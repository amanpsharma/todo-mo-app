"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../auth/AuthProvider";
import { useTodos } from "./useTodos";
import { useShares } from "../shares/useShares";
import {
  FILTERS,
  isValidEmail,
  getAuthToken,
  getFooterText,
  getDeleteTodoMessage,
  showToast,
  showUndoDeleteToast,
} from "../../lib/utils";
import AddTodoForm from "./AddTodoForm";
import CategoryChips from "../categories/CategoryChips";
import FiltersBar from "./FiltersBar";
import dynamic from "next/dynamic";
const SharesPanel = dynamic(() => import("../shares/SharesPanel"), {
  ssr: false,
});
import TodoList from "./TodoList";
import SharedTodosList from "../shares/SharedTodosList";
import DeleteCategoryModal from "../categories/DeleteCategoryModal";
import LoggedOutHero from "../ui/LoggedOutHero";
import AddCategoryModal from "../categories/AddCategoryModal";
import ConfirmModal from "../ui/ConfirmModal";
import EditTodoModal from "./EditTodoModal";
import { useDispatch, useSelector } from "react-redux";
import useCategoryState from "../../hooks/useCategoryState";
import useSharedView from "../../hooks/useSharedView";
import {
  setFilter as setFilterGlobal,
  setCategoryFilter as setCategoryFilterGlobal,
  startEdit as startEditGlobal,
  setEditingText as setEditingTextGlobal,
  setEditingCategory as setEditingCategoryGlobal,
  cancelEdit as cancelEditGlobal,
  openConfirmDelete,
  closeConfirmDelete,
  openConfirmClear,
  closeConfirmClear,
  setConfirmDeleteCategory as setConfirmDeleteCategoryGlobal,
} from "../../store/uiSlice";

export default function TodoApp() {
  const { user, loading, loginGoogle } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const uid = user?.uid;
  const dispatch = useDispatch();

  // Load custom UI state from Redux
  const filter = useSelector((s) => s.ui.filter);
  const categoryFilter = useSelector((s) => s.ui.categoryFilter);
  const editingId = useSelector((s) => s.ui.editingId);
  const editingText = useSelector((s) => s.ui.editingText);
  const editingCategory = useSelector((s) => s.ui.editingCategory);
  const confirmDeleteId = useSelector((s) => s.ui.confirmDeleteId);
  const confirmDeleteCategory = useSelector((s) => s.ui.confirmDeleteCategory);
  const confirmClearOpen = useSelector((s) => s.ui.confirmClearOpen);

  // Redux action dispatchers
  const setFilter = useCallback(
    (val) => dispatch(setFilterGlobal(val)),
    [dispatch]
  );
  const setCategoryFilter = useCallback(
    (val) => dispatch(setCategoryFilterGlobal(val)),
    [dispatch]
  );
  const setEditingText = useCallback(
    (val) => dispatch(setEditingTextGlobal(val)),
    [dispatch]
  );
  const setEditingCategory = useCallback(
    (val) => dispatch(setEditingCategoryGlobal(val)),
    [dispatch]
  );
  const cancelEdit = useCallback(
    () => dispatch(cancelEditGlobal()),
    [dispatch]
  );
  const setConfirmDeleteId = useCallback(
    (id) => {
      id ? dispatch(openConfirmDelete(id)) : dispatch(closeConfirmDelete());
    },
    [dispatch]
  );
  const setConfirmDeleteCategory = useCallback(
    (val) => dispatch(setConfirmDeleteCategoryGlobal(val)),
    [dispatch]
  );
  const setConfirmClearOpen = useCallback(
    (open) => {
      open ? dispatch(openConfirmClear()) : dispatch(closeConfirmClear());
    },
    [dispatch]
  );

  const {
    todos,
    addTodo,
    toggleTodo,
    removeTodo,
    clearCompleted,
    editTodo,
    stats,
    removeCategory,
    loading: todosLoading,
  } = useTodos(uid);

  // Inputs and categories
  const [input, setInput] = useState("");
  const [createCategory, setCreateCategory] = useState("");
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const {
    setCustomCategories,
    categories,
    categoriesWithTodos,
    newCategory,
    setNewCategory,
    handleAddNewCategory,
  } = useCategoryState(todos);

  // No-op: category state handled by hook; keep local input for modal initial value

  // Visible todos based on filters
  const visible = useMemo(() => {
    let list = todos;
    if (categoryFilter !== "all") {
      list = list.filter((t) => (t.category || "general") === categoryFilter);
    }
    return list.filter(FILTERS[filter]);
  }, [todos, filter, categoryFilter]);

  const startEdit = useCallback(
    (todo) =>
      dispatch(
        startEditGlobal({
          id: todo.id,
          text: todo.text,
          category: todo.category || "general",
        })
      ),
    [dispatch]
  );

  const [lastDeleted, setLastDeleted] = useState(null);
  const [pendingRestore, setPendingRestore] = useState(null);

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

  const [shareCategory, setShareCategory] = useState("general");
  useEffect(() => {
    if (!categories.includes(shareCategory) && categories.length) {
      setShareCategory(categories[0]);
    }
  }, [categories, shareCategory]);

  const [shareEmail, setShareEmail] = useState("");
  const [shareBusy, setShareBusy] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  const handleShare = useCallback(
    async (permissionsArg, emailArg) => {
      // backward compatibility: if first arg is email, shift
      let perms = Array.isArray(permissionsArg) ? permissionsArg : ["read"];
      let emailAuto = emailArg;

      if (typeof permissionsArg === "string" && emailArg === undefined) {
        emailAuto = permissionsArg;
        perms = ["read"];
      }

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
        await createShare(shareCategory, email, perms);
        setShareMsg("Shared");
        if (!emailArg) setShareEmail("");
        return true;
      } catch (e) {
        setShareMsg("Failed to share");
        return false;
      } finally {
        setShareBusy(false);
      }
    },
    [shareCategory, shareEmail, createShare]
  );

  const handleShareMany = useCallback(
    async (emails, permissionsArg) => {
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
      const perms = Array.isArray(permissionsArg) ? permissionsArg : ["read"];

      let ok = 0,
        fail = 0;
      for (const e of cleaned) {
        if (!isValidEmail(e)) {
          fail++;
          continue;
        }
        try {
          await createShare(shareCategory, e, perms);
          ok++;
        } catch {
          fail++;
        }
      }

      setShareMsg(
        `Shared ${ok}/${cleaned.length}${fail ? `, failed ${fail}` : ""}`
      );
      setShareBusy(false);
    },
    [shareCategory, createShare]
  );

  // Shared view
  const {
    sharedView,
    setSharedView,
    sharedTodos,
    setSharedTodos,
    sharedLoading,
    sharedPerms,
    urlInitializedRef,
    sharedVisible,
    sharedStats,
    canEdit,
    canDelete,
    canWrite,
    requireEdit,
    requireDelete,
    requireWrite,
    loadSharedTodos,
    removeSharedTodo,
  } = useSharedView(uid, filter);
  const getToken = getAuthToken;

  // Keep the Add form's category in sync with the current category filter (own list only)
  useEffect(() => {
    if (sharedView) return;
    if (categoryFilter && categoryFilter !== "all") {
      setNewCategory(categoryFilter);
    }
  }, [categoryFilter, sharedView]);

  const leaveSharedCategory = useCallback(
    async (ownerUid, category) => {
      if (hookLeaveSharedCategory) {
        return hookLeaveSharedCategory(ownerUid, category);
      }

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
    },
    [hookLeaveSharedCategory, getToken, refreshShares]
  );

  // Initialize from URL
  useEffect(() => {
    if (!mounted || !categories.length || urlInitializedRef.current) return;

    const c = searchParams.get("category");
    if (c === "all" && categoryFilter !== "all") setCategoryFilter("all");
    else if (c && categories.includes(c) && c !== categoryFilter) {
      setCategoryFilter(c);
    }

    const f = (searchParams.get("filter") || "").toLowerCase();
    if (["all", "active", "completed"].includes(f) && f !== filter) {
      setFilter(f);
    }

    const owner = searchParams.get("sharedOwner");
    const scat = searchParams.get("sharedCategory");
    if (uid && owner && scat && !sharedView) {
      loadSharedTodos(owner, scat, owner);
    }

    urlInitializedRef.current = true;
  }, [
    mounted,
    categories,
    uid,
    searchParams,
    categoryFilter,
    filter,
    sharedView,
    setCategoryFilter,
    setFilter,
    loadSharedTodos,
  ]);

  // Reflect category, filter and shared view in URL (batched)
  useEffect(() => {
    if (!mounted) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("category", categoryFilter || "all");
    params.set("filter", filter || "all");

    if (sharedView) {
      params.set("sharedOwner", sharedView.ownerUid);
      params.set("sharedCategory", sharedView.category);
    } else {
      params.delete("sharedOwner");
      params.delete("sharedCategory");
    }

    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  }, [
    mounted,
    pathname,
    router,
    searchParams,
    categoryFilter,
    filter,
    sharedView,
  ]);

  // Logged out: strip params
  useEffect(() => {
    if (mounted && !loading && !uid) {
      router.replace(pathname);
    }
  }, [mounted, loading, uid, pathname, router]);

  // Handle form submission
  const submit = useCallback(
    async (e) => {
      e.preventDefault();
      const text = input.trim();
      if (!text) return;

      // Shared view: add to owner's list if allowed
      if (sharedView) {
        const cat = sharedView.category || "general";
        if (!requireWrite()) return;

        // optimistic add
        const tempId = `tmp-${Date.now()}`;
        const optimistic = {
          id: tempId,
          uid: sharedView.ownerUid,
          text,
          completed: false,
          createdAt: Date.now(),
          category: cat,
        };

        const prev = sharedTodos;
        setSharedTodos((curr) => [optimistic, ...(curr || [])]);
        setInput("");

        try {
          const token = await getToken();
          const res = await fetch(`/api/todos`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              text,
              category: cat,
              ownerUid: sharedView.ownerUid,
            }),
          });

          if (!res.ok) {
            if (res.status === 403)
              showToast("You don't have permission to add in this category.");
            else showToast("Add failed");

            setSharedTodos(prev); // revert
            return;
          }

          const created = await res.json();
          setSharedTodos((curr) =>
            (curr || []).map((t) =>
              t.id === tempId ? { ...optimistic, ...created } : t
            )
          );
        } catch {
          showToast("Add failed");
          setSharedTodos(prev);
        }
        return;
      }

      // Own list via useTodos
      await addTodo(text, newCategory || "general");
      setInput("");
    },
    [
      input,
      sharedView,
      requireWrite,
      sharedTodos,
      getToken,
      addTodo,
      newCategory,
    ]
  );

  // removeSharedTodo provided by useSharedView hook

  const handleRemoveTodo = useCallback(
    async (id) => {
      const idx = todos.findIndex((x) => x.id === id);
      const t = idx >= 0 ? todos[idx] : null;

      await removeTodo(id);

      if (t) {
        const prevId = idx > 0 ? todos[idx - 1].id : null;
        setLastDeleted({
          id: t.id,
          text: t.text,
          category: t.category,
          prevId,
        });

        showUndoDeleteToast(`Deleted: "${t.text}"`, async () => {
          setPendingRestore({
            text: t.text,
            category: t.category || "general",
            prevId: prevId || null,
          });
          setLastDeleted(null);
          await addTodo(t.text, t.category || "general");
        });
      }
    },
    [todos, removeTodo, addTodo]
  );

  const deleteTodoMessage = getDeleteTodoMessage(
    sharedView ? sharedTodos : todos,
    confirmDeleteId
  );

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="w-full max-w-xl mx-auto">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/50 p-6 shadow-sm animate-pulse h-40" />
      </div>
    );
  }

  if (!uid)
    return <LoggedOutHero loading={loading} loginGoogle={loginGoogle} />;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      <AddTodoForm
        input={input}
        setInput={setInput}
        newCategory={
          sharedView ? sharedView.category || "general" : newCategory
        }
        setNewCategory={(val) => {
          if (!sharedView) setNewCategory(val);
        }}
        categories={
          sharedView ? [sharedView.category || "general"] : categories
        }
        onSubmit={submit}
        onOpenAddCategoryModal={() => setAddCategoryOpen(true)}
        categoryDisabled={!!sharedView}
        addCategoryDisabled={!!sharedView}
      />

      <FiltersBar
        filter={filter}
        setFilter={setFilter}
        stats={sharedView ? sharedStats : stats}
        clearCompleted={clearCompleted}
        onClearCompletedClick={() => !sharedView && setConfirmClearOpen(true)}
        readOnly={!!sharedView}
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
        sharedPerms={sharedPerms}
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
        createShare={createShare}
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
          onEditClick={(todo) => startEdit(todo)}
          confirmDeleteId={confirmDeleteId}
          setConfirmDeleteId={setConfirmDeleteId}
          toggleTodo={toggleTodo}
          removeTodo={handleRemoveTodo}
          filter={filter}
        />
      ) : Array.isArray(sharedPerms) && (canEdit || canDelete) ? (
        <TodoList
          visible={sharedVisible}
          categories={Array.from(
            new Set(sharedTodos.map((t) => t.category || "general"))
          )}
          loading={sharedLoading}
          allowEdit={canEdit}
          onBlockedEdit={() =>
            showToast("You don't have permission to edit in this category.")
          }
          allowDelete={canDelete}
          onBlockedDelete={() =>
            showToast("You don't have permission to delete in this category.")
          }
          onEditClick={(todo) => {
            if (!requireEdit()) return;
            dispatch(
              startEditGlobal({
                id: todo.id,
                text: todo.text,
                category: todo.category || "general",
              })
            );
          }}
          confirmDeleteId={confirmDeleteId}
          setConfirmDeleteId={(id) => {
            if (!requireDelete()) return;
            setConfirmDeleteId(id);
          }}
          toggleTodo={async (id) => {
            if (!requireEdit()) return;
            const t = sharedTodos.find((x) => x.id === id);
            if (!t) return;
            const token = await getToken();
            // optimistic toggle
            const prev = sharedTodos;
            setSharedTodos((curr) =>
              (curr || []).map((x) =>
                x.id === id ? { ...x, completed: !t.completed } : x
              )
            );
            const res = await fetch(`/api/todos`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ id, completed: !t.completed }),
            });
            if (!res.ok) {
              if (res.status === 403)
                showToast(
                  "You don't have permission to edit in this category."
                );
              else showToast("Update failed");
              // revert
              setSharedTodos(prev);
            }
          }}
          removeTodo={removeSharedTodo}
          filter={filter}
        />
      ) : (
        <SharedTodosList
          sharedView={sharedView}
          sharedTodos={sharedVisible}
          sharedLoading={sharedLoading}
          onAttemptAction={() =>
            showToast(
              "You don't have permission to edit or delete in this category."
            )
          }
        />
      )}

      <p className="text-[11px] text-neutral-500 text-center">
        {getFooterText(
          sharedView,
          Array.isArray(sharedPerms) ? sharedPerms : ["read"]
        )}
      </p>

      <DeleteCategoryModal
        open={!!confirmDeleteCategory}
        category={confirmDeleteCategory || ""}
        onCancel={() => setConfirmDeleteCategory(null)}
        onConfirm={async () => {
          const cat = confirmDeleteCategory;
          if (!cat) return;
          await removeCategory(cat);
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

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Delete todo"
        message={deleteTodoMessage}
        confirmLabel="Delete"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={async () => {
          if (!confirmDeleteId) return;
          if (sharedView) {
            await removeSharedTodo(confirmDeleteId);
          } else {
            await handleRemoveTodo(confirmDeleteId);
          }
          setConfirmDeleteId(null);
        }}
      />

      {/* Edit modal (re-uses Redux editing state) */}
      <EditTodoModal
        open={!!editingId}
        text={editingText || ""}
        category={editingCategory || "general"}
        categories={
          sharedView ? [sharedView.category || "general"] : categories
        }
        setText={setEditingText}
        setCategory={(v) => {
          if (!sharedView) setEditingCategory(v);
          else setEditingCategory(sharedView.category || "general");
        }}
        onCancel={() => dispatch(cancelEditGlobal())}
        onConfirm={async () => {
          if (!editingId) return;
          const text = (editingText || "").trim();
          if (!text) return;
          if (sharedView) {
            if (!requireEdit()) {
              dispatch(cancelEditGlobal());
              return;
            }
            try {
              const token = await getToken();
              const prev = sharedTodos;
              const nextCategory = editingCategory || "general";
              const isSameCategory =
                (sharedView?.category || "general") === nextCategory;
              setSharedTodos((curr) => {
                const list = Array.isArray(curr) ? curr.slice() : [];
                if (isSameCategory) {
                  return list.map((t) =>
                    t.id === editingId
                      ? { ...t, text, category: nextCategory }
                      : t
                  );
                }
                return list.filter((t) => t.id !== editingId);
              });
              const body = { id: editingId, text };
              if (editingCategory) body.category = editingCategory;
              const res = await fetch(`/api/todos`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
              });
              if (!res.ok) {
                if (res.status === 403)
                  showToast(
                    "You don't have permission to edit in this category."
                  );
                else showToast("Edit failed");
                setSharedTodos(prev);
                return;
              }
            } finally {
              dispatch(cancelEditGlobal());
            }
          } else {
            await editTodo(editingId, text, editingCategory || "general");
            dispatch(cancelEditGlobal());
          }
        }}
      />

      {pendingRestore && <span className="sr-only">Restoring…</span>}
    </div>
  );
}
