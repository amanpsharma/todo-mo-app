"use client";
import React from "react";

export default function AddTodoForm({
  input,
  setInput,
  newCategory,
  setNewCategory,
  categories,
  onSubmit,
  onOpenAddCategoryModal,
  categoryDisabled = false,
  addCategoryDisabled = false,
}) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 flex-wrap">
      <input
        type="text"
        placeholder="What needs to be done?"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
      />
      <select
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        disabled={categoryDisabled}
        className="rounded border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
      >
        {categories.map((c) => (
          <option key={c} value={c}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onOpenAddCategoryModal}
        disabled={addCategoryDisabled}
        className="rounded bg-violet-600 hover:bg-violet-500 text-white px-3 text-sm"
        title={
          addCategoryDisabled
            ? "Cannot add category in shared view"
            : "Add a new category"
        }
      >
        Add category
      </button>
      <button
        type="submit"
        className="rounded bg-blue-600 hover:bg-blue-500 text-white px-4 font-medium disabled:opacity-40"
        disabled={!input.trim()}
      >
        Add
      </button>
    </form>
  );
}
