/* ptlx_handling.js – PTLX Balance Manager
* Acts like localStorage but uses Telegram CloudStorage
* No sendData handshake (avoids promise errors)
*/

(function() {
'use strict';

// Catch silent errors in async event handlers
window.addEventListener('unhandledrejection', event => {
    console.error('⚠️ UNHANDLED PROMISE REJECTION:', event.reason);
    alert('Error: ' + event.reason); // Force an alert so you see it
});

window.addEventListener('error', event => {
    console.error('⚠️ GLOBAL ERROR:', event.message, event.filename, event.lineno);
    alert('Script Error: ' + event.message);
});

//Resonance threshold check
const userResonance = navigator.getBattery ? 7.35 : 0; // Placeholder 
if (userResonance > 7.35) { enableCloudSync() }

// 1. Ensure Telegram is Ready
const tg = window.Telegram.WebApp;
if (tg) tg.ready();

// 2. Simplified Wrapper
const TelegramStorage = {
    getItem: async (key) => {
        // If inside Telegram and CloudStorage exists
        if (tg && tg.CloudStorage) {
            try {
                return await tg.CloudStorage.getItem(key);
            } catch (e) {
                console.error("CloudStorage getItem error:", e);
                return null; // Return null on error to prevent NaN
            }
        }
        // Fallback (should not happen in Telegram if init worked)
        return localStorage.getItem(key);
    },
    
    setItem: async (key, value) => {
        if (tg && tg.CloudStorage) {
            try {
                await tg.CloudStorage.setItem(key, value);
            } catch (e) {
                console.error("CloudStorage setItem error:", e);
            }
        } else {
            localStorage.setItem(key, value);
        }
    }
};

// Connection state
let userId = null;
let isConnected = false;

// Resolve userId from multiple sources
// Uses TelegramStorage wrapper
async function resolveUserId() {
  // 1️⃣ First check URL param (sync)
  const urlUser = new URLSearchParams(window.location.search).get('user_id');
  if (urlUser) return urlUser;

  // 2️⃣ Then check initData (sync)
  if (tg?.initDataUnsafe?.user?.id) {
    const id = tg.initDataUnsafe.user.id;
    // Save to cloud/local for future (fire-and-forget)
    TelegramStorage.setItem('ptlx_user_id', id).catch(console.error); 
    return id;
  }

  // 3️⃣ Fall back to persisted ID (ASYNC - MUST await)
  // Uses your wrapper which handles CloudStorage vs localStorage automatically
  const storedId = await TelegramStorage.getItem('ptlx_user_id');
  return storedId || null;
}

tg.onEvent('web_app_data', async (e) => {
const newId = await resolveUserId(); // ← will now be populated by deep link
if (newId && !isConnected) {
setConnectionState(true, newId); // store, update UI, refresh balance
}
});

// Balance management
async function getBalance() {
  if (!userId) return 0;
  const v = await TelegramStorage.getItem(`ptlx_${userId}`);
  return v ? parseInt(v, 10) : 0;
}

async function setBalance(b) {
  if (!userId) return;
  await TelegramStorage.setItem(`ptlx_${userId}`, String(b));
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
async function init() {
  // 1. Await the Promise to get the actual ID string
  userId = await resolveUserId();
  isConnected = !!userId;
  
  if (userId) {
    // 2. Save to CloudStorage (via your hybrid helper) instead of direct localStorage
    // This ensures it syncs across devices if in Telegram
    await TelegramStorage.setItem('ptlx_user_id', userId);
  }
  
  // 3. Update balance display (ensure updateBalance is also ready to handle async if it reads storage)
  updateBalance();
  
  // 4. Show connect button if not connected
  if (!isConnected && tg) {
    showConnectButton();
  }
}

// IMPORTANT: You must call init() with await or .then() wherever it is invoked
// Example: init(); -> await init(); (if inside another async function)

// Public API
window.addPTLX = async (amt) => {
  if (!userId) { alert('Connect your account first'); return; }
  const amount = parseInt(amt, 10); // Ensure number
  const b = await getBalance();
  await setBalance(b + amount);
  updateBalance();
};

window.redeemPTLX = async (amt) => {
  if (!userId) { alert('Connect your account first'); return; }
  const amount = parseInt(amt, 10); // Ensure number
  const b = await getBalance();
  if (amount > b) { alert(`Insufficient balance! You have ${b} PTLX.`); return; }
  await setBalance(b - amount);
  updateBalance();
};

window.giftPTLX = async (toId, amt) => {
  if (!userId) { alert('Connect your account first'); return; }
  const fromBal = await getBalance();
  const amount = parseInt(amt, 10); // Ensure number
  if (amount > fromBal) { alert(`Insufficient balance! You have ${fromBal} PTLX.`); return; }
  
  // Deduct from sender
  await setBalance(fromBal - amount);
  
  // Add to recipient
  const toBalKey = `ptlx_${toId}`;
  const toBal = parseInt((await TelegramStorage.getItem(toBalKey)) || '0', 10);
  await TelegramStorage.setItem(toBalKey, String(toBal + amount));
  
  updateBalance();
};

window.adminAddPTLX = async (targetId, amt) => {
  if (!userId) { alert('Connect your account first'); return; }
  if (String(userId) !== '525612398') {
    alert('Admin function restricted to creator only');
    return;
  }

  const amount = parseInt(amt, 10); // Ensure number
  
  const cur = parseInt((await TelegramStorage.getItem(`ptlx_${targetId}`)) || '0', 10);
  await TelegramStorage.setItem(`ptlx_${targetId}`, String(cur + amount));
  updateBalance();
};

// Daily caps
const MAX_CHAT = 10, MAX_TUT = 3;

async function getDaily(key) {
  const v = await TelegramStorage.getItem(key);
  return v ? parseInt(v, 10) : 0;
}

async function incDaily(key) {
  const c = await getDaily(key);
  await TelegramStorage.setItem(key, String(c + 1));
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
  document.addEventListener('DOMContentLoaded', () => {
    (async () => {
      try {
        await init();
      } catch (error) {
        console.error("Initialization failed:", error);
      }
    })();
  });
} else {
  (async () => {
    try {
      await init();
    } catch (error) {
      console.error("Initialization failed:", error);
    }
  })();
}
})();