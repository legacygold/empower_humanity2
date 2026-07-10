import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
  include: [
  '@creit-tech/stellar-wallets-kit',
  '@creit-tech/stellar-wallets-kit/modules/utils',
  '@creit-tech/stellar-wallets-kit/modules/wallet-connect',
  '@creit-tech/stellar-wallets-kit/types',// <-- the JSR packages names
  ],
  },
  base: '/empower_humanity2/',   // VERY IMPORTANT
  plugins: [require('lit-plugin-html')] // Ensures proper template compilation
})


