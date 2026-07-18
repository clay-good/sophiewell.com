# spec-v425.md — Vesicoureteral reflux grade (VCUG) tile

> Status: **SHIPPED (2026-07-18).** Builds the `vur-grade` tile — the International Reflux Study grading of
> vesicoureteral reflux on a voiding cystourethrogram, grades I/II/III/IV/V. Catalog **1276 → 1277**, group G.

## Why

The catalog had no grading for vesicoureteral reflux — the standard five-grade scheme a radiologist reports on
a pediatric VCUG. `vesicoureteral reflux grade` / `vur grade` routed to nothing. This fills that pediatric
urology / radiology gap.

## What it does

The radiologist picks the grade; the tile reports the grade and its imaging description.

- `lib/vur-grade-v425.js` — pure grade → description, the international five-grade VUR grading on VCUG. **I:**
  ureter only, not reaching the pelvis. **II:** up to the pelvis, no dilatation. **III:** mild to moderate
  dilatation. **IV:** moderate dilatation and tortuosity, fornices obliterated. **V:** gross dilatation and
  tortuosity, intrarenal reflux. Accepts I-V and 1-5.
- `views/group-v425.js` (RV425) — one select (dom `vur-grade`), real `<label for>`.
- `lib/meta.js` — International Reflux Study Committee 1981 (Pediatrics) citation + accessed date + grouped
  bands. No citation-staleness row (the citation carries no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v146 → v147); corpus → 1277.

**HIGH-STAKES:** it reports the imaging grade the radiologist has determined, never a diagnosis, a treatment
decision (medical prophylaxis vs surgical reimplantation), or a prognosis ([spec-v11](spec-v11.md) §5.3); the
management decision stays with the pediatric urology / nephrology team.

## Sourcing (spec-v97)

- **Citation:** International Reflux Study Committee. Medical versus surgical treatment of primary
  vesicoureteral reflux. *Pediatrics.* 1981;67(3):392-400.
- Cross-verified against pediatric urology / radiology references reproducing the same ureter-only (I) /
  up-to-pelvis (II) / mild-moderate-dilatation (III) / moderate-dilatation-tortuosity (IV) / gross-dilatation
  (V) grading.

## Verification

Lint (all catalog-truth surfaces at 1277), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: grade III renders "mild to moderate dilatation," the other grades flip to their descriptions; the
tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the radiologist selects; it does not read the VCUG, choose between medical and
surgical management, or estimate resolution likelihood. The MCP adapter + golden-probe promotion follow in a
separate wave.
