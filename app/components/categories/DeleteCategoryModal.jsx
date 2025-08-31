"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function DeleteCategoryModal({
  open,
  category,
  onCancel,
  onConfirm,
}) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="cat-backdrop"
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
            key="cat-dialog"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4"
            onKeyDown={(e) => {
              if (!open) return;
              if (e.key === "Escape") onCancel();
              if (e.key === "Enter") onConfirm();
            }}
          >
            <div className="w-full max-w-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 shadow-xl relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                  Delete Category
                </h2>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Are you sure you want to delete the category
                <span className="mx-1 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-medium">
                  "{category}"
                </span>
                and all its todos? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 text-sm">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  autoFocus
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors shadow-sm"
                >
                  Delete Category
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
