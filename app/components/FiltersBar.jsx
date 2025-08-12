"use client";
import React from "react";

export default function FiltersBar({
  filter,
  setFilter,
  stats,
  clearCompleted,
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
      <div className="text-neutral-600 dark:text-neutral-400 flex gap-4">
        <span>{stats.active} active</span>
        <span>{stats.completed} completed</span>
        <button
          onClick={clearCompleted}
          disabled={!stats.completed}
          className="text-red-600 disabled:opacity-30 hover:underline"
        >
          Clear completed
        </button>
      </div>
    </div>
  );
}
