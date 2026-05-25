# v48 derivation provenance — MELD-3.0 (formula-only block on `meld-childpugh`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-1c
- Citation re-verified against: Kim WR, Mannalithara A, Heimbach JK, Kamath PS, Asrani SK, Biggins SW, Wood NL, Gentry SE, Kwong AJ. *MELD 3.0: The Model for End-Stage Liver Disease Updated for the Modern Era.* Gastroenterology. 2021;161(6):1887-1895.e4.

## Formula — verbatim source mapping

MELD-3.0 is a log-linear regression, not an additive score. The Sophie derivation block therefore ships *without* a `components` array; the renderer emits the formula, population, validity, and source quote but no per-input contribution list (the renderer's no-op branch handles `components === undefined` cleanly).

From Kim 2021 Equation 1 (with the input-clamping rules in §Methods):

```
MELD-3.0 = round(
  1.33 × (1 if female else 0)
  + 4.56 × ln(bilirubin)
  + 0.82 × (137 − sodium)
  − 0.24 × (137 − sodium) × ln(bilirubin)
  + 9.09 × ln(INR)
  + 11.14 × ln(creatinine)
  + 1.85 × (3.5 − albumin)
  − 1.83 × (3.5 − albumin) × ln(creatinine)
  + 6
)
```

Input clamping (Kim 2021 §Methods):
- Bilirubin: lower-bounded at 1.0 mg/dL.
- INR: lower-bounded at 1.0.
- Creatinine: clamped to [1.0, 3.0] mg/dL. Set to 3.0 if the patient received hemodialysis ≥2× in the last 7 days.
- Sodium: clamped to [125, 137] mEq/L.
- Albumin: clamped to [1.5, 3.5] g/dL.

`lib/scoring-v4.js meld30()` implements this verbatim, including the rounding.

## Bands

From the conventional 4-band stratification used in UNOS allocation literature:

| Score | Source-derived 3-month waitlist mortality | Sophie label |
|---|---|---|
| < 10 | ~2-4% | low |
| 10-19 | ~6-12% | moderate |
| 20-29 | ~20-30% | high |
| ≥ 30 | >50% (transplant priority) | very high |

## Population

Derivation: 20,316 US adult candidates listed for first deceased-donor liver transplant 2016-2018 in OPTN. Validation: a separate 2018-2019 cohort (n=19,373). MELD-3.0 succeeded MELD-Na (2016) by adding sex (+1.33 for female, correcting the prior MELD-Na underestimation of female mortality) and albumin terms.

## Validity

Adult candidates (≥12 years) for liver transplantation. The clamping of inputs is part of the published formula — values outside the clamp range are substituted to the nearest endpoint before the log/linear terms evaluate. NOT defined for pediatric candidates (use PELD); NOT applicable to acute liver failure prioritization (Status 1A). The female correction is intentional and grounded in measurement: pre-2021 MELD-Na underestimated female mortality because female patients have lower baseline creatinine for equivalent renal dysfunction.

## Source quote

"MELD 3.0 includes the female sex and serum albumin as additional variables ... and assigns higher scores in patients with low serum albumin compared with MELD-Na. ... MELD 3.0 reduces the gender disparity in waiting list mortality." — Kim 2021 §Abstract.

## Renderer assertions

Verified locally:
- `META['meld-childpugh'].derivation` has every required field per `lib/derivation.js validate()`.
- `components` is intentionally absent — the schema test asserts this is the formula-only shape.
- `bands` array correctly uses the 4-tier stratification (<10 / 10-19 / 20-29 / ≥30).
- A sanity test asserts `meld30()` produces a score consistent with the META worked example (17 ±1).

## Note on Child-Pugh

The `meld-childpugh` tile also renders the Child-Pugh score (Pugh 1973). Child-Pugh is additive in 5 components (each scored 1/2/3 per Pugh 1973 Table 2), so it COULD support a `components` array. However, surfacing two derivation blocks on a single tile via `derivation` + `derivationCp` (analogous to the SOFA pattern) is left to a future wave because (a) Child-Pugh's classification (A/B/C) is more useful at the bedside than the raw additive total, and (b) the tile is already large; adding two more `<details>` blocks risks burying the result. Wave 48-1c ships MELD-3.0 only on this tile.

## Defects opened
None.
