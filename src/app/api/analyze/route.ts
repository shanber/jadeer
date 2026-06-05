import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/lib/parser";
import { analyzeResumeWithAI } from "@/lib/gemini";
import { dbAddDoc, dbUpdateDoc, storageUploadFile, USING_MOCK_FIREBASE } from "@/lib/firebase";
import { serverMockAddDoc, serverMockUpdateDoc } from "@/lib/mockDbServer";

async function addLead(data: any): Promise<{ id: string }> {
  if (!USING_MOCK_FIREBASE) {
    return await dbAddDoc("leads", data);
  } else {
    return serverMockAddDoc("leads", data);
  }
}

async function updateLead(id: string, data: any): Promise<void> {
  if (!USING_MOCK_FIREBASE) {
    await dbUpdateDoc("leads", id, data);
  } else {
    serverMockUpdateDoc("leads", id, data);
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let createdLeadId = "";
  
  try {
    console.log("[TRACE] [api/analyze] Received analysis request.");
    const formData = await req.formData();
    
    // Core parameters
    const file = formData.get("file") as File | null;
    const targetJob = formData.get("targetJob") as string | null;
    const jobDescription = (formData.get("jobDescription") as string | null) || "";
    const fullName = formData.get("fullName") as string | null;
    const email = formData.get("email") as string | null;
    const mobile = formData.get("mobile") as string | null;

    // UTM tracking parameters
    const utm_source = (formData.get("utm_source") as string | null) || "";
    const utm_medium = (formData.get("utm_medium") as string | null) || "";
    const utm_campaign = (formData.get("utm_campaign") as string | null) || "";
    const utm_content = (formData.get("utm_content") as string | null) || "";
    const utm_term = (formData.get("utm_term") as string | null) || "";

    console.log(`[TRACE] [api/analyze] [Upload] File: ${file?.name}, Target Job: "${targetJob}", Candidate: "${fullName}"`);

    // 1. Validation Checks
    if (!file || !targetJob || !fullName || !email || !mobile) {
      console.warn("[TRACE] [api/analyze] Validation failed: missing parameters.");
      return NextResponse.json(
        { error: "جميع الحقول الأساسية مطلوبة (الملف، الوظيفة المستهدفة، الاسم، البريد، رقم الجوال)" },
        { status: 400 }
      );
    }

    // File size constraint: 10MB
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeBytes) {
      console.warn(`[TRACE] [api/analyze] Validation failed: file size ${file.size} exceeds 10MB.`);
      return NextResponse.json(
        { error: "حجم الملف يتجاوز الحد الأقصى المسموح به (10 ميجابايت)" },
        { status: 400 }
      );
    }

    // File type validation (PDF / DOCX)
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!allowedMimeTypes.includes(file.type)) {
      console.warn(`[TRACE] [api/analyze] Validation failed: file type ${file.type} not allowed.`);
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم. يرجى تحميل ملف بصيغة PDF أو DOCX فقط" },
        { status: 400 }
      );
    }

    // Saudi phone format validation
    const saudiPhoneRegex = /^(05\d{8}|9665\d{8}|\+9665\d{8})$/;
    if (!saudiPhoneRegex.test(mobile)) {
      console.warn(`[TRACE] [api/analyze] Validation failed: mobile format ${mobile} is invalid.`);
      return NextResponse.json(
        { error: "رقم الجوال غير صحيح. يجب أن يتكون من 10 خانات ويبدأ بـ 05 أو 9665" },
        { status: 400 }
      );
    }

    // 2. Pre-create Lead in Database (Ensures lead is NEVER lost)
    console.log(`[TRACE] [api/analyze] [Lead Creation] Pre-logging lead in database for "${fullName}"...`);
    const initialLeadData = {
      fullName,
      email,
      mobile,
      targetJob,
      jobDescription,
      status: "جديد", // Default Arabic status
      source: "resume_analyzer_landing",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      overallScore: 0,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      resumeName: file.name,
      analysisStatus: "pending",
    };

    const addResult = await addLead(initialLeadData);
    createdLeadId = addResult.id;
    console.log(`[TRACE] [api/analyze] [Lead Creation] Success. Lead document pre-created with ID: "${createdLeadId}"`);

    // 3. Upload File to Storage
    console.log(`[TRACE] [api/analyze] [Upload] Preparing file buffers and uploading to storage ref resumes/${createdLeadId}...`);
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const storagePath = `resumes/${createdLeadId}/${Date.now()}_${file.name}`;
    
    let resumeUrl = "";
    try {
      resumeUrl = await storageUploadFile(storagePath, fileBuffer, file.type);
      console.log(`[TRACE] [api/analyze] [Upload] Upload successful. Secured URL: ${resumeUrl}`);
    } catch (storageError) {
      console.error("[TRACE] [api/analyze] [Upload] WARNING: Storage upload failed:", storageError);
      resumeUrl = "/mock-resume-download-placeholder.pdf"; // Fallback URL
    }

    // Update document with resume URL and storage path
    await updateLead(createdLeadId, {
      resumeUrl,
      resumePath: storagePath,
    });

    // 4. Parse Resume Content
    console.log(`[TRACE] [api/analyze] [Analysis] Extracting text content from file buffer...`);
    let textContent = "";
    try {
      textContent = await parseResume(fileBuffer, file.type);
      console.log(`[TRACE] [api/analyze] [Analysis] Text extraction successful. Length: ${textContent.length} characters.`);
    } catch (parseError: any) {
      console.error("[TRACE] [api/analyze] [Analysis] Text extraction failed:", parseError);
      await updateLead(createdLeadId, {
        analysisStatus: "error",
        errorDetails: `Text parsing failed: ${parseError.message}`,
      });
      return NextResponse.json(
        { error: "فشل استخراج النصوص من السيرة الذاتية. يرجى التأكد من أن الملف نصي وليس عبارة عن صور ممسوحة ضوئياً" },
        { status: 422 }
      );
    }

    // Check if extracted text is too short
    if (textContent.trim().length < 150) {
      console.warn(`[TRACE] [api/analyze] [Analysis] Text extraction too short: ${textContent.trim().length} chars.`);
      await updateLead(createdLeadId, {
        analysisStatus: "error",
        errorDetails: "Extracted text content too short",
      });
      return NextResponse.json(
        { error: "النصوص المستخرجة من الملف قصيرة جداً. يرجى التأكد من تحميل سيرة ذاتية حقيقية تحتوي على تفاصيل خبراتك" },
        { status: 400 }
      );
    }

    // 5. Run AI Analysis
    console.log(`[TRACE] [api/analyze] [Analysis] Running AI Resume Analyzer engine (Target Job: "${targetJob}")...`);
    try {
      const analysisResult = await analyzeResumeWithAI(
        textContent,
        targetJob,
        jobDescription
      );
      console.log(`[TRACE] [api/analyze] [Analysis] AI evaluation complete. Overall Score generated: ${analysisResult.overallScore}`);

      // 6. Update Lead with Complete Results
      console.log(`[TRACE] [api/analyze] [Save Result] Committing final analysis results to database for lead ID: "${createdLeadId}"...`);
      await updateLead(createdLeadId, {
        overallScore: analysisResult.overallScore,
        analysisResult,
        analysisStatus: "completed",
        updatedAt: new Date().toISOString(),
      });
      console.log(`[TRACE] [api/analyze] [Save Result] Database commit successful.`);

      // Sync mock lead data back to browser client
      const finalLeadData = {
        ...initialLeadData,
        id: createdLeadId,
        resumeUrl,
        resumePath: storagePath,
        overallScore: analysisResult.overallScore,
        analysisResult,
        analysisStatus: "completed",
      };

      console.log(`[TRACE] [api/analyze] [Redirect] Returning success response code. Lead ID: "${createdLeadId}"`);
      return NextResponse.json({
        success: true,
        leadId: createdLeadId,
        leadData: USING_MOCK_FIREBASE ? finalLeadData : null,
      });

    } catch (aiError: any) {
      console.error("[TRACE] [api/analyze] [Analysis] AI Analysis execution failed:", aiError);
      await updateLead(createdLeadId, {
        analysisStatus: "error",
        errorDetails: `AI analysis failed: ${aiError.message}`,
      });
      return NextResponse.json(
        { error: "فشل تقييم السيرة الذاتية بواسطة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى لاحقاً" },
        { status: 500 }
      );
    }

  } catch (err: any) {
    console.error("[TRACE] [api/analyze] Fatal router exception occurred:", err);
    return NextResponse.json(
      { error: `حدث خطأ فني غير متوقع: ${err.message}` },
      { status: 500 }
    );
  }
}
