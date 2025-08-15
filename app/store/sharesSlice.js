"use client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAuthToken } from "../lib/utils";

const initialState = {
  myShares: [],
  sharedWithMe: [],
  loading: false,
  error: null,
};

export const refreshShares = createAsyncThunk(
  "shares/refresh",
  async ({ uid }, { rejectWithValue }) => {
    try {
      if (!uid) return { myShares: [], sharedWithMe: [] };
      const token = await getAuthToken();
      const [mineRes, swmRes] = await Promise.all([
        fetch(`/api/shares?my=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/shares?sharedWithMe=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!mineRes.ok || !swmRes.ok) throw new Error("Load shares failed");
      const [mine, swm] = await Promise.all([mineRes.json(), swmRes.json()]);
      return { myShares: mine, sharedWithMe: swm };
    } catch (e) {
      return rejectWithValue(String(e.message || e));
    }
  }
);

export const createShareRemote = createAsyncThunk(
  "shares/create",
  async (
    { uid, category, viewerEmail, permissions = ["read"] },
    { dispatch, rejectWithValue }
  ) => {
    try {
      if (!uid) return;
      const token = await getAuthToken();
      const res = await fetch(`/api/shares`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category, viewerEmail, permissions }),
      });
      if (!res.ok) throw new Error("Create share failed");
      await dispatch(refreshShares({ uid }));
    } catch (e) {
      return rejectWithValue(String(e.message || e));
    }
  }
);

export const revokeShareRemote = createAsyncThunk(
  "shares/revoke",
  async ({ uid, category, viewerEmail }, { dispatch, rejectWithValue }) => {
    try {
      if (!uid) return;
      const token = await getAuthToken();
      const res = await fetch(`/api/shares`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category, viewerEmail }),
      });
      if (!res.ok) throw new Error("Revoke share failed");
      await dispatch(refreshShares({ uid }));
    } catch (e) {
      return rejectWithValue(String(e.message || e));
    }
  }
);

export const leaveSharedCategoryRemote = createAsyncThunk(
  "shares/leave",
  async ({ uid, ownerUid, category }, { dispatch, rejectWithValue }) => {
    try {
      if (!uid) return;
      const token = await getAuthToken();
      const res = await fetch(`/api/shares`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ownerUid, category }),
      });
      if (!res.ok) throw new Error("Leave share failed");
      await dispatch(refreshShares({ uid }));
    } catch (e) {
      return rejectWithValue(String(e.message || e));
    }
  }
);

const sharesSlice = createSlice({
  name: "shares",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(refreshShares.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshShares.fulfilled, (state, action) => {
        state.loading = false;
        state.myShares = action.payload.myShares || [];
        state.sharedWithMe = action.payload.sharedWithMe || [];
      })
      .addCase(refreshShares.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || String(action.error?.message || "Error");
      })
      .addMatcher(
        (a) => a.type.startsWith("shares/") && a.type.endsWith("/rejected"),
        (state, action) => {
          state.error =
            action.payload || String(action.error?.message || "Error");
        }
      );
  },
});

export default sharesSlice.reducer;
