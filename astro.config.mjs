import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite"; // Integración moderna y directa de Tailwind

// https://astro.build
export default defineConfig({
  // 1. URL de producción de tu blog
  site: "https://moroccoblu.com",

  // 2. Integraciones estándar (removimos por completo el bloque obsoleto de fuentes)
  integrations: [mdx(), sitemap()],

  // 3. Compilador de Tailwind inyectado directo en Vite
  vite: {
    plugins: [tailwindcss()],
  },

  // 4. Tus redirecciones estáticas básicas protegidas
  redirects: {
    "/feed": { status: 301, destination: "/rss.xml" },
    "/comments/feed": { status: 301, destination: "/blog" },
  },
});
