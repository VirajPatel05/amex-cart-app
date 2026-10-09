"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/app/actions/auth";

interface NavbarClientProps {
  user: {
    name: string;
    email: string;
  } | null;
  cartCount: number;
}

export default function NavbarClient({ user, cartCount }: NavbarClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/50 border-b border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo with Liquid Glass Glow */}
          <Link href={user ? "/dashboard" : "/login"} className="flex items-center gap-3.5 group">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-[#003366] via-[#0066cc] to-[#0099ff] p-0.5 shadow-[0_0_25px_rgba(0,102,204,0.4)] group-hover:shadow-[0_0_35px_rgba(0,153,255,0.7)] group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-[#030a1c] rounded-[10px] flex items-center justify-center font-black tracking-wider text-white text-base">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-blue-400">
                  AX
                </span>
              </div>
            </div>
            <div>
              <span className="font-black tracking-tight text-lg text-white block leading-none flex items-center gap-1.5">
                AMEX <span className="text-[#38bdf8] font-bold text-xs tracking-widest uppercase">TECHNOLOGY</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold block mt-1">
                Centurion Store & Billing
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-2 bg-white/[0.04] p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-inner">
              <Link
                href="/dashboard"
                className={`text-xs font-semibold tracking-wide transition-all px-4 py-2 rounded-xl ${
                  pathname === "/dashboard"
                    ? "text-white bg-[#006fcf] shadow-[0_0_20px_rgba(0,111,207,0.5)] border border-blue-400/40"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                Store Catalog
              </Link>

              {/* Cart Pill with Neon Badge */}
              <Link
                href="/cart"
                className={`flex items-center gap-2.5 text-xs font-semibold tracking-wide transition-all px-4 py-2 rounded-xl ${
                  pathname === "/cart"
                    ? "text-white bg-[#006fcf] shadow-[0_0_20px_rgba(0,111,207,0.5)] border border-blue-400/40"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <span className="text-sm">🛒</span>
                <span>Cart</span>
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-black text-white bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                  {cartCount}
                </span>
              </Link>
            </nav>
          )}

          {/* User Profile & Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left text-xs">
                    <div className="font-bold text-white leading-tight">{user.name}</div>
                    <div className="text-slate-400 text-[10px] truncate max-w-[120px]">{user.email}</div>
                  </div>
                </div>

                <form action={logoutUser}>
                  <button
                    type="submit"
                    className="text-xs font-bold px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-500/50 transition-all cursor-pointer backdrop-blur-md shadow-xs"
                  >
                    Logout
                  </button>
                </form>
              </div>
            ) : isAuthPage ? (
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                {pathname === "/login" ? (
                  <span>
                    New user?{" "}
                    <Link href="/register" className="text-cyan-400 font-bold hover:underline ml-1">
                      Register
                    </Link>
                  </span>
                ) : (
                  <span>
                    Already registered?{" "}
                    <Link href="/login" className="text-cyan-400 font-bold hover:underline ml-1">
                      Login
                    </Link>
                  </span>
                )}
              </div>
            ) : null}
          </div>

          {/* Mobile Hamburger Button */}
          {user && (
            <div className="flex items-center gap-2.5 md:hidden">
              <Link
                href="/cart"
                className="relative p-2.5 text-slate-200 hover:text-white rounded-xl bg-white/[0.05] border border-white/10"
              >
                <span className="text-lg">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.9)]">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 text-slate-200 hover:text-white rounded-xl bg-white/[0.05] border border-white/10 focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Dropdown Menu with Liquid Glass */}
        {user && mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="p-3 bg-white/[0.04] border border-white/10 rounded-2xl flex items-center justify-between backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{user.name}</div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                </div>
              </div>
              <form action={logoutUser}>
                <button
                  type="submit"
                  className="text-xs px-3 py-1.5 rounded-xl bg-red-500/10 text-red-300 border border-red-500/30 font-semibold"
                >
                  Logout
                </button>
              </form>
            </div>

            <div className="space-y-1.5 pt-1">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition ${
                  pathname === "/dashboard"
                    ? "bg-[#006fcf] text-white shadow-[0_0_20px_rgba(0,111,207,0.5)] border border-blue-400/40"
                    : "text-slate-300 hover:bg-white/[0.05]"
                }`}
              >
                Store Catalog
              </Link>
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition ${
                  pathname === "/cart"
                    ? "bg-[#006fcf] text-white shadow-[0_0_20px_rgba(0,111,207,0.5)] border border-blue-400/40"
                    : "text-slate-300 hover:bg-white/[0.05]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>🛒</span> Shopping Cart
                </span>
                <span className="px-2.5 py-0.5 text-[11px] bg-cyan-500 text-white rounded-full font-black shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                  {cartCount} items
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
