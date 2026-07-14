/* ptlx_handling.js – Complete PTLX Balance Manager
* Implements global addPTLX, redeemPTLX, giftPTLX, and adminAddPTLX.
* Stores balances across devices via Telegram CloudStorage (fallback to localStorage).
* Tracks daily chat/tutorial caps (10 chat = 10 PTLX per day; max 3 tutorials = 30 PTLX per day).
* Exposes UI helpers for one‑click earning, redemption, gifting and admin grants.
* Automatic balance display on any injected sub‑module page (checks every 3s).
*/

(function () {
'use strict';

/* ==== CONFIGURATION ==== */
const STORAGE_KEY = 'ptlx_balance'; // Current user balance
const DAILY_CHAT_KEY = 'ptlx_daily_chat'; // Per-user daily chat counter
const MAX_CHAT_PTLX = 10; // 10 PTLX max from chat per day
const DAILY_TUTORIAL_KEY = 'ptlx_daily_tutorial'; // Per‑user daily tutorial counter
const MAX_TUTORIALS = 3; // 3 tutorials per day
const TUTORIAL_PTLX = 10; // PTLX per tutorial
const TODAY = new Date().toISOString().slice(0, 10); // YYYY‑MM‑DD

/* ==== TELEGRAM INTEGRATION ==== */
const tg = window.Telegram.WebApp;
tg.ready(); // Ensure Telegram WebApp is ready
const isTelegram = !!tg;
const userId = tg.initDataUnsafe?.user?.id; // Telegram user ID
const LOCAL_KEY = `ptlx_${userId}`; // localStorage key for current user

/* ---- TEMP DEBUG: show userId on screen ---- */
(function showDebug() {
const box = document.createElement('div');
box.id = 'debug-userid';
box.style.cssText = 'position:fixed;bottom:0;left:0;background:#e00;color:#fff;'
+ 'padding:6px 10px;font-size:14px;z-index:99999;'
+ 'font-family:monospace;';
box.textContent = 'DEBUG userId = ' + (userId || 'undefined');
// Wait for <body> to exist, then append
(document.body || document.documentElement).appendChild(box);
})();


/* ==== PERSISTENCE HELPERS ==== */
async function getBalance() {
if (isTelegram) {
return new Promise((resolve) => {
tg.CloudStorage.getItem(STORAGE_KEY, (err, value) => {
resolve(err || !value ? 0 : parseInt(value, 10));
});
});
}
return parseInt(localStorage.getItem(LOCAL_KEY) || '0', 10);
}

async function setBalance(balance) {
if (isTelegram) {
return new Promise((resolve) => {
tg.CloudStorage.setItem(STORAGE_KEY, String(balance), (err) => {
if (!err) resolve();
});
});
}
localStorage.setItem(LOCAL_KEY, String(balance));
}

/* ==== PER‑USER BALANCE HELPERS ==== */
async function getBalanceForUser(userId) {
const key = `ptlx_${userId}`;
if (isTelegram) {
return new Promise((resolve) => {
tg.CloudStorage.getItem(key, (err, value) => {
resolve(err || !value ? 0 : parseInt(value, 10));
});
});
}
return parseInt(localStorage.getItem(key) || '0', 10);
}

async function setBalanceForUser(userId, balance) {
const key = `ptlx_${userId}`;
if (isTelegram) {
return new Promise((resolve) => {
tg.CloudStorage.setItem(key, String(balance), (err) => {
if (!err) resolve();
});
});
}
localStorage.setItem(key, String(balance));
}

/* ==== DAILY COUNTERS ==== */
async function getDailyChatCount(userId) {
const key = `${DAILY_CHAT_KEY}_${userId}_${TODAY}`;
if (isTelegram) {
return new Promise((resolve) => {
tg.CloudStorage.getItem(key, (err, val) => {
resolve(err || !val ? 0 : parseInt(val, 10));
});
});
}
return parseInt(localStorage.getItem(key) || '0', 10);
}

async function incrementDailyChatCount(userId) {
const key = `${DAILY_CHAT_KEY}_${userId}_${TODAY}`;
const current = await getDailyChatCount(userId);
const next = Math.min(current + 1, MAX_CHAT_PTLX);
if (isTelegram) {
return tg.CloudStorage.setItem(key, String(next));
}
localStorage.setItem(key, String(next));
}

async function getDailyTutorialCount(userId) {
const key = `${DAILY_TUTORIAL_KEY}_${userId}_${TODAY}`;
if (isTelegram) {
return new Promise((resolve) => {
tg.CloudStorage.getItem(key, (err, val) => {
resolve(err || !val ? 0 : parseInt(val, 10));
});
});
}
return parseInt(localStorage.getItem(key) || '0', 10);
}

async function incrementDailyTutorialCount(userId) {
const key = `${DAILY_TUTORIAL_KEY}_${userId}_${TODAY}`;
const current = await getDailyTutorialCount(userId);
const next = Math.min(current + 1, MAX_TUTORIALS);
if (isTelegram) {
return tg.CloudStorage.setItem(key, String(next));
}
localStorage.setItem(key, String(next));
}

/* ==== CORE PUBLIC API ==== */
// Add PTLX to current user
window.addPTLX = async function (amount) {
if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return;
const current = await getBalance();
const newBal = current + amount;
await setBalance(newBal);
updateBalanceDisplay(newBal);
};

// Remove PTLX (can't go below 0)
window.redeemPTLX = async function (amount) {
if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return;
const current = await getBalance();
const newBal = Math.max(0, current - amount);
await setBalance(newBal);
updateBalanceDisplay(newBal);
};

// Transfer PTLX from one user to another
window.giftPTLX = async function (fromUserId, toUserId, amount) {
if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return;
const fromBal = await getBalanceForUser(fromUserId);
await setBalanceForUser(fromUserId, Math.max(0, fromBal - amount));
const toBal = await getBalanceForUser(toUserId);
await setBalanceForUser(toUserId, toBal + amount);
// Refresh the two affected UI elements
const uiEl = document.getElementById('ptlx-balance');
if (uiEl) {
uiEl.textContent = await getBalanceForUser(toUserId); // show the recipient side
}
};

/* ==== ADMIN OVERRIDE (only Debi) ==== */
/* ---- top‑level (no IIFE) ---- */
window.adminAddPTLX = async function(targetUserId, amount) {
if (!window.Telegram?.initDataUnsafe?.user?.id || window.Telegram.initDataUnsafe.user.id !== 525612398) {
console.error('Unauthorized – only Debi (525612398) may call adminAddPTLX');
return;
}
const key = `ptlx_${targetUserId}`;
const cur = parseInt(await window.ptlxStorage.getItem(key) || '0', 10);
const newBal = cur + amount;
await window.ptlxStorage.setItem(key, String(newBal));
// update the UI element (the balance span)
const el = document.getElementById('ptlx-balance');
if (el) el.textContent = String(newBal);
};

/* ==== EARNING LOGIC (chat / tutorial) ==== */
// Award 1 PTLX per chat message, respecting daily cap
window.processChatMessage = async function (userId) {
const dailyChat = await getDailyChatCount(userId);
if (dailyChat >= MAX_CHAT_PTLX) return; // already maxed out today
await addPTLXForUser(userId, 1);
await incrementDailyChatCount(userId);
if (userId === tg?.initDataUnsafe?.user?.id) {
const el = document.getElementById('ptlx-balance');
if (el) el.textContent = await getBalanceForUser(userId);
}
};

// Award 10 PTLX per tutorial, respecting daily cap (max 3/tutorials = 30 PTLX per day)
window.completeTutorial = async function () {
const userId = tg?.initDataUnsafe?.user?.id;
if (!userId) return;
const dailyTuts = await getDailyTutorialCount(userId);
if (dailyTuts >= MAX_TUTORIALS) return; // already maxed out today
await addPTLXForUser(userId, TUTORIAL_PTLX);
await incrementDailyTutorialCount(userId);
const el = document.getElementById('ptlx-balance');
if (el) el.textContent = await getBalanceForUser(userId);
};

/* ==== INTERNAL HELPERS ==== */
async function addPTLXForUser(userId, amount) {
const current = await getBalanceForUser(userId);
await setBalanceForUser(userId, current + amount);
}

/* ==== UI HELPERS ==== */
function updateBalanceDisplay(bal) {
const el = document.getElementById('ptlx-balance');
if (el) el.textContent = bal;
}

function updateBalanceDisplayForUser(userId, bal) {
const el = document.getElementById('ptlx-balance');
if (el) el.textContent = bal;
}

/* ==== INITIALIZATION ==== */
async function init() {
const bal = await getBalance();
updateBalanceDisplay(bal);
// Live‑update any injected page every 3 seconds
setInterval(async () => {
const bal = await getBalance();
const el = document.getElementById('ptlx-balance');
if (el && el.textContent !== String(bal)) {
el.textContent = bal;
}
}, 3000);
}

document.addEventListener('DOMContentLoaded', init);
})();



