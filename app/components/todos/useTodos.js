"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";

const ACTIONS = {
  HYDRATE: "HYDRATE",
  ADD: "ADD",
  TOGGLE: "TOGGLE",
  REMOVE: "REMOVE",
  CLEAR_COMPLETED: "CLEAR_COMPLETED",
  EDIT: "EDIT",
  REORDER: "REORDER",
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.HYDRATE:
      return action.payload || [];
    case ACTIONS.ADD: {
      const text = action.payload.text.trim();
      if (!text) return state;
      if (state.some((t) => t.text.toLowerCase() === text.toLowerCase()))
        return state;
      return [
        {
          id: crypto.randomUUID(),
          text,
          completed: false,
          createdAt: Date.now(),
          category: action.payload.category || "general",
        },
        ...state,
      ];
    }
    case ACTIONS.TOGGLE:
      return state.map((t) =>
        t.id === action.payload.id ? { ...t, completed: !t.completed } : t
      );
    case ACTIONS.REMOVE:
      return state.filter((t) => t.id !== action.payload.id);
    case ACTIONS.CLEAR_COMPLETED:
      return state.filter((t) => !t.completed);
    case ACTIONS.EDIT: {
      const { id, text, category } = action.payload;
      return state.map((t) =>
        t.id === id
          ? {
              ...t,
              text: text.trim(),
              ...(category ? { category } : {}),
            }
          : t
      );
    }
    case ACTIONS.REORDER:
      return action.payload;
    default:
      return state;
  }
}

export function useTodos(uid) {
  const [todos, dispatch] = useReducer(reducer, []);
  const [remoteError, setRemoteError] = useState(null);
  const [loading, setLoading] = useState(false);
  const auth =
    typeof window !== "undefined" ? window.__firebaseAuth || null : null;

  const fetchTodos = useCallback(async () => {
    if (!uid) {
      dispatch({ type: ACTIONS.HYDRATE, payload: [] });
      setLoading(false);
      return;
    }
    if (!auth) {
      setLoading(true);
      setTimeout(fetchTodos, 300);
      return;
    }
    try {
      setRemoteError(null);
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch("/api/todos", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.status === 401) {
        throw new Error(
          "Unauthorized (check Firebase Admin server credentials)"
        );
      }
      if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
      const data = await res.json();
      dispatch({ type: ACTIONS.HYDRATE, payload: data });
    } catch (e) {
      console.error("Load todos error", e);
      setRemoteError(e);
    } finally {
      setLoading(false);
    }
  }, [uid, auth]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    const handler = () => fetchTodos();
    if (typeof window !== "undefined") {
      window.addEventListener("auth:state", handler);
      return () => window.removeEventListener("auth:state", handler);
    }
  }, [fetchTodos]);

  const getToken = useCallback(async () => {
    if (!auth) throw new Error("Auth not ready");
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("No auth token");
    return token;
  }, [auth]);

  const safeRun = useCallback(
    async (optimistic, fn, options = {}) => {
      let revert;
      if (optimistic) revert = optimistic();
      try {
        await fn();
      } catch (e) {
        console.error("Mutation error", e);
        if (revert) revert();
        setRemoteError(e);
      } finally {
        if (options.refresh !== false) {
          fetchTodos();
        }
      }
    },
    [fetchTodos]
  );

  const addTodo = useCallback(
    async (text, category = "general") => {
      text = text.trim();
      if (!text || !uid) return;
      await safeRun(
        () => {
          dispatch({ type: ACTIONS.ADD, payload: { text, category } });
          return () => fetchTodos();
        },
        async () => {
          const token = await getToken();
          const res = await fetch("/api/todos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text, category }),
          });
          if (!res.ok) throw new Error("Create failed");
        }
      );
    },
    [uid, getToken, safeRun, fetchTodos]
  );

  const toggleTodo = useCallback(
    async (id) => {
      const t = todos.find((x) => x.id === id);
      if (!t || !uid) return;
      await safeRun(
        () => {
          dispatch({ type: ACTIONS.TOGGLE, payload: { id } });
          return () => fetchTodos();
        },
        async () => {
          const token = await getToken();
          const res = await fetch("/api/todos", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id, completed: !t.completed }),
          });
          if (!res.ok) throw new Error("Toggle failed");
        },
        { refresh: false }
      );
    },
    [todos, uid, getToken, safeRun, fetchTodos]
  );

  const removeTodo = useCallback(
    async (id) => {
      if (!uid) return;
      await safeRun(
        () => {
          dispatch({ type: ACTIONS.REMOVE, payload: { id } });
          return () => fetchTodos();
        },
        async () => {
          const token = await getToken();
          const res = await fetch(`/api/todos?id=${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Delete failed");
        }
      );
    },
    [uid, getToken, safeRun, fetchTodos]
  );

  const clearCompleted = useCallback(async () => {
    if (!uid) return;
    const completed = todos.filter((t) => t.completed).map((t) => t.id);
    if (!completed.length) return;
    await safeRun(
      () => {
        dispatch({ type: ACTIONS.CLEAR_COMPLETED });
        return () => fetchTodos();
      },
      async () => {
        const token = await getToken();
        const res = await fetch(`/api/todos?clearCompleted=1`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Clear completed failed");
      }
    );
  }, [uid, todos, getToken, safeRun, fetchTodos]);

  const removeCategory = useCallback(
    async (category) => {
      if (!uid || !category) return;
      const cat = category.toLowerCase();
      await safeRun(
        () => {
          const prev = todos;
          dispatch({
            type: ACTIONS.HYDRATE,
            payload: prev.filter((t) => (t.category || "general") !== cat),
          });
          return () => fetchTodos();
        },
        async () => {
          const token = await getToken();
          const res = await fetch(
            `/api/todos?category=${encodeURIComponent(cat)}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!res.ok) throw new Error("Delete category failed");
        }
      );
    },
    [uid, todos, getToken, safeRun, fetchTodos]
  );

  const editTodo = useCallback(
    async (id, text, category) => {
      text = text.trim();
      if (!text || !uid) return;
      await safeRun(
        () => {
          dispatch({ type: ACTIONS.EDIT, payload: { id, text, category } });
          return () => fetchTodos();
        },
        async () => {
          const token = await getToken();
          const body = { id, text };
          if (category) body.category = category;
          const res = await fetch("/api/todos", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error("Edit failed");
        }
      );
    },
    [uid, getToken, safeRun, fetchTodos]
  );

  const reorder = useCallback(
    (next) => dispatch({ type: ACTIONS.REORDER, payload: next }),
    []
  );

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    return { total, completed, active: total - completed };
  }, [todos]);

  return {
    todos,
    addTodo,
    toggleTodo,
    removeTodo,
    clearCompleted,
    editTodo,
    reorder,
    stats,
    remoteError,
    loading,
    removeCategory,
  };
}
