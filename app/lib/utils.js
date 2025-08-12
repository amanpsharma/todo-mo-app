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
