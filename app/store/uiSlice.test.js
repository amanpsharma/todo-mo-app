import reducer, {
  startEdit,
  setEditingText,
  setEditingCategory,
  cancelEdit,
  openConfirmDelete,
  closeConfirmDelete,
  setConfirmDeleteCategory,
  openConfirmClear,
  closeConfirmClear,
} from "./uiSlice";

describe("uiSlice reducers", () => {
  it("handles editing flow", () => {
    const s1 = reducer(
      undefined,
      startEdit({ id: "1", text: "A", category: "general" })
    );
    expect(s1.editingId).toBe("1");
    const s2 = reducer(s1, setEditingText("B"));
    expect(s2.editingText).toBe("B");
    const s3 = reducer(s2, setEditingCategory("work"));
    expect(s3.editingCategory).toBe("work");
    const s4 = reducer(s3, cancelEdit());
    expect(s4.editingId).toBe(null);
    expect(s4.editingText).toBe("");
  });

  it("handles confirm dialogs", () => {
    const s1 = reducer(undefined, openConfirmDelete("id-1"));
    expect(s1.confirmDeleteId).toBe("id-1");
    const s2 = reducer(s1, closeConfirmDelete());
    expect(s2.confirmDeleteId).toBe(null);
    const s3 = reducer(s2, setConfirmDeleteCategory("work"));
    expect(s3.confirmDeleteCategory).toBe("work");
    const s4 = reducer(s3, openConfirmClear());
    expect(s4.confirmClearOpen).toBe(true);
    const s5 = reducer(s4, closeConfirmClear());
    expect(s5.confirmClearOpen).toBe(false);
  });
});
