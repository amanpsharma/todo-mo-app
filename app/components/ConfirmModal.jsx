"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function ConfirmModal({
  open,
  title = "Confirm action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onCancel,
  onConfirm,
}) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4"
            onKeyDown={(e) => {
              if (!open) return;
              if (e.key === "Escape") onCancel?.();
              if (e.key === "Enter") onConfirm?.();
            }}
          >
            <div className="w-full max-w-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-xl relative">
              <h2 className="text-sm font-semibold mb-2">{title}</h2>
              {message && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 whitespace-pre-line">
                  {message}
                </p>
              )}
              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={onCancel}
                  className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {cancelLabel}
                </button>
                <button
                  autoFocus
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
