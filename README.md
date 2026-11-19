# Mytasky

Mytasky is a public, installable offline-first task app with a calm, native-feeling iOS interface. It includes the design rules and review practices needed to extend the product without losing visual or interaction consistency.

## What is included

- Today, Tasks, and Settings views
- Add, complete, filter, and delete task flows
- Persistent local storage and light, dark, or system appearance
- A generated service worker, install manifest, app icons, offline cache, and update prompt
- Apple-style refracting controls from `@zakisheriff/liquid-glass`
- A gesture-dismissible Liquid Glass task sheet
- Safe-area-aware layouts, accessible labels, keyboard focus, and reduced-motion support
- A reusable product-design skill in [`.design-rules/SKILL.md`](.design-rules/SKILL.md)

## Run locally

```bash
npm install
npm run dev
```

## Verify changes

```bash
npm run check
npm test
npm run lint
npm run build
git diff --check
```

## Design direction

Mytasky reduces task anxiety through quiet hierarchy, opaque content surfaces, one obvious primary action, and short purposeful motion. Translucency is reserved for spatial overlays such as the floating tab bar and sheets. The design documentation is intentionally stored with the code so future contributors and coding agents use the same decisions.

## Next product decisions

The app deliberately avoids selecting a backend or authentication provider. Tasks remain private on the device and continue working offline. Natural next steps are task editing, reminders, recurring tasks, optional cloud sync, and shared lists. Add these only after defining their loading, empty, error, offline, and retry states.

## License

MIT
