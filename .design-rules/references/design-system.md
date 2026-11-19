# Design system

## Hierarchy

- Start with the user’s immediate job, not a decorative dashboard.
- Use large titles for screen identity, section titles for grouping, and secondary labels for context.
- Prefer progressive disclosure over showing every control at once.
- Keep one strong accent and reserve red for destructive or urgent meaning.

## Surfaces

- Page background, grouped content surface, and raised control are separate semantic tokens.
- Dense content cards are opaque and have restrained borders and shadows.
- Use the shared Liquid Glass components only where spatial layering matters: sheets, high-value controls, and a small number of ambient hero panels.
- Glass always sits over a gradient, image, or scrolling content that it can optically refract.
- Maintain readable contrast in both themes; do not use opacity alone for essential text.

## Type and spacing

- Use the system font stack and tabular numerals for changing counts.
- Prefer a 4-point spacing rhythm with comfortable 16–24px content insets.
- Keep body copy short and scannable. Avoid tiny labels below 11px.
- Truncate only when the complete value is available elsewhere or nonessential.

## Responsive behavior

- Design from 320px upward, including long text and dynamic type pressure.
- Honor all safe-area insets and keep bottom content clear of floating navigation.
- Let filter rows scroll horizontally without shrinking touch targets.
- Center and constrain wide layouts instead of stretching cards indefinitely.
