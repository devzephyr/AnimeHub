# Assignment 01: Responsive Avengers Website

## 1. Objective

* 1.1. Apply HTML, CSS, and JavaScript knowledge to build a **3-page responsive website**.
* 1.2. Demonstrate **responsive design** and **basic accessibility**.
* 1.3. Use **JavaScript fundamentals**, **DOM manipulation**, and **event handling**.
* 1.4. Implement a **form with client-side validation**.

---

## 2. Instructions

### Step 1: Set Up Workspace

* 2.1. Create a folder named `assignment01`.
* 2.2. Inside, create:

  * `index.html` (Homepage)
  * `heroes.html` (Character Profiles)
  * `join.html` (Join Avengers Form)
  * `styles.css` (shared stylesheet)
  * `script.js` (JavaScript file)
  * `images/` (images for heroes, logo, etc.)
  * `report01.md` (reflection + screenshots)

---

### Step 2: Navbar

* 2.3. Create a **navigation bar** at the top of every page (`index.html`, `heroes.html`, `join.html`).
* 2.4. Navbar should include links to all three pages:

  * Home
  * Heroes
  * Join
* 2.5. The navbar must be consistent across pages and remain visible at the top.
* 2.6. Use CSS to style the navbar (horizontal layout, hover effect, clear highlight for current page).

---

### Step 3: Homepage

* 2.7. In `index.html`:

  * Add a **header** with “Avengers Assemble!” below the navbar.
  * Add a **mission statement** section: 
    * Sample content:
    ```
    The Avengers are a team of extraordinary individuals who come together to defend humanity against threats that no single hero can face alone. United by a shared mission, they combine courage, intelligence, strength, and resilience to protect peace and justice across the world. Each member brings unique abilities, but it is their cooperation and teamwork that make them truly powerful. The Avengers stand as a symbol of hope and responsibility, proving that when people work together, even the most difficult challenges can be overcome. Their mission is not only to fight enemies but also to inspire others to rise above fear and division. Whether defending cities from danger, supporting those in need, or preparing for the unknown, the Avengers are committed to protecting Earth and its people at any cost. They remind us that true strength is found in unity and in the will to do what is right.
    ```
  * Add at least **one image or banner**.
  * Footer with copyright (your name + year).

---

### Step 4: Character Profiles

* 2.8. In `heroes.html`:

  * Create a **grid of hero cards** for:

    * Iron Man
    * Captain America
    * Hulk
    * Black Widow
    * Thor
    * Hawkeye
  * Each card must include:

    * Hero image (front).
    * Hero details (back) revealed on hover or click (DOM event).
  * Make cards **responsive** (2–3 per row on large screens, stacked on mobile).

  * Sample Detail：
    - **Iron Man**: A genius inventor and billionaire who uses his intelligence and technology to build powerful armored suits. Iron Man represents creativity, innovation, and the belief that science and determination can overcome overwhelming odds.
    - **Captain America**: A super-soldier enhanced to peak human ability, he embodies honor, leadership, and determination. With his unbreakable shield, Captain America inspires his teammates and leads by example, always putting others before himself.
    - **Hulk**: A brilliant scientist whose exposure to gamma radiation transforms him into the Hulk, a being of immense strength and resilience. Despite his struggles to control his power, he channels it to protect those who cannot protect themselves.
    - **Black Widow**: A skilled spy and expert martial artist trained in espionage and combat. Black Widow uses her intelligence, stealth, and agility to outwit enemies and support her teammates on critical missions.
    - **Thor**: The god of thunder from Asgard who wields the enchanted hammer Mjölnir. Thor combines divine strength with a sense of honor and loyalty, defending both his home and Earth from cosmic and earthly threats alike.
    - **Hawkeye**: A master archer with unparalleled accuracy and sharp instincts. Though he has no superpowers, his dedication, skill, and quick thinking make him a vital member of the team.
* You should include alt text for all images, 
  - e.g.:
    - Iron Man suit glowing in red and gold.
    - Captain America holding a shield.
    - Hulk roaring in green form.
    - Black Widow ready in combat stance.
    - Thor holding Mjölnir with lightning.
    - Hawkeye aiming a bow and arrow.

---

### Step 5: Join the Avengers Form

* 2.9. In `join.html`:

  * Create a form with fields:

    * Full Name (required)
    * Hero Alias (required)
    * Email (must be valid)
    * Power Type (dropdown, e.g., Tech, Strength, Magic, Stealth)
    * Motivation (textarea, min length 20 chars)
  * Add **client-side validation** with JavaScript:

    * Prevent empty submissions.
    * Validate email format.
    * Show inline error messages if invalid.
  * Add a **Submit** button.
  * On valid submission: display confirmation message in a **quest log** section (DOM update).

---

### Step 6: Interactivity & DOM

* 2.10. Requirements:

  * **Hero cards** should react to click/hover (e.g., flip effect or highlight).
  * Form validation must run in real time (on blur or input).
  * Use at least **two event listeners** (`click`, `input`, `submit`).

---

## 3. Deliverables

Submit `assignment01` folder in your GitHub repo containing:

* 3.1. (15%) — `index.html` homepage with mission statement + navbar.
* 3.2. (20%) — `heroes.html` with interactive, responsive hero cards + navbar.
* 3.3. (20%) — `join.html` form with JavaScript validation + navbar.
* 3.4. (15%) — `styles.css` with responsive design (Flexbox/Grid, media queries).
* 3.5. (15%) — `script.js` with DOM and event handling.
* 3.6. (15%) — `report01.md` with:

  * Screenshots of each page.
  * Reflection on what you learned and challenges faced.

---

## 4. Summary

By completing this assignment, you will:

* 4.1. Practice building a **multi-page website** with consistent navigation.
* 4.2. Apply **responsive design** and accessibility techniques.
* 4.3. Use **JavaScript to add interactivity and validation**.
* 4.4. Prepare for full-stack development by mastering front-end foundations.

---

## Appendix A — Acceptance Criteria

**Navbar**

* Navbar present on all three pages.
* Links navigate correctly.
* Current page highlighted.

**Homepage**

* Mission statement visible and styled.
* Banner image included.

**Heroes Page**

* Six hero cards present.
* Cards interactive on click/hover.
* Layout adjusts for desktop and mobile.

**Join Form**

* Form fields validated in real time.
* Invalid fields show inline error messages.
* Confirmation message displayed on success.

**Code Quality**

* CSS organized and reusable.
* JavaScript separated from HTML (no inline).
* Semantic HTML and ARIA roles for accessibility.

**Copyright Disclaimer**

- This assignment uses references to the Avengers and its characters (Iron Man, Captain America, Hulk, Black Widow, Thor, and Hawkeye) for educational purposes only. All names, images, and related intellectual property belong to Marvel Comics and The Walt Disney Company.


- You should use this content strictly for classroom learning, practice, and non-commercial academic projects. Any reproduction or distribution beyond the scope of this course may infringe on copyright. If you publish your work publicly (e.g., GitHub portfolio), you should replace these references with original or generic content to avoid potential copyright issues.