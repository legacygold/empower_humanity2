/* ptlx_handling.js – PTLX Balance Manager
* Reverts to simple, stable localStorage-only storage
* No Telegram CloudStorage (avoids errors)
* No sendData handshake (avoids promise errors)
*/

(function() {
'use strict';

//Resonance threshold check 
if (userResonance > 7.35) { enableCloudSync() }

const tg = window.Telegram?.WebApp;
const isTG = !!tg;

// Connection state
let userId = null;
let isConnected = false;

// Resolve userId from multiple sources
function resolveUserId() {
// 1️⃣ First check URL param (auto‑added by deep link)
const urlUser = new URLSearchParams(window.location.search).get('user_id');
if (urlUser) return urlUser;

// 2️⃣ Then check initData (inline launch)
if (tg?.initDataUnsafe?.user?.id) return tg.initDataUnsafe.user.id;

// 3. Fall back to persisted ID
return localStorage.getItem('ptlx_user_id') || null;
}

tg.onEvent('web_app_data', async (e) => {
const newId = resolveUserId(); // ← will now be populated by deep link
if (newId && !isConnected) {
setConnectionState(true, newId); // store, update UI, refresh balance
}
});

// Storage helpers (localStorage only – no CloudStorage)
const storage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, val) => {
    localStorage.setItem(key, val);
    return Promise.resolve();
  }
};

// Balance management
async function getBalance() {
  if (!userId) return 0;
  const v = await storage.getItem(`ptlx_${userId}`);
  return v ? parseInt(v, 10) : 0;
}

async function setBalance(b) {
  if (!userId) return;
  await storage.setItem(`ptlx_${userId}`, String(b));
}

function updateBalance() {
  getBalance().then(b => {
    document.querySelectorAll('#ptlx-balance').forEach(el => el.textContent = b);
  });
}

// Connection button
function showConnectButton() {
  if (!tg || isConnected) return;
  
  tg.MainButton.text = '🔗 Connect Account';
  tg.MainButton.show();
  tg.MainButton.onClick(() => {
    // Open Telegram bot for connection
    tg.openTelegramLink('https://t.me/empower_testbot?start=connect');
  });
}

// Initialize
function init() {
  userId = resolveUserId();
  isConnected = !!userId;
  
  if (userId) {
    localStorage.setItem('ptlx_user_id', userId);
  }
  
  // Update balance display
  updateBalance();
  
  // Show connect button if not connected
  if (!isConnected && tg) {
    showConnectButton();
  }
}

// Public API
window.addPTLX = async (amt) => {
  if (!userId) { alert('Connect your account first'); return; }
  const b = await getBalance();
  await setBalance(b + amt);
  updateBalance();
};

window.redeemPTLX = async (amt) => {
  if (!userId) { alert('Connect your account first'); return; }
  const b = await getBalance();
  if (amt > b) { alert(`Insufficient balance! You have ${b} PTLX.`); return; }
  await setBalance(b - amt);
  updateBalance();
};

window.giftPTLX = async (toId, amt) => {
  if (!userId) { alert('Connect your account first'); return; }
  const fromBal = await getBalance();
  if (amt > fromBal) { alert(`Insufficient balance! You have ${fromBal} PTLX.`); return; }
  
  // Deduct from sender
  await setBalance(fromBal - amt);
  
  // Add to recipient
  const toBalKey = `ptlx_${toId}`;
  const toBal = parseInt((await storage.getItem(toBalKey)) || '0', 10);
  await storage.setItem(toBalKey, String(toBal + amt));
  
  updateBalance();
};

window.adminAddPTLX = async (targetId, amt) => {
  if (!userId) { alert('Connect your account first'); return; }
  if (String(userId) !== '525612398') {
    alert('Admin function restricted to creator only');
    return;
  }
  
  const cur = parseInt((await storage.getItem(`ptlx_${targetId}`)) || '0', 10);
  await storage.setItem(`ptlx_${targetId}`, String(cur + amt));
  updateBalance();
};

// Daily caps
const MAX_CHAT = 10, MAX_TUT = 3;

async function getDaily(key) {
  const v = await storage.getItem(key);
  return v ? parseInt(v, 10) : 0;
}

async function incDaily(key) {
  const c = await getDaily(key);
  await storage.setItem(key, String(c + 1));
}

window.processChatMessage = async () => {
  if (!userId) return;
  const key = `ptlx_chat_${userId}_${new Date().toISOString().slice(0, 10)}`;
  if (await getDaily(key) >= MAX_CHAT) return;
  await addPTLX(1);
  await incDaily(key);
};

window.completeTutorial = async () => {
  if (!userId) return;
  const key = `ptlx_tut_${userId}_${new Date().toISOString().slice(0, 10)}`;
  if (await getDaily(key) >= MAX_TUT) return;
  await addPTLX(10);
  await incDaily(key);
};

// Auto-refresh
setInterval(updateBalance, 3000);

// Run init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();