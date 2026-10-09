"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/app/actions/cart";

interface AddToCartButtonProps {
  productId: number;
}

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    startTransition(async () => {
      const res = await addToCart(productId);
      if (res?.success) {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={isPending}
      className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border ${
        justAdded
          ? "bg-emerald-600/90 text-white border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-[0.98]"
          : "bg-gradient-to-r from-[#0052cc] via-[#0066ff] to-[#0099ff] hover:from-[#0066ff] hover:to-[#33adff] text-white border-blue-400/40 shadow-[0_0_25px_rgba(0,102,255,0.4)] hover:shadow-[0_0_35px_rgba(0,153,255,0.7)] hover:-translate-y-0.5 active:translate-y-0"
      } disabled:opacity-50`}
    >
      {isPending ? (
        <>
          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Adding to Cart...</span>
        </>
      ) : justAdded ? (
        <>
          <span>✓ Added to Cart!</span>
        </>
      ) : (
        <>
          <span className="text-sm">+</span>
          <span>Add to Cart</span>
        </>
      )}
    </button>
  );
}
