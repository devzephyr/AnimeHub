// Shared JS for Assignment 01

document.addEventListener('DOMContentLoaded', () => {
  enableHeroCardInteractions();
  wireJoinFormValidation();
});

function enableHeroCardInteractions() {
  const cards = document.querySelectorAll('.card');
  if (!cards.length) return;

  const toggle = (card, force) => {
    const isFlipped = force !== undefined ? !!force : !card.classList.contains('is-flipped');
    card.classList.toggle('is-flipped', isFlipped);
    card.setAttribute('aria-expanded', String(isFlipped));
  };

  cards.forEach((card) => {
    card.addEventListener('click', (e) => {
      // Avoid toggling when clicking links inside a card (none currently)
      if (e.target && e.target.closest('a')) return;
      toggle(card);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(card);
      }
      if (e.key === 'Escape') {
        toggle(card, false);
        card.blur();
      }
    });
  });
}

function wireJoinFormValidation() {
  const form = document.getElementById('join-form');
  if (!form) return; // Not on join page

  const fields = {
    fullName: {
      input: document.getElementById('fullName'),
      error: document.getElementById('error-fullName'),
      validate: (value) => value.trim().length >= 2 || 'Please enter your full name.'
    },
    alias: {
      input: document.getElementById('alias'),
      error: document.getElementById('error-alias'),
      validate: (value) => value.trim().length >= 2 || 'Please enter your hero alias.'
    },
    email: {
      input: document.getElementById('email'),
      error: document.getElementById('error-email'),
      validate: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Please enter a valid email address.')
    },
    power: {
      input: document.getElementById('power'),
      error: document.getElementById('error-power'),
      validate: (value) => (value && value.trim() !== '' || 'Please select a power type.')
    },
    motivation: {
      input: document.getElementById('motivation'),
      error: document.getElementById('error-motivation'),
      validate: (value) => (value.trim().length >= 20 || 'Motivation must be at least 20 characters.')
    }
  };

  const setError = (field, message) => {
    field.error.textContent = message || '';
    field.input.setAttribute('aria-invalid', message ? 'true' : 'false');
  };

  const validateField = (field) => {
    const value = field.input.value;
    const result = field.validate(value);
    const ok = result === true || result === undefined;
    setError(field, ok ? '' : result);
    return ok;
  };

  // Realtime validation on input/blur
  Object.values(fields).forEach((field) => {
    field.input.addEventListener('input', () => validateField(field));
    field.input.addEventListener('blur', () => validateField(field));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let allOk = true;
    Object.values(fields).forEach((field) => {
      const ok = validateField(field);
      if (!ok && allOk) {
        field.input.focus();
      }
      allOk &&= ok;
    });

    if (!allOk) return;

    const alias = fields.alias.input.value.trim();
    const name = fields.fullName.input.value.trim();
    const email = fields.email.input.value.trim();
    const power = fields.power.input.value;
    const motivation = fields.motivation.input.value.trim();

    const messages = document.getElementById('quest-messages');
    const msg = document.createElement('div');
    msg.className = 'message success';
    msg.textContent = `Welcome ${alias} (${name}) to the Avengers! We will contact you at ${email}. Power: ${power}. Keep this in the quest log: "${motivation}"`;
    messages.appendChild(msg);

    form.reset();
    // Clear validation state after reset
    Object.values(fields).forEach((f) => setError(f, ''));
  });
}

