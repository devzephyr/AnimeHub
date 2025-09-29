# Week 4 Lab Practice: Interactive Web Pages with DOM & Events

## 1. Objective

- 1.1. Extend your **Lab03 Middle‑earth Legends** project with new DOM features.
- 1.2. Use event listeners (`addEventListener`) for clicks, dropdown changes, and form submissions.
- 1.3. Create, update, and remove DOM elements dynamically.

---

## 2. Instructions

### Step 1: Set Up Workspace

- 2.1. Copy your **Lab03** folder into a new folder named `lab04`.
- 2.2. Keep `index.html`, `styles.css`, and `images/`.
- 2.3. Create/update `script.js` with new DOM & event code.
- 2.4. Create `report04.md` for screenshots and reflection.

---

### Step 2: Available Quests Section

- 2.5. Below your character cards, add a new section:

  - Heading: _Available Quests_.
  - A list (`<ul id="taskList">`) populated by **JavaScript** with quests.
  - A dropdown (`<select id="taskSelect">`) that contains the same quests.

- 2.6. Example quests:

  - Trek to Mount Doom (Mordor)
  - Defend Helm’s Deep (Rohan)
  - Scout Fangorn Forest (Isengard)
  - Explore Mines of Moria (Khazad‑dûm)
  - Guard the White City (Minas Tirith)

- 2.7. Requirements:

  - Both list and dropdown are built from the same `TASKS` array in JS.
  - Clicking a quest in the list highlights it and updates the dropdown.
  - Select an item in dropdown highlights the same `TASK` in the list.

---

### Step 3: Choose Hero & Confirm Section

- 2.8. Add another section:

  - Paragraph `id="questLogText"` to display live quest status.
  - Button `id="confirmQuestBtn"` to start the quest.

- 2.9. Requirements:

  - Clicking a **character card** selects that hero (highlight the card with a `selected` class).
  - Selecting a quest (via list or dropdown) updates the quest log.
  - Clicking **Confirm**:

    - If no hero → log: _Select a hero by clicking a card._
    - If no quest → log: _Select a quest from the dropdown._
    - Otherwise → run quest with random outcome (`Math.random() >= 0.5` = success).
    - Show hero name, quest title, location, roll value, and result.

---

## 3. Deliverables

Students must submit a folder **`lab04`** in their GitHub repo containing:

- 3.1. (15%) — `index.html` with updated content.
- 3.2. (20%) — `script.js` with updated content.
- 3.3. (15%) — `styles.css` with updated content.
- 3.4. (20%) — `report04.md` with screenshots of:
  - Hero card selected.
  - Task list and dropdown populated.
  - Quest Log before confirm.
  - Quest Log after confirm (show success & failure).
- 3.5. (30%) — Reflection:

  - How did you build upon Lab03 code? (10%)
  - What event-handling challenges did you face? (10%)
  - How could you use these patterns in a real project? (10%)

---

## 4. Summary

By completing this lab, you will:

- 4.1. Reinforce DOM manipulation and event handling.
- 4.2. Practice dynamic list building and dropdown syncing.
- 4.3. Create multi-step interactivity: select hero → choose quest → confirm result.
- 4.4. Extend your Lab03 page into a more game‑like, interactive LOTR application.

---

## Appendix A — Acceptance Criteria

**Available Quests**

- Tasks generated dynamically in both list and dropdown.
- Clicking a list item updates dropdown and highlights selection.

**Hero Selection**

- Clicking a hero card selects it (highlighted).
- Only one hero selected at a time.

**Quest Log & Confirm**

- Log updates when hero/quest is selected.
- Confirm button runs quest with random outcome.
- Success if `roll >= 0.5`, failure otherwise.

**UX & Accessibility**

- Cards focusable with Tab, Enter/Space selects.
- Quest Log uses `aria-live="polite"` for updates.
- Page styling consistent with Lab02/03.

---

## Appendix B — Sample Snippets

**Data Array Example:**

```js
const TASKS = [
  { id: "mt-doom", title: "Trek to Mount Doom", location: "Mordor" },
  { id: "helms-deep", title: "Defend Helm’s Deep", location: "Rohan" },
];
```

**Hero Card Selection:**

```js
document.querySelectorAll(".card").forEach((card) => {
  card.tabIndex = 0;
  card.addEventListener("click", () => {
    document
      .querySelectorAll(".card")
      .forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
  });
});
```

**Random Outcome:**

```js
const roll = Math.random();
const success = roll >= 0.5;
questLogText.textContent = success ? "Quest accomplished!" : "Quest failed.";
```

