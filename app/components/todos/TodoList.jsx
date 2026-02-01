"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiCheck, FiCopy, FiEdit2, FiTrash2 } from "react-icons/fi";
import "./todoList.css";
import {
  listVariants,
  itemVariants,
  emptyStateVariants,
  checkToggleAnimation,
} from "./todoListAnimations";

function IconCheck({ className = "" }) {
  return <FiCheck className={`w-3.5 h-3.5 ${className}`} aria-hidden />;
}

function CheckToggle({ checked, onToggle }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`check-toggle relative inline-flex items-center justify-center rounded-lg border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500
        ${
          checked
            ? "bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/30"
            : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md"
        }
      `}
      style={{ width: 24, height: 24 }}
      aria-label={checked ? "Mark as not completed" : "Mark as completed"}
    >
      <motion.div
        initial={false}
        animate={
          checked
            ? checkToggleAnimation.checked
            : checkToggleAnimation.unchecked
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : checkToggleAnimation.transition
        }
      >
        <IconCheck className={checked ? "drop-shadow-sm" : ""} />
      </motion.div>
    </motion.button>
  );
}

// CSS moved to external file: todoList.css
// Animation variants moved to external file: todoListAnimations.js

export default function TodoList({
  visible,
  categories,
  loading = false,
  toggleTodo,
  removeTodo,
  filter,
  allowEdit = true,
  onBlockedEdit,
  allowDelete = true,
  onBlockedDelete,
  onEditClick,
}) {
  const prefersReducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState(null);
  const [suppressHoverId, setSuppressHoverId] = useState(null);
  const [newItemsMap, setNewItemsMap] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (todo) => {
    try {
      await navigator.clipboard.writeText(todo.text);
      setCopiedId(todo.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  const listRef = useRef(null);
  const firstVisibleIdRef = useRef(null);

  // Dismiss selection on outside click
  useEffect(() => {
    const onDocDown = (e) => {
      if (!listRef.current || listRef.current.contains(e.target)) return;
      setSelectedId(null);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  // Optimize new item highlight: use a Map for better performance and avoid unnecessary state updates
  useEffect(() => {
    if (visible.length === 0 || prefersReducedMotion) return;
    const firstItem = visible[0];
    const itemId = firstItem?.id || firstItem?._id;
    if (!itemId || firstVisibleIdRef.current === itemId) return;

    firstVisibleIdRef.current = itemId;
    setNewItemsMap((prev) => ({ ...prev, [itemId]: true }));

    const timer = setTimeout(() => {
      setNewItemsMap((prev) => ({ ...prev, [itemId]: false }));
    }, 3000);

    return () => clearTimeout(timer);
  }, [visible, prefersReducedMotion]);

  const skeletonRows = useMemo(() => Array.from({ length: 4 }), []);

  // Memoize the list to prevent unnecessary re-renders
  const todoList = useMemo(() => {
    if (loading) {
      return (
        <motion.li
          key="loading"
          className="flex flex-col gap-4 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {skeletonRows.map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="h-14 rounded-xl border border-neutral-200/60 dark:border-neutral-700/40 bg-gradient-to-r from-neutral-50 via-white to-neutral-50 dark:from-neutral-800/50 dark:via-neutral-900/50 dark:to-neutral-800/50"
              style={{ overflow: "hidden", position: "relative" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 dark:via-white/5 to-transparent skeleton-loading" />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-4">
                <div className="w-6 h-6 rounded-lg bg-neutral-200/80 dark:bg-neutral-700/50" />
                <div className="flex flex-col gap-1.5">
                  <div className="w-16 h-3 rounded-full bg-neutral-200/80 dark:bg-neutral-700/50" />
                  <div className="w-32 h-3 rounded-full bg-neutral-200/60 dark:bg-neutral-700/30" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.li>
      );
    }

    if (visible.length === 0) {
      return (
        <motion.li
          key="empty"
          initial={prefersReducedMotion ? false : emptyStateVariants.initial}
          animate={prefersReducedMotion ? {} : emptyStateVariants.animate}
          exit={prefersReducedMotion ? {} : emptyStateVariants.exit}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="empty-state flex flex-col items-center justify-center gap-3 p-8 text-center rounded-xl"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-violet-400 dark:text-violet-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <p className="text-base font-medium text-neutral-600 dark:text-neutral-300">
              {filter !== "all" ? `No ${filter} todos` : "No todos yet"}
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
              {filter !== "all"
                ? "Try a different filter"
                : "Add your first task to get started"}
            </p>
          </div>
        </motion.li>
      );
    }

    return (
      <motion.div
        key="list"
        variants={prefersReducedMotion ? {} : listVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {visible.map((todo, idx) => {
          const id1 = typeof todo.id === "string" ? todo.id.trim() : "";
          const id2 = typeof todo._id === "string" ? todo._id.trim() : "";
          const todoId = id1 || id2;
          const isNew = newItemsMap[todoId] === true;
          const itemKey =
            todoId ||
            `${todo.category || "general"}-${todo.text || "na"}-${
              todo.createdAt ?? "na"
            }-${idx}`;

          return (
            <motion.li
              layout
              variants={prefersReducedMotion ? {} : itemVariants}
              key={itemKey}
              onClick={() => {
                if (selectedId === todo.id) {
                  setSelectedId(null);
                  setSuppressHoverId(todo.id);
                } else {
                  setSelectedId(todo.id);
                  setSuppressHoverId(null);
                }
              }}
              onMouseLeave={() => {
                if (suppressHoverId === todo.id) setSuppressHoverId(null);
              }}
              className={`todo-item relative group flex items-center gap-4 rounded-xl border transition-all duration-300 ease-out
                ${
                  todo.completed
                    ? "todo-completed border-emerald-200/50 dark:border-emerald-800/30 bg-white/60 dark:bg-neutral-900/40"
                    : "border-neutral-200/80 dark:border-neutral-700/60 bg-white/80 dark:bg-neutral-900/70"
                }
                px-4 py-3.5 my-2 shadow-sm cursor-pointer
                hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50
                hover:border-violet-300/60 dark:hover:border-violet-600/40
                hover:-translate-y-0.5
                ${isNew && !prefersReducedMotion ? "todo-new ring-2 ring-violet-400/50 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900" : ""}
                ${selectedId === todo.id ? "ring-2 ring-violet-500/40 border-violet-400 dark:border-violet-500" : ""}
              `}
            >
              <div className="todo-priority-indicator" />
              <div className="flex w-full items-center gap-4 transition">
                <div className="shrink-0">
                  <CheckToggle
                    checked={todo.completed}
                    onToggle={() => toggleTodo(todo.id)}
                  />
                </div>
                <div
                  className={`flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 ${
                    todo.completed ? "opacity-80" : ""
                  }`}
                >
                  <motion.div
                    layout
                    transition={{
                      layout: { duration: 0.3, ease: "easeOut" },
                    }}
                    initial={false}
                    animate={{
                      opacity: todo.completed ? 0.7 : 1,
                      transition: { duration: 0.2 },
                    }}
                    className="flex-1 min-w-0 flex items-center gap-2 pr-28 sm:pr-36"
                  >
                    <motion.span
                      className="category-badge shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-indigo-700 dark:text-indigo-300 uppercase"
                      animate={{
                        opacity: todo.completed ? 0.5 : 1,
                        scale: todo.completed ? 0.95 : 1,
                        transition: { duration: 0.2 },
                      }}
                    >
                      {todo.category || "general"}
                    </motion.span>
                    <span
                      className={`select-text text-[15px] truncate ${
                        todo.completed
                          ? "line-through decoration-2 decoration-neutral-300 dark:decoration-neutral-600 text-neutral-400 dark:text-neutral-500"
                          : "text-neutral-800 dark:text-neutral-100 font-medium"
                      }`}
                      title={todo.text}
                    >
                      {todo.text}
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ x: 8, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`action-buttons absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 sm:gap-1 pl-6 transition-all duration-200 ${
                      selectedId === todo.id
                        ? "opacity-100"
                        : suppressHoverId === todo.id
                          ? "opacity-100 sm:opacity-0"
                          : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    }`}
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(todo);
                      }}
                      className={`inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg transition-all duration-200 ${
                        copiedId === todo.id
                          ? "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30"
                          : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200"
                      }`}
                      title={copiedId === todo.id ? "Copied!" : "Copy todo"}
                    >
                      {copiedId === todo.id ? (
                        <FiCheck className="w-4 h-4" aria-hidden />
                      ) : (
                        <FiCopy className="w-4 h-4" aria-hidden />
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!allowEdit) {
                          onBlockedEdit?.();
                          return;
                        }
                        onEditClick?.(todo);
                      }}
                      className={`inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg transition-all duration-200 ${
                        allowEdit
                          ? "text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:shadow-md"
                          : "text-neutral-400 dark:text-neutral-500 cursor-not-allowed opacity-50"
                      }`}
                      title={allowEdit ? "Edit" : "No permission to edit"}
                      aria-disabled={!allowEdit}
                    >
                      <FiEdit2 className="w-4 h-4" aria-hidden />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!allowDelete) {
                          onBlockedDelete?.();
                          return;
                        }
                        removeTodo(todo.id);
                      }}
                      className={`inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg transition-all duration-200 ${
                        allowDelete
                          ? "text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:shadow-md"
                          : "text-neutral-400 dark:text-neutral-500 cursor-not-allowed opacity-50"
                      }`}
                      title={allowDelete ? "Delete" : "No permission to delete"}
                      aria-disabled={!allowDelete}
                    >
                      <FiTrash2 className="w-4 h-4" aria-hidden />
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.li>
          );
        })}
      </motion.div>
    );
  }, [
    loading,
    visible,
    selectedId,
    suppressHoverId,
    newItemsMap,
    copiedId,
    prefersReducedMotion,
    skeletonRows,
    filter,
    allowEdit,
    allowDelete,
    onBlockedEdit,
    onBlockedDelete,
    onEditClick,
    toggleTodo,
    removeTodo,
  ]);

  return (
    <ul
      ref={listRef}
      className="flex flex-col gap-1 max-h-[480px] overflow-y-auto scroll-thin pr-2 py-1"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>{todoList}</AnimatePresence>
    </ul>
  );
}
