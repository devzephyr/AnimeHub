// Highlight the current navigation destination based on the active path.
(function highlightActiveNav() {
  const currentPath = window.location.pathname || '/';
  document.querySelectorAll('.nav-list a').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    try {
      const linkPath = new URL(href, window.location.origin).pathname;
      if (linkPath === currentPath) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    } catch (err) {
      // Ignore malformed URLs so the nav never breaks the page.
    }
  });
})();

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

// ===== Lab09: Fellowship Registry (fetch + live DOM updates) =====
const registryApiBase = '/api/v1/members';
const membersListEl = document.getElementById('membersList');
const memberTemplate = document.getElementById('memberTemplate');
const registryStatusEl = document.getElementById('registryStatus');
const refreshMembersBtn = document.getElementById('refreshMembers');

const registryState = {
  members: [],
};

function setRegistryStatus(message) {
  if (registryStatusEl) {
    registryStatusEl.textContent = message;
  }
}

function formatMemberMeta(member) {
  const role = member.role || 'Adventurer';
  const age = Number.isFinite(Number(member.age)) ? `Age ${member.age}` : 'Age unknown';
  return `${role} · ${age} · ${member.email}`;
}

function renderMembers() {
  if (!membersListEl || !memberTemplate) return;
  membersListEl.innerHTML = '';
  if (!registryState.members.length) {
    setRegistryStatus('No registered members yet. Use the form to add one.');
    return;
  }
  setRegistryStatus(`Showing ${registryState.members.length} registered member${registryState.members.length === 1 ? '' : 's'}.`);
  registryState.members.forEach((member) => {
    const fragment = memberTemplate.content.firstElementChild.cloneNode(true);
    fragment.dataset.id = member.id || member._id;
    const nameEl = fragment.querySelector('.member-name');
    const metaEl = fragment.querySelector('.member-meta');
    if (nameEl) nameEl.textContent = member.name;
    if (metaEl) metaEl.textContent = formatMemberMeta(member);
    membersListEl.appendChild(fragment);
  });
}

function upsertMember(member) {
  if (!member) return;
  const normalized = { ...member };
  normalized.id = member.id || member._id;
  const existingIndex = registryState.members.findIndex((m) => (m.id || m._id) === normalized.id);
  if (existingIndex >= 0) {
    registryState.members[existingIndex] = normalized;
  } else {
    registryState.members.unshift(normalized);
  }
  renderMembers();
}

function removeMemberFromState(id) {
  const idx = registryState.members.findIndex((m) => (m.id || m._id) === id);
  if (idx >= 0) {
    registryState.members.splice(idx, 1);
    renderMembers();
  }
}

async function loadMembers() {
  if (!membersListEl || !memberTemplate) return;
  setRegistryStatus('Loading roster…');
  try {
    const response = await fetch(registryApiBase);
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const errorMessage = payload?.error?.message || 'Unable to load members.';
      throw new Error(errorMessage);
    }
    registryState.members = Array.isArray(payload?.data) ? payload.data : [];
    renderMembers();
  } catch (error) {
    console.error('Failed to load members:', error);
    setRegistryStatus(`Unable to load roster: ${error.message}`);
  }
}

async function handleDeleteMember(memberId) {
  if (!memberId) return;
  const confirmed = window.confirm('Remove this member from the registry?');
  if (!confirmed) return;
  try {
    const response = await fetch(`${registryApiBase}/${memberId}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok && response.status !== 204) {
      const payload = await response.json().catch(() => null);
      const message = payload?.error?.message || 'Failed to delete member.';
      throw new Error(message);
    }
    removeMemberFromState(memberId);
    setRegistryStatus('Member removed from the registry.');
  } catch (error) {
    console.error('Failed to delete member:', error);
    setRegistryStatus(`Unable to delete member: ${error.message}`);
  }
}

function promptValue(label, initial) {
  const result = window.prompt(label, initial ?? '');
  if (result === null) return null;
  return result.trim();
}

async function handleEditMember(memberId) {
  const existing = registryState.members.find((m) => (m.id || m._id) === memberId);
  if (!existing) {
    setRegistryStatus('Member not found locally. Refreshing list…');
    await loadMembers();
    return;
  }

  const name = promptValue('Update hero name', existing.name);
  if (name === null || name.length < 2) {
    alert('Name must be at least 2 characters.');
    return;
  }

  const email = promptValue('Update hero email', existing.email);
  if (email === null || !email.includes('@')) {
    alert('Provide a valid email address.');
    return;
  }

  const ageInput = promptValue('Update hero age (13-999)', String(existing.age ?? ''));
  if (ageInput === null) return;
  const age = Number.parseInt(ageInput, 10);
  if (!Number.isFinite(age) || age < 13 || age > 999) {
    alert('Age must be a number between 13 and 999.');
    return;
  }

  const role = promptValue('Update hero role', existing.role || 'Ranger');
  if (role === null || role.length < 2) {
    alert('Role must be at least 2 characters.');
    return;
  }

  try {
    const response = await fetch(`${registryApiBase}/${memberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        age,
        role,
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.error?.message || 'Failed to update member.';
      throw new Error(message);
    }
    upsertMember(payload?.data);
    setRegistryStatus('Member updated successfully.');
  } catch (error) {
    console.error('Failed to update member:', error);
    setRegistryStatus(`Unable to update member: ${error.message}`);
  }
}

if (membersListEl) {
  membersListEl.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const card = button.closest('.member-card');
    const memberId = card?.dataset?.id;
    if (!memberId) return;
    const action = button.dataset.action;
    if (action === 'delete') {
      handleDeleteMember(memberId);
    } else if (action === 'edit') {
      handleEditMember(memberId);
    }
  });
}

if (refreshMembersBtn) {
  refreshMembersBtn.addEventListener('click', () => {
    loadMembers();
  });
}

loadMembers();

// ===== Lab05: Join the Fellowship — Form Validation =====
(function () {
  const form = document.getElementById('joinForm');
  if (!form) return;

  const nameInput = document.getElementById('regName');
  const emailInput = document.getElementById('regEmail');
  const ageInput = document.getElementById('regAge');
  const classSelect = document.getElementById('regClass');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const ageError = document.getElementById('ageError');
  const classError = document.getElementById('classError');
  const successMsg = document.getElementById('joinSuccess');
  const submitBtn = form.querySelector('button[type="submit"]');
  const defaultSubmitText = submitBtn ? submitBtn.textContent : '';

  function setFormStatus(state, message) {
    if (!successMsg) return;
    successMsg.textContent = message || '';
    successMsg.classList.remove('form-status--success', 'form-status--error');
    if (state === 'success') {
      successMsg.classList.add('form-status--success');
    } else if (state === 'error') {
      successMsg.classList.add('form-status--error');
    }
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? 'Submitting…' : defaultSubmitText;
  }

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
    if (v.length > 50) return setError(nameInput, nameError, 'Name must be under 50 characters.');
    return setError(nameInput, nameError, '');
  }

  function validateEmail() {
    const v = (emailInput.value || '').trim();
    if (v.length === 0) return setError(emailInput, emailError, 'Email is required.');
    if (emailInput.validity && emailInput.validity.typeMismatch) {
      return setError(emailInput, emailError, 'Enter a valid email (e.g., hero@shire.me).');
    }
    return setError(emailInput, emailError, '');
  }

  function validateAge() {
    const raw = ageInput.value;
    if (raw === '' || raw === null) return setError(ageInput, ageError, 'Age is required.');
    const n = Number(raw);
    if (!Number.isFinite(n)) return setError(ageInput, ageError, 'Enter a valid number.');
    if (n < 13) return setError(ageInput, ageError, 'Age must be at least 13.');
    if (n > 999) return setError(ageInput, ageError, 'Age must be 13–999.');
    return setError(ageInput, ageError, '');
  }

  function validateClass() {
    const v = classSelect.value;
    if (!v) return setError(classSelect, classError, 'Please choose a role.');
    return setError(classSelect, classError, '');
  }

  function validateAll() {
    const errs = [validateName(), validateEmail(), validateAge(), validateClass()];
    return !errs.some(Boolean);
  }

  nameInput.addEventListener('input', () => {
    validateName();
    setFormStatus(null, '');
  });
  emailInput.addEventListener('input', () => {
    validateEmail();
    setFormStatus(null, '');
  });
  ageInput.addEventListener('input', () => {
    validateAge();
    setFormStatus(null, '');
  });
  classSelect.addEventListener('change', () => {
    validateClass();
    setFormStatus(null, '');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setFormStatus(null, '');
    const ok = validateAll();
    if (!ok) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      setFormStatus('error', 'Please fix the highlighted fields and try again.');
      return;
    }

    const payload = {
      name: (nameInput.value || '').trim(),
      email: (emailInput.value || '').trim(),
      age: Number(ageInput.value),
      role: classSelect.value || 'Ranger',
    };

    try {
      setSubmitting(true);
      const response = await fetch(form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        const errorMessage = data?.error?.message || 'Server error. Please try again later.';
        setFormStatus('error', errorMessage);
        return;
      }

      setFormStatus('success', data?.data?.name ? `Welcome to the Fellowship, ${data.data.name}!` : 'Welcome to the Fellowship!');
      form.reset();
      [nameError, emailError, ageError, classError].forEach((el) => {
        if (el) el.textContent = '';
      });
      [nameInput, emailInput, ageInput, classSelect].forEach((el) => el.removeAttribute('aria-invalid'));
      upsertMember(data.data);
    } catch (err) {
      console.error('Network error while submitting Fellowship form:', err);
      setFormStatus('error', 'Network error. Please retry in a moment.');
    } finally {
      setSubmitting(false);
    }
  });
})();
