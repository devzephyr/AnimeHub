# Week 2 Lab Practice: Creating Responsive Layouts and Accessible Pages

## 1. Objective:

* 1.1. Create a new folder for your lab work.
* 1.2. Build a semantic HTML5 page using proper structure (header, nav, main, aside, footer).
* 1.3. Add the **skip to main content link** and improve its design using CSS.
* 1.4. Style and improve the navigation bar with Flexbox techniques.
* 1.5. Replace the placeholder `{{ your name here }}` in the footer with your own name.
* 1.6. Complete the missing CSS sections to apply Flexbox/Grid layout, responsive design, and accessibility improvements.

---

## 2. Instructions:

### Step 1: Set Up the Workspace
* 2.1. Create a folder named `lab02`.
* 2.2. Inside it, create two files:
  * `index.html` (starter provided by instructor)
  * `styles.css` (starter provided by instructor)
* 2.3. Add an `images` folder containing the five character images provided by the instructor.

---

### Step 2: Update the HTML Structure
* 2.4. Open `index.html`.
* 2.5. Confirm the semantic elements are present (header, nav, main, footer).
* 2.6. Replace the footer placeholder with your name.

---

### Step 3: Improve Accessibility and Navigation
* 2.7. Style the **skip to main content** link so it is hidden by default and becomes clearly visible when focused.
* 2.8. Style the **navigation bar** using Flexbox so links are aligned horizontally on desktop and stack vertically on mobile.
* 2.9. Ensure links have visible hover and focus states.

---

### Step 4: Work on CSS for Layout and Responsiveness
* 2.10. **Card Gallery (container) — implement Flexbox layout** so that:
  - Cards **wrap** onto the next line when the row is full.
  - Cards are **horizontally centered** within the container.
  - There is a **uniform gap** between cards (target: about the size of body text, e.g., ~1em).
  - The gallery has **inner padding** around all sides (target: about 2em) so cards don’t touch the page edge.
* 2.11. **Card Back (details panel) — use Flexbox for vertical layout** so that:
  - The text on the back of each card is laid out in a **column**.
  - Content is **centered** both vertically and horizontally.
  - There is **comfortable padding** inside the back face (target: about 1em).
* 2.12. **Skip Link styling** so that:
  - It is **visually hidden by default** off‑screen (still focusable by keyboard).
  - It becomes **clearly visible** (contrasting background, padding, rounded corners) **when focused**.
* 2.13. **Navigation bar styling** using Flexbox so that:
  - Links appear in a **row** on desktop with **even spacing**.
  - On narrow screens, links **stack vertically** and remain centered.
  - Links have **visible focus styles** (outline or background change) and a subtle **hover** state.
* 2.14. **Responsive adjustments** (media queries) so that:
  - Card layout looks balanced on desktop (multiple cards per row), tablet (fewer per row), and mobile (single column).
  - Images remain **fluid** (never overflow their cards).
  - Spacing/typography scales appropriately for smaller screens.
---

## 3. Deliverables:

Students must submit a folder `lab02` in their GitHub repo containing:

* 3.1. (25%) - `index.html` with semantic structure and updated footer (student’s name).
* 3.2. (25%) - `styles.css` implementing **all required CSS tasks** from Step 4 (gallery wrapping/centering/gap/padding, card-back column centering/padding, skip link visibility on focus, nav Flexbox behavior, responsive adjustments).
* 3.3. (20%) - `report02.md` with screenshots of:
  - Desktop layout (multiple cards per row, centered, with visible gap and container padding).
  - Mobile layout (single-column cards, stacked nav, visible skip-link on focus).
* 3.4. (30%) - Reflection:
  * How did you improve the skip link and navigation bar? (10%)
  * How did you make the layout responsive? (10%)
  * What challenges did you face and how did you solve them? (10%)

---

## 4. Summary:

By completing this lab, you will:

* 4.1. Practice semantic HTML5 structure.
* 4.2. Improve accessibility features (skip link, focus states).
* 4.3. Style and align navigation using Flexbox.
* 4.4. Apply Flexbox/Grid and media queries to make layouts responsive.
* 4.5. Gain confidence in producing professional, user-friendly pages.

---

## Appendix A — CSS Acceptance Criteria (for marking)
**.card-container**
- Wrapping enabled; cards move to a new line when needed.
- Cards are centered in the available space.
- Consistent gap between cards (~1em) and container padding (~2em).

**.card-back**
- Uses Flexbox in column direction.
- Content centered vertically and horizontally.
- Inner padding around text (~1em).

**Skip link**
- Off-screen by default; fully visible on :focus.
- Readable contrast and discernible focus style.

**Navigation**
- Row layout with even spacing on desktop; stacked, centered layout on mobile.
- Hover and focus styles are clearly visible.

**Responsiveness**
- Desktop: multiple cards per row; Mobile: one card per row.
- Images scale without distortion; no horizontal scrolling.
