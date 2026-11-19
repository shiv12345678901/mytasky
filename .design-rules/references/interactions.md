# Interaction standards

## Navigation

- Primary tabs switch stable top-level destinations without rebuilding shared data.
- Primary tabs use direct button selection; do not use draggable lenses or gesture-based selection for essential navigation.
- A detail view returns to its direct parent and restores that parent’s exact scroll position before it becomes visible.
- Do not make a global swipe gesture behave like browser history across every page.

## Sheets and confirmations

- Creation, compact choices, and confirmations use the shared `GlassSheet` rather than a centered modal.
- The sheet must be opaque, safe-area-aware, keyboard accessible, and dismissible by the grabber, backdrop, Escape key, and explicit Cancel action.
- Destructive choices name their consequence and never rely on a vague “OK”.

## Feedback

- Update the smallest relevant value rather than replaying an entire card or screen animation.
- Confirm important state changes in context with a changed label, checkmark, or brief announcement.
- Keep optimistic actions reversible where practical; show retry for recoverable network failure.

## Motion

- Use 180–350ms transitions with iOS-like deceleration for spatial movement.
- Avoid page flashes by keeping the returning screen mounted and restoring scroll before paint.
- Do not animate live numbers from placeholders after every tab switch.
- Under `prefers-reduced-motion`, remove translation and scaling while preserving state clarity.
