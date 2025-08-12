"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import { useTodos } from "./useTodos";
import { useShares } from "./useShares";
import AddTodoForm from "./AddTodoForm";
import CategoryChips from "./CategoryChips";
import FiltersBar from "./FiltersBar";
import SharesPanel from "./SharesPanel";
import TodoList from "./TodoList";
import SharedTodosList from "./SharedTodosList";
import DeleteCategoryModal from "./DeleteCategoryModal";

const FILTERS = {
  all: (t) => true,
  active: (t) => !t.completed,
  completed: (t) => t.completed,
};

export default function TodoApp() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const uid = user?.uid;

  // Todos state and actions
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

  // Input and category management
  const [input, setInput] = useState("");
  const [createCategory, setCreateCategory] = useState("");
  const baseCategories = useMemo(
    () => ["general", "work", "personal", "shopping", "urgent"],
    []
  );
  const categoriesFromTodos = useMemo(() => {
    const set = new Set(
      todos.map((t) => (t.category || "general").toLowerCase())
    );
    return Array.from(set);
  }, [todos]);
  const [customCategories, setCustomCategories] = useState([]);
  const categories = useMemo(() => {
    const set = new Set([
      ...baseCategories,
      ...categoriesFromTodos,
      ...customCategories,
    ]);
    return Array.from(set);
  }, [baseCategories, categoriesFromTodos, customCategories]);
  const [newCategory, setNewCategory] = useState("general");
  useEffect(() => {
    if (!categories.includes(newCategory) && categories.length) {
      setNewCategory(categories[0]);
    }
  }, [categories, newCategory]);

  const categoriesWithTodos = useMemo(() => {
    const set = new Set(todos.map((t) => t.category || "general"));
    return Array.from(set);
  }, [todos]);

  const handleAddNewCategory = () => {
    const raw = createCategory.trim().toLowerCase();
    if (!raw) return;
    const cat = raw.replace(/[^a-z0-9\-\s]/g, "").replace(/\s+/g, " ");
    if (!cat) return;
    setCustomCategories((prev) => (prev.includes(cat) ? prev : [...prev, cat]));
    setNewCategory(cat);
    setCreateCategory("");
  };

  const submit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    addTodo(text, newCategory || "general");
    setInput("");
  };

  // Filters
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const visible = useMemo(() => {
    let list = todos;
    if (categoryFilter !== "all") {
      list = list.filter((t) => (t.category || "general") === categoryFilter);
    }
    return list.filter(FILTERS[filter]);
  }, [todos, filter, categoryFilter]);

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingCategory, setEditingCategory] = useState("general");
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
    setEditingCategory(todo.category || "general");
  };
  const saveEdit = async () => {
    if (!editingId) return;
    const text = editingText.trim();
    if (!text) return;
    await editTodo(editingId, text, editingCategory);
    setEditingId(null);
    setEditingText("");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  // Delete confirmations
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(null);

  // Shares
  const {
    myShares,
    sharedWithMe,
    createShare,
    revokeShare,
    error: sharedError,
    refresh: refreshShares,
    leaveSharedCategory: hookLeaveSharedCategory,
  } = useShares(uid) || {};

  // Share form
  const [shareCategory, setShareCategory] = useState("general");
  useEffect(() => {
    if (!categories.includes(shareCategory) && categories.length) {
      setShareCategory(categories[0]);
    }
  }, [categories, shareCategory]);
  const [shareEmail, setShareEmail] = useState("");
  const [shareBusy, setShareBusy] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const handleShare = async () => {
    const email = shareEmail.trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setShareMsg("Enter a valid email");
      return;
    }
    try {
      setShareBusy(true);
      setShareMsg("");
      await createShare(shareCategory, email);
      setShareMsg("Shared");
      setShareEmail("");
    } catch (e) {
      setShareMsg("Failed to share");
    } finally {
      setShareBusy(false);
    }
  };

  // Shared view
  const [sharedView, setSharedView] = useState(null);
  const [sharedTodos, setSharedTodos] = useState([]);
  const [sharedLoading, setSharedLoading] = useState(false);

  const getToken = async () => {
    const auth = typeof window !== "undefined" ? window.__firebaseAuth : null;
    const token = await auth?.currentUser?.getIdToken();
    if (!token) throw new Error("No auth token");
    return token;
  };

  const loadSharedTodos = async (ownerUid, category, ownerDisplay) => {
    try {
      setSharedLoading(true);
      setSharedView({ ownerUid, ownerEmail: ownerDisplay, category });
      const token = await getToken();
      const res = await fetch(
        `/api/todos?owner=${encodeURIComponent(
          ownerUid
        )}&category=${encodeURIComponent(category)}`,
        { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to load shared todos");
      const data = await res.json();
      setSharedTodos(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSharedLoading(false);
    }
  };

  const leaveSharedCategory = hookLeaveSharedCategory
    ? hookLeaveSharedCategory
    : async (ownerUid, category) => {
        const token = await getToken();
        const res = await fetch(`/api/shares`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ownerUid, category }),
        });
        if (!res.ok) throw new Error("Leave share failed");
        await (refreshShares?.() || Promise.resolve());
      };

  if (!mounted) return null;
  if (!uid) {
    return (
      <div className="w-full max-w-xl mx-auto text-center text-sm text-neutral-500">
        Sign in to manage your todos.
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

      <FiltersBar
        filter={filter}
        setFilter={setFilter}
        stats={stats}
        clearCompleted={clearCompleted}
      />

      {!sharedView && (
        <CategoryChips
          categories={categories}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categoriesWithTodos={categoriesWithTodos}
          setConfirmDeleteCategory={setConfirmDeleteCategory}
        />
      )}

      <SharesPanel
        categories={categories}
        sharedView={sharedView}
        setSharedView={setSharedView}
        shareCategory={shareCategory}
        setShareCategory={setShareCategory}
        shareEmail={shareEmail}
        setShareEmail={setShareEmail}
        shareBusy={shareBusy}
        shareMsg={shareMsg}
        onShare={handleShare}
        myShares={myShares}
        revokeShare={revokeShare}
        sharedWithMe={sharedWithMe}
        leaveSharedCategory={leaveSharedCategory}
        loadSharedTodos={loadSharedTodos}
        sharedError={sharedError}
      />

      {!sharedView ? (
        <TodoList
          visible={visible}
          categories={categories}
          editingId={editingId}
          editingText={editingText}
          setEditingText={setEditingText}
          editingCategory={editingCategory}
          setEditingCategory={setEditingCategory}
          startEdit={startEdit}
          saveEdit={saveEdit}
          cancelEdit={cancelEdit}
          confirmDeleteId={confirmDeleteId}
          setConfirmDeleteId={setConfirmDeleteId}
          toggleTodo={toggleTodo}
          removeTodo={removeTodo}
          filter={filter}
        />
      ) : (
        <SharedTodosList
          sharedView={sharedView}
          sharedTodos={sharedTodos}
          sharedLoading={sharedLoading}
        />
      )}

      <p className="text-[11px] text-neutral-500 text-center">
        {sharedView
          ? "Viewing shared data (read-only)"
          : "Synced securely to your account (MongoDB)."}
      </p>
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
