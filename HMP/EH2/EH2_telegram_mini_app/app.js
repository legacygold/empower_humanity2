// ============================================================
// EMBOLDENED HUMANITY 2.0 — APP.JS
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
function logStack(msg = '') {
  console.log(`[${msg}] navIndex=${navIndex} navStack=`, JSON.stringify(navStack, null, 2));
}

function pushScreen(screenObj) {
  // Remove any forward‑history entries
  navStack = navStack.slice(0, navIndex + 1);
  
  // Add the new entry
  navStack.push(screenObj);
  navIndex = navStack.length - 1;
  
  // Log the stack for debugging
  logStack(`push ${screenObj.containerId}`);
}

function popScreen() {
  // Pop the current screen and show the previous one
  if (navIndex <= 0) return;
  const popped = navStack[navIndex];
  const el = document.getElementById(popped.containerId);
  if (el) el.classList.add('hidden');
  navIndex--;
  const previous = navStack[navIndex];
  const prevEl = document.getElementById(previous.containerId);
  if (prevEl) prevEl.classList.remove('hidden');
  if (previous.containerId === 'carousel') startCarousel();

  // Log the stack for debugging
  logStack(`pop ${popped.containerId}`);
}

function closeTo(thatContainerId) {
  // Pop until we hit the specified container
  while (navIndex > 0 && navStack[navIndex].containerId !== thatContainerId) {
    // Hide what we’re leaving
    hideCurrentScreen(); // ✅ Always call before navigation

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
   'footer-orbs', 'footer-orbs-ptlx', 'footer-orbs-portalx', 'footer-orbs-vault', 
   'footer-sub', 'wallet', 'connect-wallet', 'empowerbot-info', 'profile']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });

  // 2️⃣ If a submodule HTML was showing, clear its markup and injected CSS/JS
  const container = document.getElementById('subModuleContainer');
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
  hideCurrentScreen(); // ✅ Always call before navigation
  
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
  hideCurrentScreen(); // ✅ Always call before navigation
  popScreen();
}

/* ----------  BACK BUTTON HANDLER (FIXED for dynamic buttons) ---------- */
function  bindBackButton() {
  // Use event delegation since #backBtn is created dynamically
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('backBtn')) { // ✅ All Back buttons
      hideCurrentScreen(); // ✅ Always call before navigation
      popScreen();
    }
  });
}

/* ----------  CLOSE BUTTON HANDLER (FIXED for dynamic buttons) ---------- */
function  bindCloseButton() {
  // Use event delegation since #closeBtn is created dynamically
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('closeBtn')) { // ✅ All Close buttons
      hideCurrentScreen(); // ✅ Always call before navigation
      popScreen();
    }
  });
}

/* ----------  GO HOME (from anywhere back to carousel) ---------- */
function goHome() {
  // To navigate from any screen back to the carousel screen
  hideCurrentScreen(); // ✅ Always call before navigation
  document.getElementById('carousel').classList.remove('hidden');
  startCarousel();
}

// ---------------------------------------------------
// 6️⃣ TOP BAR & EMPOWERBOT INFO SCREENHANDLERS
// ---------------------------------------------------
async function loadWalletContent() {
  try {
  const resp = await fetch('src/wallet/wallet.html');
  const html = await resp.text();

  // Extract and inject CSS link
  const linkMatch = html.match(/<link[^>]+rel="stylesheet"[^>]+>/);
  if (linkMatch) {
  const link = document.createElement('div');
  link.innerHTML = linkMatch[0];
  document.head.appendChild(link.firstChild);
  }

  /* Find the two sections inside wallet.html and inject them */
  document.getElementById('connect-wallet').innerHTML = html.match(/<!-- ==== CONNECT WALLET SCREEN ==== -->[\s\S]*?<!-- ==== CONNECTED WALLETS SCREEN ==== -->/)[0];
  document.getElementById('wallet').innerHTML = html.match(/<!-- ==== CONNECTED WALLETS SCREEN ==== -->[\s\S]*?<\/body>/)[0];
  } catch (e) {
  console.error('wallet.html not loaded', e);
  }
}

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
    hideCurrentScreen(); // ✅ Always call before navigation
    document.getElementById('carousel').classList.remove('hidden');
    startCarousel();
  });
}

// ---------------------------------------------------
// 8️⃣ MODULE CAROUSEL HANDLERS
// ---------------------------------------------------

/* ----------  CAROUSEL LOGIC ---------- */
function startCarousel() {
  // Push the carousel entry (so we can go back later)
  pushScreen({ containerId: 'carousel', type: 'carousel', previous: navStack[navIndex] });
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
      hideCurrentScreen(); // ✅ Always call before navigation
      showMainOrbs(modKey);
    });
  });
}

/* ----------  MAIN SUBMODULE ORB SCREEN LOGIC ---------- */
function showMainOrbs(moduleKey) {
  // Push the main‑orbs entry (so we can go back later)
  pushScreen({ containerId: 'main-orbs', type: `main=${moduleKey}`, previous: navStack[navIndex] });
  
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
      orb.onclick = () => loadSubmodule(moduleKey, key);
    } else {
      orb.style.opacity = '0.4';
      orb.onclick = () => alert(`${sm.name} requires Tier ${sm.minTier}+`);
    }
    orbContainer.appendChild(orb);
  });
}

// ---------------------------------------------------
// 9️⃣ SUBMODULE AND COMPONENT HANDLERS
// ---------------------------------------------------

// Load a submodule (main-sub or footer-sub) based on its registry entry
async function loadSubmodule(parentKey, subKey) {
  // Decide which container to use (main-sub vs. footer-sub)
  const isFooter = ['ptlx', 'portalx', 'vault'].includes(parentKey);
  const targetContainerId = isFooter ? 'footer-sub' : 'main-sub';
  
  // Push the submodule entry (so we can go back later)
  pushScreen({ containerId: `${targetContainerId}`, type: `submodules=${subKey}`, previous: navStack[navIndex] });
  console.log(`[loadSubmodule] parentKey=${parentKey} subKey=${subKey}`); // Debug log
  
  // Resolve the registry entry and the path to the submodule's HTML (relative to index.html)
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

  // Resolve the full path to the submodule folder (relative to index.html)
  const fullPath = resolvePath(sub.path);         // e.g., "../ptlx/earn" – this is the path to the submodule folder relative to index.html
  const folderName = fullPath.split(/\//).pop();  // e.g., "earn" – this is the name of the submodule folder and the HTML file (earn.html) inside it 

  // Load the submodule's data.json (if it exists)
  const dataUrl = `${fullPath}/data.json`;   // same folder as the .html file
  let subData = null;
  try {
    const resp = await fetch(dataUrl);
    if (resp.ok) subData = await resp.json();   // now you have the data object
  } catch (e) {
    console.warn(`No data.json found for submodule "${subKey}" under "${parentKey}"`);
  }

  // Hide everything currently visible
  hideCurrentScreen(); // ✅ Always call before navigation

  // Load the submodule HTML
  const container = document.getElementById(targetContainerId);
  container.classList.remove('hidden');   // Show the submodule container
  
  try {
    console.log(`[loadSubmodule] fetching ${fullPath}/${folderName}.html`);
    const htmlResp = await fetch(`${fullPath}/${folderName}.html`);
    if (!htmlResp.ok) throw new Error('HTML not found');
    const html = await htmlResp.text();
    container.innerHTML = html;
    container.classList.remove('hidden');   // Show the container

    // Inject a Back button at the top of the container
    const backBtn = document.createElement('button');
    backBtn.className = 'backBtn hidden'; // Make it look like others
    backBtn.textContent = '← Back';
    backBtn.onclick = () => bindBackButton();   // unified navigation
    container.prepend(backBtn);

    // (Optional) Load CSS if it exists next to the HTML
    try {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${fullPath}/${folderName}.css`;
      document.head.appendChild(link);
      injectedElements.push(link);
    } catch (_) {}

    // (Optional) Load JS if it exists next to the HTML
    try {
      const script = document.createElement('script');
      script.src = `${fullPath}/${folderName}.js`;
      document.body.appendChild(script);
      injectedElements.push(script);
    } catch (_) {}

  } catch (err) {
    // Show error placeholder if HTML fails to load
    container.innerHTML = `
      <div class="sub-header" align="center">
        <h2>${sub.name}</h2>
        <p style="color:#e892f7;">${err.message}</p>
        <button id="closeBtn" class="closeBtn">← Close</button>
      </div>`;
    console.error(err);
  }
}

function bindComponentClicks() {
  document.addEventListener('click', async (e) => {
    // Check if the clicked element is a component button
    if (e.target.classList.contains('component-btn')) {
      const componentKey = e.target.dataset.component;
      
      // 1. Identify which module we are currently in
      // (You can determine this from your navStack or by checking visible IDs)
      const currentScreen = navStack[navIndex].containerId;
      
      // 2. Call the specific loader for that module
      if (currentScreen === 'main-sub') {
        if (typeof loadEarnComponent === 'function') {
          loadEarnComponent(componentKey);
        }
      } else if (currentScreen === 'footer-sub') {
        // call the footer version of the loader
        if (typeof loadFooterComponent === 'function') {
          loadFooterComponent(componentKey);
        }
      }
    }
  });
}

// ---------------------------------------------------
// 9️⃣ FOOTER MENU HANDLERS
// ---------------------------------------------------

/* ----------  FOOTER MENU ITEMCLICK HANDLERS ---------- */
function bindFooterItems() {
  document.querySelectorAll('.footer-item').forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.menu;            // e.g., "ptlx"
      hideCurrentScreen(); // ✅ Always call before navigation
      showFooterOrbs(type);
    });
  });
}
function showFooterOrbs(type) {
  const containerId = `footer-orbs-${type}`; // Unique ID per footer item
  // Push a footer‑orbs entry so we can go back to whatever we were on
  pushScreen({ containerId, type: 'footer-orbs', previous: navStack[navIndex] });
  
  // Show the container
  document.getElementById(`footer-orbs-${type}`).classList.remove('hidden');
  
  // Build the footer‑orb list
  const mod = REGISTRY[type];
  const orbsHtml = `
    <div class="sub-header" align="center">
      <h2>${mod.name}</h2>
      <div class="orb-container"></div>
      <button id="closeBtn" class="closeBtn">← Close</button>
    </div>`;
  document.getElementById(`footer-orbs-${type}`).innerHTML = orbsHtml;
  const orbContainer = document.getElementById(`footer-orbs-${type}`).querySelector('.orb-container');
  
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
  bindCloseButton();          // Close button on footer submodule screens
  bindComponentClicks();      // Component buttons inside submodules

  // 5️⃣ Load wallet.html content into the appropriate containers
  try {
    document.getElementById('connectWalletBtn').addEventListener('click', () => {
    showConnectWallet(); // Your existing function
    });
    document.getElementById('walletBtn').addEventListener('click', () => {
    showWallet(); // Your existing function
    });
  } catch (e) {
    console.error('wallet.html not loaded', e);
  }

  // 6️⃣ Check if loadWalletContent is defined and call it
  if (typeof loadWalletContent === 'function') {
    await loadWalletContent();
  } else {
    console.warn('loadWalletContent is not defined');
  }
});
