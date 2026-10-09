import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import CartClient from "./CartClient";

type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { product: true };
}>;

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    userId = decoded.userId;
  } catch {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  if (!user) {
    redirect("/login");
  }

  const cartItems: CartItemWithProduct[] = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { id: "asc" },
  });

  const subtotal = cartItems.reduce(
    (sum: number, item: CartItemWithProduct) => sum + item.product.price * item.quantity,
    0
  );

  const totalQuantity = cartItems.reduce(
    (acc: number, i: CartItemWithProduct) => acc + i.quantity,
    0
  );

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <CartClient
        cartItems={cartItems}
        subtotal={subtotal}
        totalQuantity={totalQuantity}
        user={user}
      />
    </div>
  );
}
