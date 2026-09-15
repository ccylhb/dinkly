// Self-host Google Fonts: keep only the `latin` subset, download woff2 locally,
// rewrite src URLs, emit src/styles/fonts.css. Run: node scripts/selfhost-fonts.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const CSS_URL =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,600;1,9..144,700&family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const KEEP = ["latin"]; // drop latin-ext, cyrillic*, greek*, vietnamese

const root = new URL("../", import.meta.url);
const fontDir = new URL("public/fonts/", root);
mkdirSync(fontDir, { recursive: true });

const res = await fetch(CSS_URL, { headers: { "User-Agent": UA } });
const css = await res.text();

// split into [subsetComment, block] pairs
const blocks = [...css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)];
const kept = [];
const byHash = new Map(); // sha1 -> filename (variable fonts repeat per weight)
let fetched = 0;
let bytes = 0;

for (const [, subset, block] of blocks) {
  if (!KEEP.includes(subset)) continue;
  const fam = block.match(/font-family:\s*'([^']+)'/)[1];
  const weight = block.match(/font-weight:\s*([^;]+);/)[1].trim().replace(/\s+/g, "-");
  const style = block.match(/font-style:\s*([^;]+);/)[1].trim();
  const url = block.match(/url\((https:[^)]+)\)/)[1];

  const bin = await fetch(url, { headers: { "User-Agent": UA } });
  const buf = Buffer.from(await bin.arrayBuffer());
  const hash = createHash("sha1").update(buf).digest("hex").slice(0, 10);

  let file = byHash.get(hash);
  if (!file) {
    file = `${fam.toLowerCase()}-${hash}.woff2`;
    writeFileSync(new URL(file, fontDir), buf);
    byHash.set(hash, file);
    fetched++;
    bytes += buf.length;
  }
  console.log(`${fam.padEnd(9)} ${weight.padEnd(8)} ${style.padEnd(7)} -> ${file}  ${(buf.length / 1024).toFixed(1)} KB`);

  const rewritten = block.replace(/url\(https:[^)]+\)/, `url('/fonts/${file}')`);
  kept.push(`/* ${subset} */\n${rewritten}`);
}

const header = `/* Self-hosted Google Fonts — latin subset only (script: scripts/selfhost-fonts.mjs).
   Replaces the fonts.googleapis.com stylesheet: no third-party DNS/TLS, no cyrillic/greek/vietnamese payload,
   and one file per variable font instead of one per weight. */\n\n`;
writeFileSync(new URL("src/styles/fonts.css", root), header + kept.join("\n\n") + "\n");

console.log(`\nfaces: ${kept.length}  unique files: ${fetched}  total: ${(bytes / 1024).toFixed(1)} KB`);
console.log("wrote src/styles/fonts.css");
