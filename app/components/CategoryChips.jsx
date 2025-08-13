"use client";
import React from "react";

export default function CategoryChips({
  categories,
  categoryFilter,
  setCategoryFilter,
  categoriesWithTodos,
  setConfirmDeleteCategory,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="font-medium text-neutral-700 dark:text-neutral-300">
        Categories:
      </span>
      <button
        onClick={() => setCategoryFilter("all")}
        className={`px-2 py-1 rounded border transition-colors ${
          categoryFilter === "all"
            ? "bg-violet-600 text-white border-violet-600"
            : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
        }`}
      >
        All
      </button>
      {categories.map((c, idx) => {
        const key = (typeof c === "string" ? c.trim() : "") || `cat-${idx}`;
        const label = key || "general";
        const isLast =
          categoriesWithTodos.includes(c) && categoriesWithTodos.length <= 1;
        const disabled = isLast;
        const title = isLast
          ? `Cannot delete the last remaining category (${label})`
          : `Delete ${label} (and its todos)`;
        const isSelected = categoryFilter === c;
        return (
          <div
            key={key}
            className={`relative group inline-block rounded ${
              categoryFilter === c ? "bg-violet-50 dark:bg-violet-900/20" : ""
            }`}
          >
            <button
              onClick={() => setCategoryFilter(c)}
              className={`px-2 py-1 pr-6 rounded border capitalize transition-colors ${
                categoryFilter === c
                  ? "bg-violet-600 text-white border-violet-600"
                  : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
              }`}
              title={`Filter by ${label}`}
            >
              {label}
            </button>
            <button
              onClick={() => {
                if (disabled) return;
                setConfirmDeleteCategory(c);
              }}
              aria-label={`Delete ${label} category`}
              className={`absolute -top-1 -right-1 size-4 rounded-full leading-none flex items-center justify-center text-[10px] shadow ${
                isSelected
                  ? "opacity-100"
                  : "opacity-0 sm:opacity-0 sm:group-hover:opacity-100"
              } focus:opacity-100 transition ${
                disabled
                  ? "bg-neutral-300 text-neutral-700 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-500"
              }`}
              title={title}
              disabled={disabled}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
