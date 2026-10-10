"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

export type AuthResponse = { error?: string } | void;

export async function registerUser(
  prevStateOrFormData: unknown,
  maybeFormData?: FormData
): Promise<AuthResponse> {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : (prevStateOrFormData as FormData);

  const name = formData?.get("name") as string;
  const email = formData?.get("email") as string;
  const password = formData?.get("password") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "Duplicate email: This email is already registered." };
    }

    // Hash password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    // Set session cookie
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  } catch (error) {
    console.error("Registration failed error:", error);
    return { error: "Something went wrong during registration. Please check database connection." };
  }

  redirect("/dashboard");
}

export async function loginUser(
  prevStateOrFormData: unknown,
  maybeFormData?: FormData
): Promise<AuthResponse> {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : (prevStateOrFormData as FormData);

  const email = formData?.get("email") as string;
  const password = formData?.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { error: "Wrong password or email address." };
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return { error: "Wrong password or email address." };
    }

    // Set session cookie
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  } catch (error) {
    console.error("Login failed error:", error);
    return { error: "Something went wrong during login. Please check database connection." };
  }

  redirect("/dashboard");
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}
