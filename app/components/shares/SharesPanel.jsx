"use client";
import React, { useMemo, useState, useEffect } from "react";
import ConfirmModal from "../ui/ConfirmModal";
import SharePermissionsModal from "./SharePermissionsModal";
import { isValidEmail, formatDateTime } from "../../lib/utils";

function IconTrash({ className = "", ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-4 w-4 ${className}`}
      aria-hidden="true"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function IconExit({ className = "", ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-4 w-4 ${className}`}
      aria-hidden="true"
      {...props}
    >
      <path d="M9 3h6a2 2 0 0 1 2 2v4" />
      <path d="M9 21h6a2 2 0 0 0 2-2v-4" />
      <path d="M15 12H4" />
      <path d="M6.5 8.5L3 12l3.5 3.5" />
    </svg>
  );
}

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
  onShareMany,
  myShares,
  revokeShare,
  createShare,
  sharedWithMe,
  leaveSharedCategory,
  loadSharedTodos,
  sharedError,
}) {
  // Local UI state
  const [mySharesQuery, setMySharesQuery] = useState("");
  const [mySharesQueryDeb, setMySharesQueryDeb] = useState("");
  const [mySharesLimit, setMySharesLimit] = useState(20);
  const [sharedQuery, setSharedQuery] = useState("");
  const [sharedQueryDeb, setSharedQueryDeb] = useState("");
  const [sharedOwnersLimit, setSharedOwnersLimit] = useState(20);
  const [showAllCats, setShowAllCats] = useState({});
  const [showSharedWithYou, setShowSharedWithYou] = useState(true);
  const [showSharePanel, setShowSharePanel] = useState(true);
  const [confirmRevoke, setConfirmRevoke] = useState(null); // { category, email }
  const [confirmLeave, setConfirmLeave] = useState(null); // { ownerUid, ownerLabel, category }
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState(["read"]);
  const [savingPermId, setSavingPermId] = useState(null); // share id while updating perms

  useEffect(() => {
    const t = setTimeout(() => setMySharesQueryDeb(mySharesQuery), 200);
    return () => clearTimeout(t);
  }, [mySharesQuery]);
  useEffect(() => {
    const t = setTimeout(() => setSharedQueryDeb(sharedQuery), 200);
    return () => clearTimeout(t);
  }, [sharedQuery]);
  // Persist show/hide of the entire share panel across reloads
  useEffect(() => {
    try {
      const saved = localStorage.getItem("todo:sharePanelVisible");
      if (saved === "0") setShowSharePanel(false);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "todo:sharePanelVisible",
        showSharePanel ? "1" : "0"
      );
    } catch {}
  }, [showSharePanel]);

  const filteredMyShares = useMemo(() => {
    const q = mySharesQueryDeb.trim().toLowerCase();
    if (!q) return myShares || [];
    return (myShares || []).filter(
      (s) =>
        (s.viewerEmailLower || "").includes(q) ||
        (s.category || "").toLowerCase().includes(q)
    );
  }, [myShares, mySharesQueryDeb]);
  const visibleMyShares = useMemo(
    () => (filteredMyShares || []).slice(0, mySharesLimit),
    [filteredMyShares, mySharesLimit]
  );

  const filteredSharedOwners = useMemo(() => {
    const q = sharedQueryDeb.trim().toLowerCase();
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
  }, [sharedWithMe, sharedQueryDeb]);
  const visibleSharedOwners = useMemo(
    () => (filteredSharedOwners || []).slice(0, sharedOwnersLimit),
    [filteredSharedOwners, sharedOwnersLimit]
  );

  // Email autocomplete: recent + derived suggestions
  const [recentEmails, setRecentEmails] = useState([]);
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("todo:recentEmails") || "[]"
      );
      if (Array.isArray(saved)) setRecentEmails(saved);
    } catch {}
  }, []);
  const rememberEmail = (email) => {
    try {
      const e = String(email || "")
        .trim()
        .toLowerCase();
      if (!e) return;
      setRecentEmails((prev) => {
        const next = [e, ...prev.filter((x) => x !== e)].slice(0, 50);
        localStorage.setItem("todo:recentEmails", JSON.stringify(next));
        return next;
      });
    } catch {}
  };
  const allEmailCandidates = useMemo(() => {
    const set = new Set();
    recentEmails.forEach((e) => e && set.add(e));
    (myShares || []).forEach((s) => {
      const e = (s.viewerEmailLower || "").trim().toLowerCase();
      if (e) set.add(e);
    });
    return Array.from(set);
  }, [recentEmails, myShares]);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailIndex, setEmailIndex] = useState(0);
  const emailListId = "viewer-email-suggestions";
  const emailFiltered = useMemo(() => {
    const q = (shareEmail || "").trim().toLowerCase();
    if (q.length < 3) return [];
    const list = allEmailCandidates.filter((e) => e.includes(q));
    return list.slice(0, 8);
  }, [allEmailCandidates, shareEmail]);
  // Multi-email chips state
  const [emails, setEmails] = useState([]); // array of strings
  const addEmail = (val) => {
    const e = String(val ?? shareEmail)
      .trim()
      .toLowerCase();
    if (!e || !isValidEmail(e)) return;
    setEmails((prev) => (prev.includes(e) ? prev : [...prev, e]));
    // Always clear the input after adding a chip
    setShareEmail("");
    // Reset suggestions for the next entry
    setEmailIndex(0);
    setEmailOpen(false);
  };
  const removeEmail = (val) =>
    setEmails((prev) => prev.filter((x) => x !== val));
  const onInputKeyDown = (e) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addEmail();
    } else if (e.key === "Backspace" && !shareEmail) {
      setEmails((prev) => prev.slice(0, -1));
    }
  };

  const hasChip = emails.length >= 1;
  const hasManyChips = emails.length > 1;
  useEffect(() => {
    setEmailIndex(0);
  }, [emailFiltered.length]);

  useEffect(() => {
    if (!categories.includes(shareCategory) && categories.length) {
      setShareCategory(categories[0]);
    }
  }, [categories, shareCategory, setShareCategory]);

  return (
    <div className="rounded border border-neutral-200 dark:border-neutral-800 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          Share category (view-only)
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSharePanel((v) => !v)}
            aria-expanded={showSharePanel}
            className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title={showSharePanel ? "Hide sharing panel" : "Show sharing panel"}
          >
            {showSharePanel ? "Hide" : "Show"}
          </button>
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
      </div>
      {showSharePanel && (
        <>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={shareCategory}
              onChange={(e) => setShareCategory(e.target.value)}
              className="rounded border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-2 py-1 text-xs text-neutral-900 dark:text-neutral-100"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
            <div className="relative flex-1 min-w-40">
              <div className="flex flex-wrap gap-1 items-center rounded border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-2 py-1">
                {emails.map((e) => (
                  <span
                    key={e}
                    className="inline-flex items-center gap-1 rounded bg-violet-600/10 text-violet-700 dark:text-violet-300 px-2 py-0.5 text-[11px]"
                    title={e}
                  >
                    {e}
                    <button
                      type="button"
                      onClick={() => removeEmail(e)}
                      className="ml-1 rounded hover:bg-violet-600/20 px-1"
                      aria-label={`Remove ${e}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="email"
                  placeholder="Viewer email"
                  value={shareEmail}
                  onChange={(e) => {
                    const v = e.target.value;
                    setShareEmail(v);
                    const q = v.trim().toLowerCase();
                    if (q.length >= 3) setEmailOpen(true);
                    if (q.length === 0) setEmailOpen(false);
                  }}
                  onFocus={() => {
                    const q = (shareEmail || "").trim().toLowerCase();
                    setEmailOpen(q.length >= 3);
                  }}
                  onBlur={() => setTimeout(() => setEmailOpen(false), 120)}
                  onKeyDown={(e) => {
                    const hasSuggestions =
                      emailOpen && emailFiltered.length > 0;
                    if (e.key === "ArrowDown" && hasSuggestions) {
                      e.preventDefault();
                      setEmailIndex((i) =>
                        Math.min(i + 1, Math.max(0, emailFiltered.length - 1))
                      );
                      return;
                    }
                    if (e.key === "ArrowUp" && hasSuggestions) {
                      e.preventDefault();
                      setEmailIndex((i) => Math.max(0, i - 1));
                      return;
                    }
                    if (
                      e.key === "Enter" &&
                      hasSuggestions &&
                      emailFiltered[emailIndex]
                    ) {
                      e.preventDefault();
                      addEmail(emailFiltered[emailIndex]);
                      setEmailOpen(false);
                      return;
                    }
                    // Typed entry handling
                    if (e.key === "," || e.key === "Enter") {
                      e.preventDefault();
                      addEmail();
                      return;
                    }
                    if (e.key === "Backspace" && !shareEmail) {
                      setEmails((prev) => prev.slice(0, -1));
                      return;
                    }
                    if (e.key === "Escape") {
                      setEmailOpen(false);
                      return;
                    }
                  }}
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-haspopup="listbox"
                  aria-expanded={emailOpen}
                  aria-controls={emailListId}
                  className="flex-1 min-w-40 bg-transparent outline-none text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                />
              </div>
              {emailOpen && emailFiltered.length > 0 && (
                <div
                  id={emailListId}
                  role="listbox"
                  className="absolute z-20 mt-1 w-full max-h-52 overflow-auto rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg"
                >
                  {emailFiltered.map((e, i) => (
                    <button
                      type="button"
                      key={e}
                      role="option"
                      aria-selected={i === emailIndex}
                      onMouseDown={(ev) => ev.preventDefault()}
                      onClick={() => {
                        addEmail(e);
                        setEmailOpen(false);
                      }}
                      className={`block w-full text-left px-2 py-1 text-xs truncate ${
                        i === emailIndex
                          ? "bg-violet-600/10 text-violet-700 dark:text-violet-300"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                      title={e}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1">
                {selectedPerms.map((p) => (
                  <span
                    key={p}
                    className="px-1.5 py-0.5 rounded-full text-[10px] capitalize bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                  >
                    {p}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPermModalOpen(true)}
                className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="Select permissions"
              >
                Permissions
              </button>
              <button
                onClick={async () => {
                  if (hasManyChips) {
                    await onShareMany(emails, selectedPerms);
                    emails.forEach((e) => rememberEmail(e));
                    setEmails([]);
                    setShareEmail("");
                  } else if (hasChip) {
                    const ok = await onShare(selectedPerms, emails[0]);
                    if (ok && isValidEmail(emails[0])) rememberEmail(emails[0]);
                    setEmails([]);
                    setShareEmail("");
                  } else {
                    const ok = await onShare(selectedPerms);
                    const e = (shareEmail || "").trim().toLowerCase();
                    if (ok && isValidEmail(e)) rememberEmail(e);
                  }
                }}
                disabled={shareBusy || (!shareEmail.trim() && !hasChip)}
                className="text-xs px-3 py-1 rounded bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40"
              >
                {shareBusy ? "Sharing…" : hasManyChips ? "Share all" : "Share"}
              </button>
            </div>
            {shareMsg && (
              <span className="text-[11px] text-neutral-700 dark:text-neutral-300">
                {shareMsg}
              </span>
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
                  {visibleMyShares.map((s, idx) => {
                    const sid = typeof s.id === "string" ? s.id.trim() : "";
                    const itemKey =
                      sid || `${s.category}-${s.viewerEmailLower}-${idx}`;
                    const currentPerms =
                      Array.isArray(s.permissions) && s.permissions.length
                        ? s.permissions
                        : ["read"];
                    const has = (p) => currentPerms.includes(p);
                    const canToggle = !!createShare && savingPermId !== itemKey;
                    const updatePerms = async (perm) => {
                      if (!createShare) return;
                      if (perm === "read") return; // always on
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
                        className="px-2 py-1 rounded border text-xs flex items-center gap-3 justify-between group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 capitalize">
                            {s.category}
                          </span>
                          <span className="text-neutral-400 shrink-0">→</span>
                          <span className="truncate" title={s.viewerEmailLower}>
                            {s.viewerEmailLower}
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
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Permission chips */}
                          <div className="hidden sm:flex items-center gap-1 mr-1">
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
                          <button
                            onClick={() =>
                              setConfirmRevoke({
                                category: s.category,
                                email: s.viewerEmailLower,
                              })
                            }
                            aria-label="Revoke access"
                            title="Revoke access"
                            className="shrink-0 p-1 rounded text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </li>
                    );
                  })}
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
                        {visibleSharedOwners.length}/
                        {filteredSharedOwners.length}
                      </span>
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto scroll-thin pr-1">
                    <ul className="flex flex-col gap-2">
                      {visibleSharedOwners.map((o, idxOwner) => {
                        const cats = showAllCats[o.ownerUid]
                          ? o.categories
                          : (o.categories || []).slice(0, 12);
                        const remaining =
                          (o.categories || []).length - cats.length;
                        const ownerUid =
                          typeof o.ownerUid === "string"
                            ? o.ownerUid.trim()
                            : "";
                        const ownerKey =
                          ownerUid || `${o.ownerEmail || ""}-${idxOwner}`;
                        return (
                          <li
                            key={ownerKey}
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
                                          o.ownerName ||
                                            o.ownerEmail ||
                                            o.ownerUid
                                        )
                                      }
                                      className="px-2 py-0.5 rounded border capitalize hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                      title={`View ${
                                        o.ownerName ||
                                        o.ownerEmail ||
                                        o.ownerUid
                                      }'s ${c}${
                                        ts ? ` • ${formatDateTime(ts)}` : ""
                                      }`}
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
                                            o.ownerName ||
                                            o.ownerEmail ||
                                            o.ownerUid,
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
                </>
              )}
            </div>
          )}
          {sharedError && (
            <div className="text-red-600 mt-1">{String(sharedError)}</div>
          )}
        </>
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
      {/* Permissions modal */}
      <SharePermissionsModal
        open={permModalOpen}
        defaultPermissions={selectedPerms}
        onCancel={() => setPermModalOpen(false)}
        onConfirm={(perms) => {
          setSelectedPerms(perms && perms.length ? perms : ["read"]);
          setPermModalOpen(false);
        }}
      />
    </div>
  );
}
