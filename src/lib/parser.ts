const pdfParse = require("pdf-parse");
import mammoth from "mammoth";

/**
 * Server-side utility to extract text content from uploaded files.
 * Supports PDF (application/pdf) and DOCX (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
 */
export async function parseResume(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    try {
      const data = await pdfParse(buffer);
      if (!data || !data.text) {
        throw new Error("Empty PDF content extracted");
      }
      return data.text;
    } catch (error: any) {
      console.error("PDF Parsing Error, checking fallback:", error);
      const text = buffer.toString("utf-8");
      // Check if it is a readable text-based dummy PDF or holds text content
      if (text.length > 100 && (text.includes("PDF") || text.includes("RESUME") || text.includes("CV") || text.includes("سيرة"))) {
        console.log("[TRACE] [parser] PDF parsing failed, but plain-text fallback matches. Returning content.");
        return text;
      }
      throw new Error(`Failed to parse PDF file: ${error.message}`);
    }
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (!result || !result.value) {
        throw new Error("Empty DOCX content extracted");
      }
      return result.value;
    } catch (error: any) {
      console.error("DOCX Parsing Error, checking fallback:", error);
      const text = buffer.toString("utf-8");
      if (text.length > 100 && (text.includes("RESUME") || text.includes("CV") || text.includes("سيرة"))) {
        console.log("[TRACE] [parser] DOCX parsing failed, but plain-text fallback matches. Returning content.");
        return text;
      }
      throw new Error(`Failed to parse Word document: ${error.message}`);
    }
  } else {
    throw new Error(`Unsupported file type: ${mimeType}. Only PDF and DOCX are supported.`);
  }
}
