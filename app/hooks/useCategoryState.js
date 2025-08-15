"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_CATEGORIES, sanitizeCategoryName } from "../lib/utils";

// Manages categories (base + custom), persistence, and newCategory selection
export default function useCategoryState(todos = []) {
  const baseCategories = useMemo(() => DEFAULT_CATEGORIES, []);

  const [customCategories, setCustomCategories] = useState([]);

  // Load custom categories from localStorage
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined" &&
        localStorage.getItem("customCategories");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCustomCategories(parsed.filter(Boolean));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist custom categories
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "customCategories",
          JSON.stringify(customCategories)
        );
      }
    } catch {}
  }, [customCategories]);

  // Categories that appear in todos
  const categoriesFromTodos = useMemo(() => {
    const set = new Set(
      (todos || []).map((t) => {
        const cleaned = sanitizeCategoryName(t.category || "general");
        return cleaned || "general";
      })
    );
    return Array.from(set);
  }, [todos]);

  // Remember categories discovered from todos
  useEffect(() => {
    if (!categoriesFromTodos.length) return;
    setCustomCategories((prev) => {
      const next = new Set(prev);
      for (const c of categoriesFromTodos) {
        if (!baseCategories.includes(c)) next.add(c);
      }
      return Array.from(next);
    });
  }, [categoriesFromTodos, baseCategories]);

  // Full categories list
  const categories = useMemo(() => {
    const set = new Set([
      ...baseCategories,
      ...categoriesFromTodos,
      ...customCategories,
    ]);
    return Array.from(set);
  }, [baseCategories, categoriesFromTodos, customCategories]);

  // Currently selected category in Add form
  const [newCategory, setNewCategory] = useState("general");
  useEffect(() => {
    if (!categories.includes(newCategory) && categories.length) {
      setNewCategory(categories[0]);
    }
  }, [categories, newCategory]);

  // Categories that actually have todos
  const categoriesWithTodos = useMemo(() => {
    const set = new Set(
      (todos || []).map((t) => {
        const cleaned = sanitizeCategoryName(t.category || "general");
        return cleaned || "general";
      })
    );
    return Array.from(set);
  }, [todos]);

  // Adds a new custom category, returns the sanitized category name (or null)
  const handleAddNewCategory = (name) => {
    const cat = sanitizeCategoryName(name);
    if (!cat) return null;
    setCustomCategories((prev) => (prev.includes(cat) ? prev : [...prev, cat]));
    setNewCategory(cat);
    return cat;
  };

  return {
    baseCategories,
    customCategories,
    setCustomCategories,
    categories,
    categoriesWithTodos,
    newCategory,
    setNewCategory,
    handleAddNewCategory,
  };
}
