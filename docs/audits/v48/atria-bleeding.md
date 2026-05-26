# v48 derivation provenance — ATRIA Bleeding (`atria-bleeding`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4a
- Citation re-verified against: Fang MC, Go AS, Chang Y, Borowsky LH, Pomernacki NK, Udaltsova N, Singer DE. *A new risk scheme to predict warfarin-associated hemorrhage. The ATRIA (Anticoagulation and Risk Factors in Atrial Fibrillation) Study.* J Am Coll Cardiol. 2011;58(4):395-401.

## Components — verbatim source mapping

Five weighted criteria per Fang 2011 Table 2.

| Criterion | Source phrasing | Points |
|---|---|---|
| Anemia | "Anemia (hemoglobin < 13 g/dL in men, < 12 g/dL in women)" | 3 |
| Severe renal disease | "Severe renal disease (eGFR < 30 mL/min/1.73 m² or dialysis-dependent)" | 3 |
| Age >= 75 | "Age ≥ 75 years" | 2 |
| Prior hemorrhage | "Prior hemorrhage diagnosis" | 1 |
| Hypertension | "Diagnosed hypertension" | 1 |

## Bands — source mapping (Fang 2011 Table 3)

| Score | Annual major-bleed risk | Sophie label |
|---|---|---|
| 0-3 | 0.8%/yr | low |
| 4 | 2.6%/yr | intermediate |
| 5-10 | 5.8%/yr | high |

## Population

Fang 2011: derivation in 9186 patients with non-valvular AF on warfarin from the Kaiser Permanente Northern California ATRIA cohort. Reference standard: validated major-bleeding events.

## Validity

Adults with non-valvular AF on warfarin. ATRIA was derived primarily on warfarin-treated patients; predictive performance for DOAC bleeding is similar but absolute event rates are lower across all bands. Companion bleeding-risk instruments (HAS-BLED, ORBIT, HEMORR2HAGES — separate Sophie tiles) score modestly differently; institutional preference governs which to use. The score is intended to identify *modifiable* bleeding-risk factors (anemia, BP control, renal function) for review, NOT to deny anticoagulation if CHA2DS2-VASc indicates it.

## Source quote

"We developed a simple risk score (the ATRIA bleeding risk score) ... to predict warfarin-associated hemorrhage." — Fang 2011 §Abstract.

## Renderer assertions

Verified locally:
- `META['atria-bleeding'].derivation` has every required field per `lib/derivation.js validate()` and exactly 5 components.
- Components sum equals `atriaBleeding().score` at three boundary points (zero, intermediate 4, max 10).

## Defects opened
None.
