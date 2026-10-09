import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import Link from "next/link";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

export const dynamic = "force-dynamic";

interface OrderSuccessPageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{
    emailSent?: string;
    warning?: string;
    previewUrl?: string;
  }>;
}

export default async function OrderSuccessPage({
  params,
  searchParams,
}: OrderSuccessPageProps) {
  const { orderId } = await params;
  const { emailSent, warning, previewUrl } = await searchParams;

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

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: true,
    },
  });

  if (!order || order.userId !== userId) {
    redirect("/dashboard");
  }

  const isEmailDispatched = emailSent === "true";

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      {/* 3-Step Indicator with Step 3 Active */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold pb-2">
        <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-3.5 py-2 rounded-xl">
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
            ✓
          </span>
          <span>Review Items</span>
        </div>

        <span className="text-slate-600 font-bold">→</span>

        <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-3.5 py-2 rounded-xl">
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
            ✓
          </span>
          <span>Checkout</span>
        </div>

        <span className="text-slate-600 font-bold">→</span>

        <div className="flex items-center gap-2 text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 border border-cyan-400/50 px-3.5 py-2 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.5)]">
          <span className="w-5 h-5 rounded-full bg-white text-emerald-700 flex items-center justify-center text-[10px] font-black">
            ✓
          </span>
          <span>Email Bill Sent</span>
        </div>
      </div>

      {/* Liquid Glass Order Receipt Card */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        {/* Header with Glowing Centurion Style */}
        <div className="relative p-8 sm:p-10 text-center border-b border-white/10 bg-gradient-to-b from-blue-950/40 to-transparent">
          <div className="w-18 h-18 bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl font-black shadow-[0_0_35px_rgba(16,185,129,0.4)] animate-in zoom-in-75 duration-300">
            ✓
          </div>
          <div className="inline-block bg-blue-900/60 border border-cyan-400/30 text-cyan-300 text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase mb-2 backdrop-blur-md">
            AMEX TECHNOLOGY • VERIFIED INVOICE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-slate-300 text-sm mt-1.5">
            Thank you, <span className="font-bold text-white">{order.user.name}</span>. Your order has been placed in the database.
          </p>
          <div className="mt-3 text-xs text-cyan-300 font-mono bg-black/40 border border-white/10 inline-block px-3 py-1 rounded-lg">
            Reference ID: {order.id}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Email Notification Status Banner */}
          {isEmailDispatched ? (
            <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex items-start gap-3 backdrop-blur-md shadow-xs">
              <span className="text-xl">📧</span>
              <div className="text-xs">
                <p className="font-bold text-cyan-300">Order Summary Email Dispatched</p>
                <p className="text-slate-300 mt-0.5">
                  An itemized bill breakdown was sent directly to <span className="font-bold text-white">{order.user.email}</span>.
                </p>
                {previewUrl && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs font-semibold text-cyan-400 underline hover:text-cyan-300"
                  >
                    🔗 Open Test Email Preview →
                  </a>
                )}
              </div>
            </div>
          ) : warning ? (
            <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-start gap-3 backdrop-blur-md">
              <span className="text-xl">⚠️</span>
              <div className="text-xs">
                <p className="font-bold text-amber-300">Email Delivery Notice</p>
                <p className="text-slate-300 mt-0.5">{warning}</p>
              </div>
            </div>
          ) : null}

          {/* Bill Summary Table matching AMEX PDF */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Bill Breakdown
              </h2>
              <span className="text-xs text-slate-400">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/30">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-white/[0.03] border-b border-white/10 text-slate-400 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 font-semibold text-white">{item.productName}</td>
                      <td className="py-3.5 px-4 text-center text-slate-300">{item.quantity}</td>
                      <td className="py-3.5 px-4 text-right text-slate-400">
                        Rs. {item.price.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-cyan-300">
                        Rs. {item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-white/[0.03] font-bold border-t border-white/10">
                    <td colSpan={3} className="py-4 px-4 text-right text-white">
                      Grand total
                    </td>
                    <td className="py-4 px-4 text-right text-cyan-400 font-black text-base sm:text-lg">
                      Rs. {order.grandTotal.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex-1 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-center rounded-2xl font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.4)] transition"
            >
              Continue Shopping
            </Link>
            <Link
              href="/cart"
              className="py-3.5 px-6 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white text-center rounded-2xl font-bold text-xs uppercase tracking-wider border border-white/10 transition"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
