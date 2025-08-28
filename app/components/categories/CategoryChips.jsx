"use client";
import React from "react";
import Image from "next/image";

export default function CategoryChips({
  categories,
  categoryFilter,
  setCategoryFilter,
  categoriesWithTodos,
  setConfirmDeleteCategory,
  onOpenAddCategoryModal,
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
      <span className="font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
        Categories:
      </span>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
        <button
          onClick={onOpenAddCategoryModal}
          className="px-2 py-1 sm:px-2 sm:py-1 rounded-full border border-violet-600 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 active:scale-[.98] inline-flex items-center justify-center gap-1 leading-none whitespace-nowrap min-h-[1.75rem] sm:min-h-0"
          title="Add a new category"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80 block shrink-0"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="leading-none font-medium text-xs text-center">
            Add
          </span>
        </button>
        <button
          onClick={() => setCategoryFilter("all")}
          aria-pressed={categoryFilter === "all"}
          title="Show all categories"
          className={`px-2 py-1 sm:px-2 sm:py-1 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 active:scale-[.98] inline-flex items-center justify-center gap-1 leading-none whitespace-nowrap min-h-[1.75rem] sm:min-h-0 ${
            categoryFilter === "all"
              ? "bg-violet-600 text-white border-violet-600"
              : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
          }`}
        >
          <Image
            src="/globe.svg"
            alt=""
            width={10}
            height={10}
            aria-hidden="true"
            className="opacity-80 block shrink-0"
          />
          <span className="leading-none text-xs text-center">All</span>
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
              className={`relative group inline-block rounded-full min-w-0 ${
                categoryFilter === c ? "bg-violet-50 dark:bg-violet-900/20" : ""
              }`}
            >
              <button
                onClick={() => setCategoryFilter(c)}
                aria-pressed={isSelected}
                className={`pl-3 pr-6 py-1 sm:pl-3 sm:pr-6 sm:py-1 rounded-full border capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 active:scale-[.98] min-h-[1.75rem] sm:min-h-0 flex items-center justify-center ${
                  categoryFilter === c
                    ? "bg-violet-600 text-white border-violet-600"
                    : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                }`}
                title={`Filter by ${label}`}
              >
                <span className="leading-none text-xs text-center truncate max-w-[100px] sm:max-w-none w-full block">
                  {label}
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (disabled) return;
                  setConfirmDeleteCategory(c);
                }}
                aria-label={`Delete ${label} category`}
                className={`absolute -top-0.5 -right-0.5 size-3.5 sm:size-3 rounded-full leading-none flex items-center justify-center text-[9px] sm:text-[8px] shadow-sm ${
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
    </div>
  );
}
