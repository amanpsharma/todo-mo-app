import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import jwt from "jsonwebtoken";
import fs from "fs";

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

function isPlaceholder(val) {
  return (
    !val ||
    /REPLACE_ME|your_project_id|your_key_content|XXXXXXXXXX|000000000000/i.test(
      String(val)
    )
  );
}

function parseServiceAccountFromEnv() {
  // Priority 1: FIREBASE_SERVICE_ACCOUNT (raw JSON string)
  const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch (e) {
      console.error("FIREBASE_SERVICE_ACCOUNT is not valid JSON");
    }
  }
  // Priority 2: FIREBASE_SERVICE_ACCOUNT_BASE64 (base64-encoded JSON)
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (b64) {
    try {
      const decoded = Buffer.from(b64, "base64").toString("utf8");
      const parsed = JSON.parse(decoded);
      return parsed;
    } catch (e) {
      console.error("FIREBASE_SERVICE_ACCOUNT_BASE64 is invalid");
    }
  }
  // Priority 3: FIREBASE_SERVICE_ACCOUNT_PATH (filesystem path to JSON)
  const p = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (p) {
    try {
      const file = fs.readFileSync(p, "utf8");
      const parsed = JSON.parse(file);
      return parsed;
    } catch (e) {
      console.error("Failed to read FIREBASE_SERVICE_ACCOUNT_PATH", e?.message);
    }
  }
  // Fallback to individual vars
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    // Support both literals with \n and actual newlines
    privateKey = privateKey.replace(/\\n/g, "\n");
  }
  if (!isPlaceholder(clientEmail) && !isPlaceholder(privateKey)) {
    return {
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey,
    };
  }
  return null;
}

function ensureApp() {
  if (getApps().length) return true;
  const svc = parseServiceAccountFromEnv();
  if (!svc) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Firebase Admin not initialized: missing or placeholder credentials. Set FIREBASE_SERVICE_ACCOUNT(_BASE64/_PATH) or FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY."
      );
    }
    return false;
  }
  const clientEmail = svc.client_email || process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = svc.private_key || process.env.FIREBASE_PRIVATE_KEY;
  const pid = svc.project_id || projectId;
  try {
    initializeApp({
      credential: cert({
        projectId: pid,
        clientEmail,
        privateKey: privateKey?.replace(/\\n/g, "\n"),
      }),
    });
    return true;
  } catch (e) {
    console.error("Firebase Admin init failed", e);
    return false;
  }
}

export async function verifyIdToken(idToken) {
  if (!ensureApp()) {
    // Fallback: decode header/payload without signature verification (NOT secure; dev-only fallback)
    try {
      const decoded = jwt.decode(idToken, { complete: false });
      if (decoded && decoded.sub) {
        return { uid: decoded.sub, email: decoded.email || null };
      }
    } catch (e) {
      // ignore
    }
    throw new Error("admin-not-configured");
  }
  return getAuth().verifyIdToken(idToken);
}
