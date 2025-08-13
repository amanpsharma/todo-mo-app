// Shared utility functions used across components

// Filters for todos
export const FILTERS = {
  all: () => true,
  active: (t) => !t.completed,
  completed: (t) => t.completed,
};

// Normalize and sanitize category input
export function sanitizeCategoryName(input) {
  if (!input) return "";
  const raw = String(input).trim().toLowerCase();
  // allow letters, numbers, hyphen and spaces; collapse multiple spaces
  const cleaned = raw.replace(/[^a-z0-9\-\s]/g, "").replace(/\s+/g, " ");
  return cleaned;
}

// Basic email validation used before calling share API
export function isValidEmail(email) {
  if (!email) return false;
  const e = String(email).trim();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
}

// Retrieve Firebase auth token from the global auth instance set by AuthProvider
export async function getAuthToken() {
  const auth = typeof window !== "undefined" ? window.__firebaseAuth : null;
  const token = await auth?.currentUser?.getIdToken();
  if (!token) throw new Error("No auth token");
  return token;
}

// Format a timestamp to a user-friendly local date and time
export function formatDateTime(ts, includeTime = true) {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    if (!includeTime) return `${dd}/${mm}/${yy}`;
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yy} ${hh}:${min}`;
  } catch {
    return "";
  }
}
