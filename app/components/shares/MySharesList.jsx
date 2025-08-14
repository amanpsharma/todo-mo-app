"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, IconTrash, SpinnerMini } from "./ShareUI";
import { formatDateTime } from "../../lib/utils";

export default function MySharesList({
  items,
  expandedId,
  setExpandedId,
  savingPermId,
  setSavingPermId,
  createShare,
  setConfirmRevoke,
}) {
  return (
    <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="font-medium">You shared</div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-400 whitespace-nowrap">
            {items.visible.length}/{items.filtered.length}
          </span>
        </div>
      </div>
      <div className="max-h-56 overflow-y-auto scroll-thin pr-1">
        <ul className="flex flex-col gap-1">
          {items.visible.map((s, idx) => {
            const sid = typeof s.id === "string" ? s.id.trim() : "";
            const itemKey = sid || `${s.category}-${s.viewerEmailLower}-${idx}`;
            const isExpanded = expandedId === itemKey;
            const currentPerms =
              Array.isArray(s.permissions) && s.permissions.length
                ? s.permissions
                : ["read"];
            const has = (p) => currentPerms.includes(p);
            const canToggle = !!createShare && savingPermId !== itemKey;
            const updatePerms = async (perm) => {
              if (!createShare) return;
              if (perm === "read") return;
              try {
                setSavingPermId(itemKey);
                let next = currentPerms.slice();
                if (has(perm)) next = next.filter((x) => x !== perm);
                else next = Array.from(new Set([...next, perm]));
                if (!next.includes("read")) next.unshift("read");
                await createShare(s.category, s.viewerEmailLower, next);
              } finally {
                setSavingPermId(null);
              }
            };
            return (
              <li
                key={itemKey}
                onClick={() =>
                  setExpandedId((id) => (id === itemKey ? null : itemKey))
                }
                className="px-2 py-1 rounded border text-xs group"
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 capitalize">
                      {s.category}
                    </span>
                    <span className="text-neutral-400 shrink-0">→</span>
                    <span className="inline-flex items-center gap-1 min-w-0">
                      <Avatar label={s.viewerEmailLower} />
                      <span className="truncate" title={s.viewerEmailLower}>
                        {s.viewerEmailLower}
                      </span>
                    </span>
                    {s.createdAt ? (
                      <span
                        className="text-neutral-400 text-[10px] shrink-0"
                        title={formatDateTime(s.createdAt)}
                      >
                        • {formatDateTime(s.createdAt)}
                      </span>
                    ) : null}
                  </div>
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 mr-1">
                      {["read", "write", "edit", "delete"].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updatePerms(p);
                          }}
                          disabled={!canToggle}
                          className={`px-1.5 py-0.5 rounded-full text-[10px] capitalize border ${
                            has(p)
                              ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                              : "bg-transparent border-neutral-300 dark:border-neutral-700 text-neutral-400"
                          } ${
                            p === "read"
                              ? "cursor-not-allowed opacity-70"
                              : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                          title={
                            p === "read"
                              ? "Read is always included"
                              : has(p)
                              ? `Remove ${p}`
                              : `Add ${p}`
                          }
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    {savingPermId === itemKey && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-violet-700 dark:text-violet-300">
                        <SpinnerMini />
                        Saving…
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmRevoke({
                          category: s.category,
                          email: s.viewerEmailLower,
                        });
                      }}
                      aria-label="Revoke access"
                      title="Revoke access"
                      disabled={savingPermId === itemKey}
                      className={`shrink-0 p-1 rounded transition ${
                        savingPermId === itemKey
                          ? "text-neutral-400 cursor-not-allowed"
                          : "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                      }`}
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="mobile-actions"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="sm:hidden mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-wrap items-center gap-2 justify-between">
                        <div className="flex flex-wrap items-center gap-1 mr-1">
                          {["read", "write", "edit", "delete"].map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => updatePerms(p)}
                              disabled={!canToggle}
                              className={`px-1.5 py-0.5 rounded-full text-[10px] capitalize border ${
                                has(p)
                                  ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                                  : "bg-transparent border-neutral-300 dark:border-neutral-700 text-neutral-400"
                              } ${
                                p === "read"
                                  ? "cursor-not-allowed opacity-70"
                                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              }`}
                              title={
                                p === "read"
                                  ? "Read is always included"
                                  : has(p)
                                  ? `Remove ${p}`
                                  : `Add ${p}`
                              }
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          {savingPermId === itemKey && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-violet-700 dark:text-violet-300">
                              <SpinnerMini />
                              Saving…
                            </span>
                          )}
                          <button
                            onClick={() =>
                              setConfirmRevoke({
                                category: s.category,
                                email: s.viewerEmailLower,
                              })
                            }
                            aria-label="Revoke access"
                            title="Revoke access"
                            disabled={savingPermId === itemKey}
                            className={`p-1 rounded ${
                              savingPermId === itemKey
                                ? "text-neutral-400 cursor-not-allowed"
                                : "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                            }`}
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
