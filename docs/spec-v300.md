# spec-v300.md — AVF maturation "Rule of 6s" tile

> Status: **SHIPPED (2026-07-14).** Builds the `avf-rule-of-6s` tile — a catalog gap the
> [spec-v293](spec-v293.md) search sweep noted ("AV-fistula rule of 6s"). Catalog **1151 → 1152**,
> group G.

## Why

The v14 synonym sweep listed "AV-fistula rule of 6s" among the genuine catalog gaps (no tile
existed). The Rule of 6s is the bedside heuristic a nephrology / vascular-surgery / dialysis
clinician uses to judge whether a new arteriovenous fistula has matured enough to cannulate.

## What it does

The clinician enters the measured internal fistula blood flow, vein inner diameter, and vein depth
from the skin; the tile checks each against the 2006 KDOQI thresholds (flow ≥ 600 mL/min, diameter
≥ 6 mm, depth ≤ 6 mm) and reports which are met and whether all three are satisfied — meeting all
three is highly predictive of functional maturation (PPV >90%), while not meeting them does not
reliably predict failure (NPV ~47%). It reports the cited rule's criteria, not a cannulation
decision ([spec-v11](spec-v11.md) §5.3).

- `lib/av-fistula-v300.js` — pure flow/diameter/depth → per-criterion pass flags and the all-met
  result.
- `views/group-v300.js` (RV300) — three number inputs, real `<label for>`, no innerHTML.
- `lib/meta.js` — citation + accessed date + all-met / not-all-met interpretation bands.
- 5 worked-example unit tests + fuzz registration; synonym entry (v20 → v21); corpus → 1152.

## Sourcing (spec-v97)

The 6-6-600 thresholds were re-fetched and cross-verified at build against two independent sources
that agree: the 2006 NKF-KDOQI vascular-access guideline (vessel diameter >6 mm, flow >600 mL/min,
depth <6 mm; evaluate for failure to mature if not usable by ~6 weeks) and the JVS 2022 validation
(Rules of 6 criteria predict dialysis fistula maturation; all-criteria PPV >90%, NPV ~47%).

- **Citation:** National Kidney Foundation. KDOQI Clinical Practice Guidelines and Clinical Practice
  Recommendations for Vascular Access. *Am J Kidney Dis.* 2006;48(Suppl 1):S176-S247.
  doi:10.1053/j.ajkd.2006.04.029. "KDOQI" / "National Kidney Foundation" carry no ISSUER_PATTERN
  uppercase acronym (KDIGO is listed, KDOQI is not), so no citation-staleness ledger row is required.
- **Caveat:** the 2019 KDOQI vascular-access update abandons fixed criteria for clinical judgment;
  the tile's note carries that caveat. The tile uses the round-number thresholds inclusively (≥6 /
  ≥600 / ≤6) as the mnemonic targets.

## Verification

Lint (all catalog-truth surfaces at 1152), unit suite (+5 + fuzz), build — all green. Verified in a
real browser: the three measurement inputs render the per-criterion comparison and the all-met band.

## Out of scope

Ultrasound access-flow trending and the specific 4-6 week re-evaluation schedule are out of scope
(this tile is the point-in-time Rule of 6s check). The MCP adapter + golden-probe promotion follow
in a separate wave.
