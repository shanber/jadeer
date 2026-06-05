"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { X, User, Mail, Phone, ShieldCheck, AlertCircle } from "lucide-react";

interface LeadFormModalProps {
  onClose: () => void;
  onSubmit: (leadDetails: {
    fullName: string;
    email: string;
    mobile: string;
    utms: {
      utm_source: string;
      utm_medium: string;
      utm_campaign: string;
      utm_content: string;
      utm_term: string;
    };
  }) => void;
}

export default function LeadFormModal({ onClose, onSubmit }: LeadFormModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utms, setUtms] = useState({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
  });

  // Extract UTM parameters from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setUtms({
        utm_source: params.get("utm_source") || "",
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || "",
        utm_content: params.get("utm_content") || "",
        utm_term: params.get("utm_term") || "",
      });
    }
  }, []);

  const handleMobileChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Strip non-numeric/non-plus chars to prevent bad input
    const cleaned = e.target.value.replace(/[^\d+]/g, "");
    setMobile(cleaned);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic fields validation
    if (!fullName.trim() || !email.trim() || !mobile.trim()) {
      setError("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    // Saudi phone format validation: 05xxxxxxxx, 9665xxxxxxxx, +9665xxxxxxxx
    const saudiPhoneRegex = /^(05\d{8}|9665\d{8}|\+9665\d{8})$/;
    if (!saudiPhoneRegex.test(mobile)) {
      setError("رقم الجوال غير صحيح. يجب أن يتكون من 10 خانات ويبدأ بـ 05 (مثال: 0512345678) أو 9665.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("يرجى إدخال بريد إلكتروني صحيح.");
      return;
    }

    // Consent validation
    if (!consent) {
      setError("يجب الموافقة على شروط معالجة البيانات للمتابعة.");
      return;
    }

    onSubmit({
      fullName,
      email,
      mobile,
      utms,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
      {/* Modal Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-100">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-extrabold text-slate-900 text-right">أين نرسل تقرير التقييم الخاص بك؟</h3>
        </div>

        {/* Content */}
        <form onSubmit={handleFormSubmit} className="p-6 text-right">
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            سيتم عرض التقرير والدرجة الإجمالية مباشرة على الشاشة، وسنرسل لك نسخة كاملة وتوصيات تفصيلية لتحسين ملفك المهني.
          </p>

          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-slate-700 font-bold mb-1.5 text-sm">الاسم الكامل <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="الاسم الثنائي أو الثلاثي"
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary text-right text-sm text-slate-800 transition"
                required
              />
              <User className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-slate-700 font-bold mb-1.5 text-sm">البريد الإلكتروني <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@domain.com"
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary text-right text-sm text-slate-800 font-inter transition"
                required
              />
              <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Mobile */}
          <div className="mb-6">
            <label className="block text-slate-700 font-bold mb-1.5 text-sm">رقم الجوال السعودي <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="tel"
                value={mobile}
                onChange={handleMobileChange}
                placeholder="05xxxxxxxx"
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary text-right text-sm text-slate-800 font-inter transition"
                required
              />
              <Phone className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="mb-6 flex items-start gap-2 justify-end">
            <label htmlFor="consent" className="text-xs text-slate-500 leading-relaxed select-none cursor-pointer">
              أوافق على استخدام بياناتي وسيرتي الذاتية لغرض التحليل والتواصل بخصوص خدمات جدير.
            </label>
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="h-4 w-4 shrink-0 rounded border-slate-300 text-secondary focus:ring-secondary mt-0.5 cursor-pointer"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-right text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <p className="flex-1 leading-normal">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-secondary text-white hover:bg-secondary/90 hover:shadow-md rounded-xl text-sm font-bold transition cursor-pointer"
            >
              استخراج النتيجة الآن
            </button>
          </div>

          {/* Trust Banner */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <span>بياناتك محمية ومشفرة طبقاً لسياسة خصوصية جدير المهنية</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
        </form>
      </div>
    </div>
  );
}
