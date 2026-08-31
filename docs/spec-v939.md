# spec-v939 — The website had four suggestions; the agent got none

## The finding

`scripts/build-tool-pages.mjs` picks each page's **Related tools** in two steps: the
hand-picked `META[id].related` ids first, then a top-up from what the tile shares with the
rest of the catalog (its name terms and its specialties, weighted by how rare each is). Every
one of the 1,710 pages ends up with four.

`describe_calculator` did only the first step. Its `related` field was the curated ids,
filtered to the ones this server can call — so for a tile with nothing curated, an agent
asking what else to consider got `related: []` while a reader on the same tile was being
offered four sensible neighbours.

| | Website | `describe_calculator`, before |
| --- | --- | --- |
| `acetaminophen-nomogram` | NAC dosing, King's College, DigiFab, TCA bicarbonate | *nothing* |
| `alvarado-pas` | Adult appendicitis, AIR, RIPASA, PECARN c-spine | *nothing* |
| `abg` | airway resistance, auto-PEEP, CPIS, cuff leak | *nothing* |

102 tiles on the website; **92 of them reachable through MCP, 91 now answered.**

This is the same defect spec-v630 half-fixed. That spec noticed an empty `related` meant two
different things — *this tile has no siblings* versus *its siblings are all browser-only* —
and added `relatedOnWebsite` for the second. It only ever looked at curated ids, so the third
meaning, *nobody curated this one*, stayed silent.

## What changed

The picker moved to **`lib/related.js`**, unchanged, and both surfaces call it. The page
builder's own copy is gone; `dist/tools/` rebuilds **byte-for-byte identical**
(`1ed3592d…` before and after).

In `mcp/tools.js`:

- `relatedIds(entry)` — the curated callable siblings, or, when there are none, the shortlist
  the website computes. **Curation still wins**: the fill only runs on an empty list, so no
  hand-picked choice is ever overridden or reordered.
- `relatedElsewhere(entry)` — feeds `relatedOnWebsite` from whichever list is in play. This
  is what `restraint-timer` needed: it has no curated siblings and all four tiles the website
  pairs it with are the time-dependent timers MCP cannot expose, so its answer was silence
  about four pages that exist. It now names them.

The search corpus supplies the two signals (name, specialties). It stays an accelerator, not
a dependency — with no corpus on disk `relatedFill` returns `[]` and the field is exactly
what it was.

## Proof

| Check | Result |
| --- | --- |
| `dist/tools/` before vs after the extraction | identical, `1ed3592d984d1bed1b92d498ad600be5fc5b8a37` |
| Tiles with no curated siblings, answered by MCP | 0 → **91** of 92 |
| `restraint-timer` | `related: []`, `relatedOnWebsite`: the four timers |
| `pa-turnaround` (the spec-v630 case) | unchanged |
| `npm run test:mcp` | 421 pass (was 420 — one new test) |
| `npm run test:unit` | 12,898 pass (1 known miniflare-env failure) |
| `npm run lint`, `npm run build` | clean |

`test/mcp/mcp-not-exposed.test.js` was rewritten around the rule rather than the old shape:
`relatedOnWebsite` never names a callable tile, is never present-but-empty, and where curation
applies it is still exactly the curated ids this server cannot call.
