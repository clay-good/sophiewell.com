# spec-v73.md — Make the UA color-scheme (and mobile chrome) follow the active theme

> Status: **IMPLEMENTED (2026-06-13). Catalog unchanged at 337.**
> A theme-correctness fix, not a new tile. The page declared `color-scheme`
> **dark-only** (a hardcoded `<meta>` on every page, with no CSS counterpart),
> but the site ships a full light theme reachable by OS preference *or* the
> manual toggle. So in light mode the user-agent painted every **native control
> to the dark scheme** — most visibly a **black `<input type=date>` field** on
> the ops/deadline tiles, plus dark number-spinner arrows, `<select>` popups,
> and scrollbars on a white page. v73 sets `color-scheme` in CSS keyed on
> `data-theme` so it tracks the active (toggled) theme, declares both schemes in
> the metas, and keeps `<meta name="theme-color">` (the mobile browser-chrome
> bar) in sync with the theme. Pure presentation; every prior spec (v4–v72)
> remains in force; no runtime network call, no AI, no new tile.

## 1. Thesis

`color-scheme` is the CSS/HTML mechanism that tells the browser which palette to
use when it paints the parts of the page **it** controls, not CSS: form-control
widgets (date pickers, number spinners, the `<select>` dropdown list), the
text-input caret, and scrollbars. The site set it in exactly one place —

```html
<meta name="color-scheme" content="dark" />   <!-- index.html + 5 build-script spots -->
```

— which declares the document supports **only** dark. There was no CSS
`color-scheme` property anywhere (`getComputedStyle(documentElement).colorScheme`
resolved to `normal`). The consequence: a visitor in light mode (the default for
anyone whose OS prefers light, plus anyone who taps the toggle) got a light page
per the CSS custom properties, but the UA still rendered its widgets dark. On
the five `type=date` ops tiles (`appeal-deadline`, `timely-filing`,
`pa-turnaround`, `overpayment-60day`, `em-mdm` via its date inputs) that meant a
**black date field sitting on a white card** — unmistakably broken, and a
readability/trust defect on a clinical tool.

A `<meta>` cannot solve this, because the theme is also switchable at runtime by
the [theme.js](../theme.js) toggle (stored in `localStorage['sw-theme']`), which
a static meta and even a `prefers-color-scheme` media query cannot follow. The
correct mechanism is the CSS `color-scheme` **property**, keyed on the
`data-theme` attribute theme.js already sets before first paint.

## 2. The change

```
styles.css
  :root                 { color-scheme: dark; }    (default, matches the dark token block)
  [data-theme="light"]  { color-scheme: light; }   (matches the light token block)

index.html + 4 build scripts (5 spots)
  <meta name="color-scheme" content="dark">  ->  content="dark light"
      (accurate declaration of both supported schemes; a pre-CSS hint that
       prevents a flash of dark-scheme widgets before styles.css loads)

theme.js
  swSetThemeColor(theme): find-or-create <meta name="theme-color"> and set it to
  #ffffff (light) / #0a0a0a (dark) -- matching --bg-primary. Called in the
  before-paint init IIFE and again on every toggle, so the mobile address-bar
  chrome matches the page. find-or-create means it also works on the
  pre-rendered static pages, which omit the static meta.
```

- **Tracks the toggle, not just the OS.** Because the CSS property is keyed on
  `[data-theme="light"]` (set by theme.js before paint from the stored
  preference *or* OS default), a user who manually switches to light gets light
  widgets immediately — something neither the old meta nor a media query could
  do.
- **No palette change.** Every CSS custom property, every computed band, every
  tile output is byte-for-byte unchanged. Only the UA-painted widget chrome and
  the address-bar color change, and only to *match* the theme that was already
  active.
- **Scope:** the CSS fix lives in the shared `styles.css`, so it applies to the
  SPA and all 351 pre-rendered pages (tools, hubs, topics, commitments)
  identically; the meta edits cover both the SPA shell and the four static-page
  build templates.

## 3. Robustness

- `swSetThemeColor` is wrapped in try/catch and degrades to the static meta if
  `document.head` is unavailable or DOM access is blocked; it updates the
  existing tag (verified single, no duplicate) rather than appending.
- The before-paint ordering is preserved: theme.js is the last node in `<head>`
  (synchronous, before the deferred `app.js` and before body paint), so
  `data-theme`, the CSS `color-scheme`, and the chrome color are all correct on
  first render — no flash.
- New regression guard
  [test/integration/theme-color-scheme.spec.js](../test/integration/theme-color-scheme.spec.js):
  on `/#appeal-deadline` (the date-input route the bug appeared on) it asserts,
  in **both** themes, that `getComputedStyle(documentElement).colorScheme`
  equals the active theme and that there is exactly one `theme-color` meta
  matching `--bg-primary`. Non-vacuous: pre-fix the computed value was `normal`.

## 4. Files touched

```
docs/spec-v73.md                               (this file)
styles.css                                     (:root + [data-theme=light] color-scheme)
theme.js                                       (swSetThemeColor: dynamic theme-color, init + toggle)
index.html                                     (meta color-scheme -> "dark light")
scripts/build-tool-pages.mjs                   (meta color-scheme -> "dark light")
scripts/build-hub-pages.mjs                    (meta color-scheme -> "dark light")
scripts/build-topic-pages.mjs                  (meta color-scheme -> "dark light", 2 spots)
scripts/build-commitments-page.mjs             (meta color-scheme -> "dark light")
test/integration/theme-color-scheme.spec.js    (new: color-scheme + theme-color guard, both themes)
README.md                                       (intro spec-progression + range -> v73)
CHANGELOG.md                                    (Unreleased: v73 entry, +0 catalog delta)
```

## 5. Acceptance criteria

- In light mode, `getComputedStyle(documentElement).colorScheme === 'light'` and
  the `type=date` field renders light (white field, dark glyph); in dark mode it
  is `'dark'`. The new spec passes in both themes.
- `<meta name="theme-color">` reads `#ffffff` in light, `#0a0a0a` in dark, with
  exactly one such meta after theme.js runs (SPA and static pages).
- All `<meta name="color-scheme">` (SPA + the 4 static templates) read
  `dark light`.
- `UTILITIES.length` is still **337**; all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` pass; the
  320px no-horizontal-scroll sweep stays green.
- The CHANGELOG records v73 with a +0 catalog delta.

## 6. Out of scope for v73

- **The PWA manifest stays dark.** `site.webmanifest` `theme_color` /
  `background_color` are install-time defaults for the standalone app and cannot
  be theme-responsive; the brand-dark default is intentional and the per-page
  `theme-color` meta overrides the chrome while browsing.
- **No `prefers-contrast` / `forced-colors` (high-contrast / Windows
  high-contrast) handling** — a separate concern; the base palette already meets
  WCAG 1.4.3 AA in both themes.
- **No new input, no new tile, no change to any tile's computed output.**
