import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

const configuredSite = process.env.SITE_URL?.trim() || "https://galina.kanav.net";
const inferredSite =
  process.env.CF_PAGES_URL?.trim()
    ? `https://${process.env.CF_PAGES_URL.trim()}`
    : process.env.DEPLOY_PRIME_URL?.trim() || process.env.URL?.trim();
const site = configuredSite || inferredSite;


export default defineConfig({
  site,
  compressHTML: true,
  output: "server",
  // The app does not use Astro sessions. Without a driver, the Cloudflare adapter expects a
  // `SESSION` KV binding that does not exist.
  session: { driver: "null" },
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
