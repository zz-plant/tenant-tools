import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

const configuredSite = process.env.SITE_URL?.trim();
const inferredSite =
  process.env.CF_PAGES_URL?.trim()
    ? `https://${process.env.CF_PAGES_URL.trim()}`
    : process.env.DEPLOY_PRIME_URL?.trim() || process.env.URL?.trim();
const site = configuredSite || inferredSite;

if (process.env.NODE_ENV === "production" && !site) {
  console.warn(
    "[config] SITE_URL not set. Canonical URLs and sitemap host may be incomplete in this build."
  );
}

export default defineConfig({
  site,
  compressHTML: true,
  output: "server",
  adapter: cloudflare(),
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
