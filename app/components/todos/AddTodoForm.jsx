"use client";
import React from "react";

export default function AddTodoForm({
  input,
  setInput,
  newCategory,
  setNewCategory,
  categories,
  onSubmit,
  categoryDisabled = false,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col sm:flex-row gap-2 flex-wrap"
    >
      <input
        type="text"
        placeholder="What needs to be done?"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full sm:flex-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
      />
      <div className="flex gap-2 w-full sm:w-auto relative z-10">
        <div className="flex-1 sm:flex-none relative">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            disabled={categoryDisabled}
            className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100 cursor-pointer appearance-none bg-no-repeat bg-right pr-8"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 0.5rem center",
              backgroundSize: "1.5em 1.5em",
              position: "relative",
              zIndex: 30,
            }}
          >
            {categories.map((c) => (
              <option
                key={c}
                value={c}
                className="py-2 px-3 text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                style={{
                  backgroundColor: "white",
                  color: "#111827",
                }}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="flex-1 sm:flex-none rounded bg-blue-600 hover:bg-blue-500 text-white px-4 font-medium disabled:opacity-40"
          disabled={!input.trim()}
        >
          Add
        </button>
      </div>
    </form>
  );
}
