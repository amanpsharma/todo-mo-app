"use client";
import React from "react";
import { isValidEmail } from "../../lib/utils";

export default function ShareForm({
  categories,
  shareCategory,
  setShareCategory,
  emails,
  setEmails,
  shareEmail,
  setShareEmail,
  emailOpen,
  setEmailOpen,
  emailFiltered,
  emailIndex,
  setEmailIndex,
  emailListId,
  selectedPerms,
  setPermModalOpen,
  shareBusy,
  shareMsg,
  onShare,
  onShareMany,
  rememberEmail,
}) {
  const hasChip = emails.length >= 1;
  const hasManyChips = emails.length > 1;

  const addEmail = (val) => {
    const e = String(val ?? shareEmail)
      .trim()
      .toLowerCase();
    if (!e || !isValidEmail(e)) return;
    setEmails((prev) => (prev.includes(e) ? prev : [...prev, e]));
    setShareEmail("");
    setEmailIndex(0);
    setEmailOpen(false);
  };
  const removeEmail = (val) =>
    setEmails((prev) => prev.filter((x) => x !== val));

  return (
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
              const hasSuggestions = emailOpen && emailFiltered.length > 0;
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
        <span
          className="text-[11px] text-neutral-700 dark:text-neutral-300"
          aria-live="polite"
        >
          {shareMsg}
        </span>
      )}
    </div>
  );
}
