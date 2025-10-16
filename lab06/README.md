# Week 6 Lab Practice: Node.js Server, File I/O, and Routing

## 1. Objective

- 1.1. Install Node.js LTS and verify Node/npm on your machine.
- 1.2. Build a simple HTTP server using Node core modules (http, fs, path, url).
- 1.3. Serve your existing Middle‑earth site (from Lab05) as static files.
- 1.4. Implement manual routing (/, /about, /contact) and static asset handling (CSS/JS/images).
- 1.5. Handle a POST submission from your “Join the Fellowship” form and persist data to a JSON file.
- 1.6. Add robust error handling (error‑first callbacks, try/catch for JSON parsing, proper HTTP status codes).

Theme continuity: continue your Middle‑earth Legends project. Your server powers the “Fellowship Registry” by serving the site and saving new recruits.

---

## 2. Instructions

### Step 1: Set Up Workspace

- 2.1. Copy your Lab05 folder into a new folder named `Lab06`.
- 2.2. Inside `Lab06`, create a directory `public/` and move your Lab05 site files into it:
  - `public/index.html`, `public/styles.css`, `public/script.js`, `public/images/…`
- 2.3. Create/update `report06.md` for screenshots and reflection.

Tip: After moving, update paths in `index.html` if needed (e.g., `<link href="styles.css">`, `<script src="script.js">`).

---

### Step 2: Install Node.js LTS

- 2.4. Download and install Node.js LTS (nodejs.org). Accept defaults.
- 2.5. Verify in a terminal:
  - `node -v`  → prints Node version
  - `npm -v`   → prints npm version

Add the version outputs to `report06.md`.

---

### Step 3: Create a Basic Server

- 2.6. In `Lab06`, create `server.js`. Use Node core modules only (no Express this week).
- 2.7. Start a basic HTTP server on port `3000` that:
  - Responds to `GET /` by serving `public/index.html` using `fs.readFile` (async).
  - Sets `Content-Type` appropriately.
  - Uses proper status codes (200 OK, 404 Not Found, 500 Server Error).

Note on module style:
- You may use CommonJS (`const http = require('http')`) OR ES Modules (`import http from 'http'` if your project sets `"type": "module"` in `package.json`). For simplicity, CommonJS is fine.

---

### Step 4: Serve Static Files (CSS/JS/Images)

- 2.8. Implement static file serving:
  - If `req.url` points to `/styles.css`, `/script.js`, or `/images/...`, read from `public/` and serve the file with correct MIME type:
    - `.html → text/html`, `.css → text/css`, `.js → application/javascript`, `.png/.jpg/.jpeg/.gif → image/*`, `.svg → image/svg+xml`
- 2.9. Use `fs.readFile` (async). On error (e.g., file missing), return `404` for missing static files or `500` for unexpected errors.

---

### Step 5: Manual Routing

- 2.10. Add routes using `req.url`:
  - `/` → serve `public/index.html`
  - `/about` → return a simple HTML string (e.g., lore text about the Fellowship)
  - `/contact` → return a simple HTML string
  - Anything else → return `404` with an HTML message
- 2.11. Keep routing logic clear, then fall back to static file serving where appropriate.

---

### Step 6: Handle “Join the Fellowship” Form (POST)

- 2.12. Reuse your Lab05 form (`<form id="joinForm">`). Set its `action` to `/api/join` and `method="POST"`.
- 2.13. On the server, handle `POST /api/join`:
  - Accumulate request body (`req.on('data')` / `req.on('end')`).
  - Support `application/x-www-form-urlencoded` (default browser forms) and `application/json`.
  - Parse the body:
    - For URL-encoded, use `querystring.parse`.
    - For JSON, `JSON.parse` inside `try/catch`.
  - Validate minimally on server:
    - Required: `name`, `email`, `age`
    - Email contains `@`, `age` is a number, and reuse your password policy check if you post it (or simply omit passwords from being stored).
  - Persist to `data/fellowship.json`:
    - Ensure the `data/` folder exists (create if missing).
    - Read current array (if file missing, treat as `[]`).
    - Push a new entry `{ name, email, age, class, date }`.
    - Write back updated JSON (pretty‑printed helpful for grading).
  - Respond with JSON:
    - Success: `{ ok: true, message: "Welcome to the Fellowship, <name>!" }`
    - Validation error: `400` with `{ ok: false, error: "Reason" }`
    - Server error: `500` with `{ ok: false, error: "Server error" }`

---

### Step 7: Error Handling

- 2.14. Follow Node error‑first callback conventions and use `try/catch` for synchronous blocks like JSON parsing.
- 2.15. Always handle errors gracefully:
  - File not found → `404` (static asset) or `500` (core page missing like `index.html`)
  - Validation issues → `400`
  - Unexpected issues → `500`
- 2.16. Log errors to console, but do not crash the process.

---

### Step 8: Run & Test

- 2.17. From `Lab06` directory, run: `node server.js`
- 2.18. Visit `http://localhost:3000`
  - Confirm homepage loads (from `public/index.html`)
  - Confirm CSS/JS/images load correctly
  - Visit `/about` and `/contact`
  - Submit the “Join the Fellowship” form:
    - Show an error case (e.g., invalid email) and confirm the server returns `400` JSON.
    - Submit valid data and confirm the server returns success JSON and that `data/fellowship.json` is updated.
- 2.19. Add screenshots to `report06.md`:
  - Node/npm versions
  - Homepage served from Node
  - About or Contact route
  - Network/DevTools showing a failed POST (400) and a successful POST (200)
  - The resulting `data/fellowship.json` content

---

## 3. Deliverables

Submit a folder **`Lab06`** in your GitHub repo containing:

- 3.1. (20%) — `server.js`
  - HTTP server on port 3000, manual routing, static file serving.
- 3.2. (20%) — Use of `fs` for:
  - Serving `index.html` and static files
  - Reading/writing `data/fellowship.json`
- 3.3. (20%) — POST handler `/api/join` with validation and JSON responses
- 3.4. (15%) — Error handling:
  - Proper status codes (400/404/500), no crashes
  - Error‑first callbacks and try/catch for parsing
- 3.5. (25%) — `report06.md` with screenshots and reflection:
  - Screenshots listed in Step 8
  - Reflection: How did you adapt client‑side Lab05 into a server‑backed flow? What changed between client and server validation? What would you improve next with a framework like Express?

---

## 4. Summary

By completing this lab, you will:

- 4.1. Install and verify Node.js and npm.
- 4.2. Build a Node HTTP server with `http` and serve files with `fs`.
- 4.3. Implement manual routing and static asset serving.
- 4.4. Process form submissions server‑side and persist data.
- 4.5. Apply robust error handling to keep your server stable.
- 4.6. Extend your Middle‑earth Legends theme into a full‑stack experience.

---

## Appendix A — Acceptance Criteria

Functional
- Node server runs on port 3000 and serves `public/index.html` at `/`.
- `/about` and `/contact` routes return HTML responses.
- Static assets (CSS/JS/images) load with correct MIME types.
- POST `/api/join` accepts form data and writes to `data/fellowship.json`.

Validation & Error Handling
- Invalid input returns `400` with clear JSON errors.
- Missing files handled gracefully (`404` for assets, `500` for core pages).
- Server never crashes; errors are logged.

Theme & Continuity
- Site and server content match the Middle‑earth/Fellowship theme from previous labs.

---

