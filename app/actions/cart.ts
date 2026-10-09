"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { revalidatePath } from "next/cache";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

async function getUserIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("token");
  if (!tokenCookie) return null;
  try {
    const decoded = jwt.verify(tokenCookie.value, JWT_SECRET) as {
      userId: string;
    };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function addToCart(productId: number) {
  const userId = await getUserIdFromCookie();
  if (!userId) return { error: "Unauthorized" };

  try {
    // Check if item already exists in user's cart
    const existingItem = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existingItem) {
      // Increment quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + 1 },
      });
    } else {
      // Create new cart item
      await prisma.cartItem.create({
        data: { userId, productId, quantity: 1 },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { error: "Failed to add item to cart." };
  }
}

export async function updateQuantity(cartItemId: string, change: number) {
  const userId = await getUserIdFromCookie();
  if (!userId) return { error: "Unauthorized" };

  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });
    if (!item || item.userId !== userId) return { error: "Item not found" };

    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: newQuantity },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { error: "Failed to update quantity." };
  }
}

export async function removeFromCart(cartItemId: string) {
  const userId = await getUserIdFromCookie();
  if (!userId) return { error: "Unauthorized" };

  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });
    if (!item || item.userId !== userId) return { error: "Item not found" };

    await prisma.cartItem.delete({ where: { id: cartItemId } });
    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { error: "Failed to remove item." };
  }
}
