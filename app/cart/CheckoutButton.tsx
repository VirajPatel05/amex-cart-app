"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitOrder } from "@/app/actions/order";

export default function CheckoutButton({ disabled }: { disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = () => {
    setError(null);
    startTransition(async () => {
      const res = await submitOrder();
      if (res?.error) {
        setError(res.error);
        return;
      }
      if (res?.success && res.orderId) {
        const query = new URLSearchParams();
        if (res.emailSent !== undefined) query.set("emailSent", String(res.emailSent));
        if (res.emailWarning) query.set("warning", res.emailWarning);
        if (res.previewUrl) query.set("previewUrl", String(res.previewUrl));
        router.push(`/order-success/${res.orderId}?${query.toString()}`);
      }
    });
  };

  return (
    <div className="w-full space-y-3">
      {error && (
        <div className="p-4 bg-red-950/60 border border-red-500/40 text-red-200 text-xs rounded-2xl flex items-start gap-2.5 backdrop-blur-md shadow-lg animate-in fade-in">
          <span className="shrink-0 text-sm">⚠️</span>
          <span className="font-medium">{error}</span>
        </div>
      )}
      <button
        type="button"
        id="checkout-submit-btn"
        onClick={handleCheckout}
        disabled={disabled || isPending}
        className="w-full py-4 px-6 bg-gradient-to-r from-[#0052cc] via-[#0066ff] to-[#00a3ff] hover:from-[#0066ff] hover:to-[#33b8ff] active:scale-[0.99] text-white rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(0,102,255,0.45)] hover:shadow-[0_0_45px_rgba(0,163,255,0.75)] border border-cyan-400/40 disabled:opacity-50 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5"
      >
        {isPending ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Placing Order & Dispatching Bill...</span>
          </>
        ) : (
          <span>Place Order & Send Bill →</span>
        )}
      </button>
    </div>
  );
}
