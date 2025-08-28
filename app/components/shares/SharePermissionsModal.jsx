"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const ALL_PERMS = ["read", "write", "edit", "delete"];

export default function SharePermissionsModal({
  open,
  defaultPermissions = ["read"],
  onCancel,
  onConfirm, // (permissions: string[]) => void
}) {
  const prefersReducedMotion = useReducedMotion();
  const [perms, setPerms] = useState(() => normalize(defaultPermissions));
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);
  const containerRef = useRef(null);
  const titleId = "share-permissions-title";

  useEffect(() => {
    if (!open) return;
    setPerms(normalize(defaultPermissions));
  }, [open, defaultPermissions]);

  const toggle = (p) => {
    if (p === "read") return; // always include read
    setPerms((prev) => {
      const s = new Set(prev);
      if (s.has(p)) s.delete(p);
      else s.add(p);
      s.add("read");
      return Array.from(s);
    });
  };

  const selectAll = () => setPerms(["read", "write", "edit", "delete"]);
  const clearToRead = () => setPerms(["read"]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="spm-backdrop"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={prefersReducedMotion ? {} : { opacity: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
            onClick={onCancel}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.div
            key="spm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={
              prefersReducedMotion ? false : { opacity: 0, y: -8, scale: 0.98 }
            }
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion ? {} : { opacity: 0, y: -8, scale: 0.98 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 260, damping: 22 }
            }
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            onKeyDown={(e) => {
              if (!open) return;
              if (e.key === "Escape") onCancel?.();
              if (e.key === "Enter") onConfirm?.(normalize(perms));
            }}
          >
            <div
              ref={containerRef}
              className="w-full max-w-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id={titleId} className="text-sm font-semibold mb-2">
                Select permissions
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                Choose what the recipient can do in this category. "Read" is
                always enabled.
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_PERMS.map((p) => {
                  const active = perms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggle(p)}
                      className={`px-2 py-1 rounded-full text-xs capitalize border transition ${
                        active
                          ? "bg-violet-600 text-white border-violet-600"
                          : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      } ${p === "read" ? "opacity-90 cursor-not-allowed" : ""}`}
                      aria-pressed={active}
                      aria-disabled={p === "read"}
                      title={p === "read" ? "Read is required" : `Toggle ${p}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={clearToRead}
                  className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Read only
                </button>
              </div>
              <div className="mt-4 flex justify-end gap-2 text-xs">
                <button
                  ref={cancelRef}
                  onClick={onCancel}
                  className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  ref={confirmRef}
                  onClick={() => onConfirm?.(normalize(perms))}
                  className="px-3 py-1 rounded bg-violet-600 text-white hover:bg-violet-500"
                >
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function normalize(arr) {
  const allowed = new Set(["read", "write", "edit", "delete"]);
  const out = [];
  (Array.isArray(arr) ? arr : []).forEach((p) => {
    const k = String(p || "")
      .toLowerCase()
      .trim();
    if (allowed.has(k) && !out.includes(k)) out.push(k);
  });
  if (!out.includes("read")) out.unshift("read");
  return out;
}
