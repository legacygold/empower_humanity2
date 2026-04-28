const enterBtn = document.getElementById("enterBtn");
const welcome = document.getElementById("welcome");
const modules = document.getElementById("modules");
const moduleCards = document.querySelectorAll(".module");
const subModules = document.getElementById("subModules");

let currentIndex = 0;
let carouselInterval;

if (window.Telegram && window.Telegram.WebApp) {
  Telegram.WebApp.ready();
}

// MODULE DATA
const moduleData = {
  stellarxpay: ["Cash In", "Cash Out", "Quick Pay", "PTLX Relief"],
  empowerfix: ["Tutorials", "PortalX LITE", "Marketplace", "Vendors", "FunDEXit"],
  stellarverse: ["Creation Hub", "Live Experience", "StellarVerse Shop", "PortalXperience"]
};

// ENTER → collapse welcome + start carousel
enterBtn.onclick = () => {
  welcome.classList.add("hidden");
  modules.classList.remove("hidden");
  startCarousel();
};

// LOG BUTTON CLICK
enterBtn.addEventListener("click", () => {
  console.log("Enter clicked");
});

// ROTATING MODULES
function startCarousel() {
  carouselInterval = setInterval(() => {
    moduleCards[currentIndex].classList.remove("active");
    currentIndex = (currentIndex + 1) % moduleCards.length;
    moduleCards[currentIndex].classList.add("active");
  }, 3000);
}

// MODULE ENTER CLICK
document.querySelectorAll(".moduleEnter").forEach(btn => {
  btn.onclick = (e) => {
    clearInterval(carouselInterval);

    const module = e.target.parentElement.dataset.module;

    showSubModules(module);
  };
});

// SHOW ORBS
function showSubModules(module) {
  modules.classList.add("hidden");
  subModules.classList.remove("hidden");
  subModules.innerHTML = "";

  moduleData[module].forEach(name => {
    const orb = document.createElement("div");
    orb.className = "orb";
    orb.innerText = name;

    orb.onclick = () => {
      alert(`${name} selected`);
    };

    subModules.appendChild(orb);
  });
}