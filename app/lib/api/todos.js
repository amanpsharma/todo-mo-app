// Centralized client for todos API

export async function createTodo({ text, category, ownerUid }, token) {
  const res = await fetch(`/api/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text, category, ownerUid }),
  });
  if (!res.ok) {
    const err = new Error("createTodo failed");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function updateTodo(payload, token) {
  // payload can be { id, completed } or { id, text, category }
  const res = await fetch(`/api/todos`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = new Error("updateTodo failed");
    err.status = res.status;
    throw err;
  }
  return res.json().catch(() => ({}));
}
