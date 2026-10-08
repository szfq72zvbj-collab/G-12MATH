# G-12MATH

Grade 12 Mathematics learning platform built as a React/Vite web app with a PocketBase-backed API.

## Applications

- `apps/web/` — React frontend
- `apps/api/` — Express API for payment/backend operations
- PocketBase — authentication and application data

## Local development

1. Run a PocketBase server and create/configure the collections used by the app.
2. Copy `apps/web/.env.example` to `apps/web/.env` and set `VITE_POCKETBASE_URL`.
3. Copy `apps/api/.env.example` to `apps/api/.env` and set the PocketBase/API values.
4. Run:

```bash
npm install
npm run dev
```

The web app runs on port 3000 and the API on port 3001 by default.

## Authentication

The frontend uses PocketBase's `users` auth collection. Signup creates the user and attempts an immediate login. Login sessions are persisted by PocketBase's browser auth store. Password reset is available from `/reset-password`.

## Admin

Set your own PocketBase `users` record field `role` to `admin` once. After login, the header will show **Admin** and `/admin` opens the management dashboard.

The admin dashboard manages:

- courses
- lessons
- student accounts
- purchase records

The frontend admin check is paired with PocketBase collection API rules. Configure create/update/delete/list rules so only authenticated admins can mutate or view administrative data.

## Current content model

The existing app expects these PocketBase collections:

- `users`
- `courses`
- `lessons`
- `progress`
- `purchases`

Course/lesson fields used by the UI are documented directly in the forms and existing page code.

