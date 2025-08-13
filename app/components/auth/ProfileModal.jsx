"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function ProfileModal({ open, onCancel, onSave, initial }) {
  const [displayName, setDisplayName] = useState(initial?.displayName || "");
  const [photoURL, setPhotoURL] = useState(initial?.photoURL || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setDisplayName(initial?.displayName || "");
      setPhotoURL(initial?.photoURL || "");
      setError(null);
    }
  }, [open, initial]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setError(null);
    try {
      await onSave?.({
        displayName: displayName.trim() || null,
        photoURL: photoURL.trim() || null,
      });
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="profile-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-3"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCancel?.();
          }}
        >
          <motion.div
            key="profile-dialog"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="w-full max-w-sm rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl"
          >
            <form onSubmit={handleSubmit} className="p-4">
              <h3 className="text-sm font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
                Edit profile
              </h3>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
                    Display name
                  </span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-violet-600"
                    placeholder="Your name"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
                    Photo URL
                  </span>
                  <input
                    type="url"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-violet-600"
                    placeholder="https://…"
                  />
                </label>
                {error && (
                  <div className="text-[11px] text-red-600">{error}</div>
                )}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs px-3 py-1 rounded bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
