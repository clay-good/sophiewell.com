# spec-v497.md — Schobinger staging (peripheral AVM) tile

> Status: **SHIPPED (2026-07-23).** Builds the `schobinger-avm` tile — the Schobinger clinical staging of a
> peripheral (extracranial) arteriovenous malformation, stages I-IV. Catalog **1347 → 1348**, group G.

## Why

The catalog grades *intracranial* AVMs for surgical risk (`spetzler-martin`, `spetzler-ponce`) but had nothing
for the peripheral/extracranial vascular anomalies an IR or vascular-anomalies team manages. `schobinger` and
`vascular anomaly` were both zero-hit. Different anatomy, different axis (clinical course, not imaging risk).

## What it does

The clinician picks the stage; the tile reports the stage and its clinical description.

- `lib/schobinger-avm-v497.js` — pure stage → description, the four Schobinger stages. **I:** quiescence.
  **II:** expansion. **III:** destruction. **IV:** decompensation. The staging is **cumulative** — each stage
  carries the findings of the one below it, and the band text says so explicitly. Accepts I-IV and 1-4.
- `views/group-v497.js` (RV497) — one select (dom `schobinger-stage`), real `<label for>`.
- `lib/meta.js` — Kohout and colleagues 1998 (Plast Reconstr Surg) citation + accessed date + grouped bands.
  No citation-staleness row (a named-author article; ISSVA, which adopted the staging, is not in
  `ISSUER_PATTERN` and is not cited).
- 7 worked-example unit tests + fuzz registration; synonym entry (v217 → v218); corpus → 1348.

**HIGH-STAKES:** it reports the clinical stage the clinician has determined, never a diagnosis, an indication
for embolization or resection, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays
with the vascular-anomalies team.

## Sourcing (spec-v97)

- **Citation:** Kohout MP, Hansen M, Pribaz JJ, Mulliken JB. Arteriovenous malformations of the head and neck:
  natural history and management. *Plast Reconstr Surg.* 1998;102(3):643-654 — the paper that popularized the
  Schobinger staging. The citation URL is a PubMed term search.
- Cross-verified against vascular-anomalies references reproducing the same quiescence (I) / expansion (II) /
  destruction (III) / decompensation (IV) staging, including its cumulative structure.

## Verification

Lint (all catalog-truth surfaces at 1348), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: stage II renders "the stage I findings plus enlargement, pulsation, thrill, bruit," IV flips to
"high-output cardiac failure"; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the clinician selects; it does not examine the lesion, read the angiogram, or weigh
embolization against resection. The wider ISSVA classification of vascular anomalies (which separates tumors
from malformations) is not modeled. The MCP adapter + golden-probe promotion follow in the next wave (322).
