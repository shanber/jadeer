"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Direct call using the auth object from firebase.ts (works for both real and mock auth)
      await auth.signInWithEmailAndPassword(email, password);
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(
        err.message || "فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Back to Home Header */}
      <div className="p-6 max-w-7xl mx-auto w-full flex justify-end">
        <Link
          href="/"
          className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm font-semibold flex-row-reverse"
        >
          <span>العودة للرئيسية</span>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      {/* Login Card Container */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-slate-100 shadow-xl rounded-3xl p-8 text-right">
          {/* Logo / Title */}
          <div className="text-center flex flex-col items-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl font-inter shadow-md mb-4">
              ج
            </div>
            <h2 className="text-2xl font-black text-slate-900 leading-none mb-1">جدير | لوحة الإشراف</h2>
            <span className="text-[10px] tracking-wider text-slate-400 font-bold font-inter uppercase">
              JADEER ADMIN PANEL
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5 text-sm">البريد الإلكتروني للأدمن</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jadeer.sa"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary text-right text-sm text-slate-800 font-inter transition"
                  required
                />
                <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5 text-sm">كلمة المرور</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary text-right text-sm text-slate-800 font-inter transition"
                  required
                />
                <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Demo Notice (If using mock fallback) */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 text-center leading-relaxed font-inter">
              (التسجيل التجريبي المحلي: <strong className="text-secondary">admin@jadeer.sa</strong> وكلمة المرور: <strong className="text-secondary">jadeer2026</strong>)
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-right text-sm leading-relaxed">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <p className="flex-1">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold transition text-center text-white shadow-md hover:shadow-lg ${
                loading
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-primary hover:bg-slate-800 cursor-pointer"
              }`}
            >
              {loading ? "جاري التحقق من الهوية..." : "تسجيل الدخول"}
            </button>
          </form>

          {/* Secure details tag */}
          <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <span>الوصول آمن ومحمي ومراقب</span>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
