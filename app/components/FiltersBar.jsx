"use client";
import React from "react";

export default function FiltersBar({
  filter,
  setFilter,
  stats,
  clearCompleted,
  onClearCompletedClick,
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
          disabled={!stats.completed}
          title={
            stats.completed ? "Clear all completed todos" : "Nothing to clear"
          }
          className="inline-flex items-center gap-2 px-3 py-1 rounded border text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
          Clear completed
        </button>
      </div>
    </div>
  );
}
