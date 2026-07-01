#!/usr/bin/env node
// Bump version A.B.C.D — incrementa o último segmento; ao chegar em 100, rola para o próximo.
// Uso: node scripts/bump-version.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const jsonPath = resolve(root, "public/version.json");
const tsPath = resolve(root, "src/version.ts");

const ROLL = 100;

function bump(v) {
  const p = v.split(".").map((n) => parseInt(n, 10));
  while (p.length < 4) p.push(0);
  p[3] += 1;
  for (let i = 3; i > 0; i--) {
    if (p[i] >= ROLL) {
      p[i] = 0;
      p[i - 1] += 1;
    }
  }
  return p.join(".");
}

const current = JSON.parse(readFileSync(jsonPath, "utf8"));
const next = bump(current.version || "1.0.0.0");
const timestamp = Date.now();

writeFileSync(jsonPath, JSON.stringify({ version: next, timestamp }, null, 2) + "\n");

const ts = readFileSync(tsPath, "utf8").replace(
  /APP_VERSION\s*=\s*"[^"]+"/,
  `APP_VERSION = "${next}"`,
);
writeFileSync(tsPath, ts);

console.log(`Version bumped: ${current.version} → ${next}`);
