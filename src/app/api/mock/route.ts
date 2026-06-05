import { NextRequest, NextResponse } from "next/server";
import {
  serverMockAddDoc,
  serverMockUpdateDoc,
  serverMockGetDoc,
  serverMockGetDocs,
} from "@/lib/mockDbServer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, collectionName, id, data } = body;

    console.log(`[TRACE] [api/mock] Action received: "${action}" on collection "${collectionName}"`);

    if (action === "addDoc") {
      const res = serverMockAddDoc(collectionName, data);
      return NextResponse.json(res);
    } else if (action === "updateDoc") {
      serverMockUpdateDoc(collectionName, id, data);
      return NextResponse.json({ success: true });
    } else if (action === "getDoc") {
      const res = serverMockGetDoc(collectionName, id);
      return NextResponse.json(res);
    } else if (action === "getDocs") {
      const list = serverMockGetDocs(collectionName);
      return NextResponse.json({ docs: list });
    }

    return NextResponse.json({ error: "Invalid mock action requested" }, { status: 400 });
  } catch (err: any) {
    console.error("[TRACE] [api/mock] Error handling mock action:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
