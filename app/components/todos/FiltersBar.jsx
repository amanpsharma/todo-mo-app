"use client";
import React from "react";
import { FiTrash2 } from "react-icons/fi";

export default function FiltersBar({
  filter,
  setFilter,
  stats,
  clearCompleted,
  onClearCompletedClick,
  readOnly = false,
  filterKeys = ["all", "active", "completed"],
}) {
  return (
    <div className="flex items-center justify-between text-sm flex-wrap gap-2">
      <div className="flex gap-2">
        {filterKeys.map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded border text-xs uppercase tracking-wide font-medium transition-colors ${
              filter === key
                ? "bg-blue-600 text-white border-blue-600"
                : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            }`}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="text-neutral-600 dark:text-neutral-400 flex gap-4 items-center">
        <span>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            {stats.active}
          </span>{" "}
          active
        </span>
        <span>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            {stats.completed}
          </span>{" "}
          completed
        </span>
        <button
          onClick={onClearCompletedClick || clearCompleted}
          disabled={readOnly || !stats.completed}
          title={
            readOnly
              ? "Unavailable in shared view"
              : stats.completed
              ? "Clear all completed todos"
              : "Nothing to clear"
          }
          className="inline-flex items-center gap-2 px-3 py-1 rounded border text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <FiTrash2 className="h-3.5 w-3.5" aria-hidden />
          Clear completed
        </button>
      </div>
    </div>
  );
}
