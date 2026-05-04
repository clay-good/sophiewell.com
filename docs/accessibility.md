# Accessibility Checklist

The application meets WCAG 2.2 Level AA. The items below are mandatory and
are verified in CI where automated, and by manual pass before release where
not.

Last automated audit: `npm run test:a11y` and `node scripts/grep-check.mjs`
both pass against the v4 (encryptalotta-style) chrome.

## Structural

- [x] The home page has a single `h1`. It is visually-hidden ("sophiewell -
      deterministic healthcare utilities") so the visible chrome can use the
      brand wordmark in the topbar without inflating the heading order.
      Verified by `scripts/a11y-check.mjs`.
- [x] Each tool view has a single `h1` with the tool name. Rendered in
      [app.js](../app.js) `renderToolView`.
- [x] Heading levels never skip. Home uses h1 (visually-hidden) - h2
      (visually-hidden Filters / Tools) - h3 (group section labels). Tool
      views use h1 (tool name) - h2 (Data sources). Enforced by
      `scripts/a11y-check.mjs`.
- [x] Landmarks are used: `header` (`.topbar`), `main` (`#main`),
      `footer` (`.site-footer`), `nav` is implicit via the topbar brand link
      and the in-tool breadcrumb back button. `section` is used for the
      filters and each home-section group.

## Forms

- [x] Every form input has an associated `label` element. Placeholders are
      not used as labels. Enforced by `scripts/a11y-check.mjs` against both
      static markup and dynamic `el('input', ...)` calls in renderers.
- [x] Required fields are programmatically indicated where applicable
      (renderers that require fields set `required` on the input and
      surface validation via the live region).
- [x] Validation errors are associated with the input via `aria-describedby`
      and announced via the live region. Pattern in
      [views/group-a.js](../views/group-a.js) `searchableLookup` and
      mirrored in clinical calculators.

## Color and contrast

- [x] Color contrast on body text is at least 7:1.
      Body text is `--text-primary` `#ffffff` on `--bg-primary` `#0a0a0a`,
      contrast ratio approximately 20.4:1 (well above AAA 7:1).
      `--text-secondary` `#c8c8c8` on `--bg-primary` is approximately 14:1
      (also AAA). `--text-muted` `#9a9a9a` is reserved for non-body accents
      (small caption rows, source-stamp text); its contrast on
      `--bg-primary` is about 6.6:1, which still exceeds AA 4.5:1 for
      normal text.
- [x] No information is conveyed by color alone. The visual design relies
      on shape, weight, and spacing for state (active toggle, hover lift,
      focus ring). Enforced by review.

## Keyboard

- [x] Every interactive element is reachable by keyboard. Tool cards are
      `<button>` (not `<a>`), filter toggles are buttons, footer badges
      are anchors with focus styles.
- [x] Focus rings are visible and at least two pixels wide.
      [styles.css](../styles.css) sets `outline: 2px solid var(--focus-ring)`
      on every interactive selector.
- [x] Tab order matches visual order. The DOM order in
      [index.html](../index.html) is topbar - filters - home-grid - footer
      with no `tabindex` overrides.
- [x] No keyboard traps. There are no modals; the `?` shortcut overlay
      installs an Escape-to-dismiss handler in [lib/keyboard.js](../lib/keyboard.js).

## ARIA

- [x] ARIA is used sparingly and correctly. Filter toggles use
      `aria-pressed`, sections use `aria-labelledby`, the tool-card grid
      and result lists use `aria-live="polite"` where they update.
- [x] A live region with `aria-live="polite"` announces results when a
      calculation or lookup completes. Implemented in renderer components.
- [x] Buttons that control state expose `aria-pressed` (filter toggles)
      where appropriate.

## Automated checks

- [x] axe-core runs via `npm run test:a11y` in CI on every utility view
      ([test/integration/smoke.spec.js](../test/integration/smoke.spec.js)
      visits a card from each group).
      `scripts/a11y-check.mjs` adds a static structural pass that is part
      of `npm test` and the CI workflow `unit` job.

## Manual pass

- [ ] VoiceOver on macOS: every utility usable end to end.
- [ ] NVDA on Windows: every utility usable end to end.
- [ ] Safari iOS VoiceOver: home view and at least one calculator usable.

## Clinical notice

- [x] Each clinical calculator includes an inline notice immediately above
      the input region: "This is a math aid for verification. Institutional
      protocols and clinician judgment govern any clinical decision."
      Rendered in [app.js](../app.js) `renderToolView` for any utility with
      `clinical: true` outside Group I, which has its own local-protocol
      notice (spec-v3 sec 6.5).

## Reduced motion and zoom

- [x] No motion is used outside the user's `prefers-reduced-motion`
      setting. [styles.css](../styles.css) ends with a media query that
      sets `animation: none !important; transition: none !important` for
      `prefers-reduced-motion: reduce`.
- [x] The page is usable at 200 percent zoom without horizontal scroll on
      a common desktop width. The container max-width is 1200px and the
      home grid uses `repeat(auto-fill, minmax(240px, 1fr))` so cards
      reflow into a single column on narrow viewports; the responsive
      media query at 700px collapses the grid further.

## Language

- [x] `<html lang="en">` is set. Verified by `scripts/a11y-check.mjs`.
- [x] Plain English is used throughout. Technical terms (CARC, NCCI,
      MUE, NIHSS, etc.) are defined on first use within each utility view
      or carry a tooltip / source link via the meta block.
