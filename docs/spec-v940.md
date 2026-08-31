# spec-v940 — The third surface

## The finding

spec-v939 gave `describe_calculator` the same "Related tools" shortlist the tool page shows.
There is a third surface: the live app at `/#<id>`.

`renderMetaBlock` in `app.js` rendered `META[id].related` and, when that array was empty,
rendered **nothing at all** — no heading, no line. So for 102 tiles a reader browsing the
catalog got four suggestions on `/tools/abg/` and a dead end on `/#abg`, which is the surface
they are actually using.

| Tile | `/tools/<id>/` | `/#<id>`, before |
| --- | --- | --- |
| `abg` | airway resistance, auto-PEEP, CPIS, cuff leak | *(no related-tools line)* |
| `acetaminophen-nomogram` | NAC dosing, King's College, DigiFab, TCA bicarbonate | *(no related-tools line)* |
| `alsfrs-r` | FOIS, Hughes GBS, BARS, BFCRS | *(no related-tools line)* |

## What changed

`app.js` imports the shared picker from `lib/related.js` — the same module the page builder
and the MCP server now use — and falls back to it when nothing curated resolves. The index is
built once, lazily, from `tileCorpus()`, which already carries every input it needs (name,
group, specialties).

Curation still wins, on all three surfaces: the fill runs only on an empty list, so no
hand-picked list is padded, reordered, or overridden.

## Verified in the browser, not just in a test

`/#abg`, `/#acetaminophen-nomogram`, `/#acef` and `/#alsfrs-r` were opened against the dev
server and each now renders the same four ids, in the same order, as its built page.
`/#wells-pe` still renders exactly its three curated links.

`test/integration/related-tools-shown.spec.js` pins both directions. Negative-tested: with
`app.js` reverted, the two fill cases fail and the curated case still passes.

The full-catalog 320 px sweep (`mobile-no-hscroll.spec.js`, 18 tests, 1.7 min) passes with the
new links in place — a related-tools line on 102 more tiles is the kind of change that has
broken it before.

## What is still not the same on every surface

A tile with **one to three** curated siblings gets topped up to four on the tool page and is
left at its curated length on the app and in MCP. `wells-pe` shows four on the page and three
in the app. That is a difference in depth, not a hole — every surface answers, and answers
with a person's picks first — and whether hand-picked lists should be padded everywhere is a
product call rather than a defect. Left as is, and recorded here so it is a decision and not
drift.

## Proof

| Check | Result |
| --- | --- |
| `/#abg` vs `/tools/abg/` (and 3 more) | identical ids, identical order |
| `related-tools-shown.spec.js` | 3 pass; 2 fail on reverted `app.js` |
| `mobile-no-hscroll.spec.js` full sweep | 18 pass |
| `npm run lint`, `npm run build` | clean |
| `npm run test:unit` / `test:mcp` | 12,898 (1 known env failure) / 421 |
