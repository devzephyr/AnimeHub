# Lab 04 Report — Interactive Web Pages with DOM & Events

- Name: Adeyemi Folarin
- Student ID: 123224214
- Date: 29th of September, 2025

---

## Screenshots

1) Hero card selected

![Hero card selected](screenshots/hero-selected.png)

2) Task list and dropdown populated

![Tasks populated](screenshots/tasks-populated.png)

3) Quest Log before confirm

![Quest Log before confirm](screenshots/questlog-before.png)

4) Quest Log after confirm — success

![Quest Log after confirm (success)](screenshots/questlog-success.png)

5) Quest Log after confirm — failure

![Quest Log after confirm (failure)](screenshots/questlog-failure.png)

---

## Reflection

### How did you build upon Lab03 code?
- I carried over character card structure and styling.
- i wrapped cards in a `#characters` section and added selection highlighting.
- I also added new sections for “Available Quests” and “Quest Log,” wiring them into the existing page flow.

### What event-handling challenges did you face?
- By synchronizing the quest list and dropdown so both reflect the same selection.
- By ensuring only one hero card is selected at a time and supporting keyboard activation (Enter/Space).
- Managing state (selected hero, selected task) and reflecting it in the live Quest Log without race conditions.

### How could you use these patterns in a real project?
- Mirror list ↔ dropdown synchronization in admin UIs where multiple representations of the same data must stay in sync.
- Apply accessible selection patterns (focusable cards, keyboard shortcuts) to improve UX inclusivity.
- Use centralized state and live status messages (aria-live regions) to guide users through multi-step flows.

---

## Notes
- TASKS are generated dynamically in both the list and dropdown.
- Confirm uses a random roll (`>= 0.5` = success) and logs the result with hero, quest, location, and roll value.
