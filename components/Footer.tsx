import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto bg-black/40 border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#003875] to-[#0070d2] flex items-center justify-center text-[10px] text-white font-black shadow-[0_0_10px_rgba(0,112,210,0.5)]">
            AX
          </div>
          <span className="font-bold text-slate-200">AMEX Technology Junior Developer Assessment</span>
          <span className="text-slate-600">•</span>
          <span>Centurion Cart & Billing</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-cyan-400 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            PostgreSQL & Prisma Connected
          </span>
          <Link href="/dashboard" className="hover:text-cyan-400 transition">
            Store Catalog
          </Link>
          <Link href="/cart" className="hover:text-cyan-400 transition">
            Shopping Cart
          </Link>
        </div>
      </div>
    </footer>
  );
}
