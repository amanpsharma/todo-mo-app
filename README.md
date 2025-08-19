# Todo App (Next.js + Firebase Auth + MongoDB)

A fast, accessible, and shareable Todo app built with Next.js (App Router), Firebase (Google) Auth, and MongoDB. It supports category sharing with permissions, responsive UI, dark mode, and polished toasts.

## Features

- Core
  - Add, edit (via modal), delete todos
  - Toggle complete, filter by All / Active / Completed
  - Clear completed (own list)
  - Category chips and quick category add
- Sharing
  - Share a category by email with granular permissions (Read / Write / Edit / Delete)
  - View shared categories (read-only or editable based on permission)
  - Exit shared view easily; permission badges and guardrails
  - One-time “shared with you” notification with profile avatar badge
- UX
  - Optimistic updates for snappy feel
  - Responsive and dark-mode friendly UI (Tailwind CSS + Nunito Sans)
  - Toast notifications (react-toastify) with improved design and undo delete
  - Icons via react-icons (Feather set)
- Accessibility
  - Proper semantics, focus management, ARIA labels, keyboard support
- Architecture
  - App Router with client components where needed
  - Centralized API clients under app/lib/api/\*
  - UI state via Redux Toolkit (filters, editing, confirms); hooks for domain logic

## Tech Stack

- Framework: Next.js (App Router)
- Auth: Firebase (Google) Web SDK + Admin verification on API routes
- Database: MongoDB (via Next.js API routes)
- State/UI: React, Redux Toolkit, Tailwind CSS
- UX: react-toastify, react-icons, (optional) framer-motion for subtle animations

## Getting Started

Prerequisites

- Node.js 18+
- A Firebase project (Google provider enabled)
- A MongoDB connection string

Install

```bash
npm install
```

Environment

- Copy `.env.example` to `.env.local` and fill your values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

MONGODB_URI=mongodb+srv://user:pass@cluster/db?retryWrites=true&w=majority
MONGODB_DB=yourDatabaseName

# Firebase Admin (server-side verification) – choose ONE
# FIREBASE_SERVICE_ACCOUNT='{"project_id":"...","client_email":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"}'
# or FIREBASE_SERVICE_ACCOUNT_BASE64=...
# or FIREBASE_SERVICE_ACCOUNT_PATH=/abs/path/to/service-account.json
# or set the individual fields below
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Run dev

```bash
npm run dev
# open http://localhost:3000
```

Build & start

```bash
npm run build
npm start
```

Tests (if enabled)

```bash
npm test
```

## Project Structure

```
app/
  api/
    todos/route.js          # REST handlers (GET, POST, PATCH, DELETE)
    shares/route.js         # Share endpoints (create/revoke/list/leave) if present
  components/
    todos/
      TodoApp.jsx           # Main UI (composed of smaller parts)
      AddTodoForm.jsx
      FiltersBar.jsx
      TodoList.jsx
      EditTodoModal.jsx
      sections/
        EditableSharedListSection.jsx
    shares/
      SharesPanel.jsx
      SharesHeader.jsx
      SharedTodosList.jsx
    ui/
      AppFooterNote.jsx
      LoggedOutHero.jsx
  hooks/
    useCategoryState.js     # Category persistence & selection
    useSharedView.js        # Shared view state, permissions, CRUD helpers
    useFooterThought.js     # Footer tips
    useUrlSync.js           # URL init/sync for filter/category/shared view
  lib/
    api/
      todos.js              # create/update/toggle/remove/clear APIs
      shares.js             # create/revoke/leave/list share APIs
    mongo.js                # MongoDB client
    firebaseClient.js
    firebaseAdmin.js
    utils.js                # helpers (permissions, toasts, footer tips)
  layout.js                 # Global providers (Redux, Toaster, Fonts)
  page.js                   # Entry page (renders TodoApp)
public/
  favicon.svg
  favicon.ico
  mask-icon.svg
```

## API Overview

Todos (authenticated; Bearer Firebase ID token)

- GET /api/todos → list current user’s todos
- POST /api/todos → create { text, category }
- PATCH /api/todos → update { id, text?, completed?, category? }
- DELETE /api/todos → delete by { id } or clear completed by { clearCompleted: true }

Shares (authenticated)

- GET /api/shares → lists you shared and shared-with-you categories
- POST /api/shares → create share { category, email, permissions[] }
- DELETE /api/shares → revoke { category, email } or leave { ownerUid, category }

All server handlers validate the Firebase ID token and scope MongoDB queries appropriately.

## Key Concepts

- Own vs Shared View
  - Own list: full control; clear completed enabled
  - Shared view: permissions guard Write/Edit/Delete; UI adapts (disabled actions + toasts)
- URL Sync
  - Filter, category, and shared view sync to the URL for deep links
- Toasts
  - react-toastify mounted globally; Undo for deletes; responsive placement (top-right desktop, bottom mobile)
- Fonts & Icons
  - Nunito Sans via Google Fonts; Icons via react-icons (Feather)

## Customization Ideas

- Drag & drop ordering (persist an order field)
- RTK Query or TanStack Query for server state (caching, retries, optimistic)
- Zod + React Hook Form for robust forms & email validation
- Radix UI / shadcn/ui for dialogs/menus/tooltips with a11y out of the box
- MSW for API mocks in tests; Sentry for error tracking

## Troubleshooting

- Favicon shows old icon: hard refresh (Shift+Reload) and ensure `/favicon.svg` is preferred; remove legacy `/app/favicon.ico` if autoloaded.
- Firebase Admin not initialized: provide service account via one of `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_SERVICE_ACCOUNT_BASE64`, `FIREBASE_SERVICE_ACCOUNT_PATH`, or the individual fields. Newlines in PRIVATE_KEY must be escaped as `\n`.

## License

MIT
