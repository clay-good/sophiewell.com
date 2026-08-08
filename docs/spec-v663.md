# spec-v663.md — Lichtiger Index (Modified Truelove-Witts Severity Index)

> Status: **SHIPPED (2026-08-07).** Builds the `lichtiger-index` tile. Catalog **1493 → 1494**, group G.

## Why

A companion gap in the IBD activity vein. The catalog had the Truelove & Witts **severity classification**
(`truelove-witts`, a 6-criterion mild/moderate/severe grade), Mayo (`mayo-uc`), CDAI, and Harvey-Bradshaw — but
not the Lichtiger Index, the 8-item activity **sum** widely used as a trial endpoint (it is a distinct
instrument from Truelove & Witts, despite the "Modified Truelove-Witts" alias).

> Aborted candidate note: a standalone PADSS tile was scoped first but abandoned — PADSS is already implemented
> inside the existing `aldrete-padss` tile (`F.padss`). A separate task was filed to fix that tile's PADSS pain
> criterion (it scores pain 0–2, but the canonical Modified PADSS pain item is two-level, 1–2).

## What it does

Eight items summed to **0–21**:

| Item | Range |
| --- | --- |
| Diarrhea (daily stools: 0-2/3-4/5-6/7-9/≥10) | 0–4 |
| Nocturnal diarrhea | 0–1 |
| Visible blood in stool (0% / <50% / ≥50% / 100%) | 0–3 |
| Fecal incontinence | 0–1 |
| Abdominal pain / cramping | 0–3 |
| General wellbeing (perfect → terrible) | 0–5 |
| Abdominal tenderness | 0–3 |
| Need for antidiarrheal drugs | 0–1 |

## Posture (spec-v97)

The 1994 paper defined response qualitatively; later trials operationalized a cutoff. The tile reports the
0–21 total and treats the cutoffs as **advisory**: **< 10** = clinical response, **≥ 10** = active disease,
**≤ 3** = remission (these vary across sources).

## Files

- `lib/lichtiger-index-v663.js` — `lichtigerIndex()`, `LICHTIGER_ITEMS`, `LICHTIGER_NOTE`.
- `views/group-v663.js` (RV663) — eight ordinal selects; a11y-checked, no innerHTML, no network.
- `mcp/adapters/lichtiger-index-v663.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/lichtiger-index.test.js` — 5 tests (8 items / 0–21 range, per-item maxima, activity flags,
  example, required items).
- `docs/spec-v663.md` (this file).

## Sourcing (spec-v97)

Lichtiger S, Present DH, Kornbluth A, et al. Cyclosporine in severe ulcerative colitis refractory to steroid
therapy. *N Engl J Med.* 1994;330(26):1841-1845 (PMID 8196726). A source-verification subagent confirmed all
eight items and their per-level anchors/point values, the 0–21 range, and corrected the threshold framing: the
cutoff is not in the original paper, and the dominant later convention is **< 10** = response / **≥ 10** =
active (with remission commonly **≤ 3**) — so the tile reports the total and marks the cutoffs advisory.
