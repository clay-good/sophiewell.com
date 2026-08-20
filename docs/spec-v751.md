# spec-v751.md — The home page is one box

> Status: **SHIPPED (2026-08-20).** Part of [scope-one-box](scope-one-box.md).
> Presentation only. No tile added, no number changed. Catalog stays **1564**.

## Why

The home page still reads as a directory. Below the search box sit fourteen links under two
headings — *Browse by specialty* and *Browse by who you are* — and above it a three-sentence lede
that explains the product, the privacy posture, and the catalog size before the reader has typed
anything.

Both belong to the era where the site was a catalog you browsed. It is not one. A nurse arrives
knowing what they need; the job of this page is to take the question, not to offer a menu of
places the question might live.

The placeholder is the other tell. `wells PE, CHA2DS2-VASc, GCS, magnesium replacement...` teaches
the reader to type a tool name — the one thing they have to already know the site's vocabulary to
do. It should teach the opposite: type the sentence you would say out loud.

## What it does

| | |
|---|---|
| **Heading** | `Healthcare calculators, one search away` → `Bedside math, answered.` |
| **Lede** | Three sentences → one: *Type the question the way you'd say it. You get the number, the inputs, and the source.* |
| **Placeholder** | A tool-name list → one full natural-language question: `crcl for a 72 year old woman, 68 kg, creatinine 1.4` |
| **Examples** | Four tappable chips under the box, each a real query that routes. They are the instructions; there is no other instruction text. |
| **Browse nav** | `nav.home-browse` removed from `index.html` entirely, with its two headings and fourteen links. |
| **Header / footer** | Unchanged. Brand left, theme toggle right; Clay Good and GitHub badges. They already match the target. |

The chips are buttons, not links: clicking one fills the input and fires the same code path as
typing, so what the reader sees demonstrated is exactly what their own typing will do.

## The hub pages are kept, and re-linked

`nav.home-browse` is the **only** internal link into `/topics/<8>/` and `/for/<6>/`. Removing it
without a second move orphans fourteen pages that currently rank.

They are not deleted. They are search-landing pages, not app navigation, and the pivot is about
the app. Two things keep the crawl graph intact:

- `sitemap.xml` continues to list all fourteen (already true, no change).
- `scripts/build-tool-pages.mjs` adds the tile's topic hub to the static `/tools/<id>/` footer —
  one link, on the static page only. The app UI never renders it.

If a later decision is to retire the hubs outright, that is its own spec with its own redirect
plan. This one does not quietly make that decision by starving them of links.

## Where it lives

- `index.html` — `h1.home-h1`, `p.home-lede`, the `#hero-search` placeholder, and the removal of
  `nav.home-browse`. Add `.hero-examples` with four `button.hero-chip`.
- `app.js` — `bindHeroSearch()` gains a chip click handler that sets `input.value` and calls the
  existing `render()`. No new routing logic.
- `styles.css` — `.hero-examples`, `.hero-chip` (44px touch target, pill, `--accent-pop` on hover).
  Delete `.home-browse*` rules. `.home-h1` and `.home-lede` keep their selectors.
- `scripts/check-catalog-truth.mjs` — retire the `home lede visible count` surface. The lede no
  longer carries a count, so the extractor would return `null` and fail the build. Follow the
  convention already in that file: leave a comment recording *why* the surface went, as spec-v51
  and spec-v52 did. The count stays enforced on the twelve other surfaces (title, meta / OG /
  Twitter, JSON-LD, README ×2, `package.json`, parity ledger).
- `scripts/build-tool-pages.mjs` — the topic-hub link in the static footer.
- `scripts/lib/topics.mjs` — **new.** `TOPICS` had to move out of
  `build-topic-pages.mjs` before `build-tool-pages.mjs` could import it: that module
  calls `main()` at the top level, so importing it would have run the topic build as a
  side effect. One definition, two readers, no side effect.
- `scripts/serve.mjs` — unrelated to the feature, needed to build it. `sw.js` caches
  the shell under the literal build hash `dev` in the source tree, so the dev service
  worker never invalidates and served stale JS through three separate "why is my change
  not showing" detours. The dev server now returns a self-unregistering stub for
  `/sw.js`; `SERVE_SW=1` restores the real one when the offline behavior is what you are
  testing.

## Gotchas

- **Do not leave a count in the new lede.** A visible count that is not a `check-catalog-truth`
  surface will drift; that is exactly how the README reached 1145 against a catalog of 1564.
  Either no count on the page, or a count *and* a surface, in the same change.
- The chip labels must be free of slash-joined tokens over 30 characters, or the 320px
  `mobile-no-hscroll` sweep fails on chromium. Use commas and spaces.
- `test/integration/smoke.spec.js`, `all-tools.spec.js`, and `no-network.spec.js` all reference
  home markup. Grep them for `home-browse` and `Browse by` before deleting the nav.

## What shipped differently

- **The chips are `map 120/80`, not the heparin drip.** The drip query needs a tile that
  takes bag units, volume, rate, and weight together; the four chips all had to route
  today, on a real tile, or they would be teaching a query the site cannot answer.
- **A fourth edit was needed to make the chips work at all.** The document click handler
  that closes the listbox treated a chip as a click *outside* the search UI, so a chip
  filled the box and instantly closed the results it had just opened.

## Proof

- `test/integration/smoke.spec.js` — `spec-v751 home: one box, four example chips, no
  browse nav`: the new h1, zero `nav.home-browse`, four chips, and a chip click that
  fills the box and opens the listbox. **Green on chromium.**
- `test/integration/mobile-no-hscroll.spec.js` — home at 320px, no horizontal scroll (existing
  sweep, must stay green with the chips).
- `test/integration/mobile-touch-targets.spec.js` — each chip is at least 44px.
- `check-catalog-truth: clean (1564 tiles across 13 surfaces)` — 14 before, one retired.
- 125 of the 1564 static tool pages now carry a `More in <topic>` link; all 8 hubs stay
  reachable.
- Full chain green: `lint`, `test:unit` (11444), `test:mcp` (395), `test:a11y`, the 320px
  whole-catalog hscroll sweep, and the 44px touch-target sweep.
