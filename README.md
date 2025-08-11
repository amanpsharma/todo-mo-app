## Todo App (Next.js + Firebase Auth + MongoDB)

Interactive todo list using Firebase (Google) Auth for identity and MongoDB for persistent CRUD storage via Next.js API routes.

### Features

- Add, edit, delete todos
- Toggle complete state
- Filter: All / Active / Completed
- Clear all completed
- Secure per-user persistence in MongoDB (via `/api/todos`)
- Accessible semantics (lists, buttons, form, aria-live updates)
- Responsive + dark mode friendly

### Quick Start

1. Install deps (if not already):

```
npm install
```

2. Run dev:

```
npm run dev
```

3. Open http://localhost:3000
4. Add Firebase config: copy `.env.example` to `.env.local` and fill your project values.

### Firebase Auth

Google auth is enabled via Firebase Web SDK. Provide the env vars, enable Google provider in Firebase console, and the header will show a Google Login button. The ID token is sent (Bearer) to protected API routes which validate it server‑side with the Firebase Admin SDK.

### MongoDB Persistence

Todos are stored in a MongoDB collection `todos` keyed by `uid`. CRUD is exposed through RESTful handlers in `app/api/todos/route.js` (GET, POST, PATCH, DELETE). The server validates the Firebase ID token then scopes all queries by the authenticated `uid`.

### File Overview

- `app/page.js` – page rendering the `TodoApp`
- `app/components/TodoApp.jsx` – main interactive UI (client component)
- `app/components/useTodos.js` – state + optimistic CRUD via `/api/todos`
- `app/components/AuthProvider.jsx` – Firebase auth context
- `app/api/todos/route.js` – protected MongoDB CRUD endpoints
- `app/lib/mongo.js` – MongoDB client singleton
- `app/lib/firebaseClient.js` – Firebase client SDK init
- `app/lib/firebaseAdmin.js` – Firebase Admin token verification

### Environment Variables

Create `.env.local` with (example names – fill with real values):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

MONGODB_URI=mongodb+srv://user:pass@cluster-host/dbname?retryWrites=true&w=majority
MONGODB_DB=yourDatabaseName

# Firebase Admin (choose one approach)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

If you already have a service account JSON, map its fields to the above variables (escape newlines in PRIVATE_KEY). Alternatively you can mount a JSON file and import it, but env vars keep deployment simple.

### Data Model

MongoDB `todos` documents:

```
{
	_id: ObjectId,
	uid: string,        // Firebase Auth user id
	text: string,
	completed: boolean,
	createdAt: number   // epoch ms
}
```

### Security Notes

- All API requests require a valid Firebase ID token (Bearer header)
- Server re-validates token each request (no session storage)
- Queries & mutations always include `uid` filter

### Customization Ideas

- Add drag & drop ordering (persist an `order` field)
- Add pagination or infinite scroll
- Add server actions instead of REST
- Add rate limiting / input validation (zod)
- Add tests (Vitest / React Testing Library)

### Firestore

Previously used; now removed in favor of MongoDB. You can delete unused Firestore rules if no longer needed.

### License

MIT
