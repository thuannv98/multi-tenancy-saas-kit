**Quick Start**
- **Database:** initialize the local DB with the provided SQL: `cd db && sudo -u postgres psql -f db.sql` (this creates/seeds the `ak` DB used by the backend).
- **Backend (NestJS):**
  - `cd server`
  - `npm install`
  - `npm run start:dev` (starts on port `3001`)
  - Config touched: see [server/src/main.ts](server/src/main.ts) for CORS dev settings.
- **Frontend (React + Vite):**
  - `cd gateway/ui`
  - `npm install`
  - `npm run dev` (starts on port `5173`)
  - To point the UI at a different API base, set `VITE_API_BASE` (example: `VITE_API_BASE=http://localhost:3001 npm run dev`).

**Useful Files**
- **Backend entry:** [server/src/main.ts](server/src/main.ts)
- **Actions controller (gateway):** [server/src/actions/actions.controller.ts](server/src/actions/actions.controller.ts)
- **Extensions resolver:** [server/src/extensions/extensions.service.ts](server/src/extensions/extensions.service.ts)
- **Frontend app:** [gateway/ui/src/App.tsx](gateway/ui/src/App.tsx)

**Ports / Hosts**
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

**Demo**
https://1drv.ms/v/c/841e1eb0d9244a13/IQBm-7ZgA2gxRoEBKeC6EZl8AYbDAjbskpZut_u-MpIUVzY

**Key Trade-offs / TODOs**
- **Auth:** demo uses a simple `x-user` header; there is no real authentication/authorization flow. Replace with proper JWT/sessions for production.
- **Audit & actions storage:** audit entries (and some in-memory action state) are stored in-process memory for simplicity. TODO: persist to the DB so logs survive restarts and scale across instances.
- **Idempotency:** controller includes basic idempotency support but is not hardened for concurrent writes or distributed operation. TODO: move idempotency to DB-backed dedupe with strict uniqueness.
- **Integration permissions:** code checks `integration_permissions` by practice name to gate extensions/actions. Ensure practice lookup is robust (ids vs names) and add caching for performance.
- **Extensions:** manifests are hardcoded in `src/extensions/extensions.service.ts` for demonstration. TODO: load from DB or registry and implement per-practice configuration and UI URLs.
- **CORS & dev relaxations:** CORS is permissive for local dev (origin reflection). Tighten before deploying.
- **Validation & error handling:** request validation is minimal. Add DTOs, input validation and better error payloads for user-friendly UI messages.
- **Testing / CI:** there are a few unit/e2e stubs. Add tests and CI for stability.

If you'd like, I can:
- Run the backend and perform a quick smoke test of the new endpoints, or
- Harden one TODO (persist audits or move idempotency to DB). Which should I do next?
