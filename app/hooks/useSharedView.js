"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FILTERS,
  getAuthToken,
  hasDeletePermission,
  hasEditPermission,
  hasWritePermission,
  showToast,
} from "../lib/utils";

// Encapsulates shared view state: loading todos, permissions, and CRUD helpers
export default function useSharedView(uid, filter) {
  const [sharedView, setSharedView] = useState(null); // { ownerUid, ownerEmail, category }
  const [sharedTodos, setSharedTodos] = useState([]);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [sharedPerms, setSharedPerms] = useState(["read"]);
  const urlInitializedRef = useRef(false);
  const getToken = getAuthToken;

  // Derived lists
  const sharedVisible = useMemo(() => {
    const list = Array.isArray(sharedTodos) ? sharedTodos : [];
    if (!filter || !FILTERS[filter]) return list;
    return list.filter(FILTERS[filter]);
  }, [sharedTodos, filter]);

  const sharedStats = useMemo(() => {
    const total = sharedVisible.length;
    const completed = sharedVisible.filter((t) => t.completed).length;
    return { total, completed, active: total - completed };
  }, [sharedVisible]);

  // Permissions derived
  const canEdit = useMemo(
    () => Array.isArray(sharedPerms) && hasEditPermission(sharedPerms),
    [sharedPerms]
  );
  const canDelete = useMemo(
    () => Array.isArray(sharedPerms) && hasDeletePermission(sharedPerms),
    [sharedPerms]
  );
  const canWrite = useMemo(
    () => Array.isArray(sharedPerms) && hasWritePermission(sharedPerms),
    [sharedPerms]
  );

  const requirePerm = useCallback((ok, msg) => {
    if (!ok) {
      showToast(msg);
      return false;
    }
    return true;
  }, []);
  const requireEdit = useCallback(
    () =>
      requirePerm(
        canEdit,
        "You don't have permission to edit in this category."
      ),
    [requirePerm, canEdit]
  );
  const requireDelete = useCallback(
    () =>
      requirePerm(
        canDelete,
        "You don't have permission to delete in this category."
      ),
    [requirePerm, canDelete]
  );
  const requireWrite = useCallback(
    () =>
      requirePerm(
        canWrite,
        "You don't have permission to add in this category."
      ),
    [requirePerm, canWrite]
  );

  const loadSharedTodos = useCallback(
    async (ownerUid, category, ownerDisplay) => {
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
        if (!res.ok) {
          if (res.status === 403) {
            showToast("You don't have permission to view this category.");
            setSharedView(null);
          } else {
            showToast("Failed to load shared todos");
          }
          return;
        }
        const data = await res.json();
        setSharedTodos(data || []);
      } catch (e) {
        console.error(e);
        showToast("Failed to load shared todos");
      } finally {
        setSharedLoading(false);
      }
    },
    [getToken]
  );

  // Load permissions when sharedView changes
  useEffect(() => {
    const run = async () => {
      if (!sharedView || !uid) return;
      try {
        const token = await getToken();
        const res = await fetch(
          `/api/shares?owner=${encodeURIComponent(
            sharedView.ownerUid
          )}&category=${encodeURIComponent(sharedView.category)}`,
          { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
        );
        if (!res.ok) {
          setSharedPerms(["read"]);
          return;
        }
        const j = await res.json();
        const arr =
          Array.isArray(j.permissions) && j.permissions.length
            ? j.permissions
            : ["read"];
        setSharedPerms(arr);
      } catch (e) {
        setSharedPerms(["read"]);
      }
    };
    run();
  }, [sharedView, uid, getToken]);

  // Shared delete helper (optimistic)
  const removeSharedTodo = useCallback(
    async (id) => {
      const token = await getToken();
      const prev = sharedTodos;
      setSharedTodos((curr) => (curr || []).filter((t) => t.id !== id));
      const res = await fetch(`/api/todos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 403)
          showToast("You don't have permission to delete in this category.");
        else showToast("Delete failed");
        setSharedTodos(prev); // revert
      }
    },
    [getToken, sharedTodos]
  );

  return {
    // state
    sharedView,
    setSharedView,
    sharedTodos,
    setSharedTodos,
    sharedLoading,
    sharedPerms,
    urlInitializedRef,

    // derived
    sharedVisible,
    sharedStats,

    // permissions
    canEdit,
    canDelete,
    canWrite,
    requireEdit,
    requireDelete,
    requireWrite,

    // actions
    loadSharedTodos,
    removeSharedTodo,
  };
}
