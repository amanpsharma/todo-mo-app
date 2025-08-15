// Shared utility functions used across components
import { toast } from "react-toastify";

// Filters for todos
export const FILTERS = {
  all: () => true,
  active: (t) => !t.completed,
  completed: (t) => t.completed,
};

// Default categories used in the app
export const DEFAULT_CATEGORIES = [
  "general",
  "work",
  "personal",
  "shopping",
  "urgent",
];

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

// Permission helpers
export const hasWritePermission = (perms) =>
  Array.isArray(perms) && perms.includes("write");
export const hasEditPermission = (perms) =>
  Array.isArray(perms) && perms.includes("edit");
export const hasDeletePermission = (perms) =>
  Array.isArray(perms) && perms.includes("delete");

// Footer helper text based on view and permissions
export function getFooterText(sharedView, perms) {
  if (!sharedView) return "Synced securely to your account (MongoDB).";
  const canEdit = hasEditPermission(perms) || hasDeletePermission(perms);
  const canWrite = hasWritePermission(perms);
  if (canEdit) return "Viewing shared data (editable)";
  if (canWrite) return "Viewing shared data (can add)";
  return "Viewing shared data (read-only)";
}

// Build delete confirmation message for a given list and id
export function getDeleteTodoMessage(list, id) {
  try {
    const t = Array.isArray(list) ? list.find((x) => x.id === id) : null;
    return t ? `Delete this todo?\n\n${t.text}` : "Delete this todo?";
  } catch {
    return "Delete this todo?";
  }
}

// Toast helper with sane defaults
export function showToast(message, options = undefined) {
  const m = String(message || "");
  if (!m) return;
  try {
    toast.dismiss();
    toast(m, options);
  } catch {}
}

// Show an Undo delete toast. onUndo is a callback invoked when the user clicks Undo.
// Options can override autoClose and other toastify settings.
export function showUndoDeleteToast(label, onUndo, options = {}) {
  try {
    const content = ({ closeToast }) => (
      // Using simple inline structure to avoid component dependency here
      // eslint-disable-next-line react/jsx-key
      <span className="flex items-center gap-2">
        {label}
        <button
          onClick={async () => {
            try {
              await onUndo?.();
            } finally {
              closeToast?.();
            }
          }}
          className="ml-2 rounded px-2 py-0.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
        >
          Undo
        </button>
      </span>
    );
    toast.dismiss();
    toast(content, { autoClose: 5000, ...options });
  } catch {}
}
