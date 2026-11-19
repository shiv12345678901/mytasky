import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("primary navigation uses deterministic direct buttons", async () => {
  const app = await read("src/App.tsx");
  for (const label of ["Today", "Tasks", "Settings"]) assert.match(app, new RegExp(`label: "${label}"`));
  assert.match(app, /<nav className="tab-bar"/);
  assert.doesNotMatch(app, /GlassNav|label: "Focus"/);
});

test("core task interactions remain local-first", async () => {
  const app = await read("src/App.tsx");
  for (const action of ["addTask", "toggleTask", "deleteTask", "setFilter"]) assert.match(app, new RegExp(action));
  assert.match(app, /localStorage/);
});

test("Liquid Glass primitives cover controls and sheet", async () => {
  const [app, main] = await Promise.all([read("src/App.tsx"), read("src/main.tsx")]);
  for (const component of ["GlassButton", "GlassCard", "GlassInput", "GlassSegmented", "GlassSheet", "GlassSwitch"]) assert.match(app, new RegExp(component));
  assert.match(main, /@zakisheriff\/liquid-glass\/styles\.css/);
});

test("PWA configuration supports installation and offline navigation", async () => {
  const [config, main, html, app] = await Promise.all([read("vite.config.ts"), read("src/main.tsx"), read("index.html"), read("src/App.tsx")]);
  assert.match(config, /VitePWA/);
  assert.match(config, /display: 'standalone'/);
  assert.match(config, /navigateFallback: '\/index\.html'/);
  assert.match(main, /registerSW/);
  assert.match(main, /onRegisteredSW/);
  assert.match(app, /App update available/i);
  assert.match(html, /apple-touch-icon/);
  await Promise.all(["public/app-icon.svg", "public/pwa-192x192.png", "public/pwa-512x512.png", "public/pwa-maskable-512x512.png"].map((path) => access(new URL(`../${path}`, import.meta.url))));
});

test("design skill protects touch size and reduced motion", async () => {
  const [skill, css] = await Promise.all([read(".design-rules/SKILL.md"), read("src/index.css")]);
  assert.match(skill, /44×44/);
  assert.match(skill, /prefers-reduced-motion/);
  assert.match(css, /prefers-reduced-motion/);
});
