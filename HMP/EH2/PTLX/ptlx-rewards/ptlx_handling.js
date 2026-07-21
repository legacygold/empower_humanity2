/* ptlx_handling.js – PTLX Balance Manager
* Cross-device sync via Telegram CloudStorage (with localStorage fallback)
* Works inside Telegram WebApp, falls back to localStorage in browsers
*/

(function () {
  'use strict';

  // Telegram WebApp context
  const tg = window.Telegram?.WebApp;
  const isTG = !!tg;
  if (isTG) tg.ready();

  // Connection state
  let userId = null;
  let isConnected = false;

  // Storage layer – intelligently uses CloudStorage when available
  const storage = {
    async getItem(key) {
      // Try Telegram CloudStorage first
      if (isTG && tg.CloudStorage) {
        try {
          return await new Promise((resolve) => {
            tg.CloudStorage.getItem(key, (error, value) => {
              if (error) {
                console.warn('CloudStorage getItem error:', error);
                resolve(null);
              } else {
                resolve(value);
              }
            });
          });
        } catch (e) {
          console.warn('CloudStorage getItem exception:', e);
        }
      }
      // Fallback to localStorage
      return localStorage.getItem(key);
    },

    async setItem(key, value) {
      // Try Telegram CloudStorage first
      if (isTG && tg.CloudStorage) {
        try {
          return await new Promise((resolve, reject) => {
            tg.CloudStorage.setItem(key, value, (error) => {
              if (error) {
                console.warn('CloudStorage setItem error:', error);
                // Continue to localStorage as fallback
                localStorage.setItem(key, value);
                resolve();
              } else {
                resolve();
              }
            });
          });
        } catch (e) {
          console.warn('CloudStorage setItem exception:', e);
        }
      }
      // Fallback to localStorage
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
  };

  // Resolve userId from URL, initData, or storage
  function resolveUserId() {
    // 1. URL parameter (from deep link)
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get('user_id');
    if (urlUserId) return urlUserId;

    // 2. Telegram inline launch (has full initData)
    if (tg?.initDataUnsafe?.user?.id) {
      return String(tg.initDataUnsafe.user.id);
    }

    // 3. Previously stored ID
    return localStorage.getItem('ptlx_user_id') || null;
  }

  // Balance helpers
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
    getBalance().then((b) => {
      const display = isNaN(b) ? 0 : b;
      document.querySelectorAll('#ptlx-balance').forEach((el) => {
        el.textContent = display;
      });
    });
  }

  // Connection state management
  function setConnectionState(connected, id = null) {
    isConnected = connected;
    if (id !== null) {
      userId = id;
      localStorage.setItem('ptlx_user_id', id);
      // Also store in CloudStorage for cross-device sync
      storage.setItem('ptlx_user_id', id).catch(console.warn);
    }
    if (!connected) {
      localStorage.removeItem('ptlx_user_id');
    }
  }

  // Show/hide Connect button
  function showConnectButton() {
    if (!tg || isConnected) return;
    tg.MainButton.text = '🔗 Connect Account';
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
      tg.openTelegramLink('https://t.me/empower_testbot?start=connect');
    });
  }

  function hideConnectButton() {
    if (tg) tg.MainButton.hide();
  }

  // Handle handshake from Telegram
  function handleHandshake() {
    const newUserId = resolveUserId();
    if (newUserId && newUserId !== userId) {
      setConnectionState(true, newUserId);
      updateBalance();
      hideConnectButton();
      
      if (tg) {
        tg.MainButton.text = '✅ Connected!';
        tg.MainButton.show();
        setTimeout(() => {
          if (isConnected) {
            tg.MainButton.text = '🏠 Open Rewards';
            tg.MainButton.onClick(() => window.location.reload());
          }
        }, 1500);
      }
    }
  }

  // Initialize connection
  async function initConnection() {
    userId = resolveUserId();
    isConnected = !!userId;
    
    if (userId) {
      localStorage.setItem('ptlx_user_id', userId);
      await storage.setItem('ptlx_user_id', userId);
    }
    
    updateBalance();
    
    if (!isConnected && tg) {
      showConnectButton();
    }
  }

  // Public API - PTLX functions
  window.addPTLX = async (amt) => {
    if (!userId) return alert('Connect your account first');
    const amount = parseInt(amt, 10) || 0;
    const b = await getBalance();
    await setBalance(b + amount);
    updateBalance();
  };

  window.redeemPTLX = async (amt) => {
    if (!userId) return alert('Connect your account first');
    const amount = parseInt(amt, 10) || 0;
    const b = await getBalance();
    if (amount > b) return alert(`Insufficient balance! You have ${b} PTLX`);
    await setBalance(b - amount);
    updateBalance();
  };

  window.giftPTLX = async (toId, amt) => {
    if (!userId) return alert('Connect your account first');
    const amount = parseInt(amt, 10) || 0;
    const fromBal = await getBalance();
    if (amount > fromBal) return alert(`Insufficient balance! You have ${fromBal} PTLX`);
    await setBalance(fromBal - amount);
    const toBal = parseInt((await storage.getItem(`ptlx_${toId}`)) || '0', 10);
    await storage.setItem(`ptlx_${toId}`, String(toBal + amount));
    updateBalance();
  };

  window.adminAddPTLX = async (targetId, amt) => {
    if (!userId) return alert('Connect your account first');
    if (String(userId) !== '525612398') return alert('Admin only');
    const amount = parseInt(amt, 10) || 0;
    const cur = parseInt((await storage.getItem(`ptlx_${targetId}`)) || '0', 10);
    await storage.setItem(`ptlx_${targetId}`, String(cur + amount));
    updateBalance();
  };

  // Daily caps
  const MAX_CHAT = 10,
    MAX_TUT = 3;

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

  // Setup Telegram event listeners
  if (tg) {
    tg.onEvent('web_app_data', handleHandshake);
    tg.onEvent('theme_changed', updateBalance);
  }

  // Auto-refresh balance
  setInterval(updateBalance, 3000);

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', initConnection);
})();