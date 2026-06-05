"use client";

import { useState, useEffect } from "react";

const steps = [
  "جاري رفع ملف السيرة الذاتية وتأمينه...",
  "استخراج النصوص البرمجية وتحليل بنية الملف...",
  "قياس التوافق الرقمي مع أنظمة الفرز التلقائي (ATS)...",
  "مطابقة مهاراتك وخبراتك مع المسمى الوظيفي المستهدف...",
  "مقارنة البيانات بالمعايير المهنية للسوق السعودي ومبادرات رؤية 2030...",
  "توليد التوصيات العشرة وصياغة النبذة المقترحة...",
  "جاري إعداد تقرير التقييم النهائي الخاص بك..."
];

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-100 shadow-2xl text-center animate-slide-up">
        {/* Loading Spinner */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-secondary"></div>
          <div className="absolute h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
            <span className="text-secondary font-bold font-inter text-xs">J</span>
          </div>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-2">جاري تحليل سيرتك الذاتية</h3>
        <p className="text-slate-500 text-sm mb-6">يرجى عدم إغلاق هذه الصفحة، نقوم بتقييم ملفك بواسطة الذكاء الاصطناعي</p>

        {/* Progress steps */}
        <div className="space-y-4 text-right">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 transition-opacity duration-300 ${
                  isCompleted ? "opacity-100 text-emerald-600 font-medium" : isActive ? "opacity-100 text-slate-800 font-semibold" : "opacity-40 text-slate-400"
                }`}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border">
                  {isCompleted ? (
                    <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                      <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                  ) : isActive ? (
                    <div className="h-2 w-2 rounded-full bg-secondary animate-ping"></div>
                  ) : (
                    <span className="text-[10px] font-bold font-inter">{idx + 1}</span>
                  )}
                </div>
                <span className="text-sm">{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
