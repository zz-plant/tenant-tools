import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

const site = process.env.SITE_URL?.trim() || "https://tenants.kanav.net";

export default defineConfig({
  site,
  compressHTML: true,
  output: "server",
  // The app does not use Astro sessions. Without this, the Cloudflare adapter expects a `SESSION`
  // KV binding that does not exist.
  session: false,
  // No page uses astro:assets, so no image service runs (and no sharp warning at build time).
  adapter: cloudflare({ imageService: "passthrough" }),
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        const privatePrefixes = ["/buildings/", "/submissions/"];
        return !privatePrefixes.some((prefix) => page.startsWith(prefix));
      },
    }),
  ],
});
