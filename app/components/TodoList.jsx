"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function TodoList({
  visible,
  categories,
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
  return (
    <ul
      className="flex flex-col gap-2 max-h-96 overflow-y-auto scroll-thin pr-1"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {visible.length === 0 && (
          <motion.li
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="text-sm text-neutral-500 italic p-4 text-center border rounded border-dashed"
          >
            No todos {filter !== "all" ? `for ${filter}` : "yet"}.
          </motion.li>
        )}
        {visible.map((todo) => {
          const isEditing = editingId === todo.id;
          const isConfirmingDelete = confirmDeleteId === todo.id;
          return (
            <motion.li
              layout
              key={todo.id}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative group flex items-start gap-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/60 px-3 py-2 shadow-sm"
            >
              <div
                className={`flex w-full items-start gap-3 transition filter ${
                  isConfirmingDelete
                    ? "opacity-40 blur-[2px] pointer-events-none"
                    : ""
                }`}
              >
                <motion.input
                  whileTap={{ scale: 0.85 }}
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="mt-1 size-4 accent-blue-600"
                />
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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
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
      </AnimatePresence>
    </ul>
  );
}
