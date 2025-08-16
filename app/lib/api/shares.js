// Centralized client for shares API

export async function leaveShare({ ownerUid, category }, token) {
  const res = await fetch(`/api/shares`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ownerUid, category }),
  });
  if (!res.ok) {
    const err = new Error("leaveShare failed");
    err.status = res.status;
    throw err;
  }
  return res.json().catch(() => ({}));
}
