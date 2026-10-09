import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import Link from "next/link";
import Image from "next/image";
import { updateQuantity, removeFromCart } from "@/app/actions/cart";
import CheckoutButton from "./CheckoutButton";

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
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Checkout Steps Header with Liquid Glass */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-400/30 px-3 py-1 rounded-full mb-2 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            POSTGRESQL MULTI-TENANT ISOLATED CART
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Shopping Cart & Billing
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time billing calculation. Order summary automatically dispatched to your email on checkout.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2.5 text-xs font-bold">
          <span className="flex items-center gap-2 text-white bg-[#006fcf] px-3.5 py-2 rounded-xl border border-blue-400/40 shadow-[0_0_20px_rgba(0,111,207,0.4)]">
            <span className="w-5 h-5 rounded-full bg-white text-[#006fcf] flex items-center justify-center text-[10px] font-black">1</span>
            Review Items
          </span>
          <span className="text-slate-600">→</span>
          <span className="flex items-center gap-2 text-slate-400 bg-white/[0.04] border border-white/10 px-3.5 py-2 rounded-xl">
            <span className="w-5 h-5 rounded-full bg-white/10 text-slate-300 flex items-center justify-center text-[10px]">2</span>
            Checkout
          </span>
          <span className="text-slate-600">→</span>
          <span className="flex items-center gap-2 text-slate-400 bg-white/[0.04] border border-white/10 px-3.5 py-2 rounded-xl">
            <span className="w-5 h-5 rounded-full bg-white/10 text-slate-300 flex items-center justify-center text-[10px]">3</span>
            Email Bill
          </span>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="glass-panel p-12 sm:p-16 rounded-3xl text-center max-w-2xl mx-auto my-8 border border-white/10">
          <div className="w-20 h-20 bg-blue-950/60 border border-cyan-400/40 text-cyan-400 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            🛒
          </div>
          <h3 className="text-2xl font-black text-white">Your Cart is Currently Empty</h3>
          <p className="text-slate-400 text-sm mt-2 mb-8 max-w-md mx-auto">
            You don&apos;t have any products in your cart yet. Explore the AMEX Technology store to add verified hardware peripherals.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-2xl font-extrabold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.4)] transition"
          >
            <span>← Return to Store</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List (8 Columns) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="glass-panel rounded-3xl overflow-hidden divide-y divide-white/10 border border-white/10">
              <div className="p-4 sm:p-5 bg-white/[0.02] flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Product Details ({cartItems.length} Products)</span>
                <span className="hidden sm:inline">Quantity & Line Total</span>
              </div>

              {cartItems.map((item) => {
                const lineTotal = item.product.price * item.quantity;
                return (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-black/60 border border-white/10">
                      <Image
                        src={
                          item.product.imageUrl ||
                          "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7"
                        }
                        alt={item.product.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 text-center sm:text-left min-w-0 space-y-1.5">
                      <h3 className="font-bold text-white text-base">
                        {item.product.name}
                      </h3>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs">
                        <span className="text-slate-400 font-medium">
                          Unit: Rs. {item.product.price.toLocaleString()}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg shadow-xs">
                          Line Total: Rs. {lineTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-white/10 rounded-2xl bg-black/40 p-1 shadow-inner backdrop-blur-md">
                        <form
                          action={async () => {
                            "use server";
                            await updateQuantity(item.id, -1);
                          }}
                        >
                          <button
                            type="submit"
                            aria-label="Decrease quantity"
                            className="w-8 h-8 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] flex items-center justify-center font-bold text-white transition cursor-pointer"
                          >
                            -
                          </button>
                        </form>

                        <span className="w-10 text-center font-black text-white text-sm">
                          {item.quantity}
                        </span>

                        <form
                          action={async () => {
                            "use server";
                            await updateQuantity(item.id, 1);
                          }}
                        >
                          <button
                            type="submit"
                            aria-label="Increase quantity"
                            className="w-8 h-8 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] flex items-center justify-center font-bold text-white transition cursor-pointer"
                          >
                            +
                          </button>
                        </form>
                      </div>

                      {/* Remove Button */}
                      <form
                        action={async () => {
                          "use server";
                          await removeFromCart(item.id);
                        }}
                      >
                        <button
                          type="submit"
                          aria-label="Remove item"
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                          title="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
              >
                <span>← Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Billing & Order Summary (4 Columns) with Liquid Glass Panel */}
          <div className="lg:col-span-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 sticky top-24 shadow-2xl">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Order Billing Summary</h2>
              <p className="text-xs text-slate-400 mt-0.5">Calculated in real-time</p>
            </div>

            <div className="space-y-4 text-sm border-b border-white/10 pb-5">
              <div className="flex justify-between text-slate-300">
                <span>Items Subtotal ({totalQuantity} units)</span>
                <span className="font-bold text-white">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>AMEX Express Delivery</span>
                <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg text-xs">
                  FREE
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Applicable Taxes (GST)</span>
                <span className="text-slate-400 text-xs">Included</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block">Grand Total</span>
                <span className="text-[11px] text-slate-500">Payable amount</span>
              </div>
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>

            {/* Checkout Action Component */}
            <div className="pt-2">
              <CheckoutButton />
            </div>

            {/* Assessment Highlights */}
            <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/10 space-y-2 text-xs text-slate-300 backdrop-blur-md">
              <div className="flex items-center gap-2 font-bold text-cyan-300">
                <span>✓</span> Automated E-Bill by Email
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                When you click Place Order, the order is saved in PostgreSQL, the cart is cleared, and an itemized bill is dispatched to your registered email.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
