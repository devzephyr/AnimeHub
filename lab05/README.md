# Week 5 Lab Practice: Client-Side Form Validation & UX

## 1. Objective

- 1.1. Extend your **Lab04 Middle‑earth Legends** project with a new "Join the Fellowship" registration form.
- 1.2. Apply **HTML5 validation attributes** and **custom JavaScript validation**.
- 1.3. Provide **real-time feedback** and clear, user-friendly error messages.
- 1.4. Improve accessibility and user experience.

---

## 2. Instructions

### Step 1: Set Up Workspace

- 2.1. Copy your **Lab04** folder into a new folder named `Lab05`.
- 2.2. Keep all previous files (`index.html`, `styles.css`, `script.js`, `images/`).
- 2.3. Create/update `report05.md` for screenshots and reflection.

---

### Step 2: Add Registration Form

- 2.4. Below your quest sections, add a new section with a heading: Join the Fellowship.
- 2.5. Create a form (`<form id="joinForm">`) with the following fields:
  - Name (required, min 2 chars)
  - Email (required, valid email format)
  - Password (required, min 8 chars, must include uppercase, lowercase, number, special character)
  - Age (required, number, min 1, max 999)
  - Character Class (dropdown: Hobbit, Elf, Dwarf, Human, Wizard)
  - Submit button

---

### Step 3: HTML5 Validation

- 2.6. Use HTML5 attributes (`required`, `type`, `minlength`, `min`, `max`, `pattern`, etc.) to enforce basic rules.
- 2.7. Style valid/invalid fields using CSS pseudo-classes (`:valid`, `:invalid`).

---

### Step 4: Custom JavaScript Validation

- 2.8. In `script.js`, add event listeners to:
  - Prevent form submission if any field is invalid.
  - Show **custom error messages** below each field when invalid.
  - Provide **real-time feedback** as the user types (e.g., password strength, email format).
- 2.9. Use `event.preventDefault()` to stop submission on errors.
- 2.10. On successful validation, show a success message and clear the form.

---

### Step 5: Accessibility & UX

- 2.11. Ensure error messages are accessible (e.g., use `aria-live="polite"`).
- 2.12. Make all form fields keyboard accessible.
- 2.13. Use clear, friendly language for all messages.

---

## 3. Deliverables

Submit a folder **`Lab05`** in your GitHub repo containing:

- 3.1. (15%) — `index.html` with the new form and validation attributes.
- 3.2. (20%) — `script.js` with custom validation and feedback.
- 3.3. (15%) — `styles.css` with improved form and error styling.
- 3.4. (20%) — `report05.md` with screenshots of:
  - Form with errors shown.
  - Real-time feedback in action.
  - Form successfully submitted.
- 3.5. (30%) — Reflection:
  - How did you combine HTML5 and JS validation? (10%)
  - What UX improvements did you make? (10%)
  - How would you apply these patterns in a real project? (10%)

---

## 4. Summary

By completing this lab, you will:

- 4.1. Practice HTML5 and JavaScript form validation.
- 4.2. Provide real-time, accessible feedback to users.
- 4.3. Improve the usability and accessibility of your web forms.
- 4.4. Build on your Lab04 project with professional-quality form UX.

---

## Appendix A — Acceptance Criteria

**Form Validation**

- All fields use appropriate HTML5 validation attributes.
- Custom JS validation provides real-time feedback and custom error messages.
- Form does not submit if any field is invalid.

**User Experience**

- Error messages are clear, specific, and accessible.
- Fields are styled for valid/invalid states.
- Success message shown on valid submission.

**Accessibility**

- Error messages use `aria-live`.
- All fields and buttons are keyboard accessible.

