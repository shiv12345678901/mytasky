---
name: mytasky-design
description: Design and review calm, native-feeling iOS task experiences for Mytasky.
---

# Mytasky design skill

Use this skill for every UI, UX, navigation, animation, or product-flow change in this repository.

## Product thesis

Mytasky should reduce task anxiety. Present a calm list, one obvious next step, and enough context to act without making users manage the interface itself.

## Required process

1. State the user job and the state being changed.
2. Read the relevant reference in this directory before editing UI.
3. Reuse semantic tokens and existing interaction components.
4. Define loading, empty, success, error, retry, and reduced-motion behavior.
5. Verify touch, keyboard, screen-reader labels, light/dark appearance, safe areas, and small screens.
6. Run the repository verification commands before delivery.

## Non-negotiable rules

- Use opaque content surfaces. Blur or translucency belongs only on a floating navigation layer.
- Interactive controls have at least a 44×44 CSS-pixel target.
- Use semantic colors and never communicate status with color alone.
- Keep primary tabs stable; detail screens return to their direct parent, not an unrelated history entry.
- Use bottom sheets for focused creation and confirmation. Give them rounded top corners, a grabber, gesture dismissal, and an explicit close action.
- Preserve scroll position without a flash, jump, or delayed restoration.
- Keep motion brief and purposeful, and respect `prefers-reduced-motion`.
- Give each screen one clear primary action and use verb-led labels.
- Do not copy business logic, production data, credentials, or domain-specific records from another product.

## References

- Visual language and responsive layout: [`references/design-system.md`](references/design-system.md)
- Navigation, sheets, feedback, and motion: [`references/interactions.md`](references/interactions.md)
- Pre-delivery audit: [`references/review-checklist.md`](references/review-checklist.md)
