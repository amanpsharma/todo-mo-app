"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function SharedTodosList({
  sharedView,
  sharedTodos,
  sharedLoading,
  onAttemptAction, // optional: () => void, called when user tries to edit/delete in read-only
}) {
  if (!sharedView) return null;
  return (
    <ul
      className="flex flex-col gap-2 max-h-96 overflow-y-auto scroll-thin pr-1"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        <motion.li
          key="shared-banner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-xs text-neutral-600 dark:text-neutral-400 p-2 text-center"
        >
          Viewing {sharedView.ownerEmail}'s “{sharedView.category}” (read-only)
        </motion.li>
        {!sharedLoading && sharedTodos.length === 0 && (
          <motion.li
            key="shared-empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="text-sm text-neutral-500 italic p-4 text-center border rounded border-dashed"
          >
            No shared todos.
          </motion.li>
        )}
        {sharedTodos.map((todo, idx) => {
          const id1 = typeof todo.id === "string" ? todo.id.trim() : "";
          const id2 = typeof todo._id === "string" ? todo._id.trim() : "";
          const itemKey =
            id1 || id2 || `${todo.text}-${todo.createdAt ?? "na"}-${idx}`;
          return (
            <motion.li
              layout
              key={itemKey}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative flex items-start gap-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/60 px-3 py-2 shadow-sm"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                readOnly
                onClick={() => onAttemptAction?.()}
                className="mt-1 size-4 accent-blue-600 opacity-50"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`select-text break-words ${
                    todo.completed ? "line-through text-neutral-400" : ""
                  }`}
                >
                  <span className="mr-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    {(todo.category || "general").slice(0, 1).toUpperCase() +
                      (todo.category || "general").slice(1)}
                  </span>
                  {todo.text}
                </p>
                <div className="mt-1 flex gap-2 text-xs opacity-60">
                  <button
                    onClick={() => onAttemptAction?.()}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-600 cursor-not-allowed"
                    title="No permission to edit"
                    aria-disabled
                  >
                    <FiEdit2 className="w-3.5 h-3.5" aria-hidden />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onAttemptAction?.()}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-600 cursor-not-allowed"
                    title="No permission to delete"
                    aria-disabled
                  >
                    <FiTrash2 className="w-3.5 h-3.5" aria-hidden />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
              <time
                dateTime={new Date(todo.createdAt).toISOString()}
                className="text-[10px] shrink-0 self-center text-neutral-400"
                title={new Date(todo.createdAt).toLocaleString()}
              >
                {new Date(todo.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
