# Week 7 Lab Practice: Express.js REST API

## 1. Objective

- 1.1. Install and initialize an Express project with environment config via **dotenv**.
- 1.2. Structure a production‑shaped API using **routers** and **controllers** under a versioned base path `/api/v1`.
- 1.3. Implement **CRUD** routes for a **members** resource (Fellowship registrants) with **route params** and **query**.
- 1.4. Apply core **middleware** in correct order: `helmet`, `CORS`, `morgan` (dev), `express.json`, `express.urlencoded`, and a **custom logger**.
- 1.5. Enforce **validation & sanitization** with `express-validator` for POST/PUT bodies.
- 1.6. Return consistent **JSON response shape** with proper **HTTP status codes**.
- 1.7. Add **centralized error handling** and a 404 handler that use the standard response shape.
- 1.8. Enable **CORS** and basic hardening with **helmet** + simple **rate limiting**.
- 1.9. Support **filtering/sorting/pagination** via query parameters for list endpoints.

Theme continuity: continue your Middle‑earth Legends project. Your API powers a “Fellowship Registry” service and persists registrants to a local JSON file this week (DB integration next week).

---
**Important**: Please study **Appendix B** and all referenced repositories and instructions — they are required to successfully complete this lab.

## 2. Instructions

### Step 1: Set Up Workspace

- 2.1. Create a new folder named `Lab07` in your course repo.
- 2.2. Inside `Lab07`, initialize an npm project and install dependencies:
  ```bash
  npm init -y
  npm i express cors helmet morgan express-validator dotenv express-rate-limit
  npm i -D nodemon
  ```
- 2.3. Create the following structure and seed files:
  ```
  Lab07/
  ├─ src/
  │  ├─ app.js
  │  ├─ server.js
  │  ├─ routes/
  │  │  └─ members.routes.js
  │  ├─ controllers/
  │  │  └─ members.controller.js
  │  ├─ middlewares/
  │  │  ├─ logger.js
  │  │  └─ errorHandler.js
  │  ├─ utils/
  │  │  └─ responses.js
  │  └─ data/
  │     └─ members.json   (seed with [] )
  ├─ .env           (PORT=3000, NODE_ENV=development)
  ├─ .env.example   (PORT=, NODE_ENV=)
  ├─ report07.md
  └─ README.md
  ```
- 2.4. In `package.json`, add scripts:

  ```json
  {
    "scripts": {
      "start": "node src/server.js",
      "dev": "nodemon src/server.js"
    }
  }
  ```

---

### Step 2: App Wiring (app.js vs server.js)

- 2.5. **`src/app.js`** — Build and configure the Express app (no `listen` here):

  - 2.5.1. Load **dotenv** and read `process.env.NODE_ENV` for dev vs prod behavior.
  - 2.5.2. Apply middleware **in this order**:

    1. `helmet()`
    2. `cors({ origin: true, credentials: true })` (dev default)
    3. `morgan('dev')` (only if `NODE_ENV !== 'production'`)
    4. `express.json()` and `express.urlencoded({ extended: true })`
    5. Custom **logger** (append `req.id` or timestamp; log method + path)
  - 2.5.3. Mount routers at `/api/v1`.
  - 2.5.4. Add a **404 handler** that returns the standard shape.
  - 2.5.5. Add a centralized **error‑handling** middleware `(err, req, res, next)` that:

    * Masks stack traces in production
    * Logs full errors to console (or file)
    * Always returns the standard shape

- 2.6. **`src/server.js`** — Import the app and start the server:

  - 2.6.1. Read `PORT` from `.env` with a fallback (e.g., 3000).
  - 2.6.2. Call `app.listen(PORT, ...)` and log a startup message including `/api/v1` base.

---

### Step 3: Consistent Response Utility

- 2.7. Create `src/utils/responses.js` with helpers to enforce the response shape:

  ```js
  // shape: { data, error, meta }
  const ok = (data, meta = {}) => ({ data, error: null, meta });
  const fail = (message, details = null, meta = {}) => ({ data: null, error: { message, ...(details ? { details } : {}) }, meta });
  module.exports = { ok, fail };
  ```

---

### Step 4: Router & Controller (Members)

- 2.8. Define routes in `src/routes/members.routes.js` under `/members`:

  ```
  GET    /api/v1/members            → list (filter/sort/paginate)
  GET    /api/v1/members/:id        → detail
  POST   /api/v1/members            → create (validate body)
  PUT    /api/v1/members/:id        → full update (idempotent)
  DELETE /api/v1/members/:id        → delete (204 No Content)
  ```
- 2.9. Implement controllers in `src/controllers/members.controller.js` with these rules:

  - 2.9.1. **Validation** (use `express-validator`):

    * **POST /members** requires `name` (string, 2–50 chars), `email` (valid), `age` (int 13–999).
    * **PUT /members/:id** requires the same fields (full replacement).
    * On invalid input, return `400` with `fail('Validation failed', detailsArray)`.
  - 2.9.2. **Data layer**: read/write `src/data/members.json` (array):

    * On **create**, add fields: `id` (uuid or incremental), `createdAt`, `updatedAt`.
    * On **update**, set `updatedAt`.
    * For **delete**, remove and persist.
  - 2.9.3. **List filtering/sorting/pagination** (query params):

    * Pagination: `page` (default 1), `limit` (default 10, max 50).
    * Sorting: `sort` in {`name`, `createdAt`} and `order` in {`asc`, `desc`}.
    * Filters: `role` (exact), `minAge`, `maxAge`.
    * Include `meta.total`, `meta.page`, `meta.limit` in responses.

---

### Step 5: Middleware

- 2.10. **Custom logger** (`src/middlewares/logger.js`): attach `req.id` or timestamp; log `method path req.id`.
- 2.11. **Error handler** (`src/middlewares/errorHandler.js`): centralized catch‑all implementing the standard JSON shape; never leak stack traces in production.
- 2.12. **Rate limiting**: protect `/api/v1/members` with `express-rate-limit` (e.g., 100 req / 15 min per IP) and return JSON `429` on exceed.

---

### Step 6: Status Codes & Response Shape

- 2.13. **GET list/detail** → `200 OK` with `{ data, error: null, meta }`.
- 2.14. **POST** (create) → `201 Created` with new resource in `data`.
- 2.15. **PUT** (replace) → `200 OK` with updated resource in `data`.
- 2.16. **DELETE** → `204 No Content` (no body preferred). If returning JSON, still acceptable for grading.
- 2.17. Missing resource → `404 Not Found` with `fail('Member not found')`.
- 2.18. Validation error → `400 Bad Request` with `fail('Validation failed', details)`.
- 2.19. Unexpected error → `500 Internal Server Error` with `fail('Internal Server Error')` (mask stack in prod).

---

### Step 7: Environment & Versioning

- 2.20. Use **dotenv** with `.env` and `.env.example` (no secrets committed). Respect `PORT` and `NODE_ENV`.
- 2.21. Mount all routes under **`/api/v1`** for versioning.

---

### Step 8: Run & Test

- 2.22. Start the app:

  ```bash
  npm run dev
  # or
  npm start
  ```
- 2.23. Use **Postman** (or curl) and capture screenshots for `report07.md`:

  1. `GET /api/v1/members` (empty list initially; shows `meta`)
  2. Invalid **POST /members** → `400` with validation details
  3. Valid **POST /members** (create one)
  4. `GET` list again (now contains your member)
  5. `GET /api/v1/members/:id`
  6. **PUT** the same member (full replace) → show updated result
  7. **DELETE** the same member → confirm `204`, then `GET` returns `404`
  8. **Rate limit** demo (temporarily lower thresholds if needed) → show `429` JSON

*(Optional Bonus)* Add a quick **Supertest + Jest** test covering one happy path and one validation error.

---

## 3. Deliverables

Submit a folder **`Lab07`** in your GitHub repo containing:

- 3.1. (10%) — **Project Setup & Structure**

  * Proper folders (routes/controllers/middlewares/utils/data), `.env` & `.env.example`, `server.js` vs `app.js` split.
- 3.2. (20%) — **Routing & CRUD**

  * All endpoints implemented with params and query parsing.
- 3.3. (15%) — **Middleware**

  * Required built‑ins + custom logger; correct **order**.
- 3.4. (20%) — **Validation & Responses**

  * `express-validator` rules, clear 400 messages; consistent `{data,error,meta}`; correct status codes.
- 3.5. (15%) — **Error Handling**

  * Centralized error middleware; 404 handler; safe production errors.
- 3.6. (10%) — **Security Basics**

  * `helmet`, CORS, and rate limiting functioning.
- 3.7. (10%) — **report07.md**

  * Required screenshots (Section 2.23) + short reflection: what Express simplified vs Lab06; what you’d improve next.

---

## 4. Summary

By completing this lab, you will:

- 4.1. Stand up an Express API with versioned routing and clean structure.
- 4.2. Implement a full CRUD flow with consistent, well‑validated JSON responses.
- 4.3. Apply essential middleware, security headers, CORS, and basic rate limiting.
- 4.4. Centralize error and 404 handling for reliability.
- 4.5. Support real‑world list UX via filtering, sorting, and pagination.
- 4.6. Prepare for database integration in Week 8 by isolating controllers and data access.

---

## Appendix A — Acceptance Criteria

Functional

* Server runs on `PORT` from `.env` (fallback 3000) and serves under `/api/v1`.
* **Members** routes implement: list/detail/create/put/delete as specified.
* List supports `page`, `limit`, `sort` (`name` or `createdAt`), `order` (`asc`/`desc`), and filters (`role`, `minAge`, `maxAge`).
* POST/PUT enforce body validation and sanitization; errors return `400` with details.
* Data persists to `src/data/members.json` with `id`, `createdAt`, `updatedAt` fields.

Middleware & Security

* Middleware order: `helmet` → CORS → `morgan`(dev) → parsers → custom logger → routers → 404 → error handler.
* Rate limit protects `/api/v1/members` and returns `429` JSON on exceed.
* Production errors never include stack traces in responses.

Response Shape & Codes

* All responses follow `{ data, error, meta }`.
* Status codes: 200/201/204 for success; 400/404/429/500 for errors as applicable.

Documentation & Artifacts

* `.env.example` present; no secrets committed.
* `report07.md` includes required screenshots and reflection.
* `README.md` explains how to run the project (commands and base URL).
---
## Appendix B — Learning Materials
Core Express Security & Best Practices
- Express Security Best Practices (official guide):
  - https://expressjs.com/en/advanced/best-practice-security.html
- Production Best Practices (Performance/Security):
  - https://expressjs.com/en/advanced/best-practice-performance.html
---
Middleware Introduced in Lecture 7
- CORS middleware (npm cors):
  - https://github.com/expressjs/cors
- Quick primer on Cross-Origin Resource Sharing (MDN):
  - https://developer.mozilla.org/docs/Web/HTTP/CORS
- Helmet (secure HTTP headers):
  - https://helmetjs.github.io/
- Helmet on npm:
  - https://www.npmjs.com/package/helmet
- Morgan (HTTP request logger):
  - https://github.com/expressjs/morgan
---
Rate Limiting & Abuse Protection
- express-rate-limit:
  - https://github.com/express-rate-limit/express-rate-limit
- OWASP: API Security Top 10 (context on threats):
  - https://owasp.org/API-Security/
---
Validation & Sanitization
- express-validator (official docs):
  - https://express-validator.github.io/docs/
- Zod (schema validation alternative):
  - https://zod.dev/
---
Environment Configuration
- dotenv:
  - https://github.com/motdotla/dotenv
---
