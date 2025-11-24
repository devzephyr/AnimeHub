# Week 10 Lab Practice: AI-Powered Chatbot Integration

"Speak, Friend, and Enter" – The Gate of Moria Challenge

---

## 1. Objective

- 1.1. Build a small Express-based backend that integrates with the OpenAI JavaScript SDK (or a provided mock AI endpoint).
- 1.2. Implement a fantasy-themed Mines of Moria gatekeeper chatbot that challenges users with a riddle.
- 1.3. Validate user answers and determine whether the Doors of Durin open.
- 1.4. Practice the request → backend → AI → response → DOM update flow from Lecture 10.
- 1.5. Serve a minimal frontend UI that displays the conversation (user + AI bubbles). A ready-made UI template is provided in src/public.
- 1.6. Add interaction features: typing indicators, history, animations.
- 1.7. Use environment variables securely and implement basic safeguards.
- 1.8. Use your own OpenAI API key if possible. If you cannot create an account, email your instructor to request a temporary API key to complete this lab.

Theme: You stand before the West-gate of Moria. The ancient gatekeeper spirit challenges adventurers with riddles. Answer correctly, and the doors will open.

---

## 2. Instructions

### Step 1: Project Setup

- 2.1. Create a new folder Lab10 in your course repo.
- 2.2. Initialize a Node project:

```bash
npm init -y
npm i express cors helmet morgan dotenv openai express-rate-limit
npm i -D nodemon
```

- 2.3. Add folder structure:

```
Lab10/
├─ src/
│  ├─ app.js
│  ├─ server.js
│  ├─ routes/
│  │  └─ moria.routes.js
│  ├─ controllers/
│  │  └─ moria.controller.js
│  ├─ middlewares/
│  │  ├─ logger.js
│  │  └─ errorHandler.js
│  ├─ utils/
│  │  └─ responses.js
│  └─ public/               ← Provided UI template (you may customize)
│     ├─ index.html
│     ├─ styles.css
│     └─ script.js
├─ .env  
├─ .env.example
├─ report10.md
└─ README.md
```

- Note: The src/public folder is included in this lab. Students should use it as a starting template instead of creating the frontend from scratch.

- 2.4. Update package.json scripts:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

---

### Step 2: Core App Wiring

- 2.5. In app.js:
  - Load dotenv
  - Apply middleware: helmet, cors, morgan, JSON/urlencoded parsers
  - Custom logger
  - Serve static frontend from src/public
  - Mount /api/v1/moria
  - Add 404 + centralized error handler

- 2.6. In server.js:
  - Load dotenv
  - Import app
  - app.listen(PORT || 3000)
  - Log server start

---

### Step 3: Response Helpers

Create responses.js:

```js
const ok = (data, meta = {}) => ({ data, error: null, meta });
const fail = (message, details = null, meta = {}) => ({
  data: null,
  error: { message, ...(details ? { details } : {}) },
  meta
});
module.exports = { ok, fail };
```

---

## Step 4: Moria Routes and Controller

### Routes (moria.routes.js)

```
GET  /api/v1/moria/start   → first gatekeeper message + the riddle
POST /api/v1/moria/ask     → send user prompt, receive AI reply, check correctness
```

### Controller (moria.controller.js)

- Import OpenAI:

```js
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

- Maintain in-memory state for this lab:
  - conversationHistory: array of { role, content }
  - riddleState: { riddle, answer, acceptable: string[], rules: string[], hint?: string }

- On /start:
  - If no riddleState exists (or you want a fresh one each server start), call generateRiddle() (AI-backed if API key is present, otherwise mock) and store it.
  - Send the Gatekeeper greeting and the riddle text as the first message.

- On /ask:
  - Record the user message in conversationHistory.
  - Use validateAnswer(userText, riddleState) to determine if the answer is acceptable.
    - If correct → return: "The Doors of Durin swing open. You may enter." and include a flag like { opened: true } in meta.
    - If incorrect → return an AI (or mock) reply that nudges the user (optionally provide riddleState.hint after a few wrong attempts).

- Use the OpenAI Responses API to generate a riddle and acceptance rules/functions:

```js
async function generateRiddleWithAI() {
  const system = `You are the Gatekeeper at the Doors of Durin. Generate a single, clean fantasy riddle for an adventurer to solve. Output strict JSON only, matching this schema:
  {"riddle": string, "answer": string, "acceptable": string[], "rules": string[], "hint": string}
  Rules:
  - riddle: concise 1–3 sentences, no spoilers.
  - answer: the canonical expected answer (single word or short phrase).
  - acceptable: variations/synonyms/plurals/misspellings that should count as correct.
  - rules: short normalization/validation rules (e.g., lowercase, trim, strip punctuation, allow synonyms).
  - hint: a subtle hint that doesn’t reveal the answer outright.
  - THE OUTPUT MUST BE VALID JSON ONLY.`;

  const response = await client.responses.create({
    model: "gpt-5",
    input: [{ role: "system", content: system }]
  });

  const text = response.output_text?.trim?.() ?? "";
  // Ensure we only parse JSON (strip any leading/trailing markdown if needed)
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  const payload = jsonStart !== -1 ? text.slice(jsonStart, jsonEnd + 1) : "{}";
  return JSON.parse(payload);
}
```

- Mock fallback (if no API key or API fails):

```js
function generateRiddleMock() {
  const pool = [
    {
      riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
      answer: "echo",
      acceptable: ["echo", "an echo", "the echo"],
      rules: ["lowercase", "trim", "strip punctuation", "allow articles"],
      hint: "It answers when you call into the mountains."
    },
    {
      riddle: "Voiceless it cries, wingless flutters, toothless bites, mouthless mutters. What is it?",
      answer: "wind",
      acceptable: ["wind", "the wind"],
      rules: ["lowercase", "trim", "strip punctuation", "allow articles"],
      hint: "You feel it but cannot see it."
    },
    {
      riddle: "The more of this there is, the less you see. What is it?",
      answer: "darkness",
      acceptable: ["darkness", "the dark", "dark"],
      rules: ["lowercase", "trim", "strip punctuation", "allow synonyms"],
      hint: "It reigns in the deepest mines."
    }
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}
```

- Validation helpers:

```js
function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\p{Diacritic}]/gu, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function validateAnswer(userText, state) {
  if (!state) return false;
  const user = normalize(userText);
  const accepted = new Set([
    normalize(state.answer),
    ...state.acceptable.map(normalize)
  ]);
  if (accepted.has(user)) return true;

  // Optional rule-based checks (prefix articles, plural/singular, synonyms)
  if (state.rules?.some(r => /allow articles/i.test(r))) {
    const a = user.replace(/^(a|an|the)\s+/, '');
    if (accepted.has(a)) return true;
  }
  if (state.rules?.some(r => /allow synonyms/i.test(r))) {
    // Light heuristic: check if user contains canonical within small edit distance
    if (user.includes(normalize(state.answer))) return true;
  }
  return false;
}
```

- Wire up endpoints:
  - /start → ensure riddleState exists (AI or mock), then return the greeting + the riddle.
  - /ask → evaluate with validateAnswer; if correct → success message; else → AI (or mock) reply.

---

## Step 5: Frontend Interface

This lab includes a ready-made frontend in src/public to save time. You may customize it.

- index.html
  - Title: Gate of Moria
  - Chat container
  - Input bar + Send button
  - SVG of the door (closed) and hidden open state

- styles.css
  - Different colors for user vs AI messages
  - Blue glowing runes for the door
  - Typing bubble animations

- script.js
  - On load: fetch /api/v1/moria/start
  - Display messages in chat box
  - On submit:
    - Add user bubble
    - Add “AI is thinking…” bubble
    - POST to /api/v1/moria/ask
    - Replace typing bubble with real reply
    - If reply suggests opening (or backend marks opened: true), swap door images

Note: The provided UI already implements these behaviors; focus your effort on wiring the backend, riddle generation, and answer validation logic.

---

## Step 6: API Key Handling

VERY IMPORTANT:

- Use your own API key if possible.
- If you cannot obtain one, email the instructor for a temporary key.
- **NEVER** commit your .env file.
- The backend should be the only place where the key is used.

---

## Step 7: Run and Test

- Start lab:

```bash
npm run dev
```

- Visit: http://localhost:3000
- Expected flow:
  1. Gatekeeper greets you and presents a riddle (AI-generated if possible; otherwise mock).
  2. User answers.
  3. Backend validates using your rules/functions.
  4. AI (or mock) responds.
  5. Correct answer → door opens.

---

## 3. Deliverables

- 3.1 (20%) — Project Structure
  - Correct folder layout
  - Middleware + static setup
  - .env and .env.example

- 3.2 (30%) — Moria Controller + SDK + Riddle Logic
  - Working /start and /ask
  - AI-backed random riddle generation with fallback mock
  - Proper parsing of AI JSON output (or robust fallback)
  - Correct answer detection via validateAnswer with normalization/rules

- 3.3 (20%) — Frontend UI
  - Chat interface (you may use and customize the provided template)
  - Door animation
  - Loading indicator

- 3.4 (15%) — Error Handling
  - No crashes
  - Clean fallbacks
  - Proper JSON response shape

- 3.5 (15%) — report10.md
  - Screenshots: Initial greeting + riddle, wrong answer, correct answer, door opening
  - Reflection: What felt different from CRUD labs? What was easier with SDK? What was harder?

---

## 4. Summary

By completing this lab, students will:

- Build an AI-powered backend using OpenAI SDK.
- Generate a random riddle and validate user answers with clear rules.
- Understand conversation loops and message history.
- Implement dynamic UI updates.
- Practice environment security and request flow.
- Create an interactive fantasy-themed chatbot.

---

## Appendix A — Acceptance Criteria

### Functional

- /start returns an intro message and a riddle (AI-generated if key present; otherwise mock/random).
- /ask returns AI or mock reply.
- Robust detection of correct riddle answer via validateAnswer (normalization and rules).
- Door animation triggers on success (front-end swap or meta.opened flag).
- No page reloads.

### UX

- Distinct message bubbles
- Typing indicator
- Smooth animations

### Code

- Clean structure
- Error handling
- Proper response shape { data, error, meta }