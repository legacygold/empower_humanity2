// ============================================
// TEMPLATE: Submodule JS
// Save as: {submodule-name}/{submodule-name}.js
// ============================================

(function () {
  'use strict';

  // ── Config ─────────────────────────────
  const CONFIG = {
    // Change to match your submodule key in registry.json
    key: 'REPLACE_WITH_KEY',

    // "Coming soon" message (customize per submodule)
    comingSoonMessage: 'This component is being prepared by the higher realm team. Stay tuned.',

    // Set to true when the submodule has real content
    isActive: false
  };

  // ── DOM Ready ───────────────────────────
  function init() {
    if (!CONFIG.isActive) {
      showComingSoon(CONFIG.comingSoonMessage);
      return;
    }
    // Otherwise, your real initialization code goes here
    renderContent();
  }

  // ── Coming Soon Overlay ─────────────────
  function showComingSoon(msg) {
    const container = document.getElementById('module-container');
    if (!container) return;

    container.innerHTML = `
      <div class="coming-soon-overlay">
        <div class="coming-soon-card">
          <div class="coming-soon-icon">✦</div>
          <h3>${CONFIG.key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h3>
          <p>${msg}</p>
          <button class="coming-soon-close" onclick="closeSubmodule()">← Close</button>
        </div>
      </div>`;
  }

  // ── Your Content Renderer (replace this) ─
  function renderContent() {
    const container = document.getElementById('module-container');
    if (!container) return;

    container.innerHTML = `
      <div class="sub-module-content">
        <h2>${CONFIG.key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h2>
        <p>Real content goes here. Set isActive: true to see this.</p>
        <button onclick="closeSubmodule()">← Close</button>
      </div>`;
  }

  // ── Close Handler ───────────────────────
  window.closeSubmodule = function () {
    const container = document.getElementById('module-container');
    if (container) container.innerHTML = '';
    // Show the parent view again
    document.getElementById('modules').classList.remove('hidden');
    document.getElementById('subModules').classList.add('hidden');
  };

  // ── Boot ────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
