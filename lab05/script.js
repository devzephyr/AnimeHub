// Toggle Characters Section
var toggleBtn = document.getElementById("toggleBtn");
var section = document.getElementById("characters");

if (toggleBtn) {
  // Initial state: show cards and set button text
  toggleBtn.textContent = "Hide Characters";

  toggleBtn.onclick = function () {
    if (section.style.display === "none") {
      section.style.display = "flex";
      toggleBtn.textContent = "Hide Characters";
      toggleBtn.setAttribute("aria-expanded", "true");
    } else {
      section.style.display = "none";
      toggleBtn.textContent = "Show Characters";
      toggleBtn.setAttribute("aria-expanded", "false");
    }
  };

  // Basic keyboard support (Enter key)
  toggleBtn.onkeydown = function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      toggleBtn.onclick();
    }
  };
}

// Greeting Logic (case‑insensitive, simple if/else)
var greetBtn = document.getElementById("greetBtn");
var nameInput = document.getElementById("heroName");
var msg = document.getElementById("greetMsg");

function greet() {
  var name = nameInput.value.trim();
  if (name === "") {
    msg.textContent = "Please enter a character name.";
    return;
  }

  var lower = name.toLowerCase();
  var canonical = "";
  if (lower === "frodo") {
    canonical = "Frodo";
  } else if (lower === "gimli") {
    canonical = "Gimli";
  } else if (lower === "legolas") {
    canonical = "Legolas";
  } else if (lower === "gandalf") {
    canonical = "Gandalf";
  } else if (lower === "aragorn") {
    canonical = "Aragorn";
  }

  if (canonical !== "") {
    msg.textContent = "Welcome, " + canonical + " of Middle-earth!";
  } else {
    msg.textContent = "That hero is not part of our fellowship.";
  }
}

if (greetBtn) {
  greetBtn.onclick = greet;
  // Basic keyboard support (Enter key)
  greetBtn.onkeydown = function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      greet();
    }
  };
}

// ===== Lab04: Tasks, Hero Selection, and Confirm =====

// Data Array (Appendix B style)
const TASKS = [
  { id: "mt-doom", title: "Trek to Mount Doom", location: "Mordor" },
  { id: "helms-deep", title: "Defend Helm’s Deep", location: "Rohan" },
  { id: "fangorn", title: "Scout Fangorn Forest", location: "Isengard" },
  { id: "moria", title: "Explore Mines of Moria", location: "Khazad-dûm" },
  { id: "minas-tirith", title: "Guard the White City", location: "Minas Tirith" },
];

// Elements
const taskList = document.getElementById("taskList");
const taskSelect = document.getElementById("taskSelect");
const questLogText = document.getElementById("questLogText");
const confirmQuestBtn = document.getElementById("confirmQuestBtn");

let selectedTaskId = null;
let selectedHeroName = null;

function renderTasks() {
  if (!taskList || !taskSelect) return;

  // Populate list
  TASKS.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = `${t.title} (${t.location})`;
    li.dataset.id = t.id;
    li.tabIndex = 0;
    li.addEventListener("click", () => setSelectedTaskById(t.id));
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setSelectedTaskById(t.id);
      }
    });
    taskList.appendChild(li);
  });

  // Populate select
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "— Select a quest —";
  taskSelect.appendChild(defaultOpt);

  TASKS.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = `${t.title} (${t.location})`;
    taskSelect.appendChild(opt);
  });

  taskSelect.addEventListener("change", (e) => {
    setSelectedTaskById(e.target.value || null);
  });
}

function setSelectedTaskById(id) {
  selectedTaskId = id;

  // Highlight list item
  if (taskList) {
    taskList.querySelectorAll("li").forEach((li) => {
      li.classList.toggle("selected", li.dataset.id === id);
    });
  }

  // Sync dropdown
  if (taskSelect) {
    taskSelect.value = id || "";
  }

  updateQuestLog();
}

function getSelectedTask() {
  return TASKS.find((t) => t.id === selectedTaskId) || null;
}

// Hero Card Selection (Appendix B)
document.querySelectorAll(".card").forEach((card) => {
  card.tabIndex = 0;
  card.addEventListener("click", () => {
    document
      .querySelectorAll(".card")
      .forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");

    // derive hero name from card content
    const h2 = card.querySelector(".card-back h2");
    selectedHeroName = h2 ? h2.textContent.trim() : null;
    updateQuestLog();
  });
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      card.click();
    }
  });
});

function updateQuestLog() {
  if (!questLogText) return;
  const task = getSelectedTask();
  const hero = selectedHeroName;
  if (hero && task) {
    questLogText.textContent = `${hero} prepared for: ${task.title} in ${task.location}.`;
  } else if (hero && !task) {
    questLogText.textContent = `${hero} selected. Choose a quest from the dropdown.`;
  } else if (!hero && task) {
    questLogText.textContent = `Quest selected: ${task.title} (${task.location}). Select a hero by clicking a card.`;
  } else {
    questLogText.textContent = "Select a hero and a quest to begin.";
  }
}

if (confirmQuestBtn) {
  confirmQuestBtn.addEventListener("click", () => {
    const task = getSelectedTask();
    const hero = selectedHeroName;
    if (!hero) {
      questLogText.textContent = "Select a hero by clicking a card.";
      return;
    }
    if (!task) {
      questLogText.textContent = "Select a quest from the dropdown.";
      return;
    }

    // Random Outcome (Appendix B)
    const roll = Math.random();
    const success = roll >= 0.5;
    questLogText.textContent = `${hero} attempted: ${task.title} in ${task.location}. Roll: ${roll.toFixed(2)} — ${success ? "Quest accomplished!" : "Quest failed."}`;
  });
}

// Initialize tasks UI
renderTasks();

// ===== Lab05: Join the Fellowship — Form Validation =====
(function () {
  const form = document.getElementById('joinForm');
  if (!form) return;

  const nameInput = document.getElementById('regName');
  const emailInput = document.getElementById('regEmail');
  const passwordInput = document.getElementById('regPassword');
  const ageInput = document.getElementById('regAge');
  const classSelect = document.getElementById('regClass');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const passwordHelp = document.getElementById('passwordHelp');
  const ageError = document.getElementById('ageError');
  const classError = document.getElementById('classError');
  const successMsg = document.getElementById('joinSuccess');

  function setError(input, errEl, message) {
    if (!input || !errEl) return false;
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      errEl.textContent = message;
      return true;
    } else {
      input.removeAttribute('aria-invalid');
      errEl.textContent = '';
      return false;
    }
  }

  function validateName() {
    const v = (nameInput.value || '').trim();
    if (v.length === 0) return setError(nameInput, nameError, 'Name is required.');
    if (v.length < 2) return setError(nameInput, nameError, 'Name must be at least 2 characters.');
    return setError(nameInput, nameError, '');
  }

  function validateEmail() {
    const v = (emailInput.value || '').trim();
    if (v.length === 0) return setError(emailInput, emailError, 'Email is required.');
    // Use built-in typeMismatch for simple check
    if (emailInput.validity && emailInput.validity.typeMismatch) {
      return setError(emailInput, emailError, 'Enter a valid email (e.g., hero@shire.me).');
    }
    return setError(emailInput, emailError, '');
  }

  function passwordCriteria(pw) {
    return {
      length: pw.length >= 8,
      lower: /[a-z]/.test(pw),
      upper: /[A-Z]/.test(pw),
      digit: /\d/.test(pw),
      special: /[^A-Za-z0-9]/.test(pw),
    };
  }

  function strengthLabel(pw) {
    const c = passwordCriteria(pw);
    const count = [c.length, c.lower, c.upper, c.digit, c.special].filter(Boolean).length;
    if (pw.length === 0) return '';
    if (count <= 2) return 'Strength: weak';
    if (count === 3 || count === 4) return 'Strength: medium';
    return 'Strength: strong';
  }

  function validatePassword() {
    const pw = passwordInput.value || '';
    // Update assistive strength text in real-time
    const s = strengthLabel(pw);
    passwordHelp.textContent = s ? s : 'Must include uppercase, lowercase, number, and special character.';

    if (pw.length === 0) return setError(passwordInput, passwordError, 'Password is required.');
    if (pw.length < 8) return setError(passwordInput, passwordError, 'Password must be at least 8 characters.');
    const c = passwordCriteria(pw);
    if (!c.upper) return setError(passwordInput, passwordError, 'Include at least one uppercase letter.');
    if (!c.lower) return setError(passwordInput, passwordError, 'Include at least one lowercase letter.');
    if (!c.digit) return setError(passwordInput, passwordError, 'Include at least one number.');
    if (!c.special) return setError(passwordInput, passwordError, 'Include at least one special symbol.');
    return setError(passwordInput, passwordError, '');
  }

  function validateAge() {
    const raw = ageInput.value;
    if (raw === '' || raw === null) return setError(ageInput, ageError, 'Age is required.');
    const n = Number(raw);
    if (!Number.isFinite(n)) return setError(ageInput, ageError, 'Enter a valid number.');
    if (n < 1) return setError(ageInput, ageError, 'Age must be at least 1.');
    if (n > 999) return setError(ageInput, ageError, 'Age must be 1–999.');
    return setError(ageInput, ageError, '');
  }

  function validateClass() {
    const v = classSelect.value;
    if (!v) return setError(classSelect, classError, 'Please choose a character class.');
    return setError(classSelect, classError, '');
  }

  function validateAll() {
    const errs = [
      validateName(),
      validateEmail(),
      validatePassword(),
      validateAge(),
      validateClass(),
    ];
    // errs array contains booleans: true when error shown
    return !errs.some(Boolean);
  }

  // Real-time feedback
  nameInput.addEventListener('input', () => {
    validateName();
    successMsg.textContent = '';
  });
  emailInput.addEventListener('input', () => {
    validateEmail();
    successMsg.textContent = '';
  });
  passwordInput.addEventListener('input', () => {
    validatePassword();
    successMsg.textContent = '';
  });
  ageInput.addEventListener('input', () => {
    validateAge();
    successMsg.textContent = '';
  });
  classSelect.addEventListener('change', () => {
    validateClass();
    successMsg.textContent = '';
  });

  form.addEventListener('submit', (e) => {
    const ok = validateAll();
    if (!ok) {
      e.preventDefault();
      // Focus first invalid field for accessibility
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      successMsg.textContent = '';
      return;
    }

    e.preventDefault();
    successMsg.textContent = 'Welcome to the Fellowship! Your registration is complete.';
    form.reset();
    // Clear any error states after reset
    [nameError, emailError, passwordError, ageError, classError].forEach((el) => (el.textContent = ''));
    [nameInput, emailInput, passwordInput, ageInput, classSelect].forEach((el) => el.removeAttribute('aria-invalid'));
  });
})();
