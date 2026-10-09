"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { revalidatePath } from "next/cache";
import { sendOrderSummaryEmail } from "@/lib/email";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

export interface SubmitOrderResponse {
  success?: boolean;
  orderId?: string;
  error?: string;
  emailSent?: boolean;
  emailWarning?: string;
  previewUrl?: string | false;
}

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true },
    });
    return user;
  } catch {
    return null;
  }
}

/**
 * Submits the user's current cart as an order, persists it to the database,
 * clears the cart, and dispatches the order confirmation email.
 */
export async function submitOrder(): Promise<SubmitOrderResponse> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: "You must be logged in to place an order." };
  }

  // 1. Fetch user's cart items
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
  });

  // 2. Validate empty cart and invalid quantities
  if (!cartItems || cartItems.length === 0) {
    return {
      error: "Your cart is empty. Please add products before placing an order.",
    };
  }

  const hasInvalidQuantity = cartItems.some((item) => item.quantity <= 0);
  if (hasInvalidQuantity) {
    return { error: "One or more items has an invalid quantity." };
  }

  // 3. Compute line totals and grand total
  const orderItemsData = cartItems.map((item) => {
    const lineTotal = item.product.price * item.quantity;
    return {
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      total: lineTotal,
    };
  });

  const grandTotal = orderItemsData.reduce(
    (sum: number, item) => sum + item.total,
    0,
  );

  let createdOrderId: string;

  // 4. Atomic transaction: create Order & OrderItems, then clear CartItems
  try {
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: user.id,
          grandTotal,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      });

      return order;
    });

    createdOrderId = createdOrder.id;
  } catch (error) {
    console.error("Failed to save order in database:", error);
    return {
      error:
        "An unexpected error occurred while placing your order. Please try again.",
    };
  }

  // 5. Send order summary email resiliently (do not crash if email fails)
  let emailSent = false;
  let emailWarning: string | undefined;
  let previewUrl: string | false = false;

  try {
    const emailResult = await sendOrderSummaryEmail({
      toEmail: user.email,
      userName: user.name,
      orderId: createdOrderId,
      items: orderItemsData,
      grandTotal,
    });

    emailSent = emailResult.success;
    previewUrl = emailResult.previewUrl || false;

    if (!emailResult.success) {
      emailWarning =
        "Your order was confirmed, but we encountered an issue sending the email summary.";
    }
  } catch (emailErr) {
    console.error("Non-fatal email error:", emailErr);
    emailSent = false;
    emailWarning =
      "Your order was saved, but the confirmation email could not be sent.";
  }

  revalidatePath("/cart");
  revalidatePath("/dashboard");

  return {
    success: true,
    orderId: createdOrderId,
    emailSent,
    emailWarning,
    previewUrl,
  };
}
