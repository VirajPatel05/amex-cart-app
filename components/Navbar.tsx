import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import NavbarClient from "./NavbarClient";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

export default async function Navbar() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let user: { name: string; email: string } | null = null;
  let cartCount = 0;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { name: true, email: true },
      });

      if (dbUser) {
        user = dbUser;
        cartCount = await prisma.cartItem.count({
          where: { userId: decoded.userId },
        });
      }
    } catch {
      user = null;
    }
  }

  return <NavbarClient user={user} cartCount={cartCount} />;
}
