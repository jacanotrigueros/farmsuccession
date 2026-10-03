// @ts-check
import path from "node:path";

import tailwind from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

/**
 * Where the repository is, injected as a constant because this file is the only one that can know.
 *
 * The site reads `data/` through the repository's own loaders, and those resolve their default paths from
 * their own module location — which is correct when the gate runs them and wrong once Vite has bundled
 * them into `dist/`, where they would look for the data beside the bundle and find nothing. So the site
 * says where the data is rather than inheriting a default, and it fails loudly if it is ever wrong.
 */
const repositoryRoot = path.resolve(import.meta.dirname, "..");

/**
 * A static site, built once and served as files.
 *
 * Nothing here adds a client runtime: there is no framework integration, no prefetching and no
 * third-party request, because the audience is on a rural connection and often on a phone. The site also
 * reads the repository's own `src/` for the types and the territorial model the validators use, which is
 * why Vite is allowed to resolve one directory above this one.
 */
export default defineConfig({
  site: "https://farmsuccession.eu",
  trailingSlash: "always",
  build: { format: "directory" },
  devToolbar: { enabled: false },
  /**
   * No image is fetched from anywhere: every asset is first-party and committed. Astro's default is
   * already this, and it is written out because it is load-bearing — it is the reason the one advisory in
   * this dependency tree (CVE-2026-93748, in the library Astro uses to cache remote images, and for which
   * no patched version exists) cannot be reached from this build. A test keeps both lists empty, so the
   * day somebody adds a remote image the assessment is re-made instead of silently expiring.
   */
  image: { domains: [], remotePatterns: [] },
  vite: {
    plugins: [tailwind()],
    server: { fs: { allow: [".."] } },
    define: { __REPOSITORY_ROOT__: JSON.stringify(repositoryRoot) },
  },
});
