"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, dbGetDocs, dbUpdateDoc } from "@/lib/firebase";
import {
  LogOut,
  Search,
  Download,
  Users,
  TrendingUp,
  FileCheck,
  Calendar,
  CheckCircle,
  FileText,
  User,
  Phone,
  Mail,
  Edit2,
  ChevronRight,
  Info,
  Notebook
} from "lucide-react";

const statusColors: { [key: string]: string } = {
  "جديد": "bg-blue-50 text-blue-700 border-blue-100",
  "تم التواصل": "bg-orange-50 text-orange-700 border-orange-100",
  "مهتم": "bg-purple-50 text-purple-700 border-purple-100",
  "تم التحويل": "bg-green-50 text-green-700 border-green-100",
  "مغلق": "bg-slate-100 text-slate-500 border-slate-200",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    averageScore: 0,
    uploadCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  
  // Lead modification states
  const [selectedStatus, setSelectedStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingLead, setUpdatingLead] = useState(false);

  // 1. Auth check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      if (user) {
        setIsAdmin(true);
      } else {
        router.push("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 2. Fetch leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const snap = await dbGetDocs("leads");
      
      const loadedLeads = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Sort by createdAt descending
      const sorted = loadedLeads.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setLeads(sorted);

      // Compute statistics
      const total = sorted.length;
      const scoresSum = sorted.reduce((sum, l) => sum + (l.overallScore || 0), 0);
      const avg = total > 0 ? Math.round(scoresSum / total) : 0;
      const uploads = sorted.filter((l) => l.resumeUrl).length;

      setStats({
        totalLeads: total,
        averageScore: avg,
        uploadCount: uploads,
      });

    } catch (err) {
      console.error("Failed to load leads:", err);
    } fillingly: {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchLeads();
    }
  }, [isAdmin]);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push("/admin/login");
  };

  // 3. Search filter
  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (lead.fullName || "").toLowerCase().includes(query) ||
      (lead.email || "").toLowerCase().includes(query) ||
      (lead.mobile || "").toLowerCase().includes(query) ||
      (lead.targetJob || "").toLowerCase().includes(query) ||
      (lead.id || "").toLowerCase().includes(query)
    );
  });

  const selectLeadForView = (lead: any) => {
    setSelectedLead(lead);
    setSelectedStatus(lead.status || "جديد");
    setAdminNotes(lead.notes || "");
  };

  const handleSaveLeadChanges = async () => {
    if (!selectedLead) return;
    setUpdatingLead(true);
    try {
      await dbUpdateDoc("leads", selectedLead.id, {
        status: selectedStatus,
        notes: adminNotes,
        updatedAt: new Date().toISOString(),
      });

      await fetchLeads();
      
      setSelectedLead((prev: any) => ({
        ...prev,
        status: selectedStatus,
        notes: adminNotes,
      }));

    } catch (err) {
      console.error("Error updating lead doc:", err);
      alert("فشل تحديث بيانات العميل.");
    } finally {
      setUpdatingLead(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;

    const headers = [
      "رقم التقييم (ID)",
      "الاسم الكامل",
      "البريد الإلكتروني",
      "رقم الجوال",
      "الوظيفة المستهدفة",
      "درجة التوافق الإجمالية",
      "الحالة",
      "المصدر",
      "تاريخ الإضافة",
      "ملاحظات المشرف",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign"
    ];

    const rows = filteredLeads.map((lead) => [
      lead.id,
      lead.fullName,
      lead.email,
      lead.mobile,
      lead.targetJob,
      lead.overallScore || 0,
      lead.status || "جديد",
      lead.source || "landing",
      new Date(lead.createdAt).toLocaleDateString("ar-SA"),
      (lead.notes || "").replace(/\n/g, " "),
      lead.utm_source || "",
      lead.utm_medium || "",
      lead.utm_campaign || ""
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `jadeer_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAdmin) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/50 flex flex-col font-sans text-right">
      {/* Admin Navbar (Standard RTL order) */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Left: Sign out action */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-200 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700/50 transition cursor-pointer"
            >
              <span>تسجيل الخروج</span>
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Right: JADEER Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary text-white flex items-center justify-center font-bold text-lg font-inter">
              ج
            </div>
            <div>
              <h1 className="text-lg font-black leading-none">لوحة تحكم جدير</h1>
              <span className="text-[9px] tracking-wider text-slate-400 font-bold uppercase font-inter">JADEER MANAGEMENT</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        
        {/* KPI Cards Grid (Native RTL ordering) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-1">إجمالي التحليلات والعملاء</span>
              <span className="text-2xl font-black font-inter text-slate-800">{stats.totalLeads}</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-1">السير الذاتية المرفوعة</span>
              <span className="text-2xl font-black font-inter text-slate-800">{stats.uploadCount}</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <FileCheck className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-1">متوسط توافق السير الذاتية</span>
              <span className="text-2xl font-black font-inter text-slate-800">{stats.averageScore}%</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Filter and Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Table Header Filter controls */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4 items-center">
            
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الجوال، البريد، الوظيفة..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-right text-xs text-slate-700 transition"
              />
              <Search className="absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
            </div>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              disabled={filteredLeads.length === 0}
              className="w-full md:w-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>تصدير ملف Excel (CSV)</span>
              <Download className="h-4 w-4" />
            </button>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center text-slate-400 text-sm">جاري جلب قائمة العملاء...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-sm">لا يوجد عملاء مطابقين لخيارات البحث.</div>
            ) : (
              <table className="w-full text-right border-collapse text-slate-600 text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <th className="px-6 py-4">الاسم والبيانات</th>
                    <th className="px-6 py-4">الوظيفة المستهدفة</th>
                    <th className="px-6 py-4 text-center">الدرجة</th>
                    <th className="px-6 py-4 text-center">الحالة</th>
                    <th className="px-6 py-4">التاريخ</th>
                    <th className="px-6 py-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/50 transition cursor-pointer"
                      onClick={() => selectLeadForView(lead)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-900">{lead.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-inter mt-1 flex flex-col gap-0.5">
                          <span>{lead.email}</span>
                          <span>{lead.mobile}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{lead.targetJob}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-black font-inter text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          {lead.overallScore || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            statusColors[lead.status] || statusColors["جديد"]
                          }`}
                        >
                          {lead.status || "جديد"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 flex items-center justify-start gap-1.5 mt-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-300" />
                        <span className="font-inter text-[11px]">{new Date(lead.createdAt).toLocaleDateString("ar-SA")}</span>
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => selectLeadForView(lead)}
                          className="text-secondary hover:text-secondary/80 font-bold bg-secondary/5 hover:bg-secondary/10 px-3 py-1.5 rounded-lg transition"
                        >
                          عرض تفصيلي
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Details Slide-over Drawer / Modal (aligned natively RTL) */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-start bg-slate-950/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto flex flex-col text-right animate-slide-up">
            
            {/* Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-secondary" />
                <h3 className="text-base font-extrabold">تفاصيل العميل والتحليل</h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-white rounded-lg p-1.5 transition cursor-pointer"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 space-y-6">
              {/* Contact Card */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 justify-start mb-3">
                  <User className="h-4.5 w-4.5 text-slate-400" />
                  <span className="font-black text-slate-800 text-sm">{selectedLead.fullName}</span>
                </div>
                <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex items-center justify-start gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="font-inter text-slate-700">{selectedLead.email}</span>
                  </div>
                  <div className="flex items-center justify-start gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="font-inter text-slate-700">{selectedLead.mobile}</span>
                  </div>
                  <div className="flex items-center justify-start gap-2">
                    <span className="font-bold text-slate-400">الوظيفة المستهدفة:</span>
                    <span className="text-slate-700">{selectedLead.targetJob}</span>
                  </div>
                </div>
                {/* Download resume CTA */}
                {selectedLead.resumeUrl && (
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-start">
                    <a
                      href={selectedLead.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="h-4 w-4" />
                      <span>تنزيل ملف السيرة الذاتية</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Status Switcher */}
              <div>
                <label className="block text-slate-800 font-bold mb-2 text-xs">حالة العميل (الرئيسية)</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {["جديد", "تم التواصل", "مهتم", "تم التحويل", "مغلق"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedStatus(status)}
                      className={`py-2 rounded-xl text-[10px] font-bold border transition text-center cursor-pointer ${
                        selectedStatus === status
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Score breakdown if completed */}
              {selectedLead.analysisResult && (
                <div className="border border-slate-100 rounded-2xl p-4 bg-white shadow-xs">
                  <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-start gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>درجات معايير التقييم الفرعية</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="block text-slate-400">تقييم الـ ATS</span>
                      <strong className="text-slate-800 font-inter text-xs">{selectedLead.analysisResult.scores.ats}%</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="block text-slate-400">الخبرات</span>
                      <strong className="text-slate-800 font-inter text-xs">{selectedLead.analysisResult.scores.experience}%</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="block text-slate-400">المهارات</span>
                      <strong className="text-slate-800 font-inter text-xs">{selectedLead.analysisResult.scores.skills}%</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="block text-slate-400">التنسيق</span>
                      <strong className="text-slate-800 font-inter text-xs">{selectedLead.analysisResult.scores.formatting}%</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="block text-slate-400">الكلمات</span>
                      <strong className="text-slate-800 font-inter text-xs">{selectedLead.analysisResult.scores.keyword}%</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="block text-slate-400">LinkedIn</span>
                      <strong className="text-slate-800 font-inter text-xs">{selectedLead.analysisResult.scores.linkedin}%</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Campaign / UTM Info */}
              <div className="border border-slate-100 rounded-2xl p-4 bg-white text-xs text-slate-500 space-y-2">
                <h4 className="font-bold text-slate-700 mb-2">بيانات الحملة والتسويق (UTM Parameters)</h4>
                <div className="grid grid-cols-2 gap-2 text-right">
                  <div>
                    <span className="text-slate-400 block text-[10px]">المصدر (source):</span>
                    <strong className="text-slate-700 font-inter text-[11px]">{selectedLead.utm_source || "غير محدد"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الوسيط (medium):</span>
                    <strong className="text-slate-700 font-inter text-[11px]">{selectedLead.utm_medium || "غير محدد"}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">اسم الحملة (campaign):</span>
                    <strong className="text-slate-700 font-inter text-[11px]">{selectedLead.utm_campaign || "غير محدد"}</strong>
                  </div>
                </div>
              </div>

              {/* Admin Note Box */}
              <div>
                <label className="block text-slate-800 font-bold mb-2 text-xs flex items-center justify-start gap-1.5">
                  <Notebook className="h-4 w-4 text-slate-400" />
                  <span>ملاحظات المشرف الداخلية (تدعم Markdown)</span>
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="اكتب تفاصيل التواصل، متطلبات العميل، وتفاصيل المتابعة المهنية هنا..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-right text-xs text-slate-700 transition"
                />
              </div>
            </div>

            {/* Footer actions inside Drawer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="flex-1 py-3 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveLeadChanges}
                disabled={updatingLead}
                className="flex-1 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="h-4 w-4" />
                <span>{updatingLead ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
