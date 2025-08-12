"use client";

import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTodos } from "./useTodos";
import { useAuth } from "./AuthProvider";
import AddTodoForm from "./AddTodoForm";
import CategoryChips from "./CategoryChips";
import DeleteCategoryModal from "./DeleteCategoryModal";
import { useShares } from "./useShares";

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
    removeCategory,
  } = useTodos(uid);
  const [filter, setFilter] = useState("all");
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingCategory, setEditingCategory] = useState("general");
  const [customCategories, setCustomCategories] = useState([]);
  const baseCategories = ["general", "work", "personal", "study", "shopping"];
  const categories = useMemo(() => {
    const existing = Array.from(
      new Set(todos.map((t) => (t.category || "general").toLowerCase()))
    );
    return Array.from(
      new Set([...baseCategories, ...existing, ...customCategories])
    ).sort();
  }, [todos, customCategories]);
  const [newCategory, setNewCategory] = useState("general");
  const [createCategory, setCreateCategory] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(null);
  // Sharing state
  const { myShares, sharedWithMe, createShare, revokeShare } = useShares(uid);
  const [shareEmail, setShareEmail] = useState("");
  const [shareCategory, setShareCategory] = useState("general");
  const [shareBusy, setShareBusy] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [sharedView, setSharedView] = useState(null); // { ownerUid, ownerEmail, category }
  const [sharedTodos, setSharedTodos] = useState([]);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [sharedError, setSharedError] = useState("");

  // Categories that currently have at least one todo (used to protect last-delete)
  const categoriesWithTodos = useMemo(() => {
    return Array.from(
      new Set(todos.map((t) => (t.category || "general").toLowerCase()))
    );
  }, [todos]);

  const visible = useMemo(
    () =>
      todos.filter(
        (t) =>
          FILTERS[filter](t) &&
          (categoryFilter === "all" ||
            (t.category || "general") === categoryFilter)
      ),
    [todos, filter, categoryFilter]
  );

  const submit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    addTodo(input, newCategory);
    setInput("");
    setNewCategory("general");
  };

  const handleAddNewCategory = () => {
    const raw = createCategory.trim().toLowerCase();
    if (!raw) return;
    const cat = raw.slice(0, 32);
    if (!customCategories.includes(cat)) {
      setCustomCategories((c) => [...c, cat]);
    }
    setNewCategory(cat);
    setCreateCategory("");
  };

  const handleShare = async () => {
    setShareMsg("");
    const email = shareEmail.trim().toLowerCase();
    const cat = (shareCategory || "general").toLowerCase();
    if (!email) return;
    try {
      setShareBusy(true);
      await createShare(cat, email);
      setShareMsg(`Access granted to ${email} for ${cat}`);
      setShareEmail("");
    } catch (e) {
      setShareMsg("Failed to share. Try again.");
    } finally {
      setShareBusy(false);
    }
  };

  const loadSharedTodos = async (ownerUid, category, ownerEmail) => {
    try {
      setSharedError("");
      setSharedLoading(true);
      const auth = typeof window !== "undefined" ? window.__firebaseAuth : null;
      const token = await auth?.currentUser?.getIdToken();
      const params = new URLSearchParams({ owner: ownerUid, category });
      const res = await fetch(`/api/todos?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Load shared failed ${res.status}`);
      const data = await res.json();
      setSharedTodos(data);
      setSharedView({ ownerUid, category, ownerEmail });
    } catch (e) {
      console.error(e);
      setSharedError("Unable to load shared todos");
    } finally {
      setSharedLoading(false);
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
    setEditingCategory(todo.category || "general");
  };
  const saveEdit = () => {
    const text = editingText.trim();
    if (text) editTodo(editingId, text, editingCategory);
    setEditingId(null);
    setEditingText("");
    setEditingCategory("general");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
    setEditingCategory("general");
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
      <AddTodoForm
        input={input}
        setInput={setInput}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        categories={categories}
        createCategory={createCategory}
        setCreateCategory={setCreateCategory}
        onSubmit={submit}
        onAddNewCategory={handleAddNewCategory}
      />

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

      {!sharedView && (
        <CategoryChips
          categories={categories}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categoriesWithTodos={categoriesWithTodos}
          setConfirmDeleteCategory={setConfirmDeleteCategory}
        />
      )}

      {/* Share access section */}
      <div className="rounded border border-neutral-200 dark:border-neutral-800 p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold">Share category (view-only)</h3>
          {sharedView && (
            <button
              onClick={() => setSharedView(null)}
              className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Back to my todos"
            >
              Exit shared view
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={shareCategory}
            onChange={(e) => setShareCategory(e.target.value)}
            className="rounded border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-2 py-1 text-xs"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <input
            type="email"
            placeholder="Viewer email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            className="flex-1 min-w-40 rounded border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-2 py-1 text-xs"
          />
          <button
            onClick={handleShare}
            disabled={shareBusy || !shareEmail.trim()}
            className="text-xs px-3 py-1 rounded bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40"
          >
            {shareBusy ? "Sharing…" : "Share"}
          </button>
          {shareMsg && (
            <span className="text-[11px] text-neutral-500">{shareMsg}</span>
          )}
        </div>
        {/* My shares list */}
        {!!myShares.length && (
          <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
            <div className="font-medium mb-1">You shared:</div>
            <ul className="flex flex-wrap gap-2">
              {myShares.map((s) => (
                <li
                  key={s.id}
                  className="px-2 py-1 rounded border text-xs flex items-center gap-2"
                >
                  <span className="capitalize">{s.category}</span>
                  <span className="text-neutral-400">→</span>
                  <span>{s.viewerEmailLower}</span>
                  <button
                    onClick={() => revokeShare(s.category, s.viewerEmailLower)}
                    className="text-red-600 hover:underline"
                  >
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Shared with me */}
        {!!sharedWithMe.length && (
          <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
            <div className="font-medium mb-1">Shared with you:</div>
            <ul className="flex flex-wrap gap-2">
              {sharedWithMe.map((o) => (
                <li
                  key={o.ownerUid}
                  className="px-2 py-1 rounded border text-xs flex items-center gap-2"
                >
                  <span className="font-medium">
                    {o.ownerName || o.ownerEmail || o.ownerUid}
                  </span>
                  <span className="text-neutral-400">•</span>
                  {o.categories.map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        loadSharedTodos(
                          o.ownerUid,
                          c,
                          o.ownerEmail || o.ownerUid
                        )
                      }
                      className="px-2 py-0.5 rounded border capitalize hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title={`View ${o.ownerEmail || o.ownerUid}'s ${c}`}
                    >
                      {c}
                    </button>
                  ))}
                </li>
              ))}
            </ul>
            {sharedError && (
              <div className="text-red-600 mt-1">{sharedError}</div>
            )}
          </div>
        )}
      </div>

      <ul
        className="flex flex-col gap-2 max-h-96 overflow-y-auto scroll-thin pr-1"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {!sharedView && visible.length === 0 && (
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
          {!sharedView &&
            visible.map((todo) => {
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
                            todo.completed
                              ? "line-through text-neutral-400"
                              : ""
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
                              onChange={(e) =>
                                setEditingCategory(e.target.value)
                              }
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
          {sharedView && (
            <motion.li
              key="shared-banner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-neutral-600 dark:text-neutral-400 p-2 text-center"
            >
              Viewing {sharedView.ownerEmail}'s “{sharedView.category}”
              (read-only)
            </motion.li>
          )}
          {sharedView && !sharedLoading && sharedTodos.length === 0 && (
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
          {sharedView &&
            sharedTodos.map((todo) => (
              <motion.li
                layout
                key={todo.id}
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
            ))}
        </AnimatePresence>
      </ul>
      <p className="text-[11px] text-neutral-500 text-center">
        {sharedView
          ? "Viewing shared data (read-only)"
          : "Synced securely to your account (MongoDB)."}
      </p>

      {/* Category delete confirmation modal */}
      <DeleteCategoryModal
        open={!!confirmDeleteCategory}
        category={confirmDeleteCategory || ""}
        onCancel={() => setConfirmDeleteCategory(null)}
        onConfirm={async () => {
          const cat = confirmDeleteCategory;
          if (!cat) return;
          await removeCategory(cat);
          if (categoryFilter === cat) setCategoryFilter("all");
          setConfirmDeleteCategory(null);
        }}
      />
    </div>
  );
}
