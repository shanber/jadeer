"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { dbGetDoc } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Lock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  BadgeAlert,
  ChevronDown,
  Sparkles,
  Award,
  CheckCircle,
  FileCheck,
  MessageSquare,
  FileText,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Zap,
  BookOpen,
  Search
} from "lucide-react";
import confetti from "canvas-confetti";

export default function Results() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      if (!id) return;
      console.log(`[TRACE] [results/page] [Results Retrieval] Fetching lead document for ID: "${id}"...`);
      try {
        setLoading(true);
        const snap = await dbGetDoc("leads", id);
        console.log(`[TRACE] [results/page] [Results Retrieval] Fetch result snapshot status. Exists: ${snap.exists()}`);
        if (!snap.exists()) {
          console.warn(`[TRACE] [results/page] [Results Retrieval] Lead document ID "${id}" was NOT found.`);
          setError("لم يتم العثور على تقرير التقييم المطلوب.");
          return;
        }
        const data = snap.data();
        console.log(`[TRACE] [results/page] [Results Retrieval] Retrieved lead data successfully. Candidate: "${data.fullName}", Score: ${data.overallScore}`);
        setLead(data);

        // Celebrate with confetti if score is high (>= 85)
        if (data.overallScore && data.overallScore >= 85) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch (err) {
        console.error("[TRACE] [results/page] [Results Retrieval] Fetch result failed with exception:", err);
        setError("فشل تحميل البيانات. يرجى مراجعة الخادم.");
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-secondary mb-4"></div>
          <p className="text-slate-500 text-sm">جاري جلب ملف التقييم الخاص بك...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-6 py-20 text-center flex flex-col items-center justify-center">
          <BadgeAlert className="h-16 w-16 text-red-500 mb-6" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">عذرًا، حدث خطأ</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">{error || "التقرير المطلوب غير موجود"}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-secondary text-white font-bold rounded-xl text-sm hover:bg-secondary/90 transition shadow-md flex items-center gap-2 flex-row-reverse"
          >
            <span>العودة للرئيسية</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const result = lead.analysisResult || {};
  const scores = result.scores || { ats: 0, experience: 0, skills: 0, formatting: 0, keyword: 0, linkedin: 0 };
  const strengths = result.strengths || [];
  const improvements = result.improvements || [];
  
  // Public warnings and keywords
  const publicWarnings = (result.atsWarnings || []).slice(0, 3);
  const publicKeywords = (result.missingKeywords || []).slice(0, 3);

  // Pre-calculated locked variables
  const lockedRecommendations = result.recommendations || [
    "تضمين الكلمات المفتاحية الدقيقة للمسمى المستهدف لضمان تجاوز فلترة الـ ATS بنسبة 95%.",
    "تعديل صياغة خبرتك السابقة في الشركة الأخيرة لتعتمد بالكامل على مؤشرات الأداء الرقمية.",
    "إعادة تنظيم أقسام السيرة الذاتية لتظهر الهوية الأكاديمية والشهادات المهنية في الجزء العلوي.",
    "تحديث الروابط المهنية وإضافة رابط ملفك الشخصي المطور على LinkedIn في أعلى الصفحة.",
    "إزالة كافة الرسوم البيانية الدائرية المعقدة لنسب قياس المهارات لأنها تعيق القراءة الآلية.",
    "استخدام أفعال الحركة القوية باللغة العربية الفصحى بدلاً من الصيغ المجهولة والروتينية.",
    "صياغة ملخص مهني متكامل وموجز يعبر عن قيمتك المضافة للشركات السعودية الكبرى.",
    "توحيد أحجام الخطوط ونوعها في كامل المستند لتسهيل القراءة بالعين المجردة.",
    "التأكد من خلو ملفك المهني من الأخطاء الإملائية واللغوية وتناسق المسميات.",
    "حفظ الملف النهائي بصيغة PDF قياسية غير مشفرة لضمان القراءة السلسة."
  ];
  const lockedSummary = result.suggestedSummary || "مدير مشاريع ذو خبرة وكفاءة عالية أمتلك سجلاً حافلاً في تخطيط وقيادة المشاريع الحكومية والإنشائية والتقنية الكبرى بما يتماشى مع أهداف قطاع التحول الوطني السعودي ورؤية المملكة 2030. متميز في إدارة الميزانيات، تخطيط الموارد، وصياغة مؤشرات الأداء الاستراتيجية لفرق العمل المتعددة لضمان جودة التسليم النهائي.";
  const lockedSkills = result.suggestedSkills || ["إدارة المشاريع الاحترافية (PMP)", "إدارة أصحاب المصلحة (Stakeholders)", "صياغة وتتبع مؤشرات الأداء (KPIs)", "منهجيات العمل المرنة (Agile/Scrum)"];
  const lockedKeywords = (result.missingKeywords || []).slice(3).concat(["Vision 2030 Programs", "Risk Mitigation", "Agile PM", "Resource Allocation"]);

  const score = lead.overallScore || 0;
  const radius = 70;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // New Score color ranges logic:
  // 0-49 = Red, 50-69 = Orange, 70-84 = JADEER Blue, 85-100 = Green
  let scoreColorClass = "stroke-red-500 text-red-500";
  let scoreBgClass = "bg-red-50 text-red-700 border-red-100";
  let scoreDesc = "ضعيف ويحتاج إلى إعادة صياغة جذرية فورية";

  if (score >= 50 && score <= 69) {
    scoreColorClass = "stroke-orange-500 text-orange-500";
    scoreBgClass = "bg-orange-50 text-orange-700 border-orange-100";
    scoreDesc = "مقبول، ولكن يحتوي على فجوات حرجة تمنعك من لفت انتباه الشركات الكبرى";
  } else if (score >= 70 && score <= 84) {
    scoreColorClass = "stroke-secondary text-secondary";
    scoreBgClass = "bg-secondary/5 text-secondary border-secondary/20";
    scoreDesc = "جيد جداً، مع إمكانية تحسينه لتخطي المنافسين والوصول للمستوى التنفيذي";
  } else if (score >= 85) {
    scoreColorClass = "stroke-green-500 text-green-500";
    scoreBgClass = "bg-green-50 text-green-700 border-green-100";
    scoreDesc = "ممتاز ومطابق تماماً للمعايير القياسية للتوظيف الفاخر بالمملكة";
  }

  // Pre-fill WhatsApp messages for different conversion CTAs
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966500000000";
  const whatsappUrlCV = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `السلام عليكم فريق جدير، قمت بتحليل سيرتي الذاتية لمهنة (${lead?.targetJob || ""}) وأود طلب خدمة تحسين السيرة الذاتية الاحترافية. رقم التقرير: ${id}`
  )}`;
  const whatsappUrlLinkedIn = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `السلام عليكم فريق جدير، أود طلب خدمة تحسين ملف LinkedIn الاحترافي وتطوير تواجدي المهني. رقم التقرير: ${id}`
  )}`;
  const whatsappUrlGeneral = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `السلام عليكم فريق جدير، قمت بطلب تحليل سيرتي الذاتية وحصلت على تقييم ${score}/100 لوظيفة ${lead?.targetJob || ""}. أود الاستفسار عن باقات التطوير الاحترافية. رقم التقرير: ${id}`
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-right">
      <Navbar />

      <main className="flex-1 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm font-semibold mb-6"
          >
            <ArrowRight className="h-4 w-4" />
            <span>تقييم سيرة ذاتية أخرى</span>
          </button>

          {/* Top Score Banner */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 mb-6 flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in">
            {/* Candidate Details */}
            <div className="flex-1 w-full text-right">
              <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-black mb-3 ${scoreBgClass}`}>
                {scoreDesc}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
                تقرير تحليل السيرة الذاتية لـ <span className="text-primary">{lead.fullName}</span>
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                المسمى الوظيفي المستهدف: <span className="font-bold text-slate-800">{lead.targetJob}</span>
              </p>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 justify-start">
                  <span className="font-semibold text-slate-500">الجوال:</span>
                  <span className="text-slate-600 font-inter">{lead.mobile}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-start">
                  <span className="font-semibold text-slate-500">البريد الإلكتروني:</span>
                  <span className="text-slate-600 font-inter">{lead.email}</span>
                </div>
              </div>
            </div>

            {/* Score Ring Display */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="h-44 w-44 transform -rotate-90">
                <circle cx="88" cy="88" r={radius} className="stroke-slate-100" strokeWidth={stroke} fill="transparent" />
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  className={`transition-all duration-1000 ease-out ${scoreColorClass}`}
                  strokeWidth={stroke}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-slate-900 font-inter leading-none">{score}</span>
                <span className="text-xs text-slate-400 font-bold font-inter mt-1">/100</span>
              </div>
            </div>
          </div>

          {/* 1. Executive Summary Section (Directly below main score banner) */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-lg p-6 md:p-8 mb-8 animate-fade-in" style={{ animationDelay: "50ms" }}>
            <h3 className="text-sm font-extrabold text-secondary mb-3 flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5" />
              <span>الملخص التنفيذي للتقرير</span>
            </h3>
            <div className="space-y-3 leading-relaxed">
              <p className="text-lg md:text-xl font-bold font-inter">
                نتيجتك الحالية: <span className="text-secondary font-black">{score}/100</span>
              </p>
              <p className="text-xs md:text-sm text-slate-300">
                سيرتك الذاتية تحتوي على أساس جيد، ولكن توجد عدة عوامل تقلل من فرص تجاوز أنظمة الفرز (ATS) والوصول للمقابلات الشخصية.
              </p>
              <p className="text-xs md:text-sm font-semibold text-green-400">
                تم اكتشاف 11 فرصة تحسين يمكن أن ترفع قوة سيرتك الذاتية بشكل ملحوظ.
              </p>
            </div>
          </div>
 
          {/* Detailed Section Scores */}
          <div className="mb-10 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <h3 className="text-lg font-extrabold text-slate-800 mb-4">تقييم معايير السيرة الذاتية الفرعية</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[
                { title: "تقييم الـ ATS", value: scores.ats, desc: "خلو الملف من الجداول والرموز" },
                { title: "تقييم المهارات", value: scores.skills, desc: "ملاءمة مهاراتك الفنية" },
                { title: "تقييم الخبرات", value: scores.experience, desc: "لغة الأرقام والإنجازات" },
                { title: "تقييم التنسيق", value: scores.formatting, desc: "الترتيب البصري والهوامش" },
                { title: "الكلمات المفتاحية", value: scores.keyword, desc: "نسبة مطابقة الكلمات" },
                { title: "جاهزية LinkedIn", value: scores.linkedin, desc: "الارتباط وصياغة النبذة" },
              ].map((sub, idx) => {
                let badgeColor = "bg-red-50 text-red-600 border-red-100";
                if (sub.value >= 50 && sub.value <= 69) badgeColor = "bg-orange-50 text-orange-600 border-orange-100";
                if (sub.value >= 70 && sub.value <= 84) badgeColor = "bg-secondary/5 text-secondary border-secondary/20";
                if (sub.value >= 85) badgeColor = "bg-green-50 text-green-600 border-green-100";
 
                return (
                  <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                    <p className="text-xs text-slate-500 font-bold mb-2">{sub.title}</p>
                    <div className={`inline-block font-black font-inter text-lg px-2.5 py-1 rounded-lg border ${badgeColor}`}>
                      {sub.value}%
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{sub.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
 
          {/* Strengths & Improvements Grid (Public) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
            {/* Strengths */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h4 className="text-base font-extrabold text-green-700 flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>أبرز 3 نقاط قوة في سيرتك الذاتية</span>
              </h4>
              <ul className="space-y-3.5 text-slate-600 text-sm">
                {strengths.map((str: string, idx: number) => (
                  <li key={idx} className="flex gap-3">
                    <span className="h-6 w-6 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-xs shrink-0 font-bold font-inter mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{str}</span>
                  </li>
                ))}
              </ul>
            </div>
 
            {/* Improvements */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h4 className="text-base font-extrabold text-orange-700 flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span>أبرز 3 نقاط تحتاج للتحسين فوراً</span>
              </h4>
              <ul className="space-y-3.5 text-slate-600 text-sm">
                {improvements.map((imp: string, idx: number) => (
                  <li key={idx} className="flex gap-3">
                    <span className="h-6 w-6 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-xs shrink-0 font-bold font-inter mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ATS Warnings & Missing Keywords Subset (Public) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in" style={{ animationDelay: "300ms" }}>
            {/* ATS Warnings */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-slate-500" />
                <span>تحذيرات أنظمة الفرز الفوري (ATS)</span>
              </h4>
              <div className="space-y-3">
                {publicWarnings.map((warn: string, idx: number) => (
                  <div key={idx} className="bg-red-50/50 border border-red-100/50 rounded-xl p-3.5 text-xs text-red-800 flex gap-2.5 items-start">
                    <span className="shrink-0 h-5 w-5 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-xs font-bold font-inter">!</span>
                    <span className="flex-1 leading-relaxed">{warn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-slate-500" />
                <span>الكلمات المفتاحية المفقودة (عينة للتحسين)</span>
              </h4>
              <div className="flex flex-wrap gap-2 justify-start mt-2">
                {publicKeywords.map((kw: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-slate-100 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold font-inter border border-slate-200/50"
                  >
                    {kw}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                * تم رصد كلمات إضافية مفقودة تمنع خوارزميات التوظيف من تصنيف سيرتك في مقدمة الطلبات.
              </p>
            </div>
          </div>

          {/* Section Heading */}
          <div className="mb-6 flex items-center justify-between animate-fade-in" style={{ animationDelay: "350ms" }}>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Lock className="h-4.5 w-4.5 text-secondary" />
              <span>خطة التطوير الاحترافية والتوصيات المقترحة (التقرير الشامل)</span>
            </h3>
            <span className="bg-amber-50 border border-amber-100 text-amber-700 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              <span>مغلق جزئياً</span>
            </span>
          </div>

          {/* Premium Locked Report Section */}
          <div className="relative rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden p-6 md:p-8 mb-12 min-h-[550px] animate-fade-in" style={{ animationDelay: "400ms" }}>
            
            {/* The Floating Gating CTA Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-end bg-gradient-to-t from-white via-white/95 to-white/35 pb-10 px-6 text-center">
              
              {/* Lock Badge */}
              <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-6 shadow-md border border-secondary/20 animate-pulse">
                <Lock className="h-6 w-6" />
              </div>

              {/* 3. Stat counters above CTA */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 w-full max-w-2xl bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 text-xs md:text-sm text-slate-700 shadow-inner">
                <div className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <span className="text-lg">✅</span>
                  <span className="font-extrabold text-slate-800">3 نقاط قوة</span>
                </div>
                <div className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <span className="text-lg">⚠️</span>
                  <span className="font-extrabold text-slate-800">3 تحذيرات ATS</span>
                </div>
                <div className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <span className="text-lg">🔍</span>
                  <span className="font-extrabold text-slate-800">3 كلمات مفقودة</span>
                </div>
                <div className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <span className="text-lg">📈</span>
                  <span className="font-extrabold text-slate-800">11 فرصة تحسين</span>
                </div>
              </div>

              {/* 6. JADEER Trust message above CTA */}
              <div className="max-w-xl mb-6">
                <p className="text-secondary text-sm md:text-base font-black leading-relaxed mb-3">
                  "يقوم فريق جدير بتنفيذ هذه التحسينات يدويًا بما يتوافق مع متطلبات السوق السعودي وأنظمة الفرز الحديثة."
                </p>
                <p className="text-slate-500 text-xs md:text-sm font-semibold">
                  تحتوي سيرتك الذاتية على فجوات حرجة قد تحرمك من فرص التوظيف الكبرى بالمملكة. اطلب الخدمة الآن للحصول على التقرير التفصيلي والملخصات المقترحة.
                </p>
              </div>

              {/* 3 CTAs Stack */}
              <div className="flex flex-col md:flex-row gap-3.5 w-full max-w-2xl justify-center items-stretch">
                <a
                  href={whatsappUrlCV}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-secondary text-white font-extrabold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:bg-secondary/95 transition duration-150 text-sm flex-1 flex items-center justify-center text-center cursor-pointer"
                >
                  اطلب تحسين السيرة الذاتية (الرئيسي)
                </a>
                
                <a
                  href={whatsappUrlLinkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border-2 border-secondary text-secondary hover:bg-secondary/5 font-extrabold py-4 px-6 rounded-xl transition duration-150 text-sm flex-1 flex items-center justify-center text-center cursor-pointer"
                >
                  تحسين ملف LinkedIn
                </a>
                
                <a
                  href={whatsappUrlGeneral}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 text-white font-extrabold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition duration-150 text-sm flex-1 cursor-pointer"
                >
                  <span>تواصل عبر واتساب</span>
                  <MessageSquare className="h-4.5 w-4.5 fill-current" />
                </a>
              </div>
            </div>

            {/* Blurred Visual Content Containers */}
            <div className="space-y-8 pb-96">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Suggested Summary Card */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                    <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-secondary" />
                      <span>ملخص مهني مقترح</span>
                    </h4>
                    <span className="text-[10px] bg-slate-100 text-slate-400 font-bold px-2 py-0.5 rounded">مغلق</span>
                  </div>
                  <div className="text-slate-400 text-xs leading-relaxed blur-[5px] select-none pointer-events-none">
                    {lockedSummary}
                  </div>
                </div>

                {/* 2. Suggested Skills Card */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                    <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <Award className="h-4.5 w-4.5 text-secondary" />
                      <span>مهارات مقترحة للإضافة</span>
                    </h4>
                    <span className="text-[10px] bg-slate-100 text-slate-400 font-bold px-2 py-0.5 rounded">مغلق</span>
                  </div>
                  <div className="flex flex-wrap gap-2 blur-[5px] select-none pointer-events-none">
                    {lockedSkills.map((sk: string, idx: number) => (
                      <span key={idx} className="bg-indigo-50/50 text-indigo-400 border border-indigo-100/50 px-3 py-1 rounded-lg text-[11px] font-bold">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Missing Keywords Card */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                    <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <Search className="h-4.5 w-4.5 text-secondary" />
                      <span>كلمات مفتاحية مفقودة</span>
                    </h4>
                    <span className="text-[10px] bg-slate-100 text-slate-400 font-bold px-2 py-0.5 rounded">مغلق</span>
                  </div>
                  <div className="flex flex-wrap gap-2 blur-[5px] select-none pointer-events-none">
                    {lockedKeywords.map((kw: string, idx: number) => (
                      <span key={idx} className="bg-slate-100 text-slate-400 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-slate-200/45">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. ATS Optimization Plan Card */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                    <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <FileCheck className="h-4.5 w-4.5 text-secondary" />
                      <span>خطة تحسين ATS</span>
                    </h4>
                    <span className="text-[10px] bg-slate-100 text-slate-400 font-bold px-2 py-0.5 rounded">مغلق</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-[11px] blur-[5px] select-none pointer-events-none">
                    <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50">
                      <p className="font-bold text-red-700 mb-0.5">تعديل الهيكل المخطط:</p>
                      <p className="text-slate-500">إزالة الأعمدة الجانبية والأشكال الهندسية وتوحيدها إلى عمود واحد قياسي.</p>
                    </div>
                    <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50">
                      <p className="font-bold text-slate-700 mb-0.5">عناوين الأقسام المعيارية:</p>
                      <p className="text-slate-500">استخدام ترويسات متعارف عليها دولياً لتتمكن الخوارزميات من تصنيف خبراتك.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Detailed Recommendations Card (10 steps) */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-secondary" />
                    <span>توصيات تفصيلية (10 خطوات)</span>
                  </h4>
                  <span className="text-[10px] bg-slate-100 text-slate-400 font-bold px-2 py-0.5 rounded">مغلق</span>
                </div>
                <div className="space-y-2 blur-[5px] select-none pointer-events-none">
                  {lockedRecommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-xl p-2.5 text-[11px] text-slate-400 flex gap-2.5">
                      <span className="h-5 w-5 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center text-[10px] font-bold font-inter shrink-0">{idx + 1}</span>
                      <span className="flex-1">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
