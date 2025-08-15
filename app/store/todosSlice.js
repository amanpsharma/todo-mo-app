"use client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAuthToken } from "../lib/utils";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchTodos = createAsyncThunk(
  "todos/fetch",
  async ({ uid }, { rejectWithValue }) => {
    try {
      if (!uid) return [];
      const token = await getAuthToken();
      const res = await fetch("/api/todos", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
      return await res.json();
    } catch (e) {
      return rejectWithValue(String(e.message || e));
    }
  }
);

export const addTodoRemote = createAsyncThunk(
  "todos/add",
  async (
    { uid, text, category = "general" },
    { dispatch, rejectWithValue }
  ) => {
    try {
      if (!uid || !text?.trim()) return;
      const token = await getAuthToken();
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: text.trim(), category }),
      });
      if (!res.ok) throw new Error("Create failed");
      await dispatch(fetchTodos({ uid }));
    } catch (e) {
      return rejectWithValue(String(e.message || e));
    }
  }
);

export const toggleTodoRemote = createAsyncThunk(
  "todos/toggle",
  async ({ uid, id, completed }, { dispatch, rejectWithValue }) => {
    try {
      if (!uid || !id) return;
      const token = await getAuthToken();
      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, completed }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      await dispatch(fetchTodos({ uid }));
    } catch (e) {
      return rejectWithValue(String(e.message || e));
    }
  }
);

export const removeTodoRemote = createAsyncThunk(
  "todos/remove",
  async ({ uid, id }, { dispatch, rejectWithValue }) => {
    try {
      if (!uid || !id) return;
      const token = await getAuthToken();
      const res = await fetch(`/api/todos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      await dispatch(fetchTodos({ uid }));
    } catch (e) {
      return rejectWithValue(String(e.message || e));
    }
  }
);

export const clearCompletedRemote = createAsyncThunk(
  "todos/clearCompleted",
  async ({ uid }, { dispatch, rejectWithValue }) => {
    try {
      if (!uid) return;
      const token = await getAuthToken();
      const res = await fetch(`/api/todos?clearCompleted=1`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Clear completed failed");
      await dispatch(fetchTodos({ uid }));
    } catch (e) {
      return rejectWithValue(String(e.message || e));
    }
  }
);

export const editTodoRemote = createAsyncThunk(
  "todos/edit",
  async ({ uid, id, text, category }, { dispatch, rejectWithValue }) => {
    try {
      if (!uid || !id || !text?.trim()) return;
      const token = await getAuthToken();
      const body = { id, text: text.trim() };
      if (category) body.category = category;
      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Edit failed");
      await dispatch(fetchTodos({ uid }));
    } catch (e) {
      return rejectWithValue(String(e.message || e));
    }
  }
);

export const removeCategoryRemote = createAsyncThunk(
  "todos/removeCategory",
  async ({ uid, category }, { dispatch, rejectWithValue }) => {
    try {
      if (!uid || !category) return;
      const token = await getAuthToken();
      const res = await fetch(
        `/api/todos?category=${encodeURIComponent(category)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Delete category failed");
      await dispatch(fetchTodos({ uid }));
    } catch (e) {
      return rejectWithValue(String(e.message || e));
    }
  }
);

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    reorderLocally(state, action) {
      state.items = action.payload || [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || String(action.error?.message || "Error");
      })
      .addMatcher(
        (a) => a.type.startsWith("todos/") && a.type.endsWith("/rejected"),
        (state, action) => {
          state.error =
            action.payload || String(action.error?.message || "Error");
        }
      );
  },
});

export const { reorderLocally } = todosSlice.actions;
export default todosSlice.reducer;
