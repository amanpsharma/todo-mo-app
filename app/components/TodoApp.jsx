"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useTodos } from "./useTodos";
import { useShares } from "./useShares";
import {
  FILTERS,
  sanitizeCategoryName,
  isValidEmail,
  getAuthToken,
} from "../lib/utils";
import AddTodoForm from "./AddTodoForm";
import CategoryChips from "./CategoryChips";
import FiltersBar from "./FiltersBar";
import dynamic from "next/dynamic";
const SharesPanel = dynamic(() => import("./SharesPanel"), { ssr: false });
import TodoList from "./TodoList";
import SharedTodosList from "./SharedTodosList";
import DeleteCategoryModal from "./DeleteCategoryModal";
import LoggedOutHero from "./LoggedOutHero";
import AddCategoryModal from "./AddCategoryModal";
import Toast from "./Toast";
import ConfirmModal from "./ConfirmModal";

// using FILTERS from ../lib/utils

export default function TodoApp() {
  const { user, loading, loginGoogle } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
    reorder,
    loading: todosLoading,
  } = useTodos(uid);

  // Input and category management
  const [input, setInput] = useState("");
  const [createCategory, setCreateCategory] = useState("");
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const baseCategories = useMemo(
    () => ["general", "work", "personal", "shopping", "urgent"],
    []
  );
  const [customCategories, setCustomCategories] = useState([]);
  // Persist custom categories so categories don't disappear when todos are cleared
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined" &&
        localStorage.getItem("customCategories");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCustomCategories(parsed.filter(Boolean));
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "customCategories",
          JSON.stringify(customCategories)
        );
      }
    } catch {}
  }, [customCategories]);
  const categoriesFromTodos = useMemo(() => {
    const set = new Set(
      todos.map((t) => {
        const cleaned = sanitizeCategoryName(t.category || "general");
        return cleaned || "general";
      })
    );
    return Array.from(set);
  }, [todos]);
  // Ensure categories discovered from todos are remembered so they persist even if empty later
  useEffect(() => {
    if (!categoriesFromTodos.length) return;
    setCustomCategories((prev) => {
      const next = new Set(prev);
      for (const c of categoriesFromTodos) {
        if (!baseCategories.includes(c)) next.add(c);
      }
      return Array.from(next);
    });
  }, [categoriesFromTodos, baseCategories]);
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
    const set = new Set(
      todos.map((t) => {
        const cleaned = sanitizeCategoryName(t.category || "general");
        return cleaned || "general";
      })
    );
    return Array.from(set);
  }, [todos]);

  const handleAddNewCategory = (name) => {
    const cat = sanitizeCategoryName(name || createCategory);
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
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [lastDeleted, setLastDeleted] = useState(null); // { id, text, category, prevId }
  const [toastOpen, setToastOpen] = useState(false);
  const [pendingRestore, setPendingRestore] = useState(null); // { text, category, prevId }

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
  // Share a single email
  const handleShare = async (emailArg) => {
    const email = String(emailArg ?? shareEmail)
      .trim()
      .toLowerCase();
    if (!isValidEmail(email)) {
      setShareMsg("Enter a valid email");
      return false;
    }
    try {
      setShareBusy(true);
      setShareMsg("");
      await createShare(shareCategory, email);
      setShareMsg("Shared");
      if (!emailArg) setShareEmail("");
      return true;
    } catch (e) {
      setShareMsg("Failed to share");
      return false;
    } finally {
      setShareBusy(false);
    }
  };
  // Share multiple emails
  const handleShareMany = async (emails) => {
    const list = Array.isArray(emails) ? emails : [];
    const cleaned = list
      .map((e) =>
        String(e || "")
          .trim()
          .toLowerCase()
      )
      .filter((e, idx, arr) => e && arr.indexOf(e) === idx);
    if (!cleaned.length) {
      setShareMsg("Add at least one valid email");
      return;
    }
    setShareBusy(true);
    setShareMsg("");
    let ok = 0,
      fail = 0;
    for (const e of cleaned) {
      if (!isValidEmail(e)) {
        fail++;
        continue;
      }
      try {
        await createShare(shareCategory, e);
        ok++;
      } catch {
        fail++;
      }
    }
    setShareMsg(
      `Shared ${ok}/${cleaned.length}${fail ? `, failed ${fail}` : ""}`
    );
    setShareBusy(false);
  };

  // Shared view
  const [sharedView, setSharedView] = useState(null);
  const [sharedTodos, setSharedTodos] = useState([]);
  const [sharedLoading, setSharedLoading] = useState(false);
  const urlInitializedRef = useRef(false);

  const getToken = getAuthToken;

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

  // URL -> state: initialize from search params (category and shared deep links)
  useEffect(() => {
    if (!mounted) return;
    if (!categories.length) return;
    if (urlInitializedRef.current) return;
    // category deep-link
    const c = searchParams.get("category");
    if (c === "all" && categoryFilter !== "all") setCategoryFilter("all");
    else if (c && categories.includes(c) && c !== categoryFilter) {
      setCategoryFilter(c);
    }
    // filter deep-link
    const f = (searchParams.get("filter") || "").toLowerCase();
    if (["all", "active", "completed"].includes(f) && f !== filter) {
      setFilter(f);
    }
    // shared deep-link
    const owner = searchParams.get("sharedOwner");
    const scat = searchParams.get("sharedCategory");
    if (uid && owner && scat && !sharedView) {
      // owner label unknown here; will show UID until user list loads
      loadSharedTodos(owner, scat, owner);
    }
    urlInitializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, categories, uid]);

  // state -> URL: keep categoryFilter reflected in the URL
  useEffect(() => {
    if (!mounted || !uid) return;
    const params = new URLSearchParams(searchParams.toString());
    // Always reflect category, including 'all'
    params.set("category", categoryFilter || "all");
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  }, [categoryFilter, mounted, pathname, router, searchParams, uid]);

  // state -> URL: keep filter reflected in the URL (including 'all')
  useEffect(() => {
    if (!mounted || !uid) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", filter || "all");
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  }, [filter, mounted, pathname, router, searchParams, uid]);

  // When logged out, strip query params and route to base path to avoid stale deep-links
  useEffect(() => {
    if (!mounted) return;
    if (!loading && !uid) {
      router.replace(pathname);
    }
  }, [mounted, loading, uid, pathname, router]);

  // state <-> URL: reflect shared view in URL
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(searchParams.toString());
    if (sharedView) {
      params.set("sharedOwner", sharedView.ownerUid);
      params.set("sharedCategory", sharedView.category);
    } else {
      params.delete("sharedOwner");
      params.delete("sharedCategory");
    }
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  }, [sharedView, mounted, pathname, router, searchParams]);

  if (!mounted) return null;
  // Prevent flashing the logged-out hero while Firebase auth resolves on reload
  if (loading) {
    return (
      <div className="w-full max-w-xl mx-auto">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/50 p-6 shadow-sm animate-pulse h-40" />
      </div>
    );
  }
  if (!uid)
    return <LoggedOutHero loading={loading} loginGoogle={loginGoogle} />;

  // Reusable remove handler used by list and confirm modal
  const handleRemoveTodo = async (id) => {
    const idx = todos.findIndex((x) => x.id === id);
    const t = idx >= 0 ? todos[idx] : null;
    await removeTodo(id);
    if (t) {
      const prevId = idx > 0 ? todos[idx - 1].id : null;
      setLastDeleted({ id: t.id, text: t.text, category: t.category, prevId });
      setToastOpen(true);
    }
  };

  const deleteTodoMessage = (() => {
    const t = todos.find((x) => x.id === confirmDeleteId);
    return t ? `Delete this todo?\n\n${t.text}` : "Delete this todo?";
  })();

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      <AddTodoForm
        input={input}
        setInput={setInput}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        categories={categories}
        onSubmit={submit}
        onOpenAddCategoryModal={() => setAddCategoryOpen(true)}
      />

      <FiltersBar
        filter={filter}
        setFilter={setFilter}
        stats={stats}
        clearCompleted={clearCompleted}
        onClearCompletedClick={() => setConfirmClearOpen(true)}
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
        onShareMany={handleShareMany}
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
          loading={todosLoading}
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
          removeTodo={handleRemoveTodo}
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
          // Remove from saved list so it truly disappears only when explicitly deleted
          setCustomCategories((prev) => prev.filter((x) => x !== cat));
          if (categoryFilter === cat) setCategoryFilter("all");
          setConfirmDeleteCategory(null);
        }}
      />
      <AddCategoryModal
        open={addCategoryOpen}
        initialValue={createCategory}
        onCancel={() => setAddCategoryOpen(false)}
        onConfirm={(name) => {
          handleAddNewCategory(name);
          setAddCategoryOpen(false);
        }}
      />
      <Toast
        open={toastOpen}
        message={lastDeleted ? `Deleted: "${lastDeleted.text}"` : ""}
        actionLabel={lastDeleted ? "Undo" : undefined}
        onAction={async () => {
          if (!lastDeleted) return;
          setPendingRestore({
            text: lastDeleted.text,
            category: lastDeleted.category || "general",
            prevId: lastDeleted.prevId || null,
          });
          setToastOpen(false);
          setLastDeleted(null);
          await addTodo(lastDeleted.text, lastDeleted.category || "general");
        }}
        onClose={() => {
          setToastOpen(false);
          setLastDeleted(null);
        }}
      />

      {/* Confirm: Clear completed */}
      <ConfirmModal
        open={!!confirmClearOpen}
        title="Clear completed todos"
        message={`This will remove ${stats.completed} completed todo${
          stats.completed === 1 ? "" : "s"
        }. This action cannot be undone.`}
        confirmLabel="Clear"
        onCancel={() => setConfirmClearOpen(false)}
        onConfirm={async () => {
          await clearCompleted();
          setConfirmClearOpen(false);
        }}
      />

      {/* Confirm: Delete single todo */}
      <ConfirmModal
        open={!!confirmDeleteId}
        title="Delete todo"
        message={deleteTodoMessage}
        confirmLabel="Delete"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={async () => {
          if (!confirmDeleteId) return;
          await handleRemoveTodo(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />

      {/* After undo add completes (state refresh), move the restored todo next to its previous neighbor */}
      {/* Note: Order is client-side only; this keeps perceived position consistent post-undo. */}
      {pendingRestore && <span className="sr-only">Restoring…</span>}
    </div>
  );
}
