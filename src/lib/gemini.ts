import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const hasApiKey = apiKey.trim().length > 0;

let genAI: GoogleGenerativeAI | null = null;
if (hasApiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export interface ScoreBreakdown {
  ats: number;
  experience: number;
  skills: number;
  formatting: number;
  keyword: number;
  linkedin: number;
}

export interface AnalysisResult {
  score: number;
  level: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  suggestedService: string;
  subScores: {
    professionalSummary: number;
    experienceClarity: number;
    achievementsMetrics: number;
    atsKeywords: number;
    structureFormatting: number;
    skillsSection: number;
    educationCertifications: number;
    contactInformation: number;
  };
  overallScore?: number; // legacy compatibility
  scores?: ScoreBreakdown; // legacy compatibility
  improvements?: string[]; // legacy compatibility
  missingKeywords: string[];
  atsWarnings: string[];
  suggestedSummary: string;
  suggestedSkills: string[];
}

/**
 * Runs the Gemini Resume Analysis.
 * Throws an error if the GEMINI_API_KEY is not defined.
 */
export async function analyzeResumeWithAI(
  resumeText: string,
  targetJob: string,
  jobDescription?: string
): Promise<AnalysisResult> {
  if (!hasApiKey || !genAI) {
    console.error("No GEMINI_API_KEY detected. Aborting analysis.");
    throw new Error("API_KEY_MISSING");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            score: {
              type: SchemaType.INTEGER,
              description: "Overall score out of 100, which MUST be the exact sum of the 8 subScores."
            },
            level: {
              type: SchemaType.STRING,
              description: "Arabic evaluation level based on score (e.g. 'ضعيف ويحتاج تعديل جذري' for <50, 'جيد ويحتاج تحسين' for 50-75, 'جيد جداً ومنافس' for 75-90)."
            },
            strengths: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Exactly 3 distinct, professional strengths of the CV in Arabic."
            },
            weaknesses: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Exactly 3 distinct weaknesses/areas of improvement of the CV in Arabic."
            },
            recommendations: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Exactly 10 detailed, actionable recommendations in Arabic."
            },
            suggestedService: {
              type: SchemaType.STRING,
              description: "Suggested service. MUST be exactly one of: 'تحسين السيرة الذاتية', 'تحسين ملف لينكد إن', 'استشارة مهنية'."
            },
            subScores: {
              type: SchemaType.OBJECT,
              properties: {
                professionalSummary: { type: SchemaType.INTEGER, description: "Score for Professional Summary (0 to 10 points)" },
                experienceClarity: { type: SchemaType.INTEGER, description: "Score for Experience Clarity (0 to 20 points)" },
                achievementsMetrics: { type: SchemaType.INTEGER, description: "Score for Achievements & Metrics (0 to 15 points)" },
                atsKeywords: { type: SchemaType.INTEGER, description: "Score for ATS Keywords (0 to 20 points)" },
                structureFormatting: { type: SchemaType.INTEGER, description: "Score for Structure & Formatting (0 to 15 points)" },
                skillsSection: { type: SchemaType.INTEGER, description: "Score for Skills Section (0 to 10 points)" },
                educationCertifications: { type: SchemaType.INTEGER, description: "Score for Education & Certifications (0 to 5 points)" },
                contactInformation: { type: SchemaType.INTEGER, description: "Score for Contact Information (0 to 5 points)" }
              },
              required: [
                "professionalSummary",
                "experienceClarity",
                "achievementsMetrics",
                "atsKeywords",
                "structureFormatting",
                "skillsSection",
                "educationCertifications",
                "contactInformation"
              ]
            },
            scores: {
              type: SchemaType.OBJECT,
              properties: {
                ats: { type: SchemaType.INTEGER, description: "ATS compatibility score out of 100" },
                experience: { type: SchemaType.INTEGER, description: "Experience quality score out of 100" },
                skills: { type: SchemaType.INTEGER, description: "Skills relevance score out of 100" },
                formatting: { type: SchemaType.INTEGER, description: "Visual formatting score out of 100" },
                keyword: { type: SchemaType.INTEGER, description: "Keyword density score out of 100" },
                linkedin: { type: SchemaType.INTEGER, description: "LinkedIn optimization readiness out of 100" }
              },
              required: ["ats", "experience", "skills", "formatting", "keyword", "linkedin"]
            },
            missingKeywords: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "At least 5 missing keywords/skills for the target job in Saudi market."
            },
            atsWarnings: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "At least 3 ATS compatibility warning messages in Arabic."
            },
            suggestedSummary: {
              type: SchemaType.STRING,
              description: "Suggested professional summary paragraph in Arabic."
            },
            suggestedSkills: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "At least 4 suggested skills to add to the CV."
            }
          },
          required: [
            "score",
            "level",
            "strengths",
            "weaknesses",
            "recommendations",
            "suggestedService",
            "subScores",
            "scores",
            "missingKeywords",
            "atsWarnings",
            "suggestedSummary",
            "suggestedSkills"
          ]
        }
      }
    });

    const jdContext = jobDescription
      ? `قارن النص بدقة مع هذا الوصف الوظيفي المحدد:\n"${jobDescription}"`
      : "";

    const prompt = `
أنت خبير التوظيف وأنظمة فرز السير الذاتية (ATS) في استوديو "جدير" (JADEER) الاحترافي بالمملكة العربية السعودية.
مهمتك هي إجراء تحليل نقدي وعميق للسيرة الذاتية المقدمة بناءً على المسمى الوظيفي المستهدف: "${targetJob}".
${jdContext}

قواعد التقييم الصارمة:
1. كن ناقداً ومحترفاً للغاية. جدير هو استوديو فاخر، ونريد من العميل فهم نقاط الضعف الحقيقية في سيرته الذاتية الحالية ليقدّر قيمة خدمات جدير المدفوعة. لا تمنح درجات مرتفعة (فوق 75) إلا للسير الذاتية الاستثنائية.
2. احسب الدرجات الفرعية (subScores) لـ 8 معايير بدقة بناءً على جودة محتوى السيرة الذاتية المقدمة:
   - Professional Summary (الملخص المهني): أقصى حد 10 درجات.
   - Experience Clarity (وضوح الخبرات العملية): أقصى حد 20 درجة.
   - Achievements & Metrics (قوة الإنجازات والأرقام القابلة للقياس): أقصى حد 15 درجة.
   - ATS Keywords (الكلمات المفتاحية المهنية): أقصى حد 20 درجة.
   - Structure & Formatting (التنسيق والبنية وقابلية القراءة للـ ATS): أقصى حد 15 درجة.
   - Skills Section (وجود وترتيب المهارات): أقصى حد 10 درجات.
   - Education & Certifications (وجود التعليم والشهادات الاحترافية): أقصى حد 5 درجات.
   - Contact Information (وضوح ودقة معلومات التواصل): أقصى حد 5 درجات.
   
3. الدرجة النهائية الإجمالية (score) يجب أن تكون مجموع هذه الدرجات الفرعية الثمانية بالضبط (الحد الأقصى هو 100).
4. اضبط التقييم النهائي ونوعية الـ CV حسب الفئات التالية:
   - سيرة ضعيفة (مثلاً تفتقر للأرقام، ناقصة الأقسام، أو سيئة التنسيق): المجموع الكلي (score) أقل من 50.
   - سيرة متوسطة (تحتوي الهيكل الأساسي ولكن بدون كلمات مفتاحية دقيقة أو إنجازات رقمية واضحة): المجموع الكلي (score) بين 50 و 75.
   - سيرة قوية (احترافية ومنسقة بشكل ممتاز ومعلومات واضحة، ولكن تحتاج تحسينات طفيفة): المجموع الكلي (score) بين 75 و 90.
   - لا تمنح الدرجة النهائية 100/100 أبداً إلا إذا كان الملف خالياً تماماً من أي عيب، وهو أمر نادر الحدوث.
5. اكتب جميع الملاحظات والتوصيات ونقاط القوة والضعف والملخص المقترح باللغة العربية الفصحى وبأسلوب مهني ولبق ومقنع.
6. التزم تماماً بالسياق السعودي (رؤية المملكة 2030، سوق العمل السعودي، المصطلحات المتداولة).
7. يجب أن تختلف النتيجة من ملف إلى آخر حسب جودة المحتوى الفعلي.

نص السيرة الذاتية المراد تحليلها:
"""
${resumeText}
"""
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean potential code block wrappers if Gemini ignored instructions
    const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsedData: AnalysisResult = JSON.parse(jsonString);
    
    // Set legacy fields on the returned object for compatibility
    parsedData.overallScore = parsedData.score;
    parsedData.improvements = parsedData.weaknesses;
    
    return parsedData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
