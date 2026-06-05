"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        
        {/* Links (natively aligned left in RTL layout) */}
        <div className="flex flex-wrap gap-8 text-xs font-semibold justify-center">
          <div className="text-right">
            <h4 className="text-white text-sm mb-3">أدواتنا المهنية</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition">أداة تقييم السير الذاتية</Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white transition">لوحة التحكم للفريق</Link>
              </li>
            </ul>
          </div>
          <div className="text-right">
            <h4 className="text-white text-sm mb-3">استوديو جدير</h4>
            <ul className="space-y-2">
              <li>
                <a href="#services" className="hover:text-white transition">باقة كتابة السير الذاتية</a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition">باقة تهيئة LinkedIn</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Brand (natively aligned right in RTL layout) */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-secondary text-white flex items-center justify-center font-bold text-sm font-inter">
              ج
            </div>
            <h2 className="text-lg font-bold text-white leading-none">جدير | JADEER</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            استوديو احترافي سعودي متخصص في صناعة وكتابة السير الذاتية وصياغة الهويات المهنية الفاخرة للقيادات والمهنيين بالمملكة العربية السعودية.
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500">
        <div>جميع الحقوق محفوظة © {currentYear} استوديو جدير للهوية المهنية</div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-400">سياسة الخصوصية</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-400">شروط الاستخدام</a>
        </div>
      </div>
    </footer>
  );
}
