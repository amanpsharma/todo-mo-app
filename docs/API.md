# Mobile API Reference

This document describes the API endpoints used by the mobile app. All endpoints are served by the Next.js app under `/api/*`.

Base URL examples:

- Production: https://todo-mo-app.vercel.app
- Local LAN: http://192.168.0.104:3000
- Localhost (simulators only): http://localhost:3000

Authentication:

- All endpoints require an Authorization header with a Firebase ID token.
- Header: `Authorization: Bearer <FIREBASE_ID_TOKEN>`

Errors:

- 401 unauthorized: Missing/invalid token
- 403 forbidden: Not enough permissions on shared categories
- 400 bad request: Missing or invalid parameters
- 404 not found: Resource missing

---

## Categories

Canonical categories used by both web and mobile:

- general
- work
- personal
- shopping
- urgent

Normalization rules enforced by the API:

- Lowercased, trimmed; empty becomes `general`.
- Max length 32 characters.
- Sanitized to letters, numbers, hyphen, and spaces (multiple spaces collapsed).

Recommendation for mobile:

- Use the exact list above for creation and filters to stay in sync with the web app.

---

## Todos

### GET /api/todos

List todos.

Query params:

- owner (optional): string (UID). If omitted or equals your uid, returns your todos.
- category (required when viewing another user's list): string, lowercase category.

Examples:

- Own list: `GET /api/todos`
- Shared view: `GET /api/todos?owner=<ownerUid>&category=work`

Response 200 JSON: Array of todos

```
[
  {
    "id": "<mongo_id>",
    "uid": "<owner_uid>",
    "text": "Buy milk",
    "completed": false,
    "createdAt": 1710000000000,
    "category": "general"
  },
  ...
]
```

Notes:

- Requires token. For shared view, you must be shared on {owner, category} with at least `read` permission.

---

### POST /api/todos

Create a todo for your own list or on a shared list (if permitted).

Body JSON:

- text: string (required)
- category: string (optional, default: "general")
- ownerUid: string (optional). If provided and not your uid, you must have `write` permission on that owner+category.

Example body:

```
{
  "text": "Walk dog",
  "category": "personal",
  "ownerUid": "<owner_uid_if_sharing>"
}
```

Response 200 JSON:

```
{
  "id": "<mongo_id>",
  "uid": "<target_uid>",
  "text": "Walk dog",
  "completed": false,
  "createdAt": 1710000000000,
  "category": "personal"
}
```

Errors: 400 (empty text), 403 (no permission), 401 (no token)

---

### PATCH /api/todos

Update fields of a todo. Works for own todos and for shared todos when you have `edit` permission.

Body JSON:

- id: string (required)
- text: string (optional)
- completed: boolean (optional)
- category: string (optional). When moving a shared todo to a different category, you must also have `edit` on the destination category.

Example body:

```
{
  "id": "64fe...",
  "completed": true
}
```

Response 200 JSON: Updated todo

```
{
  "id": "64fe...",
  "uid": "<owner_uid>",
  "text": "Walk dog",
  "completed": true,
  "createdAt": 1710000000000,
  "category": "personal"
}
```

Errors: 400 (missing id / no fields), 403 (no permission), 404 (not found), 401 (no token)

---

### DELETE /api/todos

Delete a single todo, clear completed in a category, or clear an entire category.

Query params (choose one mode):

- id: string (delete single todo by id)
- clearCompleted=1 [&category=cat] [&ownerUid=uid]
  - Clears completed todos. If ownerUid is provided and not your uid, requires `delete` on that owner+category.
- category=cat [&ownerUid=uid]
  - Clears all todos in category. If ownerUid is provided and not your uid, requires `delete` on that owner+category.

Examples:

- Delete single: `/api/todos?id=64fe...`
- Clear completed (own): `/api/todos?clearCompleted=1&category=work`
- Clear completed (shared): `/api/todos?clearCompleted=1&category=work&ownerUid=<owner_uid>`
- Clear category (own): `/api/todos?category=personal`
- Clear category (shared): `/api/todos?category=personal&ownerUid=<owner_uid>`

Responses:

- Delete single: `{ "id": "<id>", "ownerUid": "<owner_uid>" }`
- Clear completed: `{ "cleared": true, "ownerUid": "<target_uid>" }`
- Clear category: `{ "clearedCategory": "work", "deletedCount": 3 }`

Errors: 400, 401, 403, 404

---

## Shares

### GET /api/shares

List share info or permissions.

Query modes:

- my=1 → lists shares you created (as owner).
- sharedWithMe=1 → lists owners who shared with you, grouped by owner.
- owner=<ownerUid>&category=<cat> → returns the permissions record for that owner+category with respect to the current viewer.

Examples:

- `GET /api/shares?my=1`
- `GET /api/shares?sharedWithMe=1`
- `GET /api/shares?owner=<ownerUid>&category=work`

Responses:

- my=1: Array of share docs you created

```
[
  {
    "id": "<share_id>",
    "ownerUid": "<your_uid>",
    "ownerEmail": "you@example.com",
    "ownerName": "you",
    "category": "work",
    "viewerUid": "<viewer_uid|null>",
    "viewerEmailLower": "friend@example.com",
    "permissions": ["read", "write"],
    "createdAt": 1710000000000
  },
  ...
]
```

- sharedWithMe=1: Array grouped by owner

```
[
  {
    "ownerUid": "<uid>",
    "ownerEmail": "owner@example.com",
    "ownerName": "owner",
    "categories": ["work", "personal"],
    "categoriesMeta": { "work": { "createdAt": 1710000000000 } }
  }
]
```

- owner+category: single permission doc for this viewer

```
{
  "id": "<share_id>",
  "ownerUid": "<uid>",
  "category": "work",
  "permissions": ["read", "write"]
}
```

---

### POST /api/shares

Create or update a share on one of your categories.

Body JSON:

- category: string (required, lowercase recommended)
- viewerEmail: string (required)
- permissions: string[] (optional; default ["read"]). Allowed: read, write, edit, delete

Example:

```
{
  "category": "work",
  "viewerEmail": "friend@example.com",
  "permissions": ["read", "write"]
}
```

Response 200 JSON: `{ "ok": true, "id": "<share_id>" }`

Notes:

- If a share already exists for the same viewer and category, permissions are updated.

---

### DELETE /api/shares

Revoke a share (as owner) or leave a shared category (as viewer).

Body JSON (choose one):

- Revoke (owner): `{ "category": "work", "viewerEmail": "friend@example.com" }`
- Leave (viewer): `{ "category": "work", "ownerUid": "<owner_uid>" }`

Responses:

- `{ "ok": true, "deleted": <number> }`

Errors: 400 (bad request), 401 (unauthorized)

---

## Headers for all requests

```
Authorization: Bearer <Firebase ID token>
Content-Type: application/json
```

## Mobile usage tips

- Always fetch a fresh Firebase ID token before calling APIs.
- For shared lists, ensure you know the `ownerUid` and `category` before calling.
- Handle 401 by re-authenticating; handle 403 by showing a permissions message.
