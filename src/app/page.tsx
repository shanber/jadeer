"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ResumeUploader from "@/components/ResumeUploader";
import LeadFormModal from "@/components/LeadFormModal";
import LoadingState from "@/components/LoadingState";
import { ShieldCheck, FileCheck, Search, Award } from "lucide-react";

export default function Home() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966554060424";
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [targetJob, setTargetJob] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeClick = (selectedFile: File, job: string, desc: string) => {
    setFile(selectedFile);
    setTargetJob(job);
    setJobDescription(desc);
    setShowLeadModal(true);
  };

  const handleLeadSubmit = async (leadDetails: {
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
  }) => {
    setShowLeadModal(false);
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("targetJob", targetJob);
      formData.append("jobDescription", jobDescription);
      formData.append("fullName", leadDetails.fullName);
      formData.append("email", leadDetails.email);
      formData.append("mobile", leadDetails.mobile);

      // Append UTMs
      formData.append("utm_source", leadDetails.utms.utm_source);
      formData.append("utm_medium", leadDetails.utms.utm_medium);
      formData.append("utm_campaign", leadDetails.utms.utm_campaign);
      formData.append("utm_content", leadDetails.utms.utm_content);
      formData.append("utm_term", leadDetails.utms.utm_term);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || "حدث خطأ أثناء تحليل السيرة الذاتية.");
      }

      // Sync mock lead data to browser localStorage
      if (result.leadData) {
        try {
          const localLeads = localStorage.getItem("jadeer_leads");
          const leads = localLeads ? JSON.parse(localLeads) : [];
          // Prevent duplicates
          const filtered = leads.filter((l: any) => l.id !== result.leadId);
          filtered.push(result.leadData);
          localStorage.setItem("jadeer_leads", JSON.stringify(filtered));
          
          // Re-calculate statistics for dashboard
          const total = filtered.length;
          const scoresSum = filtered.reduce((sum: number, l: any) => sum + (l.overallScore || 0), 0);
          const avg = total > 0 ? Math.round(scoresSum / total) : 0;
          localStorage.setItem(
            "jadeer_global_stats",
            JSON.stringify({
              totalAnalyses: total,
              totalLeads: total,
              averageScore: avg,
              lastUpdatedAt: new Date().toISOString(),
            })
          );
        } catch (storageErr) {
          console.error("Local storage write failed:", storageErr);
        }
      }

      router.push(`/results/${result.leadId}`);

    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "فشل الاتصال بالخادم. يرجى إعادة المحاولة لاحقاً.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-950 text-white overflow-hidden text-center px-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="max-w-4xl mx-auto relative z-10">
            {/* Tagline (native RTL layout order) */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-secondary mb-6">
              <ShieldCheck className="h-4 w-4" />
              <span>فحص متكامل متوافق مع معايير الـ ATS بالمملكة</span>
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              هل سيرتك الذاتية جاهزة للمنافسة <br />
              <span className="text-secondary">في السوق السعودي؟</span>
            </h2>

            <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed mb-12">
              حمّل سيرتك الذاتية الآن واحصل على تقييم فوري مدعوم بالذكاء الاصطناعي مجاناً. تأكد من مطابقتها لأنظمة التصفية الآلية وتلقي نصائح دقيقة وموجهة لتجاوز المقابلات الشخصية في كبرى الجهات والشركات السعودية.
            </p>

            {/* Uploader integration */}
            <div className="flex justify-center">
              <ResumeUploader onAnalyzeClick={handleAnalyzeClick} />
            </div>
            
            {/* Show API error if occurs */}
            {error && (
              <div className="max-w-2xl mx-auto mt-6 bg-red-900/40 border border-red-500/30 text-red-200 rounded-xl p-4 text-sm text-right">
                <p className="font-bold mb-1">فشل بدء التحليل:</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* Value Cards Section */}
        <section className="py-20 px-6 max-w-7xl mx-auto text-right">
          <div className="text-center mb-16">
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">ما الذي تكشفه لك أداة التحليل الفوري؟</h3>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              نقوم بمراجعة هيكلية ملفك بدقة عالية عبر 7 أبعاد قياسية تقيس مدى جاهزيتك للتوظيف والقبول.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition duration-200">
              <div className="h-10 w-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-4">
                <FileCheck className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-800 mb-2">توافق أنظمة الفرز (ATS)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                التأكد من خلو ملفك من التنسيقات والجداول المعقدة التي تعطل القراءة الآلية لدى مسؤولي التوظيف.
              </p>
            </div>

            <div className="border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition duration-200">
              <div className="h-10 w-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-4">
                <Search className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-800 mb-2">الكلمات المفتاحية والمهارات</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                تحديد الكلمات المهنية الناقصة ومطابقة مهاراتك الدقيقة مع متطلبات المسمى المستهدف والوصف الوظيفي.
              </p>
            </div>

            <div className="border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition duration-200">
              <div className="h-10 w-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-4">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-800 mb-2">صياغة الخبرات والإنجازات</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                تقييم قوة أفعال الحركة وإدراج مؤشرات الأداء الرقمية الموثقة لإثبات التأثير الفعلي لخبراتك السابقة.
              </p>
            </div>

            <div className="border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition duration-200">
              <div className="h-10 w-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-800 mb-2">التكامل مع معايير المملكة</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                ربط هيكل سيرتك الذاتية بمحاور التحول الوطني وبرامج الرؤية وتضمين المصطلحات المتداولة محلياً.
              </p>
            </div>
          </div>
        </section>

        {/* JADEER Premium Services Banner */}
        <section id="services" className="bg-slate-50 py-20 px-6 border-y border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">خدمات استوديو جدير الاحترافية</h3>
              <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                لا نكتفي بتقديم النصح؛ خبراء جدير يعيدون صياغة وبناء هويتك المهنية بالكامل لتناسب النخبة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* CV Revamp */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-black text-slate-800 mb-2">كتابة السيرة الذاتية الاحترافية</h4>
                  <p className="text-xs text-slate-400 mb-6 font-inter">Premium CV Revamp</p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    بناء وتصميم سيرة ذاتية مميزة تناسب السوق الخليجي، صياغة الإنجازات بلغة الأرقام ومؤشرات الأداء، ومتوافقة تماماً مع معايير الـ ATS بنسبة 100%.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 border border-secondary text-secondary hover:bg-secondary/5 font-bold rounded-xl text-sm transition"
                >
                  اطلب الخدمة الآن
                </a>
              </div>

              {/* LinkedIn Optimize */}
              <div className="bg-white rounded-2xl border border-secondary/20 shadow-md p-8 text-center flex flex-col justify-between relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-secondary text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                  الأكثر طلباً
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-800 mb-2">تهيئة الملف الاحترافي LinkedIn</h4>
                  <p className="text-xs text-slate-400 mb-6 font-inter">LinkedIn Executive Optimization</p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    تحسين ظهور حسابك في محركات البحث لدى مسؤولي التوظيف، صياغة خلاصة مهنية جذابة، وهيكلة المهارات والأعمال لجذب فرص التوظيف الفاخرة.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-secondary text-white hover:bg-secondary/90 font-bold rounded-xl text-sm shadow-md transition"
                >
                  اطلب الخدمة الآن
                </a>
              </div>

              {/* Executive Bundle */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-black text-slate-800 mb-2">الباقة التنفيذية المتكاملة</h4>
                  <p className="text-xs text-slate-400 mb-6 font-inter">Executive Identity Bundle</p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    الهوية المهنية الكاملة للقياديين ومدراء المشاريع. تشمل سيرة ذاتية ثنائية اللغة، خطاب التقديم الاحترافي، مع تهيئة وإعادة بناء ملف LinkedIn بالكامل.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 border border-secondary text-secondary hover:bg-secondary/5 font-bold rounded-xl text-sm transition"
                >
                  اطلب الخدمة الآن
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal and Loading Overlays */}
      {showLeadModal && (
        <LeadFormModal
          onClose={() => setShowLeadModal(false)}
          onSubmit={handleLeadSubmit}
        />
      )}

      {isLoading && <LoadingState />}
    </div>
  );
}
