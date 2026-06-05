import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword as realSignIn, signOut as realSignOut } from "firebase/auth";
import {
  getFirestore,
  addDoc as realAddDoc,
  updateDoc as realUpdateDoc,
  getDoc as realGetDoc,
  getDocs as realGetDocs,
  collection,
  doc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes as realUpload, getDownloadURL as realDownload } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isFirebaseConfigured =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

let app;
let realAuth: any;
let realDb: any;
let realStorage: any;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    realAuth = getAuth(app);
    realDb = getFirestore(app);
    realStorage = getStorage(app);
  } catch (error) {
    console.error("Error initializing Firebase, falling back to mock:", error);
  }
}

// Local mock storage system using localStorage
class MockFirestore {
  private getLeads(): any[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem("jadeer_leads");
    return data ? JSON.parse(data) : [];
  }

  private saveLeads(leads: any[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem("jadeer_leads", JSON.stringify(leads));
    this.updateStats();
  }

  private updateStats() {
    if (typeof window === "undefined") return;
    const leads = this.getLeads();
    const totalAnalyses = leads.length;
    const totalLeads = leads.length;
    const sumOverallScore = leads.reduce((sum, l) => sum + (l.overallScore || 0), 0);
    const averageScore = totalAnalyses > 0 ? Math.round(sumOverallScore / totalAnalyses) : 0;

    localStorage.setItem(
      "jadeer_global_stats",
      JSON.stringify({
        totalAnalyses,
        totalLeads,
        averageScore,
        sumOverallScore,
        lastUpdatedAt: new Date().toISOString(),
      })
    );
  }

  async getDoc(collectionName: string, id: string) {
    if (collectionName === "leads") {
      const leads = this.getLeads();
      const lead = leads.find((l) => l.id === id);
      return {
        exists: () => !!lead,
        data: () => lead,
        id,
      };
    } else if (collectionName === "analytics" && id === "global_stats") {
      if (typeof window === "undefined") return { exists: () => false, data: () => null, id: "global_stats" };
      const stats = localStorage.getItem("jadeer_global_stats");
      const defaultStats = { totalAnalyses: 0, totalLeads: 0, averageScore: 0 };
      return {
        exists: () => true,
        data: () => (stats ? JSON.parse(stats) : defaultStats),
        id,
      };
    }
    return { exists: () => false, data: () => null, id };
  }

  async addDoc(collectionName: string, data: any) {
    if (collectionName !== "leads") throw new Error("Mock only supports leads collection");
    const leads = this.getLeads();
    const id = "mock_lead_" + Math.random().toString(36).substring(2, 11);
    const newDoc = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    leads.push(newDoc);
    this.saveLeads(leads);
    return { id, path: `leads/${id}` };
  }

  async updateDoc(collectionName: string, id: string, data: any) {
    if (collectionName !== "leads") throw new Error("Mock only supports leads collection");
    const leads = this.getLeads();
    const index = leads.findIndex((l) => l.id === id);
    if (index !== -1) {
      leads[index] = {
        ...leads[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.saveLeads(leads);
    }
  }

  async getDocs(collectionName: string) {
    if (collectionName !== "leads") throw new Error("Mock only supports leads collection");
    const leads = this.getLeads().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return {
      docs: leads.map((l) => ({
        id: l.id,
        data: () => l,
      })),
      empty: leads.length === 0,
      size: leads.length,
    };
  }
}

class MockAuth {
  async signInWithEmailAndPassword(email: string, pass: string) {
    if (email === "admin@jadeer.sa" && pass === "jadeer2026") {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("jadeer_mock_admin_token", "logged_in");
      }
      return { user: { email: "admin@jadeer.sa", uid: "mock_admin_uid" } };
    }
    throw new Error("Invalid admin email or password (Mock Admin: admin@jadeer.sa / jadeer2026)");
  }

  async signOut() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("jadeer_mock_admin_token");
    }
  }

  onAuthStateChanged(callback: (user: any) => void) {
    if (typeof window === "undefined") {
      callback(null);
      return () => {};
    }
    const checkUser = () => {
      const token = sessionStorage.getItem("jadeer_mock_admin_token");
      if (token === "logged_in") {
        callback({ email: "admin@jadeer.sa", uid: "mock_admin_uid" });
      } else {
        callback(null);
      }
    };
    checkUser();
    const interval = setInterval(checkUser, 1000);
    return () => clearInterval(interval);
  }
}

class MockStorage {
  async uploadBytes(ref: any, file: File | Blob) {
    return {
      metadata: { fullPath: `mock-resumes/mock_file_${Date.now()}` },
      ref,
    };
  }
  async getDownloadURL(ref: any) {
    return "/mock-resume-download-placeholder.pdf";
  }
}

export const db = isFirebaseConfigured ? realDb : new MockFirestore();
export const auth = isFirebaseConfigured ? realAuth : new MockAuth();
export const storage = isFirebaseConfigured ? realStorage : new MockStorage();
export const USING_MOCK_FIREBASE = !isFirebaseConfigured;

// Unified database helper methods
export async function dbAddDoc(collectionName: string, data: any): Promise<{ id: string }> {
  if (isFirebaseConfigured) {
    const res = await realAddDoc(collection(realDb, collectionName), data);
    return { id: res.id };
  } else {
    if (typeof window === "undefined") {
      return { id: "mock_lead_" + Math.random().toString(36).substring(2, 11) };
    } else {
      const localLeads = localStorage.getItem("jadeer_leads");
      const leads = localLeads ? JSON.parse(localLeads) : [];
      const id = "mock_lead_" + Math.random().toString(36).substring(2, 11);
      const newDoc = {
        ...data,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      leads.push(newDoc);
      localStorage.setItem("jadeer_leads", JSON.stringify(leads));
      return { id };
    }
  }
}

export async function dbUpdateDoc(collectionName: string, id: string, data: any): Promise<void> {
  if (isFirebaseConfigured) {
    await realUpdateDoc(doc(realDb, collectionName, id), data);
  } else {
    if (typeof window !== "undefined") {
      const localLeads = localStorage.getItem("jadeer_leads");
      const leads = localLeads ? JSON.parse(localLeads) : [];
      const index = leads.findIndex((l: any) => l.id === id);
      if (index !== -1) {
        leads[index] = {
          ...leads[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("jadeer_leads", JSON.stringify(leads));
      }
    }
  }
}

export async function dbGetDoc(collectionName: string, id: string): Promise<{ exists: () => boolean; data: () => any; id: string }> {
  if (isFirebaseConfigured) {
    const snap = await realGetDoc(doc(realDb, collectionName, id));
    return {
      exists: () => snap.exists(),
      data: () => snap.data(),
      id: snap.id,
    };
  } else {
    if (typeof window === "undefined") {
      const { serverMockGetDoc } = require("./mockDbServer");
      const res = serverMockGetDoc(collectionName, id);
      return {
        exists: () => res.exists,
        data: () => res.data,
        id: res.id,
      };
    } else {
      const localLeads = localStorage.getItem("jadeer_leads");
      if (localLeads) {
        const leads = JSON.parse(localLeads);
        const lead = leads.find((l: any) => l.id === id);
        if (lead) {
          return {
            exists: () => true,
            data: () => lead,
            id,
          };
        }
      }
      return {
        exists: () => false,
        data: () => null,
        id,
      };
    }
  }
}

export async function dbGetDocs(collectionName: string): Promise<{ docs: Array<{ id: string; data: () => any }>; empty: boolean; size: number }> {
  if (isFirebaseConfigured) {
    const snap = await realGetDocs(collection(realDb, collectionName));
    return {
      docs: snap.docs.map((d) => ({ id: d.id, data: () => d.data() })),
      empty: snap.empty,
      size: snap.size,
    };
  } else {
    if (typeof window === "undefined") {
      const { serverMockGetDocs } = require("./mockDbServer");
      const list = serverMockGetDocs(collectionName);
      return {
        docs: list.map((item: any) => ({ id: item.id, data: () => item })),
        empty: list.length === 0,
        size: list.length,
      };
    } else {
      const localLeads = localStorage.getItem("jadeer_leads");
      const leads = localLeads ? JSON.parse(localLeads) : [];
      const sorted = leads.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return {
        docs: sorted.map((l: any) => ({ id: l.id, data: () => l })),
        empty: sorted.length === 0,
        size: sorted.length,
      };
    }
  }
}

// Storage helpers
export async function storageUploadFile(filePath: string, fileBuffer: Buffer | Blob, contentType?: string): Promise<string> {
  if (isFirebaseConfigured) {
    const storageRef = ref(realStorage, filePath);
    const options = contentType ? { contentType } : undefined;
    await realUpload(storageRef, fileBuffer instanceof Buffer ? fileBuffer : fileBuffer, options);
    return await realDownload(storageRef);
  } else {
    return "/mock-resume-download-placeholder.pdf";
  }
}
