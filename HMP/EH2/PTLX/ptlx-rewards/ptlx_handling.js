/* ptlx_handling.js – PTLX Balance Manager with Telegram handshake
* Complete PTLX Balance Manager
* Implements global addPTLX, redeemPTLX, giftPTLX, and adminAddPTLX.
* Stores balances across devices via Telegram CloudStorage (fallback to localStorage).
* Tracks daily chat/tutorial caps (10 chat = 10 PTLX per day; max 3 tutorials = 30 PTLX per day).
* Exposes UI helpers for one‑click earning, redemption, gifting and admin grants.
* Automatic balance display on any injected sub‑module page (checks every 3s).
*/

(function () {
'use strict';

const tg = window.Telegram?.WebApp;
const isTG = !!tg;

/* ---- 1. Resolve userId (handshake) ---- */
function getUserId() {
if (tg?.initDataUnsafe?.user?.id) return tg.initDataUnsafe.user.id;
const params = new URLSearchParams(window.location.search);
if (params.get('user_id')) return params.get('user_id');
const stored = localStorage.getItem('ptlx_user_id');
if (stored) return stored;
return null;
}

let userId = getUserId();

function showConnectButton() {
if (tg?.MainButton) {
tg.MainButton.text = '🔗 Connect Account';
tg.MainButton.show();
tg.MainButton.onClick(() => { tg.sendData('CONNECT_USER'); tg.MainButton.hide(); });
} else {
const btn = document.createElement('button');
btn.textContent = '🔗 Connect Account';
btn.onclick = () => alert('In Telegram this calls tg.sendData("CONNECT_USER")');
document.body.appendChild(btn);
}
}

if (!userId) { showConnectButton(); return; }
localStorage.setItem('ptlx_user_id', userId);

/* ---- 2. Storage helpers ---- */
const storage = {
async getItem(key) {
if (isTG) return new Promise(r => tg.CloudStorage.getItem(key, (_, v) => r(v)));
return Promise.resolve(localStorage.getItem(key));
},
async setItem(key, val) {
if (isTG) return new Promise(r => tg.CloudStorage.setItem(key, val, (_, s) => r(s)));
localStorage.setItem(key, val);
return Promise.resolve();
}
};

const BAL_KEY = `ptlx_${userId}`;
const TODAY = new Date().toISOString().slice(0, 10);

async function getBalance() {
const v = await storage.getItem(BAL_KEY);
return v ? parseInt(v, 10) : 0;
}
async function setBalance(b) { await storage.setItem(BAL_KEY, String(b)); }

function updateBalance() {
getBalance().then(b => {
const el = document.getElementById('ptlx-balance');
if (el) el.textContent = b;
});
}

/* ---- 3. Public API ---- */
window.addPTLX = async (amt) => { const b = await getBalance(); await setBalance(b + amt); updateBalance(); };
window.redeemPTLX = async (amt) => { const b = await getBalance(); await setBalance(Math.max(0, b - amt)); updateBalance(); };
window.giftPTLX = async (toId, amt) => {
const from = parseInt(await storage.getItem(`ptlx_${userId}`) || '0', 10);
await setBalance(Math.max(0, from - amt));
const to = parseInt(await storage.getItem(`ptlx_${toId}`) || '0', 10);
await storage.setItem(`ptlx_${toId}`, String(to + amt));
updateBalance();
};
window.adminAddPTLX = async (targetId, amt) => {
if (isTG && tg.initDataUnsafe?.user?.id !== 525612398) { console.error('Unauthorized'); return; }
const cur = parseInt(await storage.getItem(`ptlx_${targetId}`) || '0', 10);
await storage.setItem(`ptlx_${targetId}`, String(cur + amt));
updateBalance();
};

/* ---- 4. Earning logic (chat / tutorial) ---- */
const MAX_CHAT = 10, CHAT_EARN = 1, MAX_TUT = 3, TUT_EARN = 10;

async function getDaily(key) { return parseInt(await storage.getItem(key) || '0', 10); }
async function incDaily(key) { const c = await getDaily(key); await storage.setItem(key, String(c + 1)); }

window.processChatMessage = async () => {
const chatKey = `ptlx_chat_${userId}_${TODAY}`;
if (await getDaily(chatKey) >= MAX_CHAT) return;
await addPTLX(CHAT_EARN);
await incDaily(chatKey);
};
window.completeTutorial = async () => {
const tutKey = `ptlx_tut_${userId}_${TODAY}`;
if (await getDaily(tutKey) >= MAX_TUT) return;
await addPTLX(TUT_EARN);
await incDaily(tutKey);
};

/* ---- 5. Auto‑refresh ---- */
setInterval(updateBalance, 3000);
updateBalance();
})();

