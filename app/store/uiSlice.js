"use client";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filter: "all", // all | active | completed
  categoryFilter: "all",
  // Editing state
  editingId: null,
  editingText: "",
  editingCategory: "general",
  // Confirmation modals
  confirmDeleteId: null,
  confirmDeleteCategory: null,
  confirmClearOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload || "all";
    },
    setCategoryFilter(state, action) {
      state.categoryFilter = action.payload || "all";
    },
    resetFilters(state) {
      state.filter = "all";
      state.categoryFilter = "all";
    },
    // Editing reducers
    startEdit(state, action) {
      const { id, text, category } = action.payload || {};
      state.editingId = id ?? null;
      state.editingText = text ?? "";
      state.editingCategory = category ?? "general";
    },
    setEditingText(state, action) {
      state.editingText = action.payload ?? "";
    },
    setEditingCategory(state, action) {
      state.editingCategory = action.payload || "general";
    },
    cancelEdit(state) {
      state.editingId = null;
      state.editingText = "";
    },
    // Confirm modals
    openConfirmDelete(state, action) {
      state.confirmDeleteId = action.payload ?? null;
    },
    closeConfirmDelete(state) {
      state.confirmDeleteId = null;
    },
    setConfirmDeleteCategory(state, action) {
      state.confirmDeleteCategory = action.payload ?? null;
    },
    openConfirmClear(state) {
      state.confirmClearOpen = true;
    },
    closeConfirmClear(state) {
      state.confirmClearOpen = false;
    },
  },
});

export const {
  setFilter,
  setCategoryFilter,
  resetFilters,
  startEdit,
  setEditingText,
  setEditingCategory,
  cancelEdit,
  openConfirmDelete,
  closeConfirmDelete,
  setConfirmDeleteCategory,
  openConfirmClear,
  closeConfirmClear,
} = uiSlice.actions;
export default uiSlice.reducer;
