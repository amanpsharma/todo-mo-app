"use client";
import React, { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

function IconCheck({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      className={`w-3.5 h-3.5 ${className}`}
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CheckToggle({ checked, onToggle }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`relative inline-flex items-center justify-center rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        ${
          checked
            ? "bg-green-600 border-green-600 text-white hover:bg-green-500"
            : "bg-white/90 dark:bg-neutral-900/70 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        }
      `}
      style={{ width: 22, height: 22 }}
      aria-label={checked ? "Mark as not completed" : "Mark as completed"}
    >
      <motion.div
        initial={false}
        animate={
          checked ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 500, damping: 35 }
        }
      >
        <IconCheck />
      </motion.div>
    </button>
  );
}

export default function TodoList({
  visible,
  categories,
  loading = false,
  editingId,
  editingText,
  setEditingText,
  editingCategory,
  setEditingCategory,
  startEdit,
  saveEdit,
  cancelEdit,
  confirmDeleteId,
  setConfirmDeleteId,
  toggleTodo,
  removeTodo,
  filter,
}) {
  const prefersReducedMotion = useReducedMotion();
  const listVariants = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { staggerChildren: 0.04 } },
        exit: { opacity: 0 },
      };
  const itemVariants = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: -8, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 8, scale: 0.98 },
        transition: { type: "spring", stiffness: 260, damping: 24 },
      };

  const skeletonRows = useMemo(() => Array.from({ length: 4 }), []);
  return (
    <ul
      className="flex flex-col gap-2 max-h-96 overflow-y-auto scroll-thin pr-1"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {loading && (
          <li key="loading" className="flex flex-col gap-2 w-full">
            {skeletonRows.map((_, i) => (
              <div
                key={i}
                className="h-10 rounded border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 animate-pulse"
              />
            ))}
          </li>
        )}
        {visible.length === 0 && (
          <motion.li
            key="empty"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="text-sm text-neutral-500 italic p-4 text-center border rounded border-dashed"
          >
            No todos {filter !== "all" ? `for ${filter}` : "yet"}.
          </motion.li>
        )}
        <motion.div
          key="list"
          variants={listVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {visible.map((todo, idx) => {
            const isEditing = editingId === todo.id;
            const isConfirmingDelete = confirmDeleteId === todo.id;
            const isNew = idx === 0; // recently added appear first per reducer
            const id1 = typeof todo.id === "string" ? todo.id.trim() : "";
            const id2 = typeof todo._id === "string" ? todo._id.trim() : "";
            const itemKey =
              id1 ||
              id2 ||
              `${todo.category || "general"}-${todo.text || "na"}-$${
                todo.createdAt ?? "na"
              }-${idx}`;
            return (
              <motion.li
                layout
                variants={itemVariants}
                key={itemKey}
                className={`relative group flex items-start gap-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/60 px-3 py-2 shadow-sm ${
                  isNew && !prefersReducedMotion
                    ? "ring-2 ring-violet-300/60"
                    : ""
                }`}
              >
                <div
                  className={`flex w-full items-start gap-3 transition filter ${
                    isConfirmingDelete
                      ? "opacity-40 blur-[2px] pointer-events-none"
                      : ""
                  }`}
                >
                  <div className="mt-0.5">
                    <CheckToggle
                      checked={todo.completed}
                      onToggle={() => toggleTodo(todo.id)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {!isEditing && (
                      <motion.p
                        layout
                        className={`select-text break-words ${
                          todo.completed ? "line-through text-neutral-400" : ""
                        }`}
                      >
                        <span className="mr-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                          {(todo.category || "general")
                            .slice(0, 1)
                            .toUpperCase() +
                            (todo.category || "general").slice(1)}
                        </span>
                        {todo.text}
                      </motion.p>
                    )}
                    {isEditing && (
                      <motion.input
                        layout
                        autoFocus
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="w-full rounded border border-neutral-300 dark:border-neutral-600 bg-white/90 dark:bg-neutral-800 px-2 py-1 text-sm"
                      />
                    )}
                    <div className="mt-1 flex flex-wrap gap-2 text-xs items-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      {!isEditing && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => startEdit(todo)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </motion.button>
                      )}
                      {isEditing && (
                        <>
                          <select
                            value={editingCategory}
                            onChange={(e) => setEditingCategory(e.target.value)}
                            className="rounded border border-neutral-300 dark:border-neutral-600 bg-white/80 dark:bg-neutral-800 px-2 py-1 text-[11px]"
                          >
                            {categories.map((c) => (
                              <option key={c} value={c}>
                                {c.charAt(0).toUpperCase() + c.slice(1)}
                              </option>
                            ))}
                          </select>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={saveEdit}
                            className="text-green-600 hover:underline"
                            disabled={!editingText.trim()}
                          >
                            Save
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={cancelEdit}
                            className="text-neutral-500 hover:underline"
                          >
                            Cancel
                          </motion.button>
                        </>
                      )}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setConfirmDeleteId(todo.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                  <motion.time
                    layout
                    dateTime={new Date(todo.createdAt).toISOString()}
                    className="text-[10px] shrink-0 self-center text-neutral-400"
                    title={new Date(todo.createdAt).toLocaleString()}
                  >
                    {new Date(todo.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </motion.time>
                </div>
                <AnimatePresence>
                  {isConfirmingDelete && (
                    <motion.div
                      key="confirm"
                      initial={
                        prefersReducedMotion
                          ? false
                          : { opacity: 0, scale: 0.9 }
                      }
                      animate={
                        prefersReducedMotion ? {} : { opacity: 1, scale: 1 }
                      }
                      exit={
                        prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      role="dialog"
                      aria-modal="true"
                      className="absolute inset-0 z-10 flex flex-col justify-center rounded border border-red-400 bg-red-50/95 dark:bg-red-950/80 backdrop-blur-sm p-3"
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setConfirmDeleteId(null);
                        if (e.key === "Enter") {
                          removeTodo(todo.id);
                          setConfirmDeleteId(null);
                        }
                      }}
                    >
                      <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-3 break-words">
                        Delete this todo?
                      </p>
                      <div className="flex gap-2 justify-end text-xs">
                        <button
                          onClick={() => {
                            removeTodo(todo.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-500"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </ul>
  );
}
