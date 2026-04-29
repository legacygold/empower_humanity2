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
    clearInterval(carouselInterval);

    const module = e.target.closest(".module").dataset.module;
    currentModule = module;

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
      alert(`${name} coming soon!`);
    };

    orbContainer.appendChild(orb);
  });

  // BACK BUTTON LOGIC
  document.getElementById("backBtn").onclick = () => {
    subModules.classList.add("hidden");
    modules.classList.remove("hidden");
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