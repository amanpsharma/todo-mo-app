"use client";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Expect env vars (add them in .env.local)
// NEXT_PUBLIC_FIREBASE_API_KEY, AUTH_DOMAIN, PROJECT_ID, etc.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let _configValid = false;
let _missingKeys = [];

function computeStatus() {
  const required = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];
  _missingKeys = required.filter((k) => {
    const v = firebaseConfig[k];
    return !v || /your_|REPLACE_ME|000000000000|XXXXXXXXXX/i.test(v);
  });
  _configValid = _missingKeys.length === 0;
}

computeStatus();

function validateConfig() {
  computeStatus();
  if (!_configValid) {
    const msg = `Firebase config incomplete (missing/placeholder): ${_missingKeys.join(
      ", "
    )}`;
    if (typeof window === "undefined") {
      console.warn("(build) " + msg);
    } else if (!window.__firebaseConfigWarned) {
      console.warn(msg);
      window.__firebaseConfigWarned = true;
    }
  }
}

let appInstance; // cache to avoid repeated init attempts after a thrown validation error

export function getFirebaseApp() {
  if (!appInstance) {
    validateConfig(firebaseConfig);
    if (!_configValid) return null; // defer until real keys provided
    appInstance =
      getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return appInstance;
}

export function getFirebaseAuth() {
  const app = getFirebaseApp();
  if (!app) throw new Error("firebase-config-incomplete");
  return getAuth(app);
}

export function getFirestoreDb() {
  return getFirestore(getFirebaseApp());
}

export const googleProvider = new GoogleAuthProvider();

export function firebaseConfigStatus() {
  return { valid: _configValid, missing: _missingKeys };
}
