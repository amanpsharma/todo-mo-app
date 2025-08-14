"use client";
import React from "react";
import { IconExit, Avatar } from "./ShareUI";
import { formatDateTime } from "../../lib/utils";

export default function SharedWithMeList({
  owners,
  showSharedWithYou,
  setShowSharedWithYou,
  showAllCats,
  setShowAllCats,
  visibleCount,
  filteredCount,
  sharedQuery,
  setSharedQuery,
  setSharedOwnersLimit,
  loadSharedTodos,
  setConfirmLeave,
}) {
  return (
    <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="font-medium">Shared with you</div>
        <button
          onClick={() => setShowSharedWithYou((v) => !v)}
          className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          title={
            showSharedWithYou
              ? "Hide shared categories"
              : "Show shared categories"
          }
        >
          {showSharedWithYou ? "Hide" : "Show"}
        </button>
      </div>
      {showSharedWithYou && (
        <>
          <div className="flex items-center justify-between gap-2 mb-1">
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
                {visibleCount}/{filteredCount}
              </span>
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto scroll-thin pr-1">
            <ul className="flex flex-col gap-2">
              {owners.map((o, idxOwner) => {
                const cats = showAllCats[o.ownerUid]
                  ? o.categories
                  : (o.categories || []).slice(0, 12);
                const remaining = (o.categories || []).length - cats.length;
                const ownerUid =
                  typeof o.ownerUid === "string" ? o.ownerUid.trim() : "";
                const ownerKey =
                  ownerUid || `${o.ownerEmail || ""}-${idxOwner}`;
                return (
                  <li
                    key={ownerKey}
                    className="px-2 py-1 rounded border text-xs flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar
                        label={o.ownerName || o.ownerEmail || o.ownerUid}
                        size={18}
                        className="shrink-0"
                      />
                      <span className="font-medium truncate">
                        {o.ownerName || o.ownerEmail || o.ownerUid}
                      </span>
                      <span className="text-neutral-400">•</span>
                      <span className="text-neutral-500">
                        {(o.categories || []).length} categories
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cats.map((c, idxCat) => {
                        const ts = o.categoriesMeta?.[c]?.createdAt;
                        return (
                          <div
                            key={`${ownerKey}-${c}-${idxCat}`}
                            className="flex items-center gap-1 group/cat"
                          >
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
                              }'s ${c}${ts ? ` • ${formatDateTime(ts)}` : ""}`}
                            >
                              {c}
                            </button>
                            {ts ? (
                              <span
                                className="text-neutral-400 text-[10px]"
                                title={formatDateTime(ts)}
                              >
                                {formatDateTime(ts)}
                              </span>
                            ) : null}
                            <button
                              onClick={() =>
                                setConfirmLeave({
                                  ownerUid: o.ownerUid,
                                  ownerLabel:
                                    o.ownerName || o.ownerEmail || o.ownerUid,
                                  category: c,
                                })
                              }
                              aria-label="Leave this shared category"
                              title="Leave this shared category"
                              className="p-1 rounded text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition opacity-100 sm:opacity-0 sm:group-hover/cat:opacity-100"
                            >
                              <IconExit />
                            </button>
                          </div>
                        );
                      })}
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
        </>
      )}
    </div>
  );
}
