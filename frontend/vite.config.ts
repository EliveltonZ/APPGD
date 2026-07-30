import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../backend/public',
    emptyOutDir: true,
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "pwa-192.svg", "pwa-512.svg"],
      manifest: {
        name: "Geração Design",
        short_name: "GD",
        description: "Sistema de gestão Geração Design",
        theme_color: "#2478C8",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        orientation: "portrait",
        icons: [
          {
            src: "pwa-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "pwa-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
