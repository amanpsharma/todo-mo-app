"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiCheck, FiEdit2, FiTrash2 } from "react-icons/fi";

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
          checked ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 500, damping: 35 }
        }
      >
        <IconCheck />
      </motion.div>
    </button>
  );
}

export default function TodoList({
  visible,
  categories,
  loading = false,
  // editing props are no longer used inline; modal will handle editing
  confirmDeleteId,
  setConfirmDeleteId,
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

  // Dismiss selection on outside click
  useEffect(() => {
    const onDocDown = (e) => {
      const t = e.target;
      if (!listRef.current) return;
      if (!listRef.current.contains(t)) setSelectedId(null);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  // Track the first visible todo for highlighting
  const firstVisibleIdRef = useRef(null);
  
  // Effect to handle temporary highlight for new items
  useEffect(() => {
    if (visible.length > 0 && !prefersReducedMotion) {
      const firstItem = visible[0];
      const itemId = firstItem?.id || firstItem?._id;
      
      // Only apply highlight if this is a new item we haven't seen before
      if (itemId && firstVisibleIdRef.current !== itemId) {
        firstVisibleIdRef.current = itemId;
        
        // Mark the item as new
        setNewItemsMap(prev => ({ ...prev, [itemId]: true }));
        
        console.log(`Highlight added for item: ${itemId}`);
        
        // Set a timer to remove the highlight after 3 seconds
        const timer = setTimeout(() => {
          console.log(`Removing highlight for item: ${itemId}`);
          setNewItemsMap(prev => ({ ...prev, [itemId]: false }));
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [visible, prefersReducedMotion]);
  const listVariants = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { staggerChildren: 0.04 } },
        exit: { opacity: 0 },
      };
  const itemVariants = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: -8, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 8, scale: 0.98 },
        transition: { type: "spring", stiffness: 260, damping: 24 },
      };

  const skeletonRows = useMemo(() => Array.from({ length: 4 }), []);
  return (
    <ul
      ref={listRef}
      className="flex flex-col gap-5 max-h-96 overflow-y-auto scroll-thin pr-1"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {loading && (
          <li key="loading" className="flex flex-col gap-4 w-full">
            {skeletonRows.map((_, i) => (
              <div
                key={i}
                className="h-10 rounded border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 animate-pulse"
              />
            ))}
          </li>
        )}
        {visible.length === 0 && (
          <motion.li
            key="empty"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="text-sm text-neutral-500 italic p-4 text-center border rounded border-dashed"
          >
            No todos {filter !== "all" ? `for ${filter}` : "yet"}.
          </motion.li>
        )}
        <motion.div
          key="list"
          variants={listVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {visible.map((todo, idx) => {
            const isEditing = false; // inline editing removed; using modal instead
            // Inline confirm UI removed: use main ConfirmModal only
            const id1 = typeof todo.id === "string" ? todo.id.trim() : "";
            const id2 = typeof todo._id === "string" ? todo._id.trim() : "";
            const todoId = id1 || id2;
            // Explicit check for true to ensure we only highlight when specifically marked
            const isNew = newItemsMap[todoId] === true;
            const itemKey =
              todoId ||
              `${todo.category || "general"}-${todo.text || "na"}-$$${
                todo.createdAt ?? "na"
              }-${idx}`;
            return (
              <motion.li
                layout
                variants={itemVariants}
                key={itemKey}
                onClick={() => {
                  if (selectedId === todo.id) {
                    // Clicking again hides actions for this row and suppresses hover reveal on desktop
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
                className={`relative group flex items-center gap-3 rounded border transition-colors duration-150 border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/60 px-3 py-3 my-1 shadow-sm cursor-pointer hover:bg-neutral-50/70 dark:hover:bg-neutral-800/60 ${
                  isNew && !prefersReducedMotion
                    ? "ring-2 ring-violet-300/60"
                    : ""
                }`}
              >
                <div className={`flex w-full items-center gap-3 transition`}>
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
                    {!isEditing && (
                      <motion.p
                        layout
                        className={`select-text flex-1 min-w-0 truncate ${
                          todo.completed
                            ? "line-through text-neutral-400"
                            : "text-neutral-800 dark:text-neutral-100"
                        }`}
                        title={todo.text}
                      >
                        <span className="mr-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                          {(todo.category || "general")
                            .slice(0, 1)
                            .toUpperCase() +
                            (todo.category || "general").slice(1)}
                        </span>
                        {todo.text}
                      </motion.p>
                    )}
                    {/* editing handled by modal */}
                    {(() => {
                      const actionsVisibilityClass =
                        isEditing || selectedId === todo.id
                          ? "opacity-100"
                          : suppressHoverId === todo.id
                          ? "opacity-100 sm:opacity-0"
                          : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100";
                      return (
                        <div
                          className={`absolute right-2 sm:right-3 top-2 sm:top-3 flex items-center gap-1 sm:gap-2 transition-opacity ${actionsVisibilityClass}`}
                        >
                          {
                            <motion.button
                              whileTap={{ scale: 0.92 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!allowEdit) {
                                  onBlockedEdit?.();
                                  return;
                                }
                                if (onEditClick) onEditClick(todo);
                                else if (typeof startEdit === "function")
                                  startEdit(todo);
                              }}
                              className={`inline-flex items-center justify-center p-1.5 sm:p-2 rounded-full ${
                                allowEdit
                                  ? "text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 active:bg-violet-100 dark:active:bg-violet-900/30"
                                  : "text-neutral-400 dark:text-neutral-500 cursor-not-allowed opacity-60"
                              }`}
                              title={
                                allowEdit ? "Edit" : "No permission to edit"
                              }
                              aria-disabled={!allowEdit}
                            >
                              <FiEdit2
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                aria-hidden
                              />
                            </motion.button>
                          }
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!allowDelete) {
                                onBlockedDelete?.();
                                return;
                              }
                              setConfirmDeleteId(todo.id);
                            }}
                            className={`inline-flex items-center justify-center p-1.5 sm:p-2 rounded-full ${
                              allowDelete
                                ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30"
                                : "text-neutral-400 dark:text-neutral-500 cursor-not-allowed opacity-60"
                            }`}
                            title={
                              allowDelete ? "Delete" : "No permission to delete"
                            }
                            aria-disabled={!allowDelete}
                          >
                            <FiTrash2
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                              aria-hidden
                            />
                          </motion.button>
                        </div>
                      );
                    })()}
                  </div>
                  {/* Time is now shown inline with the text */}
                </div>
              </motion.li>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </ul>
  );
}
