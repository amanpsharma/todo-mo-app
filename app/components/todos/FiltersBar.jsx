"use client";
import React from "react";
import { FiTrash2, FiCheckCircle, FiCircle, FiList } from "react-icons/fi";

export default function FiltersBar({
  filter,
  setFilter,
  stats,
  clearCompleted,
  onClearCompletedClick,
  readOnly = false,
}) {
  const filterOptions = [
    {
      key: "all",
      label: "All",
      icon: FiList,
      count: stats.total,
      activeClasses:
        "bg-blue-500 text-white shadow-md shadow-blue-500/25 scale-105",
      inactiveClasses:
        "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-sm",
    },
    {
      key: "active",
      label: "Active",
      icon: FiCircle,
      count: stats.active,
      activeClasses:
        "bg-green-500 text-white shadow-md shadow-green-500/25 scale-105",
      inactiveClasses:
        "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-sm",
    },
    {
      key: "completed",
      label: "Completed",
      icon: FiCheckCircle,
      count: stats.completed,
      activeClasses:
        "bg-purple-500 text-white shadow-md shadow-purple-500/25 scale-105",
      inactiveClasses:
        "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-sm",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-6 sm:gap-4 justify-center sm:justify-start">
        {filterOptions.map((option) => {
          const Icon = option.icon;
          const isActive = filter === option.key;
          return (
            <button
              key={option.key}
              onClick={() => setFilter(option.key)}
              title={`Show ${option.label.toLowerCase()} todos (${
                option.count
              } items)`}
              className={`group relative flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs font-medium transition-all duration-200 min-w-[60px] sm:min-w-0 ${
                isActive ? option.activeClasses : option.inactiveClasses
              }`}
            >
              <Icon
                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300"
                }`}
              />
              <span className="text-[10px] sm:text-xs">{option.label}</span>
              <span
                className={`px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                }`}
              >
                {option.count}
              </span>
              {isActive && (
                <div className="absolute inset-0 rounded-md bg-white/10 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Stats and Clear Button */}
      <div className="flex items-center justify-center sm:justify-end gap-3">
        {/* Mobile Stats */}
        <div className="flex sm:hidden items-center gap-3 text-xs">
          <div
            className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400"
            title={`${stats.active} active todos remaining to complete`}
          >
            <FiCircle className="h-3 w-3 text-green-500" />
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {stats.active}
            </span>
          </div>
          <div
            className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400"
            title={`${stats.completed} completed todos`}
          >
            <FiCheckCircle className="h-3 w-3 text-purple-500" />
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {stats.completed}
            </span>
          </div>
        </div>

        {/* Desktop Stats */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          <div
            className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400"
            title={`${stats.active} active todos remaining to complete`}
          >
            <FiCircle className="h-3 w-3 text-green-500" />
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {stats.active}
            </span>
          </div>
          <div
            className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400"
            title={`${stats.completed} completed todos`}
          >
            <FiCheckCircle className="h-3 w-3 text-purple-500" />
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {stats.completed}
            </span>
          </div>
        </div>

        {/* Clear Button */}
        <button
          onClick={onClearCompletedClick || clearCompleted}
          disabled={readOnly || !stats.completed}
          title={
            readOnly
              ? "Clear completed todos (unavailable in shared view)"
              : stats.completed
              ? `Clear all ${stats.completed} completed todos (this action cannot be undone)`
              : "No completed todos to clear"
          }
          className={`group flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
            readOnly || !stats.completed
              ? "opacity-40 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
              : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/50 hover:border-red-300 dark:hover:border-red-700 hover:shadow-sm"
          }`}
        >
          <FiTrash2 className="h-3 w-3 transition-transform group-hover:scale-110" />
          <span className="text-[10px] sm:text-xs">Clear</span>
        </button>
      </div>
    </div>
  );
}
