"use client";
import React, { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function ConfirmModal({
  open,
  title = "Confirm action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onCancel,
  onConfirm,
}) {
  const prefersReducedMotion = useReducedMotion();
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);
  const titleId = useMemo(
    () => `cm-title-${Math.random().toString(36).slice(2)}`,
    []
  );
  const descId = useMemo(
    () => `cm-desc-${Math.random().toString(36).slice(2)}`,
    []
  );

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      confirmRef.current?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="confirm-backdrop"
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
            key="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={message ? descId : undefined}
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
              if (e.key === "Tab") {
                const focusables = [
                  cancelRef.current,
                  confirmRef.current,
                ].filter(Boolean);
                if (focusables.length < 2) return;
                const [first, last] = focusables;
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
              className="w-full max-w-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id={titleId} className="text-sm font-semibold mb-2">
                {title}
              </h2>
              {message && (
                <p
                  id={descId}
                  className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 whitespace-pre-line"
                >
                  {message}
                </p>
              )}
              <div className="flex justify-end gap-2 text-xs">
                <button
                  ref={cancelRef}
                  onClick={onCancel}
                  className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {cancelLabel}
                </button>
                <button
                  ref={confirmRef}
                  onClick={onConfirm}
                  className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-500"
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
