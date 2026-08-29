# spec-v871 — the US-English gate was pointed at the wrong half of the copy

## What was wrong

Two separate holes in `scripts/check-us-english.mjs`, each of which had been letting British
spellings onto the screen since the gate was written.

**1. It never scanned `mcp/adapters/`.** An adapter `summary` is not agent-only copy: it is the
source of the lede on every `/tools/<id>/` page and of the tile's row on every hub and topic page,
so more people read it than read the view it describes. Twenty-one lines across sixteen adapters
were British — including `colour` and `Haemoglobin`, words that have been on the banned list since
spec-v184 and were simply never looked for in that directory.

**2. The banned list was a seed list, and stems in it could never fire.** The pattern closes with
`\b`, so the entry `catheteris` could not match `catheterisation` — and `catheterisation` was live
in a tool page's closing line. The same shape hid `haemodynamic`, which was sitting in a **tile
name**: every visit to that tool put "Pulmonary Hypertension Haemodynamics (2022)" in the browser
tab, in the search result, and in three hub rows.

## What changed

| | |
|---|---|
| `SCAN_DIRS` | `lib`, `views` → `lib`, `views`, `mcp/adapters` |
| Banned list | 26 words added, all as **whole words** rather than stems, each one verified against a real leak before adding |
| Copy fixed | 76 lines across 52 files |

The added words: haemodynamic(s), haemostasis, haematology, haematological, oesophagus,
oesophageal, oesophagectomy, dyspnoea, apnoea, tachypnoea, manoeuvre(s), artefact(s),
favourable, favourably, litre(s), metre(s), labour, stabilisation, visualisation, analysed,
catheterisation, catheterised.

One tile name changed: **Pulmonary Hypertension Hemodynamics (2022)**. The id
`ph-hemodynamics-2022` is unchanged, so no route, deep link or agent call moves.

## What did not change

- **Citations stay verbatim.** The existing allowlist exempts `citation`, `sourceCitation` and
  `citationUrl` fields and journal tokens, so *MRC dyspnoea scale*, *Br J Anaesth* and
  *Classification of adenocarcinoma of the oesophagogastric junction* are untouched, as they must
  be.
- **Code comments.** The gate exempts them by design and they are not read by anyone using the
  site. A handful in the touched files still read `metres`; that is deliberate, not missed.

## Proof

`check-us-english` went from **1,511 files scanned, clean** to **2,245 files scanned, clean** —
734 files that had never been checked, now checked and passing. Re-running the pre-change gate
against the post-change tree finds nothing; re-running the post-change gate against the
pre-change tree finds 76 lines.

Catalog unchanged at 1662.
