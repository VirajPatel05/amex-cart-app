import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AMEX Technology | Online Cart & Billing",
  description: "Official online cart application for AMEX Technology Junior Developer assessment. Shop products, manage carts, and receive instant email billing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#030712] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-cyan-200 relative overflow-x-hidden">
        {/* Ambient Liquid Glass Lighting Orbs */}
        <div className="fixed top-0 left-1/4 w-[650px] h-[650px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none -z-10"></div>
        <div className="fixed top-1/3 -right-20 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
        <div className="fixed bottom-0 left-1/3 w-[750px] h-[450px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10"></div>

        <Navbar />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
