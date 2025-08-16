"use client";

import { useEffect } from "react";

// Centralizes URL init/sync and logged-out cleanup side effects
export default function useUrlSync({
  mounted,
  categories,
  urlInitializedRef,
  searchParams,
  categoryFilter,
  setCategoryFilter,
  filter,
  setFilter,
  uid,
  sharedView,
  loadSharedTodos,
  router,
  pathname,
  loading,
}) {
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
    urlInitializedRef,
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
}
