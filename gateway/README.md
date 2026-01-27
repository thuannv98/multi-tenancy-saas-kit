Minimal React + Vite UI for Account Kit

Run the UI

```bash
cd gateway/ui
npm install
npm run dev
# open http://localhost:5173
```

Configuration
- `VITE_API_BASE` (optional) — override the API base (default `http://localhost:3001`). Example:

```bash
VITE_API_BASE=http://localhost:3001 npm run dev
```

What the UI contains
- Context panel: select user and practice, list clients, create client (requires PracticeAdmin role in demo)
- Client detail: extensions panel, send email form (calls `POST /practices/:practiceId/actions`), audit log for practice

Notes / trade-offs
- No real authentication — the demo uses an `x-user` header to simulate the caller.
- The UI is intentionally minimal and not styled; its purpose is to exercise backend behaviour and flows.
- The UI expects the backend to run on `localhost:3001` by default; enable CORS on the backend for the UI origin (see `server/src/main.ts`).

If you'd like, I can add a small README entry showing example curl commands and expected responses for key flows.
