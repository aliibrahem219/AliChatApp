import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
// https://vite.dev/config/
export default defineConfig({
  base: "/AliChatApp/",
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills(), // This adds all Node globals automatically
  ],

  server: {
    host: true, // This exposes the project on your local network
    port: 5173,
  },
  build: {
    outDir: "dist", // Vite defaults to 'dist', gh-pages uses this to deploy
  },
});
