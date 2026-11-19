import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("primary navigation exposes four stable destinations", async () => {
  const app = await read("src/App.tsx");
  for (const label of ["Today", "Tasks", "Focus", "Settings"]) assert.match(app, new RegExp(`"${label}"`));
  assert.match(app, /className="tab-bar"/);
});

test("core task interactions remain implemented", async () => {
  const app = await read("src/App.tsx");
  for (const action of ["addTask", "toggleTask", "deleteTask", "setFilter"]) assert.match(app, new RegExp(action));
  assert.match(app, /localStorage/);
});

test("sheet is accessible, draggable, and opaque", async () => {
  const [sheet, css] = await Promise.all([read("src/components/IosSheet.tsx"), read("src/App.css")]);
  assert.match(sheet, /role="dialog"/);
  assert.match(sheet, /onPointerDown/);
  assert.match(sheet, /aria-modal="true"/);
  assert.match(css, /\.ios-sheet[^}]*background:\s*var\(--surface\)/s);
});

test("design skill protects touch size and reduced motion", async () => {
  const [skill, css] = await Promise.all([read(".design-rules/SKILL.md"), read("src/index.css")]);
  assert.match(skill, /44×44/);
  assert.match(skill, /prefers-reduced-motion/);
  assert.match(css, /prefers-reduced-motion/);
});
