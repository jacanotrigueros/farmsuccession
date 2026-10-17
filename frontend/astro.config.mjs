// @ts-check
import path from "node:path";

import tailwind from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import icon from "astro-icon";

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
 * third-party request, because the audience is on a rural connection and often on a phone. The icon set is
 * the same kind of promise: astro-icon writes each icon into the page as inline SVG while the site is
 * built, so there is no icon font, no sprite to fetch and nothing left at runtime. The site also
 * reads the repository's own `src/` for the types and the territorial model the validators use, which is
 * why Vite is allowed to resolve one directory above this one.
 */
export default defineConfig({
  site: "https://farmsuccession.eu",
  integrations: [icon()],
  trailingSlash: "always",
  build: { format: "directory" },
  devToolbar: { enabled: false },
  /**
   * “No third-party request”, said to the reader's browser instead of only to the build.
   *
   * Nothing on this site comes from anywhere else, and a test reads the built pages to prove it. That
   * proves what the build produced; it says nothing about what a page may do once it is open in front of
   * somebody. This policy says it again as a rule the browser enforces — a script, a stylesheet, a font,
   * an image or a connection from another host is refused, and so is a form that would post somewhere
   * else. The mail address a reader writes a correction to is the one exception, and it is named.
   *
   * It is a `<meta>` rather than a header because GitHub Pages sends no headers of its own on a custom
   * domain. That is the whole cost of the choice: `frame-ancestors` exists only as a header, so this
   * covers injected content and not framing.
   *
   * Astro hashes its own inline styles while it builds, so none of this needs `'unsafe-inline'`.
   * `'wasm-unsafe-eval'` is here because Pagefind compiles WebAssembly to search — it permits that and
   * nothing else, and it is not `'unsafe-eval'`.
   */
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self'",
        "font-src 'self'",
        "connect-src 'self'",
        "form-action 'self' mailto:",
        "base-uri 'none'",
        "object-src 'none'",
      ],
      scriptDirective: { resources: ["'self'", "'wasm-unsafe-eval'"] },
      styleDirective: { resources: ["'self'"] },
    },
  },
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
