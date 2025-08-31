"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { sanitizeCategoryName } from "../../lib/utils";

export default function AddCategoryModal({
  open,
  initialValue = "",
  onCancel,
  onConfirm, // (name) => void
}) {
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(initialValue || "");
  const inputRef = useRef(null);
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);
  const titleId = "add-category-title";
  const descId = "add-category-description";

  useEffect(() => {
    if (!open) return;
    setValue(initialValue || "");
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [open, initialValue]);

  const cleaned = sanitizeCategoryName(value);
  const canConfirm = !!cleaned;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="addcat-backdrop"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={prefersReducedMotion ? {} : { opacity: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={onCancel}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.div
            key="addcat-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            initial={
              prefersReducedMotion ? false : { opacity: 0, scale: 0.95, y: -8 }
            }
            animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion ? {} : { opacity: 0, scale: 0.95, y: -8 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 260, damping: 22 }
            }
            className="fixed z-50 inset-0 flex items-center justify-center p-4"
            onKeyDown={(e) => {
              if (!open) return;
              if (e.key === "Escape") onCancel?.();
              if (e.key === "Enter" && canConfirm) onConfirm?.(cleaned);
              if (e.key === "Tab") {
                const focusables = [
                  inputRef.current,
                  cancelRef.current,
                  confirmRef.current,
                ].filter(Boolean);
                if (focusables.length < 2) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey) {
                  if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                  }
                } else {
                  if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                  }
                }
              }
            }}
          >
            <div
              className="w-full max-w-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                id={titleId}
                className="text-lg font-semibold mb-2 text-neutral-800 dark:text-neutral-100"
              >
                Add Category
              </h2>
              <p
                id={descId}
                className="text-sm text-neutral-600 dark:text-neutral-400 mb-4"
              >
                Create a new category to organize your todos.
              </p>
              <div className="relative">
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Category name"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white/90 dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-600 focus:border-transparent transition-all"
                />
                {canConfirm && (
                  <div className="absolute right-3 top-2 h-5 w-5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                {cleaned && cleaned !== value.trim().toLowerCase()
                  ? `Will be saved as: "${cleaned}"`
                  : "Use letters, numbers, spaces and hyphens."}
              </div>
              <div className="mt-6 flex justify-end gap-3 text-sm">
                <button
                  ref={cancelRef}
                  onClick={onCancel}
                  className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  ref={confirmRef}
                  onClick={() => canConfirm && onConfirm?.(cleaned)}
                  disabled={!canConfirm}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    canConfirm
                      ? "bg-violet-600 text-white hover:bg-violet-500 shadow-sm"
                      : "bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  Add Category
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
