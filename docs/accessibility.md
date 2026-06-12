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
      views use h1 (tool name) - h2 (result + section headings); the
      derivation "show your work" block is a `<dl>`, not headings, so it
      never adds a level. `scripts/a11y-check.mjs` checks the static
      `index.html` order; the dynamic per-tile body is enforced at runtime
      by the heading-order sweep in
      [test/integration/all-tools.spec.js](../test/integration/all-tools.spec.js)
      (asserts every rendered tile's headings step by at most one level).
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

- [x] ARIA is used sparingly and correctly. The home `#hero-search`
      combobox uses `role="combobox"` + `aria-expanded` / `aria-activedescendant`
      over a `role="listbox"` of results; each tool view's result region uses
      `aria-live="polite"` where it updates. (The spec-v51/v53 redesign replaced
      the old filter-chip + tool-card grid home with this single combobox, so the
      earlier filter-toggle `aria-pressed` controls no longer exist.)
- [x] A live region with `aria-live="polite"` announces results when a
      calculation or lookup completes. Implemented in renderer components.

## Automated checks

The project ships no axe-core dependency (the runtime-dependency budget keeps
it dependency-free, spec-v10 §2.2). Accessibility is enforced by purpose-built,
dependency-free checks instead:

- [x] `scripts/a11y-check.mjs` — a static structural pass over the renderer
      source and `index.html` (label/`for` associations, landmark and
      heading-order in the static shell). Part of `npm test` and the CI `unit`
      job.
- [x] Runtime DOM sweeps in
      [test/integration/all-tools.spec.js](../test/integration/all-tools.spec.js)
      (CI `e2e` job, chromium) boot every tile route and assert, against the
      real rendered DOM, that (a) every form control has an accessible name and
      (b) no heading level is skipped — the dynamic cases the static pass cannot
      see.
- [x] [test/integration/smoke.spec.js](../test/integration/smoke.spec.js) drives
      a representative tile from each group end to end in a real browser.

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
      a common desktop width. The `.container` max-width is `--content-max`
      (1200px) and every block inside it (the hero-search combobox, the
      static browse-by-category nav, and each tile's single-column form)
      is fluid-width, so content reflows rather than overflowing; the
      responsive media queries at 700px and 600px tighten spacing further.
- [x] No view scrolls horizontally at 320px (the narrowest mainstream
      phone width). Enforced catalog-wide:
      `test/integration/mobile-no-hscroll.spec.js` sweeps every tile from
      `sitemap.xml` at 320px and fails CI on any horizontal overflow, in
      addition to the per-shape sample it checks at 320px and 360px.

## Language

- [x] `<html lang="en">` is set. Verified by `scripts/a11y-check.mjs`.
- [x] Plain English is used throughout. Technical terms (CARC, NCCI,
      MUE, NIHSS, etc.) are defined on first use within each utility view
      or carry a tooltip / source link via the meta block.
