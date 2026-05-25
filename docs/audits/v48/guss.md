# v48 derivation provenance — GUSS (`guss`) — formula-only

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-2c
- Citation re-verified against: Trapl M, Enderle P, Nowotny M, Teuschl Y, Matz K, Dachenhausen A, Brainin M. *Dysphagia bedside screening for acute-stroke patients: the Gugging Swallowing Screen.* Stroke. 2007;38(11):2948-2952.

## Why formula-only

GUSS is a **staged** screen, not a pure additive score. The stages gate each other: a patient who fails Stage 1 must NOT be advanced to the swallowing trials, and within Stage 2 each consistency gates the next. Surfacing this as an additive `components` array would misrepresent the gating safety mechanism — the value of GUSS is partly in the *stop conditions*, not just the totals.

Therefore wave 48-2c ships GUSS as a formula-only derivation block (no `components`), following the wave-48-1c MELD-3.0 precedent. The renderer's no-op branch handles `components === undefined` cleanly.

## Formula — verbatim source mapping

From Trapl 2007 Tables 1-2.

```
Stage 1 — Preliminary investigation (max 5):
  - Vigilance / alertness — 0 or 1
  - Voluntary cough or throat clearing — 0 or 1
  - Saliva swallow successful — 0 or 1
  - No drooling — 0 or 1
  - No voice change — 0 or 1
  If Stage 1 < 5: STOP. Total = Stage 1. Severe dysphagia; NPO.
  If Stage 1 = 5: proceed to Stage 2 — Semisolid.

Stage 2 — Semisolid (max 5):
  - Deglutition: 0 not possible / 1 delayed / 2 successful
  - No involuntary cough — 0 or 1
  - No drooling — 0 or 1
  - No voice change — 0 or 1
  If semisolid < 5: STOP. Total = Stage 1 + semisolid.
  If semisolid = 5: proceed to Liquid.

Stage 2 — Liquid (max 5): same 4 items as semisolid.
  If liquid < 5: STOP. If liquid = 5: proceed to Solid.

Stage 2 — Solid (max 5): same 4 items.

Total = Stage 1 + (each Stage 2 consistency that was reached). Range 0-20.
```

`lib/scoring-v4.js guss()` enforces the gating and returns the per-stage totals plus a `gated` array listing consistencies that were not performed.

## Bands — verbatim source mapping

From Trapl 2007 Table 2:

| Total | Source band | Sophie label |
|---|---|---|
| 20 | slight / no dysphagia | normal diet, normal liquids |
| 15-19 | slight dysphagia | dysphagia diet (purée + thickened liquids); SLP evaluation |
| 10-14 | moderate dysphagia | semisolid only, NPO liquids; SLP; FEES/VFSS |
| 0-9 | severe dysphagia | NPO; consider NG/PEG; urgent SLP |

## Population

Trapl 2007 derivation: 50 acute-stroke patients at a Vienna stroke unit. Validation: 50 additional patients, sensitivity 100% for aspiration on VFSS at the <20 cutoff in this cohort.

## Validity

Adult post-stroke bedside dysphagia screen. The staged gating IS the safety mechanism: a patient who fails Stage 1 should NOT be advanced to the swallowing trials. The Sophie computation respects the gating — even if the user enters values for liquid / solid after failing semisolid, those values do not contribute to the total (and the result block surfaces a `gated` list of consistencies that were not performed). The screen is an SLP-pre-evaluation tool; FEES/VFSS remain the gold standard. NOT validated for non-stroke dysphagia etiologies.

## Source quote

"The GUSS allows a graded rating with separate evaluations for nonfluid and fluid foods. ... Sensitivity for aspiration as confirmed by FEES was 100% at the cutoff of < 20 in our cohort." — Trapl 2007 §Abstract.

## Renderer assertions

Verified locally:
- `META.guss.derivation` has every required field per `lib/derivation.js validate()`.
- `components` is intentionally absent — the schema test asserts this is the formula-only shape.
- `bands` correctly use the 4-tier dysphagia stratification (0-9 / 10-14 / 15-19 / 20).

## Defects opened
None.
