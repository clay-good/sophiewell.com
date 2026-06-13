# spec-v74.md — Make the "Skip to content" link work in the SPA (WCAG 2.4.1)

> Status: **IMPLEMENTED (2026-06-13). Catalog unchanged at 337.**
> An accessibility fix, not a new tile. The skip link
> (`<a class="skip-link" href="#main">Skip to content</a>`) is the standard
> keyboard/screen-reader affordance for bypassing the repeated topbar + browse
> nav (WCAG 2.4.1, Bypass Blocks). But the home view is a **hash-routed SPA**:
> a bare `href="#main"` sets `location.hash`, the router reads route `"main"`,
> finds no such tile, and calls `restoreHome()`. So activating the skip link on
> any tile **ejected the user back to the home view** — and focus landed on
> `<body>`, not the content. The one control whose entire job is "jump to the
> content" instead destroyed the current view and dropped focus. v74 intercepts
> the link in the SPA and moves focus to the `<main>` landmark without touching
> the hash. Every prior spec (v4–v73) remains in force; no runtime network call,
> no AI, no new tile.

## 1. Thesis

A skip link relies on the browser's native fragment behavior: clicking
`href="#main"` focuses the element with `id="main"` so the next Tab lands inside
the content. That works on the **pre-rendered static pages** (`/tools/<id>/`,
`/for/<hub>/`, `/topics/<topic>/`) — they are plain HTML and do not load
`app.js`, so `#main` is a normal in-page anchor.

The single-page home (`index.html`) is different: it loads `app.js`, which owns
`window.location.hash` as its router. `route()` parses any hash into a route id;
`#main` becomes route `"main"`, misses the `UTIL_BY_ID` lookup, and falls
through to `restoreHome()` — the same fallback that handles an unknown
deep-link. The observable result, confirmed before the fix:

```
On /#bmi, activate the skip link:
  hash      #bmi&q=...   ->  #main
  <main> h1 "BMI Calculator"  ->  "Free clinical calculators, built for the nurse on shift"
  focus     skip link    ->  <body>        (never reaches the content)
```

So the skip link was not merely ineffective — it navigated away from the user's
tile and lost focus. For a keyboard or screen-reader user that is a trap, not a
shortcut.

## 2. The change

A one-function handler in `app.js`, bound once at `boot()`:

```js
function bindSkipLink() {
  const link = document.querySelector('.skip-link');
  if (!link) return;
  link.addEventListener('click', (e) => {
    e.preventDefault();                 // <- stop the hash router from running
    const main = getMain();
    if (!main) return;
    main.setAttribute('tabindex', '-1'); // make the landmark programmatically focusable
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: 'start', behavior: 'auto' });
  });
}
```

- **Scope is exactly the SPA.** The handler lives in `app.js`, which only the
  home shell loads; the static pages keep their working native-anchor behavior
  untouched. (The skip link markup and `<main id="main">` are unchanged on every
  page.)
- **No hash mutation.** `preventDefault()` stops the navigation, so the router
  never sees `#main`; the current tile, its `q=` input state, and the URL are
  all preserved. Focus moves to the `<main>` landmark (a screen reader announces
  "main" and reads from there); the next Tab enters the content.
- **No markup, compute, or catalog change.** Presentation/behavior only;
  `UTILITIES.length` stays **337**.

## 3. Robustness

- Bound once at boot (the skip link is in the static shell, not re-rendered by
  routing), so there is no listener leak across navigations.
- `getMain()` is null-guarded; `tabindex="-1"` left on `<main>` is inert (not in
  the tab order, only programmatically focusable), matching the pattern `route()`
  already uses on the tile `<h1>`.
- New regression guard
  [test/integration/skip-link.spec.js](../test/integration/skip-link.spec.js):
  on `/#bmi`, activating the skip link must (a) leave the tile heading unchanged
  (not ejected to home), (b) leave the hash unchanged, and (c) move
  `document.activeElement` to `#main`; a second test pins the home view. All
  three assertions failed before the fix (heading became the home hero, focus
  was `<body>`).

## 4. Files touched

```
docs/spec-v74.md                          (this file)
app.js                                     (bindSkipLink(); called in boot())
test/integration/skip-link.spec.js         (new: skip-link focus + no-navigation guard)
README.md                                  (intro spec-progression + range -> v74)
CHANGELOG.md                               (Unreleased: v74 entry, +0 catalog delta)
```

## 5. Acceptance criteria

- On a tile in the SPA, activating the skip link keeps the tile rendered, leaves
  the hash unchanged, and focuses `#main`; on the home view it focuses `#main`.
  The new spec passes.
- Static pre-rendered pages are unchanged (native `#main` anchor still works).
- `UTILITIES.length` is still **337**; all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` pass; the
  full e2e suite stays green.
- The CHANGELOG records v74 with a +0 catalog delta.

## 6. Out of scope for v74

- **No change to the static pages' skip link** — they don't load the router, so
  the native anchor already works; touching them would be churn.
- **No change to route-change focus management** — `route()` already moves focus
  to the tile `<h1>` on navigation (spec-v53-era); v74 only fixes the skip link.
- **No new input, no new tile, no change to any tile's computed output.**
