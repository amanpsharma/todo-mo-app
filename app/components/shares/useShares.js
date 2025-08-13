"use client";

import { useCallback, useEffect, useState } from "react";

export function useShares(uid) {
  const auth =
    typeof window !== "undefined" ? window.__firebaseAuth || null : null;
  const [myShares, setMyShares] = useState([]);
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = useCallback(async () => {
    if (!auth) throw new Error("Auth not ready");
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("No auth token");
    return token;
  }, [auth]);

  const refresh = useCallback(async () => {
    if (!uid || !auth) return;
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const [mineRes, swmRes] = await Promise.all([
        fetch(`/api/shares?my=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/shares?sharedWithMe=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!mineRes.ok || !swmRes.ok) throw new Error("Load shares failed");
      const [mine, swm] = await Promise.all([mineRes.json(), swmRes.json()]);
      setMyShares(mine);
      setSharedWithMe(swm);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [uid, auth, getToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createShare = useCallback(
    async (category, viewerEmail) => {
      if (!uid) return;
      const token = await getToken();
      const res = await fetch(`/api/shares`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category, viewerEmail }),
      });
      if (!res.ok) throw new Error("Create share failed");
      await refresh();
    },
    [uid, getToken, refresh]
  );

  const revokeShare = useCallback(
    async (category, viewerEmail) => {
      if (!uid) return;
      const token = await getToken();
      const res = await fetch(`/api/shares`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category, viewerEmail }),
      });
      if (!res.ok) throw new Error("Revoke share failed");
      await refresh();
    },
    [uid, getToken, refresh]
  );

  const leaveSharedCategory = useCallback(
    async (ownerUid, category) => {
      if (!uid) return;
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
      await refresh();
    },
    [uid, getToken, refresh]
  );

  return {
    myShares,
    sharedWithMe,
    createShare,
    revokeShare,
    loading,
    error,
    refresh,
    leaveSharedCategory,
  };
}
