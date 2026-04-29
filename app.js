// ELEMENTS
const enterBtn = document.getElementById("enterBtn");
const welcome = document.getElementById("welcome");
const modules = document.getElementById("modules");
const moduleCards = document.querySelectorAll(".module");
const subModules = document.getElementById("subModules");

let currentIndex = 0;
let carouselInterval;
let currentModule = null;

// Telegram safe init
if (window.Telegram && window.Telegram.WebApp) {
  Telegram.WebApp.ready();
}

// MODULE DATA
const moduleData = {
  stellarxpay: ["Cash In", "Cash Out", "Quick Pay", "PTLX Relief"],
  empowerfix: ["Tutorials", "PortalX LITE", "Marketplace", "Vendors", "FunDEXit"],
  stellarverse: ["Creation Hub", "Live Experience", "StellarVerse Shop", "PortalXperience"]
};

// ENTER → start app
enterBtn.onclick = () => {
  enterBtn.classList.add("glow-click");

  setTimeout(() => {
    enterBtn.classList.remove("glow-click");
  }, 400);

  welcome.classList.add("hidden");
  modules.classList.remove("hidden");

  startCarousel();
};

console.log("JS LOADED");

// CAROUSEL ROTATION
function startCarousel() {
  moduleCards[currentIndex].classList.add("active");

  carouselInterval = setInterval(() => {
    moduleCards[currentIndex].classList.remove("active");
    currentIndex = (currentIndex + 1) % moduleCards.length;
    moduleCards[currentIndex].classList.add("active");
  }, 3000);
}

// MODULE CLICK
document.querySelectorAll(".moduleEnter").forEach(btn => {
  btn.onclick = (e) => {
    const button = e.currentTarget;

    const module = button.closest(".module").dataset.module;

    console.log("MODULE CLICKED:", module);

    // Glow effect
    button.classList.add("glow-click");
    setTimeout(() => {
      button.classList.remove("glow-click");
    }, 400);

    clearInterval(carouselInterval);

    showSubModules(module);
  };
});

// SHOW SUB MODULES
function showSubModules(module) {
  modules.classList.add("hidden");
  subModules.classList.remove("hidden");

  // CLEAR + ADD TITLE + BACK BUTTON
  subModules.innerHTML = `
    <div class="sub-header">
      <button id="backBtn">← Back</button>
      <h2>${formatTitle(module)}</h2>
    </div>
    <div class="orb-container"></div>
  `;

  const orbContainer = subModules.querySelector(".orb-container");

  moduleData[module].forEach(name => {
    const orb = document.createElement("div");
    orb.className = "orb";
    orb.innerText = name;

    orb.onclick = () => {
      orb.classList.add("glow-click");

      setTimeout(() => {
        orb.classList.remove("glow-click");
      }, 200);

      alert(`${name} coming soon!`);
    };

    orbContainer.appendChild(orb);
  });

  // BACK BUTTON LOGIC
  document.getElementById("backBtn").onclick = () => {
    subModules.innerHTML = "";
    subModules.classList.add("hidden");

    modules.classList.remove("hidden");

    // Reset carousel state cleanly
    currentIndex = 0;
    moduleCards.forEach(card => card.classList.remove("active"));

    startCarousel();
  };
}

// FORMAT TITLE
function formatTitle(key) {
  if (key === "stellarxpay") return "StellarXPAY";
  if (key === "empowerfix") return "EmpowerFiX";
  if (key === "stellarverse") return "StellarVerse";
  return key;
}

// GO HOME
function goHome() {
  subModules.classList.add("hidden");
  modules.classList.add("hidden");
  welcome.classList.remove("hidden");

  clearInterval(carouselInterval);
}