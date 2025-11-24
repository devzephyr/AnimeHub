# Week 9 Lab Practice: Full‑Stack Integration

## 1. Objective

- 1.1. Connect your Express API to a real MongoDB database using **Mongoose**.
- 1.2. Replace JSON‑file persistence from Lab07 with a proper MongoDB collection.
- 1.3. Implement DTO‑style validation at the API boundary and enforce schema rules in Mongoose.
- 1.4. Expose RESTful CRUD endpoints under `/api/v1` and return a consistent response shape.
- 1.5. Build a simple frontend (served by Express) that uses `fetch()` to call your API, with live DOM updates (no full page reload).
- 1.6. Configure **CORS**, environment variables, and proper middleware order for a production‑shaped app.
- 1.7. Test endpoints with Postman and verify data in **MongoDB Compass**.

Theme continuity: continue your Middle‑earth Legends project. Your “Fellowship Registry” now persists to MongoDB through Mongoose and updates the page dynamically after user actions.

## Quick Start (Implementation Notes)

1. From `lab09/`, run `npm install` (already done once; re-run after pulling new changes).
2. Create a `.env` file that matches the template below and ensure MongoDB is running locally (default `mongodb://127.0.0.1:27017/middleearth`).
3. Launch the server with `npm run dev` and open `http://localhost:3000`.
4. Use the built-in UI (`src/public/index.html`) to add/edit/delete heroes; the frontend calls `/api/v1/members` via `fetch`.

> **Note:** The current workspace blocks committing dot-env files. Please create `.env` and `.env.example` manually with the following content:

```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/middleearth
```

---

## 2. Instructions

### Step 1: Prerequisites & Setup

- 2.1. Ensure MongoDB Community Server and Compass are installed and running locally (from Lab08). Default URI:
  - `mongodb://127.0.0.1:27017` (recommended) or `mongodb://localhost:27017`
- 2.2. Create a new folder `Lab09` in your course repo, or copy your Lab07 scaffold and refactor it.
- 2.3. Initialize the project and install dependencies:

  ```bash
  npm init -y
  npm i express mongoose cors helmet morgan express-validator dotenv express-rate-limit
  npm i -D nodemon
  ```

- 2.4. Create the following structure and seed files:

  ```
  Lab09/
  ├─ src/
  │  ├─ app.js
  │  ├─ server.js
  │  ├─ config/
  │  │  └─ db.js
  │  ├─ models/
  │  │  └─ member.model.js
  │  ├─ routes/
  │  │  └─ members.routes.js
  │  ├─ controllers/
  │  │  └─ members.controller.js
  │  ├─ middlewares/
  │  │  ├─ logger.js
  │  │  └─ errorHandler.js
  │  ├─ utils/
  │  │  └─ responses.js
  │  └─ public/
  │     ├─ index.html
  │     ├─ styles.css
  │     └─ app.js
  ├─ .env            (PORT=3000, NODE_ENV=development, MONGO_URI=mongodb://127.0.0.1:27017/middleearth)
  ├─ .env.example    (PORT=, NODE_ENV=, MONGO_URI=)
  ├─ report09.md
  └─ README.md
  ```

- 2.5. In `package.json`, add scripts:

  ```json
  {
    "scripts": {
      "start": "node src/server.js",
      "dev": "nodemon src/server.js"
    }
  }
  ```

---

### Step 2: Database Connection (Mongoose)

- 2.6. In `src/config/db.js`, export a `connectDB` function that connects to `process.env.MONGO_URI` using `mongoose.connect(...)`. Log success and handle errors (exit process on fatal failure).
- 2.7. In `src/server.js`, load dotenv, call `connectDB()` before `app.listen`, then start server on `PORT` (fallback 3000). Log startup including base path `/api/v1`.

---

### Step 3: Mongoose Model (Members)

- 2.8. Create `src/models/member.model.js` with a schema and model:
  - Fields and rules (align with Lecture09 “DTOs & Validation Boundaries”):
    - `name`: String, required, min 2, max 50
    - `email`: String, required, unique, validate email format
    - `age`: Number, required, integer 13–999
    - `role`: String, optional (e.g., enum of `"Ranger" | "Archer" | "Warrior" | "Hobbit" | "Wizard" | "Dwarf"`)
  - Enable `timestamps: true` for `createdAt` and `updatedAt`.
  - Add `toJSON` transform to remove `__v` and normalize `_id` to `id` if preferred.
  - Create a unique index on `email`.

Example (shape reference; your exact code may vary):

```js
const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, match: /.+@.+\..+/ },
  age: { type: Number, required: true, min: 13, max: 999 },
  role: { type: String, enum: ["Ranger","Archer","Warrior","Hobbit","Wizard","Dwarf"], default: "Ranger" }
}, { timestamps: true });
```

---

### Step 4: App Wiring (Middleware, Static, Versioning)

- 2.9. In `src/utils/responses.js`, reuse standard response helpers from Lab07:
  ```js
  // shape: { data, error, meta }
  const ok = (data, meta = {}) => ({ data, error: null, meta });
  const fail = (message, details = null, meta = {}) => ({ data: null, error: { message, ...(details ? { details } : {}) }, meta });
  module.exports = { ok, fail };
  ```

- 2.10. In `src/app.js` (no `listen` here):
  1. Load dotenv.
  2. `helmet()`
  3. `cors({ origin: true, credentials: true })` (dev default; restrict in prod)
  4. `morgan('dev')` if `NODE_ENV !== 'production'`
  5. `express.json()` and `express.urlencoded({ extended: true })`
  6. Custom `logger` (append `req.id` or timestamp)
  7. Serve static: `app.use(express.static(path.join(__dirname, 'public')))`
  8. Mount routers at `/api/v1`
  9. 404 handler (standard shape)
  10. Centralized error handler (mask stack in prod)

---

### Step 5: Routes & Controllers (CRUD over MongoDB)

- 2.11. Routes in `src/routes/members.routes.js` under `/members`:

```
GET    /api/v1/members            → list (optionally filter/sort/paginate)
GET    /api/v1/members/:id        → detail
POST   /api/v1/members            → create (validate body)
PUT    /api/v1/members/:id        → full update
DELETE /api/v1/members/:id        → delete (204 No Content on success)
```

- 2.12. Use `express-validator` to define DTO boundaries:
  - POST/PUT require: `name` (2–50), `email` (isEmail), `age` (int 13–999). Sanitize and trim fields.
  - Return `400` with `fail('Validation failed', detailsArray)` on errors.

- 2.13. Controllers in `src/controllers/members.controller.js` (async/await + try/catch):
  - Use the Mongoose model for all CRUD; remove Lab07 JSON file access.
  - On create/update, save and return the resource.
  - On missing resource, return `404` with `fail('Member not found')`.
  - Map Mongo/Mongoose errors to clean messages (e.g., duplicate email → 409 or 400 with message).
  - Responses must use `{ data, error, meta }` format.

- 2.14. Status codes:
  - GET list/detail → 200
  - POST create → 201
  - PUT replace → 200
  - DELETE → 204 (no body preferred)

- 2.15. Optional (carryover from Lab07): list pagination/sorting
  - `page` (default 1), `limit` (default 10, max 50)
  - `sort` in {`name`, `createdAt`} and `order` in {`asc`, `desc`}
  - Filters like `role`, `minAge`, `maxAge`
  - Include `meta.total`, `meta.page`, `meta.limit`

---

### Step 6: Frontend Integration (Public)

- 2.16. Build a minimal UI in `src/public/`:
  - `index.html`: A simple “Fellowship Registry” page with a form (`name`, `email`, `age`, optional `role`) and a list/table to display members. Include `app.js` and `styles.css`.
  - `app.js`:
    - On `DOMContentLoaded`, call `GET /api/v1/members` and render the list.
    - Handle form submit: prevent default, build JSON, `fetch('/api/v1/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })`, update DOM on success without reload.
    - Implement delete button next to each item: `DELETE /api/v1/members/:id`, remove from DOM if successful.
    - Implement edit/update flow (simple prompt or inline edit acceptable): `PUT /api/v1/members/:id`, update DOM on success.
    - Show user feedback: success and error messages; disable submit during pending network; basic loading indicators.

- 2.17. CORS
  - If developing the frontend separately (different port), ensure `cors` allows that origin. If served statically from Express, requests are same‑origin and CORS errors should not occur.

---

### Step 7: Environment & Security

- 2.18. `.env` contains non‑committed config (PORT, NODE_ENV, MONGO_URI). Provide `.env.example` with empty placeholders.
- 2.19. Never commit `.env` or secrets. Use `dotenv` to load variables. Treat configuration as data, not code.
- 2.20. In production, restrict `cors` `origin` to your frontend domain and avoid `'*'`.

---

### Step 8: Run & Test (End‑to‑End)

- 2.21. Ensure MongoDB service is running locally. In `Lab09` directory:
  ```bash
  npm run dev
  ```
- 2.22. Visit `http://localhost:3000`:
  - Confirm UI loads from `public/index.html`.
  - Create a member via the form; verify list updates without full reload.
  - Edit a member; verify changes persist to DB and UI updates.
  - Delete a member; verify removal from DB and UI.
- 2.23. Use Postman (or curl) and capture screenshots for `report09.md`:
  1. `GET /api/v1/members` (empty list initially; shows meta if implemented)
  2. Invalid `POST /members` → `400` with validation details
  3. Valid `POST /members` (create one)
  4. `GET` list again (now contains your member)
  5. `GET /api/v1/members/:id`
  6. `PUT` the same member (full replace) → show updated result
  7. `DELETE` the same member → confirm `204`, then `GET` returns `404`
  8. Duplicate email attempt → show clean error handling (409/400)
- 2.24. Verify DB in **MongoDB Compass**:
  - Database: `middleearth`
  - Collection: `members`
  - Documents reflect your CRUD actions.

---

### Step 9: Troubleshooting (Lecture09 — Slide 20)

- CORS error in console → configure `cors()` on server; ensure correct origin/ports.
- `req.body` undefined → add `express.json()` and `express.urlencoded()` before routes.
- 404 route mismatch → confirm `/api/v1` base path and exact endpoint match in fetch/Postman.
- Network error/Failed to fetch → ensure server is running and using the correct URL/port.
- Mongoose ValidationError / duplicate key → catch and return clean 400/409 with helpful message.
- Connection error → verify `MONGO_URI` and that MongoDB is running locally.

---

## 3. Deliverables

Submit a folder **`Lab09`** in your GitHub repo containing:

- 3.1. (10%) — Project Setup & Structure
  - Proper folders (config/models/controllers/routes/middlewares/utils/public), `.env` & `.env.example`, `server.js` vs `app.js` split.
- 3.2. (20%) — Mongoose Model & DB Connection
  - `member.model.js` with schema rules and timestamps; unique email; `connectDB` wiring.
- 3.3. (20%) — API Routing & Controllers
  - CRUD endpoints implemented over MongoDB; consistent `{data,error,meta}`; correct status codes.
- 3.4. (10%) — Middleware, CORS, Error Handling
  - Proper middleware order; CORS configured; 404 and centralized error handler.
- 3.5. (15%) — Frontend Integration & Dynamic DOM
  - `public/index.html` + `app.js`: form submit via `fetch`, render list, update/delete without page reload.
- 3.6. (10%) — Validation & Boundaries
  - `express-validator` DTO checks; map Mongoose errors to clean responses.
- 3.7. (15%) — `report09.md`
  - Screenshots: server start, Compass DB/collection, Postman tests (Section 2.23), browser UI showing live add/edit/delete, and a short reflection: how full‑stack integration changed your flow vs Lab07/08; what you’d secure next.

---

## 4. Summary

By completing this lab, you will:

- 4.1. Connect Express to MongoDB through Mongoose and enforce schema validation.
- 4.2. Expose RESTful CRUD endpoints with consistent response shape and proper status codes.
- 4.3. Serve a small frontend that uses `fetch()` to create, read, update, and delete records with live DOM updates.
- 4.4. Configure CORS, environment variables, and error handling for a production‑shaped service.
- 4.5. Validate DTOs at the API boundary and confirm results in MongoDB Compass and Postman.

---

## Appendix A — Acceptance Criteria

Functional
- Server runs on `PORT` from `.env` (fallback 3000), serves static `public/`, and mounts API under `/api/v1`.
- MongoDB connection succeeds using `MONGO_URI`; data persists in `middleearth.members`.
- Members routes implement: list/detail/create/put/delete over Mongoose.
- Frontend renders list on load; form submit creates a member; edit and delete actions update DB and UI without full page reload.

Validation & Error Handling
- DTO validation with `express-validator` for POST/PUT; invalid requests return `400` with details.
- Duplicate email surfaces as clean error (400/409) without crashing.
- 404 and centralized error handler return standard shape; production responses never include stack traces.

Response Shape & Codes
- All responses follow `{ data, error, meta }`.
- Status codes: 200/201/204 for success; 400/404/409/500 for errors as applicable.

Security & Config
- Middleware order: `helmet` → CORS → `morgan`(dev) → parsers → custom logger → static → routers → 404 → error handler.
- `.env.example` present; `.env` not committed. CORS restricted appropriately for environment.

Documentation & Artifacts
- `README.md` explains how to run the project and base URL.
- `report09.md` includes required screenshots and short reflection.
