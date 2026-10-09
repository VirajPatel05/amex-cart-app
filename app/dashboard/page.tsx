import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) {
    redirect("/login");
  }

  const products = await prisma.product.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Liquid Glass Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-12 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        {/* Ambient interior neon glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-cyan-400/40 text-cyan-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            AMEX CENTURION TECH STORE • MEMBER PRIVILEGES
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Premium Hardware &{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-white">
              Workplace Essentials
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Curated electronics catalog with persistent multi-tenant carts. Checkout with one click and receive an official AMEX itemized bill directly in your email inbox.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-2 bg-white/[0.04] border border-white/10 px-3.5 py-2 rounded-xl text-slate-200 backdrop-blur-md shadow-xs">
              <span className="text-cyan-400">⚡</span> Free Express Delivery
            </span>
            <span className="flex items-center gap-2 bg-white/[0.04] border border-white/10 px-3.5 py-2 rounded-xl text-slate-200 backdrop-blur-md shadow-xs">
              <span className="text-blue-400">✉️</span> Automated Email Bills
            </span>
            <span className="flex items-center gap-2 bg-white/[0.04] border border-white/10 px-3.5 py-2 rounded-xl text-slate-200 backdrop-blur-md shadow-xs">
              <span className="text-emerald-400">🔒</span> PostgreSQL Isolation
            </span>
          </div>
        </div>

        {/* Watermark branding */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block opacity-5 text-9xl font-black text-white select-none pointer-events-none">
          AMEX
        </div>
      </section>

      {/* Product Catalog Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Verified Catalog</span>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded-full">
                {products.length} Items Available
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              All items verified and seeded in PostgreSQL. Select items to add to your cart.
            </p>
          </div>

          <Link
            href="/cart"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-cyan-300 hover:text-white rounded-xl text-xs font-bold border border-cyan-500/30 hover:border-cyan-400/60 transition-all shadow-xs"
          >
            <span>View Shopping Cart</span>
            <span>→</span>
          </Link>
        </div>

        {/* Product Cards Grid with Liquid Glass Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group glass-card rounded-3xl flex flex-col justify-between overflow-hidden"
            >
              {/* Product Image Frame */}
              <div className="relative aspect-4/3 bg-slate-950/80 overflow-hidden border-b border-white/10">
                <Image
                  src={
                    product.imageUrl ||
                    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7"
                  }
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-108 transition-transform duration-500 brightness-95 group-hover:brightness-105"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-cyan-300 border border-cyan-400/30 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  IN STOCK
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="mt-2.5 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">incl. GST</span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="pt-3 border-t border-white/10">
                  <AddToCartButton productId={product.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}