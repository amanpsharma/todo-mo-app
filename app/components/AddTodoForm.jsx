"use client";
import React from "react";

export default function AddTodoForm({
  input,
  setInput,
  newCategory,
  setNewCategory,
  categories,
  createCategory,
  setCreateCategory,
  onSubmit,
  onAddNewCategory,
}) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 flex-wrap">
      <input
        type="text"
        placeholder="What needs to be done?"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        className="rounded border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
      >
        {categories.map((c) => (
          <option key={c} value={c}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </option>
        ))}
      </select>
      <div className="flex items-stretch gap-1">
        <input
          type="text"
          placeholder="New category"
          value={createCategory}
          onChange={(e) => setCreateCategory(e.target.value)}
          className="w-32 rounded border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-2 py-2 text-sm focus:ring-2 focus:ring-violet-500"
        />
        <button
          type="button"
          onClick={onAddNewCategory}
          className="rounded bg-violet-600 hover:bg-violet-500 text-white px-3 text-sm disabled:opacity-40"
          disabled={!createCategory.trim()}
        >
          Add
        </button>
      </div>
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
