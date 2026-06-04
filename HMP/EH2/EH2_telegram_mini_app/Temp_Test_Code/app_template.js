// ============================================================
// EMBOLDENED HUMANITY 2.0 — APP.JS TEMPLATE
// ============================================================

// ---------------------------------------------------
// 1️⃣ INITIAL STATE & GLOBAL VARIABLES
// ---------------------------------------------------
let REGISTRY = null;                // Filled after registry.json loads
let currentTier = 1;                // 1 = Explorer (always)
let ptlxBalance = 0;                // (for testing – replace with real balance logic later)
let carouselInterval = null;
let currentIndex = 0;

// Global stack – holds the *container* that is currently visible
let navStack = [{ containerId: 'welcome', type: 'welcome', previous: null }];   // each entry = { containerId, previousContainer }
let navIndex = 0;  // current position in the stack (0 = bottom)

// Helper array – holds references to injected <link>/<script> elements
const injectedElements = [];

// ---------------------------------------------------
// 2️⃣ UTILS – DOM, Path, Cleanup
// ---------------------------------------------------
function ensureContainer() {
  let container = document.getElementById('module-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'module-container';
    document.body.appendChild(container);
  }
  return container;
}

function cleanup() {
  injectedElements.forEach(el => el.remove());
  injectedElements.length = 0;
}

function resolvePath(path) {
  // All paths in registry are **relative** to index.html
  // If they already start with ".." they're absolute – keep them.
  return path.startsWith('..') ? path : `../${path}`;
}

// ---------------------------------------------------
// 3️⃣ LOAD REGISTRY (from registry.json)
// ---------------------------------------------------
async function loadRegistry() {
  try {
    const resp = await fetch('registry.json');
    if (!resp.ok) throw new Error('registry.json not found');
    REGISTRY = await resp.json();
    console.log('✅ Registry loaded – keys:', Object.keys(REGISTRY));
  } catch (e) {
    console.error('❌ Could not load registry.json:', e);
    REGISTRY = {};
  }
}

// ---------------------------------------------------
// 4️⃣ UNIVERSAL STACK‑BASED NAVIGATION FUNCTIONS
// ---------------------------------------------------
function pushScreen(screenObj) {
  // Remove any forward‑history entries
  navStack = navStack.slice(0, navIndex + 1);
  
  // Add the new entry
  navStack.push(screenObj);
  navIndex = navStack.length - 1;
}

function popScreen() {
  if (navIndex <= 0) return;               // nothing to pop
  const popped = navStack[navIndex];
  document.getElementById(popped.containerId).classList.add('hidden');
  navIndex--;                               // step down
  const previous = navStack[navIndex];
  document.getElementById(previous.containerId).classList.remove('hidden');
  if (previous.containerId === 'carousel') startCarousel();
}

function closeTo(thatContainerId) {
  // Pop until we hit the specified container
  while (navIndex > 0 && navStack[navIndex].containerId !== thatContainerId) {
    // Hide what we’re leaving
    const leaving = navStack[navIndex];
    document.getElementById(leaving.containerId).classList.add('hidden');

    navIndex--;
  }

  // Now we’re at the target screen; show it
  const target = navStack[navIndex];
  document.getElementById(target.containerId).classList.remove('hidden');

  if (target.containerId === 'carousel') startCarousel();
}

// ---------------------------------------------------
// 5️⃣ CORE UI FUNCTIONS
// ---------------------------------------------------

/* ----------  HIDE CURRENT SCREEN ---------- */
function hideCurrentScreen() {
  // 1️⃣ Hide any containers that might be visible
  ['welcome', 'carousel', 'main-orbs', 'main-sub', 'main-comp', 
   'footer-orbs', 'footer-sub', 'wallet', 'connect-wallet', 'empowerbot-info', 'profile']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });

  // 2️⃣ If a submodule HTML was showing, clear its markup and injected CSS/JS
  const container = document.getElementById('module-container');
  if (container) {
    container.innerHTML = '';
    cleanup();    // removes any <link>/<script> we injected
  }
}

/* ----------  GO TO PREVIOUS SCREEN (using the 'previous' property in navStack) ---------- */
function goToPreviousScreen() {
  // Go back to the screen stored in 'previous' property
  const current = navStack[navIndex];
  const previous = current.previous;
  
  if (!previous) return;  // No previous screen
  
  // Hide current screen
  document.getElementById(current.containerId).classList.add('hidden');
  
  // Find and show the previous screen in the stack
  const prevIndex = navStack.findIndex(s => s === previous);
  if (prevIndex >= 0) {
    navIndex = prevIndex;
    document.getElementById(navStack[navIndex].containerId).classList.remove('hidden');
    
    if (navStack[navIndex].containerId === 'carousel') startCarousel();
  }
}

/* ----------  GO BACK ONE STEP (pop the current screen and show the previous one) ---------- */
function goBack() {
  popScreen();
}

/* ----------  BACK BUTTON HANDLER (FIXED for dynamic buttons) ---------- */
function  bindBackButton() {
  // Use event delegation since #backBtn is created dynamically
  document.addEventListener('click', (e) => {
    if (e.target.id === 'backBtn') { // ID-based selector
      popScreen();
    }
  });
}

/* ----------  GO HOME (from anywhere back to carousel) ---------- */
function goHome() {
  // To navigate from any screen back to the carousel screen
  document.getElementById('welcome').classList.add('hidden');
  document.getElementById('carousel').classList.remove('hidden');
  document.getElementById('main-orbs').classList.add('hidden');
  document.getElementById('main-sub').classList.add('hidden');
  document.getElementById('main-comp').classList.add('hidden');
  document.getElementById('footer-orbs').classList.add('hidden');
  document.getElementById('footer-sub').classList.add('hidden');
  document.getElementById('wallet').classList.add('hidden');
  document.getElementById('connect-wallet').classList.add('hidden');
  document.getElementById('empowerbot-info').classList.add('hidden');
  document.getElementById('profile').classList.add('hidden');
  startCarousel();
  previousScreen = 'carousel';
}

// ---------------------------------------------------
// 6️⃣ TOP BAR HANDLERS
// ---------------------------------------------------
function showProfile() {
  hideCurrentScreen();
  pushScreen({ containerId: 'profile', type: 'profile', previous: navStack[navIndex] });
  document.getElementById('profile').classList.remove('hidden');
}

function showWallet() {
  hideCurrentScreen();
  pushScreen({ containerId: 'wallet', type: 'wallet', previous: navStack[navIndex] });
  document.getElementById('wallet').classList.remove('hidden');
}

function showEmpowerBotInfo() {
  hideCurrentScreen();
  pushScreen({ containerId: 'empowerbot-info', type: 'empowerbot-info', previous: navStack[navIndex] });
  document.getElementById('empowerbot-info').classList.remove('hidden');
}

function showConnectWallet() {
  hideCurrentScreen();
  pushScreen({ containerId: 'connect-wallet', type: 'connect-wallet', previous: navStack[navIndex] });
  document.getElementById('connect-wallet').classList.remove('hidden');
}

function showPTLXbalance() {}

function showTier() {}

function showTierResonance() {}

// ---------------------------------------------------
// 7️⃣ WELCOME SCREEN HANDLERS
// ---------------------------------------------------

/* ----------  WELCOME ENTER BUTTON HANDLER (Welcome → Carousel) ---------- */
function bindEnterButton() {
  const btn = document.getElementById('enterBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    // hide welcome, show carousel, start carousel animation
    hideCurrentScreen();
    document.getElementById('carousel').classList.remove('hidden');
    startCarousel();
  });
}

// ---------------------------------------------------
// 8️⃣ MODULE CAROUSEL HANDLERS
// ---------------------------------------------------

/* ----------  CAROUSEL LOGIC ---------- */
function startCarousel() {
  const container = ensureContainer();   // makes sure #module-container exists
  navIndex = navStack.length - 1;
  const cards = document.querySelectorAll('.module');
  if (!cards.length) return;
  cards.forEach((c, i) => {
    if (i === currentIndex) c.classList.add('active');
    else c.classList.remove('active');
  });
  clearInterval(carouselInterval);
  carouselInterval = setInterval(() => {
    cards[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % cards.length;
    cards[currentIndex].classList.add('active');
  }, 5000);
}

/* ----------  MODULE ENTER BUTTONS (carousel → submodule) ---------- */
function bindModuleEnterButtons() {
  document.querySelectorAll('.moduleEnter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modKey = e.currentTarget.closest('.module').dataset.module;
      // Hide carousel and show submodule screen
      hideCurrentScreen();
      showMainOrbs(modKey);
    });
  });
}

/* ----------  MAIN SUBMODULE ORB SCREEN LOGIC ---------- */
function showMainOrbs(moduleKey) {
  // Hide everything else first
  hideCurrentScreen();                 // clears previous UI and cleans injected markup
  
  // Push the main‑orbs entry (so we can go back later)
  pushScreen({ containerId: 'main-orbs', type: 'main-orbs', previous: navStack[navIndex] });
  
  // Show the container
  document.getElementById('main-orbs').classList.remove('hidden');
  
  // Build the orb list (your existing orb‑creation code stays the same, just under this function)
  const mod = REGISTRY[moduleKey];
  const orbsHtml = `
    <div class="sub-header" align="center">
      <h2>${mod.name}</h2>
      <div class="orb-container"></div>
      <button id="backBtn" class="backBtn">← Back</button>
    </div>`;
  document.getElementById('main-orbs').innerHTML = orbsHtml;
  const orbContainer = document.getElementById('main-orbs').querySelector('.orb-container');

  // Build orbs
  Object.keys(mod.submodules || {}).forEach(key => {
    const sm = mod.submodules[key];
    const orb = document.createElement('div');
    orb.className = 'orb';
    orb.textContent = sm.name;
    if (currentTier >= (sm.minTier || 1)) {
      orb.onclick = () => loadSubmodule(type, key);
    } else {
      orb.style.opacity = '0.4';
      orb.onclick = () => alert(`${sm.name} requires Tier ${sm.minTier}+`);
    }
    orbContainer.appendChild(orb);
  });

  // Insert Back button
  const backBtn = document.getElementById('backBtn');
  backBtn.onclick = () => popScreen();   // ← unified navigation
  
}

// ---------------------------------------------------
// 9️⃣ SUBMODULE HANDLERS
// ---------------------------------------------------

// Load a submodule (main-sub or footer-sub) based on its registry entry
async function loadSubmodule(parentKey, subKey) {
  // 1️⃣ Resolve the registry entry
  const parent = REGISTRY[parentKey];
  if (!parent) {
    console.warn(`No parent module "${parentKey}"`);
    return;
  }
  const sub = parent.submodules?.[subKey];
  if (!sub) {
    console.warn(`No submodule "${subKey}" under "${parentKey}"`);
    return;
  }

  // 2️⃣ Decide which container to use (main-sub vs. footer-sub)
  const isFooter = ['ptlx', 'portalx', 'vault'].includes(parentKey);
  const targetContainerId = isFooter ? 'footer-sub' : 'main-sub';
  const dataUrl = `${fullPath}/${folderName}/data.json`;   // same folder as the .html file
  let subData = null;
  try {
    const resp = await fetch(dataUrl);
    if (resp.ok) subData = await resp.json();   // now you have the data object
  } catch (e) {
    console.warn(`No data.json found for submodule "${subKey}" under "${parentKey}"`);
  }

  // 3️⃣ Hide everything currently visible
  hideCurrentScreen();

  // 4️⃣ Push the new screen onto the navigation stack
  pushScreen({
    containerId: targetContainerId,
    type: 'submodule',
    previous: navStack[navIndex]
  });

  // 5️⃣ Load the submodule HTML
  const container = document.getElementById(targetContainerId);
  const fullPath = resolvePath(sub.path);
  const folderName = fullPath.split(/\//).pop();

  try {
    const htmlResp = await fetch(`${fullPath}/${folderName}.html`);
    if (!htmlResp.ok) throw new Error('HTML not found');
    const html = await htmlResp.text();
    container.innerHTML = html;

    // 6️⃣ Inject a Back button at the top of the container
    const backBtn = document.createElement('button');
    backBtn.textContent = '← Back';
    backBtn.onclick = () => popScreen();   // unified navigation
    container.prepend(backBtn);

    // 7️⃣ (Optional) Load CSS if it exists next to the HTML
    try {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${fullPath}/${folderName}.css`;
      document.head.appendChild(link);
      injectedElements.push(link);
    } catch (_) {}

    // 8️⃣ (Optional) Load JS if it exists next to the HTML
    try {
      const script = document.createElement('script');
      script.src = `${fullPath}/${folderName}.js`;
      document.body.appendChild(script);
      injectedElements.push(script);
    } catch (_) {}

  } catch (err) {
    // Show error placeholder if HTML fails to load
    container.innerHTML = `
      <div class="sub-header" style="padding:1rem;text-align:center;">
        <h2>${sub.name}</h2>
        <p style="color:#e892f7;">${err.message}</p>
        <button onclick="popScreen()">← Close</button>
      </div>`;
    console.error(err);
  }
}

// Close submodule container (main-sub or footer-sub) screen and return to previous screen
function closeSubmodule() {
  popScreen();   // unified “go back one step” logic
}

// ---------------------------------------------------
// 9️⃣ FOOTER MENU HANDLERS
// ---------------------------------------------------

/* ----------  FOOTER MENU ITEMCLICK HANDLERS ---------- */
function bindFooterItems() {
  document.querySelectorAll('.footer-item').forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.menu;            // e.g., "ptlx"
      showFooterOrbs(type);
    });
  });
}
function showFooterOrbs(type) {
  // Hide everything else first
  hideCurrentScreen();
  
  // Push a footer‑orbs entry so we can go back to whatever we were on
  pushScreen({ containerId: 'footer-orbs', type: 'footer-orbs', previous: navStack[navIndex] });
  
  // Show the container
  document.getElementById('footer-orbs').classList.remove('hidden');
  
  // Build the footer‑orb list
  const mod = REGISTRY[type];
  const orbsHtml = `
    <div class="sub-header" align="center">
      <h2>${mod.name}</h2>
      <div class="orb-container"></div>
      <button id="closeBtn" class="closeBtn">← Close</button>
    </div>`;
  document.getElementById('footer-orbs').innerHTML = orbsHtml;
  const orbContainer = document.getElementById('footer-orbs').querySelector('.orb-container');
  
  // Build orbs (same logic as main orbs)
  Object.keys(mod.submodules || {}).forEach(key => {
    const sm = mod.submodules[key];
    const orb = document.createElement('div');
    orb.className = 'orb';
    orb.textContent = sm.name;
    if (currentTier >= (sm.minTier || 1)) {
      orb.onclick = () => loadSubmodule(type, key);
    } else {
      orb.style.opacity = '0.4';
      orb.onclick = () => alert(`${sm.name} requires Tier ${sm.minTier}+`);
    }
    orbContainer.appendChild(orb);
  });
  
  // Close button uses the unified navigation
  const closeBtn = document.getElementById('closeBtn');
  closeBtn.onclick = () => popScreen();   // <-- unified navigation
}

// ---------------------------------------------------
// 🔟 INITIALIZATION
// ---------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  // 1️⃣ Make sure the #module-container exists
  ensureContainer();

  // 2️⃣ Load the JSON registry
  await loadRegistry();

  // 3️⃣ Resolve tier (hard-coded for now – change later)
  currentTier = 1;   // Explorer tier

  // 4️⃣ Set up buttons that need JS right away
  bindEnterButton();          // Welcome → Carousel
  bindModuleEnterButtons();   // Carousel → Submodule orbs
  bindBackButton();           // Back button on submodule screens  
  bindFooterItems();          // Footer items → openFooterContainer

  // 5️⃣ Kick-off the Welcome screen
  showWelcome();
});

