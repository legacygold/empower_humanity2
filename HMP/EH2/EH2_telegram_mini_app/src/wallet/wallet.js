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
url: "https://legacygold.github.io/empower_humanity2/HMP/EH2/EH2_telegram_mini_app/index.html",
},
}),
],
});

// Export a function to render the button AFTER HTML exists
function renderWalletConnectButton() {
const wrapper = document.getElementById('stellarButtonWrapper');
if (wrapper) {
StellarWalletsKit.createButton(wrapper, {
children: "Connect Stellar Wallet"
});
}
}

/* ---------------- TON CONNECT (placeholder) ---------------- */
function renderTonConnectButton() {
const wrapper = document.getElementById('tonButtonWrapper');
if (wrapper) {
const button = document.createElement('button');
button.textContent = "Connect TON Wallet";
wrapper.appendChild(button);
// TODO: add TON Connect library integration here
console.log('TON Connect not yet implemented');
}
}

renderWalletConnectButton(); // Renders Stellar Wallet Connect button
renderTonConnectButton(); // Renders TON Connect button (placeholder)





