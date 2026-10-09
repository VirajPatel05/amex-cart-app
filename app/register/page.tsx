"use client";

import { useActionState } from "react";
import { registerUser } from "@/app/actions/auth";
import Link from "next/link";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, null);

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      <div className="w-full max-w-md space-y-6">
        {/* Register Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#003366] via-[#0066cc] to-[#0099ff] p-0.5 shadow-[0_0_30px_rgba(0,102,204,0.5)] mb-3">
              <div className="w-full h-full bg-[#030a1c] rounded-[14px] flex items-center justify-center font-black text-2xl text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-blue-400">
                  AX
                </span>
              </div>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Create an AMEX Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Register to access your personal cart and automated email billing
            </p>
          </div>

          {state?.error && (
            <div className="mb-6 p-4 bg-red-950/60 border border-red-500/40 text-red-200 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
              <span className="text-base">⚠️</span>
              <span className="font-semibold">{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Name"
                className="w-full px-4 py-3.5 glass-input rounded-2xl text-sm outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="example@gmail.com"
                className="w-full px-4 py-3.5 glass-input rounded-2xl text-sm outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3.5 glass-input rounded-2xl text-sm outline-none placeholder:text-slate-500"
              />
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                <span>🔒</span> Encrypted with bcrypt (never stored as plain text).
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-4 bg-gradient-to-r from-[#0052cc] via-[#0066ff] to-[#00a3ff] hover:from-[#0066ff] hover:to-[#33b8ff] text-white font-extrabold rounded-2xl text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(0,102,255,0.45)] hover:shadow-[0_0_45px_rgba(0,163,255,0.75)] border border-cyan-400/40 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register & Continue →</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan-400 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
