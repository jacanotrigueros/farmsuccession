import { readFileSync } from "node:fs";
const files = [
  "frontend/src/components/Needs.astro",
  "frontend/src/components/ResourceList.astro",
  "frontend/src/components/SearchView.astro",
  "frontend/src/pages/[...territory].astro",
  "frontend/test/reporting.test.ts",
  "frontend/test/territory-presentation.test.ts",
];
for (let id = 0; id < files.length; id++) {
  const source = readFileSync(files[id], "utf8");
  let n = 0;
  for (let i = 0; i < source.length; i += 1200) {
    console.log(`FSUX_FORMAT:${id}:${n++}:${JSON.stringify(source.slice(i, i + 1200))}`);
  }
  console.log(`FSUX_END:${id}:${n}`);
}
