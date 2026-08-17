# spec-v741.md — Long explanations fold behind a disclosure

> Status: **SHIPPED (2026-08-17).** Presentation only. No tile added, no number changed, no
> catalog surface moved. Catalog stays **1564**.

## Why

Tile renderers write their explanations as `<p class="muted">` paragraphs. Most are a line or two.
477 of the 1150 in the catalog run past 280 characters — a full paragraph of background about what
the scheme is for, which groups exist, what it deliberately does not do.

All of it is true and worth keeping. But a reader who opened the page to get a number has to walk
past it to reach the first field. On `#poseidon` that was 622 characters above the fold, and a
second 300-character paragraph between two inputs.

## What it does

Keep the first sentence visible — it is the one that says what the tool is — and put the rest one
click away under **More detail**.

| | |
|---|---|
| **Threshold** | Paragraphs over 280 characters. Shorter ones are untouched. |
| **Split** | After the first sentence, provided the lead is at least 60 characters (so a spelled-out acronym like `S.T.O.N.E.` is not left standing alone) and the hidden remainder is at least 80 (below that the disclosure costs more attention than it saves). |
| **Scope** | Direct `p.muted` children of `#tool-body`. Result areas and derivation blocks are nested, so a computed message or a formula is never folded. |
| **Effect** | 463 of the 477 collapse. The other 14 are a single long sentence with nothing to split off, and stay as written. |

Nothing is deleted. The text stays in the DOM, so search, copy, and screen readers still reach it,
and `theme.js` already opens every disclosure before printing — a printed page is unchanged.

## Where it lives

One place, not 612 view files: the rule is about how a page reads, not about what any one tile
means.

- `lib/long-note.js` — `splitLead()`, `collapseLongNotes()`.
- `app.js` — one call after `renderer(body)`.
- `styles.css` — `.note-more`; summary is a 44px touch target, matching `.tool-proof`.

## Proof

- `test/unit/long-note.test.js` — 7 tests: the split point, decimals (`1.2 ng/mL` never splits),
  abbreviations (`e.g.`), the acronym guard, short paragraphs left alone, non-`muted` paragraphs
  ignored.
- `test/integration/smoke.spec.js` — `#poseidon` shows a lead under 280 characters, the remainder
  is hidden, and one click reveals it. Green on chromium, firefox, webkit.
- Full chain green: `lint`, `test:unit` (11373), `test:mcp` (395), `test:a11y`, plus the 320px
  whole-catalog hscroll sweep and the 44px touch-target guard.
