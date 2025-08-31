"use client";
import React from "react";
import { FiTag, FiPlus, FiX, FiGlobe } from "react-icons/fi";

export default function CategoryChips({
  categories,
  categoryFilter,
  setCategoryFilter,
  categoriesWithTodos,
  setConfirmDeleteCategory,
  onOpenAddCategoryModal,
}) {
  return (
    <div className="relative md:p-4 p-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white/80 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm">
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
          <FiTag className="h-3.5 w-3.5" />
          <h3 className="font-semibold">Categories</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <button
            onClick={onOpenAddCategoryModal}
            className="px-1 py-0.5 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 active:scale-[.98] inline-flex items-center justify-center gap-1.5 font-medium text-xs whitespace-nowrap shadow-sm"
            title="Add a new category"
          >
            <FiPlus className="h-3.5 w-3.5" />
            <span>New Category</span>
          </button>

          <button
            onClick={() => setCategoryFilter("all")}
            aria-pressed={categoryFilter === "all"}
            title="Show all categories"
            className={`px-1 py-0.5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 active:scale-[.98] inline-flex items-center justify-center gap-1.5 font-medium text-xs whitespace-nowrap shadow-sm ${
              categoryFilter === "all"
                ? "bg-violet-600 text-white"
                : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <FiGlobe className="h-3 w-3" />
            <span>All</span>
          </button>

          {categories.map((c, idx) => {
            const key = (typeof c === "string" ? c.trim() : "") || `cat-${idx}`;
            const label = key || "general";
            const isLast =
              categoriesWithTodos.includes(c) &&
              categoriesWithTodos.length <= 1;
            const disabled = isLast;
            const title = isLast
              ? `Cannot delete the last remaining category (${label})`
              : `Filter by ${label}`;
            const isSelected = categoryFilter === c;

            return (
              <div key={key} className="relative group inline-block min-w-0">
                <button
                  onClick={() => setCategoryFilter(c)}
                  aria-pressed={isSelected}
                  className={`px-1 py-0.5 rounded-lg capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 active:scale-[.98] inline-flex items-center justify-center font-medium text-xs whitespace-nowrap shadow-sm ${
                    isSelected
                      ? "bg-violet-600 text-white"
                      : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  }`}
                  title={title}
                >
                  <span className="truncate max-w-[120px] sm:max-w-[150px] px-1">
                    {label}
                  </span>
                </button>

                {!disabled && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      if (disabled) return;
                      setConfirmDeleteCategory(c);
                    }}
                    role="button"
                    aria-label={`Delete ${label} category`}
                    className={`absolute -top-1.5 -right-1.5 size-5 rounded-full flex items-center justify-center bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 shadow-sm z-10 
                      sm:opacity-0 sm:group-hover:opacity-100 opacity-100 focus:opacity-100 transition-all
                      ${isSelected ? "opacity-100" : ""}
                      ${
                        disabled
                          ? "cursor-not-allowed"
                          : "hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:scale-110 active:scale-95"
                      }`}
                    title={`Delete ${label} category`}
                  >
                    <FiX className="h-3 w-3" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
