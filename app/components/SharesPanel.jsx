"use client";
import React, { useMemo, useState, useEffect } from "react";
import ConfirmModal from "./ConfirmModal";

export default function SharesPanel({
  categories,
  sharedView,
  setSharedView,
  shareCategory,
  setShareCategory,
  shareEmail,
  setShareEmail,
  shareBusy,
  shareMsg,
  onShare,
  myShares,
  revokeShare,
  sharedWithMe,
  leaveSharedCategory,
  loadSharedTodos,
  sharedError,
}) {
  // Local UI scaling state
  const [mySharesQuery, setMySharesQuery] = useState("");
  const [mySharesLimit, setMySharesLimit] = useState(20);
  const [sharedQuery, setSharedQuery] = useState("");
  const [sharedOwnersLimit, setSharedOwnersLimit] = useState(20);
  const [showAllCats, setShowAllCats] = useState({});
  const [confirmRevoke, setConfirmRevoke] = useState(null); // { category, email }
  const [confirmLeave, setConfirmLeave] = useState(null); // { ownerUid, ownerLabel, category }

  const filteredMyShares = useMemo(() => {
    const q = mySharesQuery.trim().toLowerCase();
    if (!q) return myShares || [];
    return (myShares || []).filter(
      (s) =>
        (s.viewerEmailLower || "").includes(q) ||
        (s.category || "").toLowerCase().includes(q)
    );
  }, [myShares, mySharesQuery]);
  const visibleMyShares = useMemo(
    () => (filteredMyShares || []).slice(0, mySharesLimit),
    [filteredMyShares, mySharesLimit]
  );

  const filteredSharedOwners = useMemo(() => {
    const q = sharedQuery.trim().toLowerCase();
    if (!q) return sharedWithMe || [];
    return (sharedWithMe || []).filter((o) => {
      const name = (
        o.ownerName ||
        o.ownerEmail ||
        o.ownerUid ||
        ""
      ).toLowerCase();
      const cats = (o.categories || []).join(" ").toLowerCase();
      return name.includes(q) || cats.includes(q);
    });
  }, [sharedWithMe, sharedQuery]);
  const visibleSharedOwners = useMemo(
    () => (filteredSharedOwners || []).slice(0, sharedOwnersLimit),
    [filteredSharedOwners, sharedOwnersLimit]
  );

  useEffect(() => {
    if (!categories.includes(shareCategory) && categories.length) {
      setShareCategory(categories[0]);
    }
  }, [categories, shareCategory, setShareCategory]);

  return (
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
          onClick={onShare}
          disabled={shareBusy || !shareEmail.trim()}
          className="text-xs px-3 py-1 rounded bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40"
        >
          {shareBusy ? "Sharing…" : "Share"}
        </button>
        {shareMsg && (
          <span className="text-[11px] text-neutral-500">{shareMsg}</span>
        )}
      </div>

      {!!(myShares && myShares.length) && (
        <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="font-medium">You shared</div>
            <div className="flex items-center gap-2">
              <input
                value={mySharesQuery}
                onChange={(e) => {
                  setMySharesQuery(e.target.value);
                  setMySharesLimit(20);
                }}
                placeholder="Filter by email or category"
                className="rounded border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-2 py-1 text-[11px] min-w-48"
              />
              <span className="text-neutral-400 whitespace-nowrap">
                {visibleMyShares.length}/{filteredMyShares.length}
              </span>
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto scroll-thin pr-1">
            <ul className="flex flex-col gap-1">
              {visibleMyShares.map((s) => (
                <li
                  key={s.id}
                  className="px-2 py-1 rounded border text-xs flex items-center gap-3 justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 capitalize">
                      {s.category}
                    </span>
                    <span className="text-neutral-400 shrink-0">→</span>
                    <span className="truncate" title={s.viewerEmailLower}>
                      {s.viewerEmailLower}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setConfirmRevoke({
                        category: s.category,
                        email: s.viewerEmailLower,
                      })
                    }
                    className="text-red-600 hover:underline shrink-0"
                  >
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {filteredMyShares.length > mySharesLimit && (
            <div className="mt-2 text-center">
              <button
                onClick={() => setMySharesLimit((n) => n + 20)}
                className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px]"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}

      {!!(sharedWithMe && sharedWithMe.length) && (
        <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="font-medium">Shared with you</div>
            <div className="flex items-center gap-2">
              <input
                value={sharedQuery}
                onChange={(e) => {
                  setSharedQuery(e.target.value);
                  setSharedOwnersLimit(20);
                }}
                placeholder="Filter by owner or category"
                className="rounded border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-2 py-1 text-[11px] min-w-48"
              />
              <span className="text-neutral-400 whitespace-nowrap">
                {visibleSharedOwners.length}/{filteredSharedOwners.length}
              </span>
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto scroll-thin pr-1">
            <ul className="flex flex-col gap-2">
              {visibleSharedOwners.map((o) => {
                const cats = showAllCats[o.ownerUid]
                  ? o.categories
                  : (o.categories || []).slice(0, 12);
                const remaining = (o.categories || []).length - cats.length;
                return (
                  <li
                    key={o.ownerUid}
                    className="px-2 py-1 rounded border text-xs flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {o.ownerName || o.ownerEmail || o.ownerUid}
                      </span>
                      <span className="text-neutral-400">•</span>
                      <span className="text-neutral-500">
                        {(o.categories || []).length} categories
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cats.map((c) => (
                        <div key={c} className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              loadSharedTodos(
                                o.ownerUid,
                                c,
                                o.ownerName || o.ownerEmail || o.ownerUid
                              )
                            }
                            className="px-2 py-0.5 rounded border capitalize hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            title={`View ${
                              o.ownerName || o.ownerEmail || o.ownerUid
                            }'s ${c}`}
                          >
                            {c}
                          </button>
                          <button
                            onClick={() =>
                              setConfirmLeave({
                                ownerUid: o.ownerUid,
                                ownerLabel:
                                  o.ownerName || o.ownerEmail || o.ownerUid,
                                category: c,
                              })
                            }
                            className="text-red-600 hover:underline"
                            title="Leave this shared category"
                          >
                            Leave
                          </button>
                        </div>
                      ))}
                      {remaining > 0 && (
                        <button
                          onClick={() =>
                            setShowAllCats((m) => ({
                              ...m,
                              [o.ownerUid]: true,
                            }))
                          }
                          className="px-2 py-0.5 rounded border hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          title={`Show ${remaining} more`}
                        >
                          +{remaining} more
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          {filteredSharedOwners.length > sharedOwnersLimit && (
            <div className="mt-2 text-center">
              <button
                onClick={() => setSharedOwnersLimit((n) => n + 20)}
                className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px]"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}
      {sharedError && (
        <div className="text-red-600 mt-1">{String(sharedError)}</div>
      )}

      {/* Revoke confirm modal */}
      <ConfirmModal
        open={!!confirmRevoke}
        title="Revoke access"
        message={
          confirmRevoke
            ? `Revoke access to category "${confirmRevoke.category}" for ${confirmRevoke.email}?`
            : ""
        }
        confirmLabel="Revoke"
        onCancel={() => setConfirmRevoke(null)}
        onConfirm={async () => {
          const { category, email } = confirmRevoke || {};
          if (!category || !email) return setConfirmRevoke(null);
          await revokeShare(category, email);
          setConfirmRevoke(null);
        }}
      />

      {/* Leave confirm modal */}
      <ConfirmModal
        open={!!confirmLeave}
        title="Leave shared category"
        message={
          confirmLeave
            ? `Leave ${confirmLeave.ownerLabel}'s "${confirmLeave.category}" category? You will lose access.`
            : ""
        }
        confirmLabel="Leave"
        onCancel={() => setConfirmLeave(null)}
        onConfirm={async () => {
          const { ownerUid, category } = confirmLeave || {};
          if (!ownerUid || !category) return setConfirmLeave(null);
          await leaveSharedCategory(ownerUid, category);
          if (
            sharedView &&
            sharedView.ownerUid === ownerUid &&
            sharedView.category === category
          ) {
            setSharedView(null);
          }
          setConfirmLeave(null);
        }}
      />
    </div>
  );
}
