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
              className="w-full max-w-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id={titleId} className="text-sm font-semibold mb-2">
                Add category
              </h2>
              <p
                id={descId}
                className="text-xs text-neutral-600 dark:text-neutral-400 mb-3"
              >
                Create a new category to organize your todos.
              </p>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Category name"
                className="w-full rounded border border-neutral-300 dark:border-neutral-600 bg-white/90 dark:bg-neutral-800 px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
              <div className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                {cleaned && cleaned !== value.trim().toLowerCase()
                  ? `Will be saved as: "${cleaned}"`
                  : "Use letters, numbers, spaces and hyphens."}
              </div>
              <div className="mt-4 flex justify-end gap-2 text-xs">
                <button
                  ref={cancelRef}
                  onClick={onCancel}
                  className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  ref={confirmRef}
                  onClick={() => canConfirm && onConfirm?.(cleaned)}
                  disabled={!canConfirm}
                  className="px-3 py-1 rounded bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
