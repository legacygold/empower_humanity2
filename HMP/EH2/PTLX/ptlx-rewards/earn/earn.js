// Earn.js - Submodule for earning PTLX rewards runs after the page loads
(function () {
  'use strict';

  // Fetch the data, fall back to a tiny hard‑coded list if the file is missing
  function loadData() {
    const fullPath = `../PTLX/ptlx-rewards/earn/`;  // relative to the .html file
    const dataUrl = `${fullPath}/data.json`;   // same folder as the .html file
    return fetch(dataUrl)
      .then(r => r.ok ? r.json() : { components: [] })
      .catch(() => ({ components: [] }));
  }

  // Build a single card from a component definition
  function buildCard(comp) {
    const card = document.createElement('div');
    card.className = 'earn-card';

    // PTLX badge
    const ptsText = comp.ptlxPerUsdc
      ? `${comp.ptlxPerUsdc} PTLX per USDC`
      : `${comp.ptlx} PTLX`;

    card.innerHTML = `
      <div class="earn-card-header">
        <span class="earn-card-label">${comp.label}</span>
        <span class="earn-card-pts">+${ptsText}</span>
      </div>
      <div class="earn-card-desc">${comp.description}</div>
      <button class="earn-card-btn"
              data-action="${comp.action}"
              data-ptlx="${comp.ptlx}"
              data-ptlx-per-usdc="${comp.ptlxPerUsdc || 0}">
        ${comp.action === 'openDonationPage'
          ? 'Donate & Earn'
          : 'Earn ' + comp.ptlx + ' PTLX'}
      </button>
    `;
    return card;
  }

  // Wire up button clicks after the cards are inserted
  function attachHandlers() {
    document.querySelectorAll('.earn-card-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const action = this.dataset.action;
        const pts    = parseInt(this.dataset.ptlx, 10);
        const perUsdc= parseFloat(this.dataset.ptlxPerUsdc);
        handleEarnAction(action, pts, perUsdc);
      });
    });
  }

  // Placeholder actions – replace with your real logic later
  function handleEarnAction(action, pts, perUsdc) {
    switch (action) {
      case 'openEmpowerBot':
        // Minimize the mini‑app and open EmpowerBot Telegram chat
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.close();
        }
        addPTLX(pts);
        break;

      case 'openTutorials':
        // If you have a tutorials submodule built, load it; otherwise show a toast
        if (typeof loadSubmodule === 'function') {
          loadSubmodule('tutorials');
        } else {
          alert('Tutorials submodule coming soon.');
        }
        addPTLX(pts);
        break;

      case 'openTelegramGroup':
        window.open('https://t.me/+egQAdYY7En4yMDYx', '_blank'); // replace with real link
        addPTLX(pts);
        break;

      case 'openDonationPage':
        alert('Donation page coming soon – when ready, 1 USDC = 1 PTLX.');
        break;

      default:
        addPTLX(pts);
    }
  }

  function addPTLX(amount) {
    if (!amount) return;
    let bal = parseInt(localStorage.getItem('ptlxBalance') || '0', 10);
    bal += amount;
    localStorage.setItem('ptlxBalance', String(bal));
    updateBalanceDisplay();
    // Optional: show a little toast / animation here
  }

  function updateBalanceDisplay() {
    const el = document.getElementById('ptlx-balance');
    if (el) el.textContent = localStorage.getItem('ptlxBalance') || '0';
  }

  // Load an earn submodule component based on its registry entry
  async function loadEarnComponent(componentKey) {
    // Load the submodule's data.json (if it exists)
    const dataUrl = `.../PTLX/ptlx-rewards/earn/data.json`;   // same folder as the .html file
    let earnData = null;
    try {
      const resp = await fetch(dataUrl);
      if (resp.ok) earnData = await resp.json();   // now you have the data object
    } catch (e) {
      console.warn(`No data.json found for submodule "${subKey}" under "${parentKey}"`);
    }
    const component = earnData.components.find(c => c.id === componentKey);
    
    if (!component) {
      console.warn('Component not found:', componentKey);
      return;
    }
    
    // component.path now holds the HTML path
    fetch(component.path)
      .then(resp => resp.text())
      .then(html => {
        // inject into the subModuleContainer or whatever container you're using
        document.getElementById('subModuleContainer').innerHTML = html;
      });
  }

  // ── Init ───────────────────────────────────────
  loadData().then(data => {
    const grid = document.getElementById('earn-grid');
    if (!grid) return; // safety

    // Clear any placeholder cards you may have hard‑coded
    grid.innerHTML = '';

    data.components.forEach(comp => {
      const card = buildCard(comp);
      grid.appendChild(card);
    });

    attachHandlers();
    updateBalanceDisplay();
  });
})();
