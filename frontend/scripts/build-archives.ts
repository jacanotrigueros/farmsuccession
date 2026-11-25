/**
 * Freezes every retired edition listed in `archives.json` under `dist/<edition>/` (decisions/038).
 *
 * Each edition is rebuilt from the git tag it was published at, in a throwaway worktree, with that
 * tag's own code and data — the site readers saw, not today's templates over old data — and each built
 * page is rewritten by `archivePage`. Run it after the current edition's build:
 *
 *   npm run build && npm run build:archives
 *
 * With no edition listed it does nothing. Publishing runs it after the build (`.github/workflows/publish.yml`).
 */
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { archivePage, leftOut } from "./archive.ts";
import { words } from "../src/lib/words.ts";

const FRONTEND = path.join(import.meta.dirname, "..");
const REPOSITORY = path.join(FRONTEND, "..");
const DIST = path.join(FRONTEND, "dist");

type Archive = { edition: string; tag: string };
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the repository's own file, checked by test/archive.test.ts
const { archives } = JSON.parse(readFileSync(path.join(FRONTEND, "archives.json"), "utf8")) as { archives: Archive[] };

const run = (command: string, args: string[], cwd: string): void => {
  execFileSync(command, args, { cwd, stdio: "inherit" });
};

function files(dir: string, base = dir): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? files(full, base) : [path.relative(base, full)];
  });
}

for (const { edition, tag } of archives) {
  const work = mkdtempSync(path.join(tmpdir(), `farmsuccession-${edition}-`));
  try {
    run("git", ["worktree", "add", "--detach", work, tag], REPOSITORY);
    run("npm", ["ci"], work);
    run("npm", ["ci", "--prefix", "frontend"], work);
    run("npm", ["run", "build", "--prefix", "frontend"], work);
    const built = path.join(work, "frontend", "dist");
    const target = path.join(DIST, edition);
    rmSync(target, { recursive: true, force: true });
    let pages = 0;
    for (const relative of files(built)) {
      if (leftOut(relative)) continue;
      const from = path.join(built, relative);
      const to = path.join(target, relative);
      mkdirSync(path.dirname(to), { recursive: true });
      if (!relative.endsWith(".html")) {
        cpSync(from, to);
        continue;
      }
      const html = readFileSync(from, "utf8");
      const language = /<html\b[^>]*\blang="([a-z]{2})/u.exec(html)?.[1] ?? "en";
      const text = words(language);
      const pagePath = `/${relative
        .split(path.sep)
        .join("/")
        .replace(/index\.html$/u, "")}`;
      writeFileSync(
        to,
        archivePage(html, {
          edition,
          path: pagePath,
          notice: text.archivedNotice.replace("{edition}", edition),
          link: text.archivedLink,
        }),
      );
      pages += 1;
    }
    console.log(`edition ${edition} (${tag}): ${pages} pages frozen under /${edition}/`);
  } finally {
    run("git", ["worktree", "remove", "--force", work], REPOSITORY);
  }
}
if (archives.length === 0) console.log("no retired edition to archive");
