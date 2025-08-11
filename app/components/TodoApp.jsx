"use client";

import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTodos } from "./useTodos";
import { useAuth } from "./AuthProvider";

const FILTERS = {
  all: (t) => true,
  active: (t) => !t.completed,
  completed: (t) => t.completed,
};

export default function TodoApp() {
  const { user, firebaseConfig } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const uid = user?.uid;
  const {
    todos,
    addTodo,
    toggleTodo,
    removeTodo,
    clearCompleted,
    editTodo,
    stats,
  } = useTodos(uid);
  const [filter, setFilter] = useState("all");
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const visible = useMemo(() => todos.filter(FILTERS[filter]), [todos, filter]);

  const submit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    addTodo(input);
    setInput("");
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };
  const saveEdit = () => {
    const text = editingText.trim();
    if (text) editTodo(editingId, text);
    setEditingId(null);
    setEditingText("");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  if (!mounted) {
    return <div className="w-full max-w-xl mx-auto mt-10" />; // empty shell to match SSR
  }

  if (firebaseConfig && !firebaseConfig.valid) {
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col gap-4 text-center mt-10">
        <h1 className="text-3xl font-bold">Configure Firebase</h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm">
          Set real values in <code>.env.local</code> for:{" "}
          {firebaseConfig.missing.join(", ")} then restart dev server.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col gap-4 text-center mt-10">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Sign in with Google above to start managing your todos.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 hover:bg-blue-500 text-white px-4 font-medium disabled:opacity-40"
          disabled={!input.trim()}
        >
          Add
        </button>
      </form>

      <div className="flex items-center justify-between text-sm flex-wrap gap-2">
        <div className="flex gap-2">
          {Object.keys(FILTERS).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 rounded border text-xs uppercase tracking-wide font-medium transition-colors ${
                filter === key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
        <div className="text-neutral-600 dark:text-neutral-400 flex gap-4">
          <span>{stats.active} active</span>
          <span>{stats.completed} completed</span>
          <button
            onClick={clearCompleted}
            disabled={!stats.completed}
            className="text-red-600 disabled:opacity-30 hover:underline"
          >
            Clear completed
          </button>
        </div>
      </div>

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
                {/* Base content (blurred when confirming delete) */}
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
                    <div className="mt-1 flex gap-2 text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
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
                {/* Inline confirmation modal overlay */}
                <AnimatePresence>
                  {isConfirmingDelete && (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
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
        </AnimatePresence>
      </ul>
      <p className="text-[11px] text-neutral-500 text-center">
        Synced securely to your account (MongoDB).
      </p>
    </div>
  );
}
