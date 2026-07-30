# spec-v617 — WHO oral mucositis grade

**Status:** shipped. Catalog 1466 -> 1467. MCP wave 442, 1403 -> 1404 adapters.

## Why this tile

A **whole-concept gap**. "Mucositis" and "stomatitis" were both zero-hit across `app.js`, and every slug
spelling returned zero.

## What it does for the reader

Answer two questions — what the mucosa looks like, and what the patient can swallow — and get the grade plus
the thing the grade number hides: **which of the two axes actually set it**.

## The findings the tile is built around

| Finding | Consequence |
|---|---|
| **The scale conflates two axes.** Grades 0–2 come from appearance; grades 2–4 come from oral intake. | Grade 2 is the hinge where the axis silently changes. The tile asks the two questions separately rather than offering one list of five grades. |
| **Above grade 2 the appearance stops mattering entirely.** | All three appearances collapse to one grade at each restricted intake. `appearanceIgnored` is returned, because the grade number hides it. |
| **Extensive ulceration cannot push the grade past 2 if solids are tolerated.** | The *extent* of ulceration is never scored — only its presence. A worse-looking mouth can carry the same grade, and a better-looking one a higher grade. **Not an anatomic severity measure.** |
| **The definitions say what the patient can tolerate, not why.** | A high grade does not establish that the mucosa is the cause. `intakeUnexplainedByMucosa` fires when intake is restricted but the mucosa is normal. |
| **It was built for reporting, not bedside management.** | From the 1979 WHO handbook, for comparability across trials. |

## Sourcing (spec-v97)

Re-fetched and double-confirmed, never recalled. Both sources give the same five grades with the same
wording, including ulcers first appearing at grade 2 (grade 1 is explicitly soreness/erythema **only**) and
the solids → liquids-only → nothing ladder above it.

The attribution gap is stated as an observation about what the grade definitions **do and do not say** — they
specify tolerance without specifying cause — rather than as a sourced critique. The tile still returns the
grade the scale specifies, because the scale is the source; it only refuses to let the combination pass
silently.

## Posture (spec-v11 §5.3)

Grades a **toxicity for reporting**. It does not diagnose mucositis or its cause, does not measure pain, does
not decide analgesia, oral care, feeding-tube placement or parenteral nutrition, and does not decide whether
to modify or interrupt cancer treatment.

## Files

`lib/who-mucositis-v617.js`, `views/group-v617.js`, `mcp/adapters/who-mucositis-v617.js`,
`test/unit/who-mucositis.test.js`. Registered in `app.js` (tile + RV617), `mcp/catalog.js`,
`test/unit/fuzz-tools.test.js`, `test/mcp/mcp-search-relevance.test.js`, `data/synonyms.json`,
`lib/meta.js`, `docs/mcp-coverage.md`.
