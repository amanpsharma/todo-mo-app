"use client";
import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Toast({
  open,
  message,
  actionLabel,
  onAction,
  onClose,
  duration = 7000,
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60]"
        >
          <div className="flex items-center gap-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 shadow-lg text-sm">
            <span className="text-neutral-800 dark:text-neutral-100">
              {message}
            </span>
            {actionLabel && (
              <button
                onClick={onAction}
                className="ml-2 rounded px-2 py-1 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
              >
                {actionLabel}
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Dismiss"
              className="ml-1 rounded px-2 py-1 text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
