"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-40">
      {/* Standard flex container. RTL layout engine handles logo to the right, button to the left naturally */}
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left: Contact/Action Button (natively aligned left in RTL) */}
        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/966500000000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs md:text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl transition cursor-pointer"
          >
            تواصل معنا
          </a>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <Link href="/" className="text-secondary hover:text-secondary/80">تقييم السيرة الذاتية</Link>
          <a href="#services" className="hover:text-primary transition duration-150">خدماتنا</a>
          <a href="#testimonials" className="hover:text-primary transition duration-150">عملائنا</a>
        </nav>

        {/* Right: Brand Logo (natively aligned right in RTL) */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg font-inter shadow-md">
            ج
          </div>
          <div className="text-right">
            <h1 className="text-xl font-black text-slate-900 leading-none">جدير</h1>
            <span className="text-[10px] tracking-wider text-slate-400 font-bold font-inter uppercase">JADEER STUDIO</span>
          </div>
        </Link>

      </div>
    </header>
  );
}
