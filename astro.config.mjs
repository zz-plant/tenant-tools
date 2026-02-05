import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";

export default defineConfig({
  compressHTML: true,
  output: "server",
  adapter: cloudflare(),
  integrations: [react()],
});
