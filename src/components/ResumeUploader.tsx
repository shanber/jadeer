"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface ResumeUploaderProps {
  onAnalyzeClick: (file: File, targetJob: string, jobDescription: string) => void;
}

const popularJobs = [
  "مدير مشاريع (Project Manager)",
  "أخصائي موارد بشرية (HR Specialist)",
  "مطور برمجيات (Software Engineer)",
  "محلل مالي (Financial Analyst)",
  "مدير مكتب إدارة المشاريع (PMO Manager)",
  "أخصائي تسويق رقمي (Digital Marketer)",
  "أخصائي سلاسل الإمداد (Supply Chain Specialist)",
  "مدير علاقات العملاء (Relationship Manager)",
];

export default function ResumeUploader({ onAnalyzeClick }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [targetJob, setTargetJob] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);

    // Size limit check: 10MB
    const maxSizeBytes = 10 * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setError("حجم الملف كبير جداً. يجب أن يكون حجم السيرة الذاتية أقل من 10 ميجابايت.");
      return;
    }

    // Type check: PDF & DOCX
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    // Some browsers have empty mime-type for DOCX on Windows, check extension too
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
    const isAllowedExt = ["pdf", "docx", "doc"].includes(fileExtension || "");

    if (!allowedTypes.includes(selectedFile.type) && !isAllowedExt) {
      setError("صيغة الملف غير مدعومة. يرجى تحميل ملف بصيغة PDF أو DOCX فقط.");
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  const handleSubmit = () => {
    if (!file) {
      setError("يرجى اختيار ملف السيرة الذاتية أولاً.");
      return;
    }
    if (!targetJob.trim()) {
      setError("يرجى كتابة المسمى الوظيفي المستهدف.");
      return;
    }
    onAnalyzeClick(file, targetJob, jobDescription);
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-xl p-6 md:p-8 animate-slide-up">
      {/* Target Job Title */}
      <div className="mb-6">
        <label className="block text-slate-800 font-bold mb-2 text-sm text-right">
          الوظيفة المستهدفة <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={targetJob}
          onChange={(e) => setTargetJob(e.target.value)}
          placeholder="مثال: مدير مشاريع، مهندس برمجيات..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary text-right text-sm text-slate-800 transition"
        />
        {/* Popular suggestions */}
        <div className="mt-2 flex flex-wrap gap-2 justify-start md:justify-start">
          {popularJobs.map((job, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setTargetJob(job.split(" (")[0])}
              className="text-xs bg-slate-50 text-slate-500 hover:bg-secondary/10 hover:text-secondary px-2.5 py-1.5 rounded-lg border border-slate-100 transition duration-150 cursor-pointer"
            >
              {job}
            </button>
          ))}
        </div>
      </div>

      {/* Optional Job Description */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400 font-medium font-inter">اختياري (Optional)</span>
          <label className="block text-slate-800 font-bold text-sm text-right">
            الوصف الوظيفي (نص الإعلان الوظيفي)
          </label>
        </div>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="انسخ والصق متطلبات الوظيفة المعلنة هنا لقياس نسبة مطابقة سيرتك الذاتية معها بدقة..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary text-right text-sm text-slate-800 transition resize-none"
        />
      </div>

      {/* Drag & Drop Area */}
      <div className="mb-6">
        <label className="block text-slate-800 font-bold mb-2 text-sm text-right">
          ملف السيرة الذاتية <span className="text-red-500">*</span>
        </label>
        
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={file ? undefined : triggerFileInput}
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition duration-200 ${
            dragActive ? "border-secondary bg-secondary/5" : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
          } ${file ? "" : "cursor-pointer"}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc"
            className="hidden"
          />

          {!file ? (
            <div className="text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">اسحب ملف السيرة الذاتية هنا أو اضغط للتصفح</p>
              <p className="text-xs text-slate-400">PDF أو DOCX (بحد أقصى 10 ميجابايت)</p>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <button
                type="button"
                onClick={removeFile}
                className="text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
              >
                حذف الملف
              </button>
              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="text-sm font-bold text-slate-800 max-w-xs md:max-w-md truncate">{file.name}</p>
                  <p className="text-xs text-slate-400 font-inter">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Privacy Notice */}
        <p className="mt-3 text-xs text-slate-400 text-right leading-relaxed flex items-start gap-1.5 justify-end">
          <span>نستخدم سيرتك الذاتية فقط لغرض التحليل وإعداد التقرير. لا يتم مشاركة بياناتك مع أي جهة خارجية.</span>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-right text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="flex-1">{error}</p>
        </div>
      )}

      {/* Analyze Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || !targetJob.trim()}
        className={`w-full py-4 rounded-xl font-bold transition text-center shadow-lg hover:shadow-xl ${
          file && targetJob.trim()
            ? "bg-secondary text-white hover:bg-secondary/90 cursor-pointer"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        قيّم سيرتي الذاتية الآن (مجانًا)
      </button>
    </div>
  );
}
