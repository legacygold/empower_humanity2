// wallet.js 

import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit-tech/stellar-wallets-kit/modules/utils";
import { WalletConnectModule } from "@creit-tech/stellar-wallets-kit/modules/wallet-connect";
import { SwkAppDarkTheme } from "@creit-tech/stellar-wallets-kit/types";

// 1️⃣ Initialise SWK (only once)
StellarWalletsKit.init({
theme: SwkAppDarkTheme,
modules: [
...defaultModules(), // Lobstr, Freighter, etc.
new WalletConnectModule({
projectId: "48b7bf0dacf7920c182f112b3cc388a8", // your Project ID
metadata: {
name: "Empower Humanity 2.0 Wallet Management",
description: "Connect wallet for EH 2.0",
icons: ["https://legacygold.github.io/empower_humanity2/HMP/EH2/EH2_telegram_mini_app/assets/logo.JPG"],
url: "https://legacygold.github.io/empower_humanity2/",
},
}),
],
});

// 2️⃣ Define buttons
const buttonWrapper = document.querySelector("#buttonWrapper");
StellarWalletsKit.createButton(buttonWrapper);

// 3️⃣ Wire Stellar WalletConnect
buttonWrapper.addEventListener("click", async () =>  {
try {
// Show wallet selector
const { address } = await StellarWalletsKit.authModal(); // Requires setup below
console.log('Connected Stellar address:', address);
alert('Connected wallet:\\n' + address);
// TODO: Save address and update UI
} catch (err) {
console.error('Stellar connect failed:', err);
}
});

/* ---------------- TON CONNECT (placeholder) ---------------- */
function connectTONwallet() {
// TODO: add TON Connect library integration here
console.log('TON Connect not yet implemented');
}

// Show "Connected Wallets"
document.getElementById('openConnectedWallets').onclick = () => {
hideAll();
show('connected-wallets-screen');
renderConnectedWallets(); // pull from stored data
};

// Placeholdr for "Wallet(s) Dashboard" UI logic
function showTONwallet() {} // Will show connected TON wallet (s) and allow users to manage them (e.g. view balance, transaction history, etc.)
function showStellarWallet() {} // Will show connected Stellar wallet (s) and allow users to manage them (e.g. view balance, transaction history, etc.)

function hideAll() {
document.querySelectorAll('.body.hidden').forEach(el => el.classList.add('hidden'));
}

function show(id) {
document.getElementById(id).classList.remove('hidden');
}

document.querySelectorAll('.expandable-section').forEach(section => {
section.addEventListener('click', e => {
if (e.target.closest('.section-title')) {
section.classList.toggle('collapsed');
}
});
});


