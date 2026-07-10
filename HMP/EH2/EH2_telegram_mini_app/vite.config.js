import { defineConfig } from 'vite';

export default defineConfig({
  base: '/empower_humanity2/',   // VERY IMPORTANT
  plugins: [require('lit-plugin-html')] // Ensures proper template compilation
})


