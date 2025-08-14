"use client";
import React from "react";

export default function SharesHeader({
  showSharePanel,
  setShowSharePanel,
  sharedView,
  setSharedView,
  sharedPerms,
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          Share category
        </h3>
        {sharedView &&
          (() => {
            const perms = Array.isArray(sharedPerms) ? sharedPerms : ["read"];
            const has = (p) => perms.includes(p);
            const parts = [];
            if (has("write")) parts.push("Write");
            if (has("edit")) parts.push("Edit");
            if (has("delete")) parts.push("Delete");
            const label = parts.length ? parts.join("/") : "Read";
            const color = has("edit")
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : has("write")
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";
            return (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700 ${color}`}
                title={`Permissions: ${label}`}
                aria-label={`Permissions: ${label}`}
              >
                {label}
              </span>
            );
          })()}
      </div>
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
  );
}
