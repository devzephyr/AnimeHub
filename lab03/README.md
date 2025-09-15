# Week 3 Lab Practice: Interactive Web Pages with JavaScript Basics (Middle-earth Edition)

## 1. Objective:

* 1.1. Link a JavaScript file to an existing HTML/CSS project (your Middle-earth Legends site).
* 1.2. Use variables, conditionals, and loops.
* 1.3. Get an **introductory look** at DOM manipulation by enhancing the cards.
* 1.4. Provide immediate, user-friendly feedback in the browser.

> **Note:** DOM manipulation will be covered in detail in Lecture 04. In this lab, you’ll get a **first preview** by adding simple interactions to the Middle-earth Legends page.

---

## 2. Instructions:

### Step 1: Set Up the Workspace

* 2.1. Copy your **lab02** folder to a new folder named `lab03`.
* 2.2. In `lab03`, ensure you have:

  * `index.html` (reused + updated with interactivity)
  * `styles.css` (reused + updated with added content)
  * `images/` (reused)
  * `script.js` (new)
* 2.3. Create `script.js` in the project root and link it in `index.html` **before** `</body>`:

  ```html
  <script src="script.js"></script>
  ```

---

### Step 2: Show/Hide Character Info (Toggle)

* 2.4. Wrap all cards inside a `<section id="characters">...</section>`.
* 2.5. Add a button (styled `div`) **below the card section** labeled `Show/Hide Characters` with `id="toggleBtn"` and `class="siteBtn"`.
* 2.6. Update CSS: make sure the new container (`characters`) still displays cards correctly. Change the layout container (`card-container`) to be column‑oriented (rename the class to a clearer name, e.g., `main-container`).
* 2.7. Style the toggle button so it is centered with background color, padding, and rounded corners.
* 2.8. In `script.js`, write code so when the button is clicked, the **entire card section** toggles between hidden and visible.

**Reference snippet:**

```javascript
const toggleBtn = document.getElementById("toggleBtn");
const section = document.getElementById("characters");

toggleBtn.onclick = () => {
  const hidden = section.style.display === "none" || section.style.display === "";
  section.style.display = hidden ? "flex" : "none";
  toggleBtn.textContent = hidden ? "Hide Characters" : "Show Characters";
};
```
---

### Step 3: Character Greeting

* 2.9. Below the cards, add a text **input** with `id="heroName"`, a button (styled `div`) with `id="greetBtn"` and `class="siteBtn"`, and a **paragraph** with `id="greetMsg"`.
* 2.10. When clicked, the button should read the input and:

  * If blank, display: `Please enter a character name.`
  * If it matches one of the listed heroes (e.g., Frodo, Gimli, Legolas, Gandalf, Aragorn), display: `Welcome, <name> of Middle-earth!`.
  * Otherwise, display: `That hero is not part of our fellowship.`

**Reference snippet:**

```javascript
const greetBtn = document.getElementById("greetBtn");
const nameInput = document.getElementById("heroName");
const msg = document.getElementById("greetMsg");

const heroes = ["Frodo", "Gimli", "Legolas", "Gandalf", "Aragorn"];

greetBtn.onclick = () => {
  const name = nameInput.value.trim();
  if (!name) {
    msg.textContent = "Please enter a character name.";
  } else if (heroes.includes(name)) {
    msg.textContent = `Welcome, ${name} of Middle-earth!`;
  } else {
    msg.textContent = "That hero is not part of our fellowship.";
  }
};
```

---

### Step 4: Additional Optimization

* 2.11. Add a proper `<label>` for the input field (e.g., `<label for="heroName">Hero name:</label>`).
* 2.12. On first page load, ensure the toggle button says **Hide Characters** and the cards are visible. Clicking it should hide the cards and change the button text.
* 2.13. Update the greeting logic so that input is **case-insensitive**. For example, typing `frodo`, `FRODO`, or `Frodo` should all be recognized as `Frodo`.

---

## 3. Deliverables:

Students must submit a folder **`lab03`** in their GitHub repo containing:

* 3.1. (25%) — `index.html` updated with buttons, inputs, and `script.js` linked.
* 3.2. (45%) — `report03.md` with screenshots of:

  * Characters section toggled hidden and visible.
  * Greeting for a valid hero (case-insensitive) and for an invalid hero.
  * Initial page load showing cards visible and button text **Hide Characters**.
* 3.3. (30%) — Reflection:

  * How did you adapt Lab02’s layout to support JavaScript features? (10%)
  * How did you ensure the features worked with different inputs? (10%)
  * What challenges did you face and how did you solve them? (10%)

---

## 4. Summary:

By completing this lab, you will:

* 4.1. Enhance the Middle-earth Legends page with interactivity.
* 4.2. Use variables, conditionals, and loops in meaningful ways.
* 4.3. Get your first look at DOM manipulation by toggling content and validating input.
* 4.4. Reinforce accessible, responsive design from Lab02 while adding interactivity.

---

## Appendix A — Acceptance Criteria (for marking)

**Toggle behavior**

* On page load, cards are visible and button says **Hide Characters**.
* Button toggles the visibility of the characters section.
* Button text updates correctly.

**Greeting behavior**

* Blank input shows a helpful message.
* Valid hero input (case-insensitive) shows a welcome message with the hero’s name.
* Invalid hero input shows a rejection message.

**UX & Accessibility**

* Buttons are keyboard accessible with visible focus styles.
* Inputs are labeled or have clear instructions.
* Page remains consistent with Lab02’s visual design and responsive layout.