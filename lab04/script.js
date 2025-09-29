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
