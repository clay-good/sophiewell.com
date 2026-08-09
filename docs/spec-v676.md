# spec-v676.md — Lund-Kennedy endoscopic score (chronic rhinosinusitis)

> Status: **SHIPPED (2026-08-09).** Builds the `lund-kennedy` tile. Catalog **1506 → 1507**, group G.

## Why

The catalog has the symptom (SNOT-22) and CT (Lund-Mackay) sinus tiles but not the **endoscopic** score.
Lund-Kennedy is the standard objective grading of nasal-endoscopy appearance in chronic rhinosinusitis, used
to track response to medical or surgical therapy. It completes the sinus assessment trio.

## What it does

Grades each nasal cavity 0–2 per variable; left and right are summed. The tile reports **both** published
versions:

| Variable | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Polyps | absent | in middle meatus | beyond middle meatus |
| Edema | absent | mild | severe |
| Discharge | none | clear / thin | thick / purulent |
| Scarring\* | absent | mild | severe |
| Crusting\* | absent | mild | severe |

- **Modified (Psaltis 2014)** = polyps + edema + discharge, both sides → **0–12** (the reliable general-use
  score; correlates with SNOT-22).
- **Original (Lund-Kennedy 1997)** adds scarring + crusting → **0–20**.

\*Scarring and crusting are essentially **post-operative** findings, so they are **optional** here (default 0).

## Posture (spec-v97)

Higher = worse; there is **no validated severity cutoff**, so the tile reports the totals (leading with the
modified score) and flags only the anchor-objective presence of any **severe (2)** finding. It grades
appearance and tracks change over time; it supports rather than replaces clinical judgment.

## Files

- `lib/lund-kennedy-v676.js` — `lundKennedy()`, `LK_NOTE`.
- `views/group-v676.js` (RV676) — six required 0–2 selects + four optional post-op selects; a11y-checked, no
  innerHTML, no network.
- `mcp/adapters/lund-kennedy-v676.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation bands, specialty, related.
- `test/unit/lund-kennedy.test.js` — 7 tests (modified sum, optional post-op extension, all-zero, max 12/20,
  severe-finding flag, worked 6/12 example, required-vs-optional validation).
- `docs/spec-v676.md` (this file).

## Sourcing (spec-v97)

Lund VJ, Kennedy DW. Staging for rhinosinusitis. *Otolaryngol Head Neck Surg.* 1997;117(3 Pt 2):S35-S40.
Psaltis AJ, Li G, Vaezeafshar R, Cho KS, Hwang PH. Modification of the Lund-Kennedy endoscopic scoring system…
*Laryngoscope.* 2014;124(10):2216-2223 (PMID 24615873). A source-verification subagent confirmed the five
variables and 0/1/2 anchors, the per-side 0–10 / total 0–20 original range, the modified three-variable 0–12
range, and that scarring/crusting are post-operative findings dropped in the modified version.
