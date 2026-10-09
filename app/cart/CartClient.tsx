"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateQuantity, removeFromCart } from "@/app/actions/cart";
import CheckoutButton from "./CheckoutButton";
import { Prisma } from "@prisma/client";

type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { product: true };
}>;

interface CartClientProps {
  cartItems: CartItemWithProduct[];
  subtotal: number;
  totalQuantity: number;
  user: {
    name: string;
    email: string;
  };
}

export default function CartClient({
  cartItems,
  subtotal,
  totalQuantity,
  user,
}: CartClientProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpdateQuantity = (itemId: string, change: number) => {
    startTransition(async () => {
      await updateQuantity(itemId, change);
      router.refresh();
    });
  };

  const handleRemove = (itemId: string) => {
    startTransition(async () => {
      await removeFromCart(itemId);
      router.refresh();
    });
  };

  return (
    <div className="space-y-10">
      {/* Dynamic 3-Step Checkout Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-400/30 px-3 py-1 rounded-full mb-2 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            POSTGRESQL MULTI-TENANT ISOLATED CART
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {currentStep === 1
              ? "Review Items & Quantities"
              : "Review Delivery & Final Checkout"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {currentStep === 1
              ? "Inspect your selected hardware items before advancing to checkout."
              : "Verify your email delivery address and place order for automated bill dispatch."}
          </p>
        </div>

        {/* Interactive 3-Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-bold">
          {/* Step 1: Review Items */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-300 cursor-pointer ${
              currentStep === 1
                ? "text-white bg-gradient-to-r from-[#0052cc] to-[#0088ff] border border-cyan-400/50 shadow-[0_0_20px_rgba(0,102,255,0.6)]"
                : "text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/40"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                currentStep === 1
                  ? "bg-white text-[#0052cc]"
                  : "bg-emerald-500 text-white"
              }`}
            >
              {currentStep > 1 ? "✓" : "1"}
            </span>
            <span>Review Items</span>
          </button>

          <span className="text-slate-600 font-bold">→</span>

          {/* Step 2: Checkout */}
          <button
            type="button"
            onClick={() => {
              if (cartItems.length > 0) setCurrentStep(2);
            }}
            disabled={cartItems.length === 0}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-300 ${
              cartItems.length === 0 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
            } ${
              currentStep === 2
                ? "text-white bg-gradient-to-r from-[#0052cc] to-[#0088ff] border border-cyan-400/50 shadow-[0_0_20px_rgba(0,102,255,0.6)]"
                : "text-slate-400 bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 hover:text-slate-200"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                currentStep === 2
                  ? "bg-white text-[#0052cc]"
                  : "bg-white/10 text-slate-300"
              }`}
            >
              2
            </span>
            <span>Checkout</span>
          </button>

          <span className="text-slate-600 font-bold">→</span>

          {/* Step 3: Email Bill (Active upon order placement) */}
          <div className="flex items-center gap-2 text-slate-500 bg-white/[0.02] border border-white/5 px-3.5 py-2 rounded-xl select-none">
            <span className="w-5 h-5 rounded-full bg-white/5 text-slate-400 flex items-center justify-center text-[10px] font-bold">
              3
            </span>
            <span>Email Bill</span>
          </div>
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
      ) : currentStep === 1 ? (
        /* ================= STEP 1: REVIEW ITEMS ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
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
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          disabled={isPending}
                          aria-label="Decrease quantity"
                          className="w-8 h-8 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] flex items-center justify-center font-bold text-white transition cursor-pointer disabled:opacity-50"
                        >
                          -
                        </button>

                        <span className="w-10 text-center font-black text-white text-sm">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          disabled={isPending}
                          aria-label="Increase quantity"
                          className="w-8 h-8 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] flex items-center justify-center font-bold text-white transition cursor-pointer disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        disabled={isPending}
                        aria-label="Remove item"
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer disabled:opacity-50"
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

          {/* Billing Sidebar & Next Step Button (4 Columns) */}
          <div className="lg:col-span-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 sticky top-24 shadow-2xl">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Step 1 Summary</h2>
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
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block">Subtotal</span>
                <span className="text-[11px] text-slate-500">Payable amount</span>
              </div>
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>

            {/* Advance to Step 2 Button */}
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#0052cc] via-[#0066ff] to-[#00a3ff] hover:from-[#0066ff] hover:to-[#33b8ff] active:scale-[0.99] text-white rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(0,102,255,0.45)] hover:shadow-[0_0_45px_rgba(0,163,255,0.75)] border border-cyan-400/40 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <span>Proceed to Step 2: Checkout →</span>
            </button>

            <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/10 space-y-2 text-xs text-slate-300 backdrop-blur-md">
              <div className="flex items-center gap-2 font-bold text-cyan-300">
                <span>ℹ️</span> Next: Delivery & Email Checkout
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Step 2 will show your registered destination email and allow you to finalize and place your order.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ================= STEP 2: CHECKOUT & DELIVERY ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
          {/* Checkout Details (8 Columns) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Delivery Destination Card */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 text-lg">
                    📍
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">Delivery & Invoice Destination</h3>
                    <p className="text-xs text-slate-400">Order bill will be dispatched to this email</p>
                  </div>
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full">
                  Verified Member
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/10 space-y-1">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">
                    Recipient Name
                  </span>
                  <span className="text-white font-black text-sm block">
                    {user.name}
                  </span>
                </div>

                <div className="p-4 bg-white/[0.03] rounded-2xl border border-cyan-500/30 space-y-1 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                  <span className="text-cyan-400 font-bold block uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <span>✉️</span> Registered Invoice Email
                  </span>
                  <span className="text-white font-black text-sm block truncate">
                    {user.email}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-2xl text-xs text-blue-200 flex items-center gap-2.5">
                <span className="text-base">🚀</span>
                <span>
                  <strong>AMEX Express Delivery:</strong> Estimated arrival within 24-48 business hours. Tracking and official receipt will be emailed immediately upon placement.
                </span>
              </div>
            </div>

            {/* Payment & Invoicing Mode Card */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 text-lg">
                  💳
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Payment & Billing Method</h3>
                  <p className="text-xs text-slate-400">AMEX Corporate Member Billing</p>
                </div>
              </div>

              <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#003366] to-[#0099ff] flex items-center justify-center font-black text-white text-xs">
                    AX
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">AMEX Centurion Direct Invoice</div>
                    <div className="text-[11px] text-slate-400">Pre-authorized assessment checkout</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
                  Auto-Settled
                </span>
              </div>
            </div>

            {/* Order Items Overview Table */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Order Items ({cartItems.length} Products, {totalQuantity} Units)
                </h4>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                >
                  Edit Items
                </button>
              </div>

              <div className="divide-y divide-white/5 text-xs">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between">
                    <span className="font-semibold text-white">
                      {item.product.name}{" "}
                      <span className="text-slate-400 font-normal">× {item.quantity}</span>
                    </span>
                    <span className="font-bold text-cyan-300">
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
            >
              <span>← Back to Step 1: Review Items</span>
            </button>
          </div>

          {/* Step 2 Final Billing Sidebar (4 Columns) */}
          <div className="lg:col-span-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 sticky top-24 shadow-2xl">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Step 2: Final Bill</h2>
              <p className="text-xs text-slate-400 mt-0.5">Ready for order submission</p>
            </div>

            <div className="space-y-4 text-sm border-b border-white/10 pb-5">
              <div className="flex justify-between text-slate-300">
                <span>Items Subtotal</span>
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
                <span>Recipient</span>
                <span className="text-white font-medium text-xs truncate max-w-[150px]">
                  {user.email}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block">Grand Total</span>
                <span className="text-[11px] text-slate-500">Total charge</span>
              </div>
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>

            {/* Final Place Order Button */}
            <div className="pt-2">
              <CheckoutButton />
            </div>

            <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/10 space-y-2 text-xs text-slate-300 backdrop-blur-md">
              <div className="flex items-center gap-2 font-bold text-cyan-300">
                <span>✉️</span> Real-Time Email Delivery
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Clicking <strong>Place Order</strong> will immediately save this order to the database, clear your cart, and dispatch your official AMEX bill to <strong>{user.email}</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
