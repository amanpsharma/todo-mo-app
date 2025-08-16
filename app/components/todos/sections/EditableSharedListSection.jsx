"use client";

import React, { useCallback } from "react";
import TodoList from "../TodoList";
import { showToast } from "../../../lib/utils";
import { updateTodo } from "../../../lib/api/todos";

export default function EditableSharedListSection({
  sharedTodos,
  visible,
  loading,
  allowEdit,
  allowDelete,
  requireEdit,
  requireDelete,
  onEditClick,
  confirmDeleteId,
  setConfirmDeleteId,
  setSharedTodos,
  getToken,
  removeTodo,
  filter,
}) {
  const categories = Array.from(
    new Set((sharedTodos || []).map((t) => t.category || "general"))
  );

  const handleToggle = useCallback(
    async (id) => {
      if (!requireEdit()) return;
      const t = (sharedTodos || []).find((x) => x.id === id);
      if (!t) return;
      const token = await getToken();
      const prev = sharedTodos;
      // optimistic
      setSharedTodos((curr) =>
        (curr || []).map((x) =>
          x.id === id ? { ...x, completed: !t.completed } : x
        )
      );
      try {
        await updateTodo({ id, completed: !t.completed }, token);
      } catch (e) {
        if (e?.status === 403)
          showToast("You don't have permission to edit in this category.");
        else showToast("Update failed");
        setSharedTodos(prev); // revert
      }
    },
    [requireEdit, sharedTodos, setSharedTodos, getToken]
  );

  return (
    <TodoList
      visible={visible}
      categories={categories}
      loading={loading}
      allowEdit={allowEdit}
      onBlockedEdit={() =>
        showToast("You don't have permission to edit in this category.")
      }
      allowDelete={allowDelete}
      onBlockedDelete={() =>
        showToast("You don't have permission to delete in this category.")
      }
      onEditClick={(todo) => {
        if (!requireEdit()) return;
        onEditClick(todo);
      }}
      confirmDeleteId={confirmDeleteId}
      setConfirmDeleteId={(id) => {
        if (!requireDelete()) return;
        setConfirmDeleteId(id);
      }}
      toggleTodo={handleToggle}
      removeTodo={removeTodo}
      filter={filter}
    />
  );
}
