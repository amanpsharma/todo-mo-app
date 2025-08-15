"use client";
import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./uiSlice";
import todosReducer from "./todosSlice";
import sharesReducer from "./sharesSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      ui: uiReducer,
      todos: todosReducer,
      shares: sharesReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });

export const store = makeStore();
