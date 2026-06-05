import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.GEMINI_API_KEY || "";
  if (!key) {
    return NextResponse.json({ error: "No GEMINI_API_KEY set in environment variables." });
  }

  try {
    console.log("[TRACE] [api/test-models] Fetching model list from Gemini API...");
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    
    console.log(`[TRACE] [api/test-models] API response status: ${res.status}`);
    
    return NextResponse.json({
      status: res.status,
      statusText: res.statusText,
      data
    });
  } catch (err: any) {
    console.error("[TRACE] [api/test-models] Failed to fetch models:", err);
    return NextResponse.json({ error: err.message });
  }
}
