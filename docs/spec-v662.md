# spec-v662.md — PUSH tool (Pressure Ulcer Scale for Healing)

> Status: **SHIPPED (2026-08-07).** Builds the `push-tool` tile. Catalog **1492 → 1493**, group G.

## Why

A companion gap in the pressure-ulcer vein. The catalog had the pressure-ulcer RISK tools (Braden, Braden-Q,
Norton, Waterlow, Bates-Jensen), but not the standard HEALING-tracking instrument. PUSH is the NPUAP tool for
monitoring pressure ulcer healing over time.

## What it does

Three subscores summed to **0–17**:

| Subscore | Range | Basis |
| --- | --- | --- |
| Surface area | 0–10 | length × width (cm²) mapped to 11 categories (0, <0.3, 0.3–0.6, 0.7–1.0, 1.1–2.0, 2.1–3.0, 3.1–4.0, 4.1–8.0, 8.1–12.0, 12.1–24.0, >24.0) |
| Exudate amount | 0–3 | none / light / moderate / heavy |
| Tissue type | 0–4 | closed / epithelial / granulation / slough / necrotic (worst present wins) |

A **decreasing** total over serial assessments indicates healing; an **increasing** total indicates
deterioration.

## Scope (spec-v11 §5.3)

PUSH is a monitoring instrument, so the meaningful output is the score trended over time, not a single-visit
interpretation; read with the full wound assessment.

## Files

- `lib/push-tool-v662.js` — `pushTool()`, `PUSH_NOTE`.
- `views/group-v662.js` (RV662) — two number inputs (length, width) + two selects (exudate, tissue);
  a11y-checked, no innerHTML, no network.
- `mcp/adapters/push-tool-v662.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/push-tool.test.js` — 6 tests (0/17 extremes, area-category boundaries, total = sum, example,
  validation).
- `docs/spec-v662.md` (this file).

## Sourcing (spec-v97)

Thomas DR, Rodeheaver GT, Bartolucci AA, et al. Pressure ulcer scale for healing: derivation and validation of
the PUSH tool. *Adv Wound Care.* 1997;10(5):96-101 (**PMID 9362591**); NPUAP PUSH Tool 3.0. A source-
verification subagent confirmed the three subscales, their point ranges (area 0–10, exudate 0–3, tissue 0–4),
the exact area-category cm² boundaries, the tissue ordering, the 0–17 total, and the worst-tissue-wins rule.
(The PMID was corrected during build: an initial 9432619 was verified via PubMed to be an unrelated
orthodontics paper; 9362591 is the PUSH derivation paper.)
