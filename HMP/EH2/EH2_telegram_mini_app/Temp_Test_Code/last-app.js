/* ==========================================================
   EMBOLDENED HUMANITY 2.0 — APP.JS (Fixed)
   ========================================================== */

/* ────────────────────────────────────────────────────────────
   1️⃣ GLOBALS & STATE
   ──────────────────────────────────────────────────────────── */
let REGISTRY = null;                // Filled after registry.json loads
let currentTier = 1;                // 1 = Explorer (always)
let ptlxBalance = 0;                
let windowHistory = [];             // For back‑navigation
let carouselInterval = null;
let currentIndex = 0;

// Global stack – holds the *container* that is currently visible
let navStack = [{ containerId: 'welcome', type: 'welcome', previous: null }];   // each entry = { containerId, previousContainer }
let navIndex = 0;  // current position in the stack (0 = bottom)

// Track the current screen (welcome, carousel, submodule orbs, or submodule) to manage back‑navigation correctly
let previousScreen = 'welcome';   // will be updated when you navigate

// Helper array – holds references to injected <link>/<script> elements
const injectedElements = [];

/* ────────────────────────────────────────────────────────────
   2️⃣ UTILS – DOM, Path, Cleanup
   ──────────────────────────────────────────────────────────── */
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

function pushScreen(screenObj) {
  // Remove any forward history (in case user navigated back first)
  navStack = navStack.slice(0, navIndex + 1);
  
  // Add the new screen
  navStack.push(screenObj);
  navIndex = navStack.length - 1;
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

/* ────────────────────────────────────────────────────────────
   3️⃣ LOAD REGISTRY (from registry.json)
   ──────────────────────────────────────────────────────────── */
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

/* ────────────────────────────────────────────────────────────
   4️⃣ CORE UI MANIPULATIONS
   ──────────────────────────────────────────────────────────── */

/* Show the Welcome screen and hide everything else */
function showWelcome() {
  // push the current container (welcome) onto the stack
  navStack.push({containerId: 'welcome', previous: null});
  // Start at the Welcome screen
  navIndex = navStack.length - 1;  
  // now show the welcome UI
  document.getElementById('welcome').classList.remove('hidden');
  document.getElementById('carousel').classList.add('hidden');
  document.getElementById('main-orbs').classList.add('hidden');
  document.getElementById('footer-orbs').classList.add('hidden');
}

/* Hide everything that shows a submodule */
function hideSubmoduleScreen() {
  document.getElementById('main-sub').classList.add('hidden');
  document.getElementById('footer-sub').classList.add('hidden');
}

function goBack() {
  if (navIndex <= 0) return;  // Already at Welcome
  
  // Hide current screen
  hideCurrentScreen();
  
  // Move to previous screen
  navIndex--;
  const previous = navStack[navIndex];
  document.getElementById(previous.containerId).classList.remove('hidden');
  
  // Restart carousel if returning to modules
  if (previous.containerId === 'carousel') startCarousel();
}

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

/**
 * Hide the currently visible screen and clean up injected markup.
 * Works for:
 *   - #welcome
 *   - #modules   (carousel)
 *   - #subModules (orb screen)
 *   - #module-container (submodule HTML page)
 */
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

/* ----------  CAROUSEL LOGIC ---------- */
function startCarousel() {
  const container = ensureContainer();   // makes sure #module-container exists
  navStack.push({containerId: 'carousel', previous: navStack[navIndex]}); // Link to current screen
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

/* ----------  ENTER BUTTON HANDLER (Welcome → Carousel) ---------- */
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

/* ----------  MODULE ENTER BUTTONS (carousel → submodule) ---------- */
function bindModuleEnterButtons() {
  document.querySelectorAll('.moduleEnter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modKey = e.currentTarget.closest('.module').dataset.module;
      // Hide carousel and show submodule screen
      hideCurrentScreen();
      showSubmodules(modKey);
    });
  });
}

/* ----------  SUBMODULE LOADING ---------- */
/*
  The function receives:
    - parentKey : the data‑module name (e.g., "stellarxpay",
      "empowerfix", "stellarverse")
    - subKey    : the concrete submodule name (e.g., "create‑epnm")
  It loads the HTML, CSS, and JS for that submodule.
  If nothing exists it shows a "Coming soon" placeholder.
  --------------------------------------------------- */
async function loadSubmodule(parentKey, subKey) {
  // Create a stack entry for this submodule page
  navStack.push({containerId: 'subModulePage', previous: navStack[navIndex]});
  navIndex = navStack.length - 1;

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

  const container = ensureContainer();
  cleanup();                      // remove old CSS/JS
  container.innerHTML = '';       // clear any previous markup

  const fullPath = resolvePath(sub.path);
  const folderName = fullPath.split(/[/\\]/).pop();
  try {
    // ---- Load HTML -------------------------------------------------
    const htmlResp = await fetch(`${fullPath}/${folderName}.html`);
    if (!htmlResp.ok) throw new Error('HTML not found');  // FIXED: resp -> htmlResp
    const html = await htmlResp.text();                   // FIXED: resp -> htmlResp
    container.innerHTML = html;
    // Hide the orb screen that is underneath
    document.getElementById('main-orbs').classList.add('hidden');
    // Inject a Back button into the newly loaded submodule
    const backBtn = document.createElement('button');
    backBtn.id = 'submoduleBackBtn';
    backBtn.textContent = '← Back';
    backBtn.onclick = goBack;             // uses the helper we’ll add below
    container.prepend(backBtn);           // put it at the very top of the container



    // ---- Load CSS (optional) ---------------------------------------
    try {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${base}.css`;
      console.log('Loading CSS from', link.href);
      document.head.appendChild(link);
      injectedElements.push(link);
    } catch (_) {}

    // ---- Load JS (optional) ----------------------------------------
    try {
      const script = document.createElement('script');
      script.src = `${base}.js`;
      document.body.appendChild(script);
      injectedElements.push(script);
    } catch (_) {}
  } catch (err) {
    // ---- Show "Coming soon" placeholder on error -----------------
    container.innerHTML = `
      <div class="sub-header" align="center" style="color:#e892f7;">
        <h2>${sub.name}</h2>
        <p style="color:#e892f7;">${err.message}</p>
        <button onclick="closeSubmodule()">← Close</button>
      </div>`;
    console.error(err);
  }
}

/* ----------  SHOW SUBMODULES (NEW) ---------- */
function showSubmodules(moduleKey) {
  // Save current screen before navigating
  const currentScreen = navStack[navIndex];
  
  // Push the submodule orbs screen onto the stack
  pushScreen({
    containerId: 'main-orbs',
    previous: currentScreen,
    moduleKey: moduleKey,
    type: 'main-orbs'
  })
  
  const mod = REGISTRY[moduleKey];
  if (!mod) { console.warn('No registry entry for', moduleKey); return; }

  // 1️⃣ Remember where we are
  navStack.push({containerId: 'main-orbs', previous: currentScreen});

  // 2️⃣ Build the submodule UI (same as before)
  const modInfo = REGISTRY[moduleKey];
  const subKeys = Object.keys(mod.submodules || {});

  // clear any previous content
  document.getElementById('main-orbs').innerHTML = '';
  document.getElementById('main-orbs').classList.remove('hidden');

  const orbsHtml = `
    <div class="sub-header" align="center">
      <h2>${mod.name}</h2>
      <div class="orb-container"></div>
      <button id="backBtn">← Back</button>
    </div>`;
  document.getElementById('main-orbs').innerHTML = orbsHtml;

  const orbContainer = document.getElementById('main-orbs')
                            .querySelector('.orb-container');

  subKeys.forEach(key => {
    const sm = mod.submodules[key];

    const orb = document.createElement('div');
    orb.className = 'orb';
    orb.textContent = sm.name;

    // Check tier and make clickable if available
    if (currentTier >= (sm.minTier || 1)) {
      orb.addEventListener('click', () => loadSubmodule(moduleKey, key));
    } else {
      orb.style.opacity = '0.4';
      orb.addEventListener('click', () => {
        alert(`${sm.name} requires Tier ${sm.minTier}+`);
      });
    }

    orbContainer.appendChild(orb);
  });

  // Back button - use event delegation since button is created dynamically
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      document.getElementById('main-orbs').classList.add('hidden');
      document.getElementById('carousel').classList.remove('hidden');
    });
  }
}

/* ----------  FOOTER MENU HANDLERS ---------- */
function bindFooterItems() {
  document.querySelectorAll('.footer-item').forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.menu;            // e.g., "ptlx"
      showFooterOrbs(type);
    });
  });
}

function openFooterContainer(type) {
  hideCurrentScreen();                 // <-- NEW  (collapses submodule page OR orb screen)

  // Remember where we came from (the screen that was just hidden)
  const previous = navStack[navStack.length - 1] || { containerId: 'welcome' };
  navStack.push({ containerId: 'footer-orbs', previous });

  // Show the footer‑module orb screen
  document.getElementById('footer-orbs').classList.remove('hidden');
  
  // 1️⃣ remember where we are now
  // Save current screen before navigating
  const currentScreen = navStack[navIndex];

  // 2️⃣ show the footer‑module container
  document.getElementById('welcome').classList.add('hidden');
  document.getElementById('carousel').classList.add('hidden');
  document.getElementById('footer-orbs').classList.remove('hidden');

  const mod = REGISTRY[type];
  if (!mod) {
    document.getElementById('footer-orbs').innerHTML = '<p>Module not found.</p>';
    return;
  }

  const subKeys = Object.keys(mod.submodules || {});
  const orbsHTML = `
    <div class="sub-header" align="center">
      <h2>${mod.name}</h2>
      <div class="orb-container"></div>
      <button id="closeBtn">← Close</button>
    </div>
  `;

  document.getElementById('footer-orbs').innerHTML = orbsHTML;
  const orbContainer = document.getElementById('footer-orbs')
                           .querySelector('.orb-container');

  subKeys.forEach(key => {
    const sm = mod.submodules[key];
    const orb = document.createElement('div');
    orb.className = 'orb';
    orb.innerText = sm.name;

    // Tier gating – dim if tier too low
    if (currentTier >= (sm.minTier || 1)) {
      orb.addEventListener('click', () => loadSubmodule(type, key));
    } else {
      orb.style.opacity = '0.4';
      orb.addEventListener('click', () => {
        alert(`${sm.name} requires Tier ${sm.minTier}+`);
      });
    }
    orbContainer.appendChild(orb);
  });

  // Close button – return to the screen that was visible *before* we opened this footer
  function closeSubmodule() {
    // The screen that was visible BEFORE we opened the footer module
    // is stored in the 'previous' property of the current stack entry
    const prev = navStack[navIndex].previous;
    if (!prev) {
      console.error("No previous screen found");
      return;
    }

    // Hide current screen
    document.getElementById('footer-orbs').classList.add('hidden');
    
    // Use closeTo to go back to the screen we were on before opening footer
    closeTo(prev.containerId);
  };

  const closeBtn = document.getElementById('closeBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeSubmodule);
  }
}

/* --------─  GO BACK HELPER  ---------- */
function goBack() {
  if (navIndex <= 0) return; // already at the base screen

  // Hide current screen
  const current = navStack[navIndex];
  if (current.containerId !== 'subModPage') {
    document.getElementById(current.containerId).classList.add('hidden');
  }

  // Step back one level
  navIndex--;
  const previous = navStack[navIndex];

  // Show the previous screen
  document.getElementById(previous.containerId).classList.remove('hidden');

  // Special handling for carousel
  if (previous.containerId === 'carousel') startCarousel();
}

/* ──────────────────────────────────────────────────────────────────────
   9️⃣ INITIALISATION – runs once when the page finishes loading
   ─────────────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────
   🔟 BACK BUTTON HANDLER (FIXED for dynamic buttons)
   ───────────────────────────────────────────────────────────── */
function bindBackButton() {
  // Use event delegation since #backBtn is created dynamically
  document.addEventListener('click', function(event) {
    if (event.target.id === 'backBtn') {
      document.getElementById('main-orbs').classList.add('hidden');
      document.getElementById('carousel').classList.remove('hidden');
    }
  });
}