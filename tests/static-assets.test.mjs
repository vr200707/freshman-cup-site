import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("loads local stylesheet and module entrypoints", async () => {
  const html = await readFile(path.join(root, "index.html"), "utf8");
  assert.match(html, /href="styles\.css"/);
  assert.match(html, /type="module" src="app\.js"/);
});

test("uses the supplied local pencil artwork", async () => {
  const css = await readFile(path.join(root, "styles.css"), "utf8");
  assert.match(css, /assets\/pencil-football-background\.png/);
  const imagePath = path.join(root, "assets", "pencil-football-background.png");
  await access(imagePath, constants.R_OK);
  assert.ok((await stat(imagePath)).size > 100_000);
});

test("switches fixtures to one column on small screens", async () => {
  const css = await readFile(path.join(root, "styles.css"), "utf8");
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*?\.fixture-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
});
