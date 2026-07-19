# spec-v477.md — SFU grade (hydronephrosis) tile

> Status: **SHIPPED (2026-07-19).** Builds the `sfu-hydronephrosis` tile — the Society for Fetal Urology (SFU)
> ultrasound grading of hydronephrosis, grades 0-4. Catalog **1327 → 1328**, group G.

## Why

The pediatric-urology tiles (Koff expected bladder capacity) had no hydronephrosis grade. `sfu` /
`hydronephrosis grade` routed to nothing. This fills that pediatric-urology / radiology gap.

## What it does

The clinician picks the grade; the tile reports the grade and its renal-sinus/calyceal-dilatation description.

- `lib/sfu-hydronephrosis-v477.js` — pure grade → description, the five SFU grades. **0:** intact central
  renal complex. **1:** renal pelvis only. **2:** pelvis and a few calyces. **3:** pelvis and all calyces
  uniformly dilated (normal parenchyma). **4:** as grade 3 plus parenchymal thinning. Accepts 0-4.
- `views/group-v477.js` (RV477) — one select (dom `sfu-grade`), real `<label for>`.
- `lib/meta.js` — Fernbach, Maizels & Conway 1993 (Pediatr Radiol) citation + accessed date + grouped bands. No
  citation-staleness row (the citation is a named-author journal article, no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v197 → v198); corpus → 1328.

**HIGH-STAKES:** it reports the ultrasound grade the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the urology team.

## Sourcing (spec-v97)

- **Citation:** Fernbach SK, Maizels M, Conway JJ. Ultrasound grading of hydronephrosis: introduction to the
  system used by the Society for Fetal Urology. *Pediatr Radiol.* 1993;23(6):478-480. The citation URL is a
  PubMed term search.
- Cross-verified against pediatric-urology references reproducing the same intact (0) / pelvis-only (1) /
  pelvis-plus-some-calyces (2) / pelvis-plus-all-calyces (3) / plus-parenchymal-thinning (4) grading.

## Verification

Lint (all catalog-truth surfaces at 1328), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade 2 renders "dilatation of the renal pelvis and a few calyces," the other grades flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the ultrasound or recommend management. The
MCP adapter + golden-probe promotion follow in the next wave (302).
