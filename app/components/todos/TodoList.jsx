"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiCheck, FiEdit2, FiTrash2 } from "react-icons/fi";
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
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
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
      className={`relative inline-flex items-center justify-center rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        ${
          checked
            ? "bg-green-600 border-green-600 text-white hover:bg-green-500"
            : "bg-white/90 dark:bg-neutral-900/70 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        }
      `}
      style={{ width: 22, height: 22 }}
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
        <IconCheck />
      </motion.div>
    </button>
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
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="h-12 rounded border border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-neutral-100/70 to-white/80 dark:from-neutral-800/40 dark:to-neutral-900/60"
              style={{ overflow: "hidden", position: "relative" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent skeleton-loading" />
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
          className="text-sm text-neutral-500 italic p-5 text-center border rounded border-dashed bg-neutral-50/50 dark:bg-neutral-800/30"
        >
          No todos {filter !== "all" ? `for ${filter}` : "yet"}.
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
              className={`relative group flex items-center gap-3 rounded border transition-all duration-200 ease-in-out border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/60 px-3 py-3 my-1 shadow-sm cursor-pointer hover:bg-neutral-50/90 dark:hover:bg-neutral-800/80 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-md ${
                isNew && !prefersReducedMotion
                  ? "ring-2 ring-violet-300/60"
                  : ""
              }`}
            >
              <div className="flex w-full items-center gap-3 transition">
                <div className="shrink-0">
                  <CheckToggle
                    checked={todo.completed}
                    onToggle={() => toggleTodo(todo.id)}
                  />
                </div>
                <div
                  className={`flex-1 min-w-0 flex items-center gap-3 ${
                    todo.completed ? "opacity-90" : ""
                  }`}
                >
                  <motion.p
                    layout
                    transition={{
                      layout: { duration: 0.3, ease: "easeOut" },
                    }}
                    initial={false}
                    animate={{
                      opacity: todo.completed ? 0.75 : 1,
                      transition: { duration: 0.2 },
                    }}
                    className={`select-text flex-1 min-w-0 truncate ${
                      todo.completed
                        ? "line-through text-neutral-400"
                        : "text-neutral-800 dark:text-neutral-100"
                    }`}
                    title={todo.text}
                  >
                    <motion.span
                      className="mr-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                      animate={{
                        opacity: todo.completed ? 0.6 : 1,
                        scale: todo.completed ? 0.95 : 1,
                        transition: { duration: 0.2 },
                      }}
                    >
                      {(todo.category || "general").slice(0, 1).toUpperCase() +
                        (todo.category || "general").slice(1)}
                    </motion.span>
                    {todo.text}
                  </motion.p>
                  <motion.div
                    initial={{ x: 5, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-2 sm:right-3 top-2 sm:top-3 flex items-center gap-1 sm:gap-2 transition-all ${
                      selectedId === todo.id
                        ? "opacity-100"
                        : suppressHoverId === todo.id
                        ? "opacity-100 sm:opacity-0"
                        : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    }`}
                  >
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!allowEdit) {
                          onBlockedEdit?.();
                          return;
                        }
                        onEditClick?.(todo);
                      }}
                      className={`inline-flex items-center justify-center p-1.5 sm:p-2 rounded-full ${
                        allowEdit
                          ? "text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 active:bg-violet-100 dark:active:bg-violet-900/30"
                          : "text-neutral-400 dark:text-neutral-500 cursor-not-allowed opacity-60"
                      }`}
                      title={allowEdit ? "Edit" : "No permission to edit"}
                      aria-disabled={!allowEdit}
                    >
                      <FiEdit2
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                        aria-hidden
                      />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!allowDelete) {
                          onBlockedDelete?.();
                          return;
                        }
                        removeTodo(todo.id); // Assuming removeTodo is passed and handles confirmation
                      }}
                      className={`inline-flex items-center justify-center p-1.5 sm:p-2 rounded-full ${
                        allowDelete
                          ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30"
                          : "text-neutral-400 dark:text-neutral-500 cursor-not-allowed opacity-60"
                      }`}
                      title={allowDelete ? "Delete" : "No permission to delete"}
                      aria-disabled={!allowDelete}
                    >
                      <FiTrash2
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                        aria-hidden
                      />
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
      className="flex flex-col gap-5 max-h-96 overflow-y-auto scroll-thin pr-1"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>{todoList}</AnimatePresence>
    </ul>
  );
}
