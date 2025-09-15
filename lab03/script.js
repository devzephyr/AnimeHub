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
