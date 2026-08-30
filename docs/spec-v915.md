# spec-v915 — A retired id has to work for readers too

## Why

spec-v914 retired four duplicate ids and mapped each to its survivor in
`data/id-aliases.json`. That file is read by the MCP server and by nothing else, so on the day
it was first used it fixed the problem for **agents only**: an agent holding `gbs` self-healed to
`glasgow-blatchford`, while a reader following the same permalink landed on the home page with no
explanation.

Two more things were true and worth fixing in the same change: the alias resolver had been
unit-tested against a **synthetic** map since spec-v637 and never against the real file, because
the real file was empty; and the comment above it still said "Empty today — no shipped id has
been renamed."

## What changed

**The browser router honors the aliases.** `app.js` carries `RETIRED_TILE_ALIASES` — it reads no
JSON at runtime — and `route()` rewrites the hash to the survivor before looking a tile up.
`#gbs` now lands on Glasgow-Blatchford with the address bar, a copied link and a reload all
agreeing. This is different from `REMOVED_V29_IDS`, which explains a removal: here the instrument
is still on the site, so a redirect is the honest answer, not a note.

**A gate holds the two maps in step.** `scripts/check-mcp-catalog.mjs` now fails if an alias is
in one and not the other, or if the two disagree on the survivor. Negative-tested both ways.

**The alias path is tested end to end.** Real `data/id-aliases.json`, real registry, real
`dispatch`: every alias resolves to a live successor, carries a deprecation notice, and still
computes with the retired id naming both itself and its survivor in the result.

## Verified in a browser

All four retired hashes redirect to the surviving tile, and an unknown id still falls through to
the home view rather than being swallowed:

| `#` entered | lands on |
| --- | --- |
| `gbs` | Glasgow-Blatchford Score (Upper GI Bleed) |
| `forrest` | Forrest Classification (Bleeding Peptic Ulcer) |
| `osi-oxygenation` | Oxygenation Index (OI) + Oxygen Saturation Index (OSI) |
| `university-texas-dfu` | University of Texas Diabetic Foot Wound Classification |
| `not-a-real-tile` | home, unchanged |

## Not covered

`/tools/<retired-id>/` — the static page — is gone and returns whatever the host returns for a
missing path. Only the hash route redirects. Fixing that needs a build-time stub or a host
redirect rule, which is a separate change.

## Files

`app.js`, `mcp/tools.js` (comment), `scripts/check-mcp-catalog.mjs`,
`test/mcp/mcp-tools.test.js`, this file. No catalog change, no count change.
