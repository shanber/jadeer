import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), ".jadeer_mock_db.json");

interface DbSchema {
  leads: any[];
  stats: {
    totalAnalyses: number;
    totalLeads: number;
    averageScore: number;
    lastUpdatedAt: string;
  };
}

function readDb(): DbSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Read mock DB failed, using defaults:", err);
  }
  return {
    leads: [],
    stats: {
      totalAnalyses: 0,
      totalLeads: 0,
      averageScore: 0,
      lastUpdatedAt: new Date().toISOString(),
    },
  };
}

function writeDb(data: DbSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Write mock DB failed:", err);
  }
}

function generateReportId(): string {
  const currentYear = new Date().getFullYear();
  let randomNum = 0;
  try {
    const crypto = require("crypto");
    randomNum = crypto.randomInt(10000, 100000); // 10000 to 99999
  } catch (e) {
    randomNum = Math.floor(10000 + Math.random() * 90000);
  }
  return `JDR-${currentYear}-${randomNum}`;
}

export function serverMockAddDoc(collectionName: string, data: any) {
  console.log(`[TRACE] [mockDbServer] addDoc on collection "${collectionName}"`);
  if (collectionName !== "leads") {
    try {
      const crypto = require("crypto");
      return { id: "gen_" + crypto.randomBytes(4).toString("hex") };
    } catch (e) {
      return { id: "gen_" + Math.random().toString(36).substring(2, 9) };
    }
  }

  const db = readDb();
  const id = generateReportId();
  const newDoc = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  db.leads.push(newDoc);
  
  // Re-calculate statistics
  const total = db.leads.length;
  const sum = db.leads.reduce((s: number, l: any) => s + (l.overallScore || 0), 0);
  const avg = total > 0 ? Math.round(sum / total) : 0;
  
  db.stats = {
    totalAnalyses: total,
    totalLeads: total,
    averageScore: avg,
    lastUpdatedAt: new Date().toISOString(),
  };

  writeDb(db);
  console.log(`[TRACE] [mockDbServer] Saved new lead with ID: ${id}`);
  return { id };
}

export function serverMockUpdateDoc(collectionName: string, id: string, data: any) {
  console.log(`[TRACE] [mockDbServer] updateDoc on collection "${collectionName}" for ID: ${id}`);
  if (collectionName !== "leads") return;

  const db = readDb();
  const index = db.leads.findIndex((l: any) => l.id === id);
  
  if (index !== -1) {
    db.leads[index] = {
      ...db.leads[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    // Re-calculate statistics
    const total = db.leads.length;
    const sum = db.leads.reduce((s: number, l: any) => s + (l.overallScore || 0), 0);
    const avg = total > 0 ? Math.round(sum / total) : 0;
    
    db.stats = {
      totalAnalyses: total,
      totalLeads: total,
      averageScore: avg,
      lastUpdatedAt: new Date().toISOString(),
    };

    writeDb(db);
    console.log(`[TRACE] [mockDbServer] Successfully updated lead ID: ${id}`);
  } else {
    console.warn(`[TRACE] [mockDbServer] Warning: lead ID ${id} not found to update.`);
  }
}

export function serverMockGetDoc(collectionName: string, id: string) {
  console.log(`[TRACE] [mockDbServer] getDoc on collection "${collectionName}" for ID: ${id}`);
  const db = readDb();
  
  if (collectionName === "leads") {
    const lead = db.leads.find((l: any) => l.id === id);
    return {
      exists: !!lead,
      data: lead || null,
      id,
    };
  } else if (collectionName === "analytics" && id === "global_stats") {
    return {
      exists: true,
      data: db.stats,
      id,
    };
  }
  return { exists: false, data: null, id };
}

export function serverMockGetDocs(collectionName: string) {
  console.log(`[TRACE] [mockDbServer] getDocs on collection "${collectionName}"`);
  const db = readDb();
  
  if (collectionName === "leads") {
    return db.leads.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  return [];
}
