import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

const site = process.env.SITE_URL || "https://example.com";

export default defineConfig({
  site,
  compressHTML: true,
  output: "server",
  adapter: cloudflare(),
  integrations: [react(), sitemap({
    filter: (page) => {
      const privatePrefixes = ["/buildings/", "/submissions/"];
      return !privatePrefixes.some((prefix) => page.startsWith(prefix));
    },
  })],
});
