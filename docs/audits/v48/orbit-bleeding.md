# v48 derivation provenance — ORBIT Bleeding (`orbit-bleeding`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4b
- Citation re-verified against: O'Brien EC, Simon DN, Thomas LE, Hylek EM, Gersh BJ, Ansell JE, Kowey PR, Mahaffey KW, Chang P, Fonarow GC, Pencina MJ, Piccini JP, Peterson ED. *The ORBIT bleeding score: a simple bedside score to assess bleeding risk in atrial fibrillation.* Eur Heart J. 2015;36(46):3258-3264.

## Components — verbatim source mapping

Five weighted criteria per O'Brien 2015 Table 2.

| Criterion | Source phrasing | Points |
|---|---|---|
| Low Hgb or Hct | "Hemoglobin < 13 g/dL in men, < 12 g/dL in women, OR hematocrit < 40% in men, < 36% in women" | 2 |
| Age > 74 | "Age older than 74 years" | 1 |
| Bleeding history | "History of bleeding (GI, intracranial, or hemorrhagic stroke)" | 2 |
| Renal insufficiency | "Renal insufficiency (eGFR < 60 mL/min/1.73 m²)" | 1 |
| Antiplatelet treatment | "Treatment with an antiplatelet agent" | 1 |

## Bands — source mapping (O'Brien 2015 Table 3)

| Score | Annual major-bleed risk | Sophie label |
|---|---|---|
| 0-2 | 2.4%/yr | low |
| 3 | 4.7%/yr | intermediate |
| 4-7 | 8.1%/yr | high |

## Population

O'Brien 2015: derivation in 7411 patients with AF from the ORBIT-AF registry. External validation in 8438 patients from the ROCKET-AF trial.

## Validity

Adults with non-valvular AF on anticoagulation. ORBIT has slightly better c-statistic than HAS-BLED in some cohorts and is endorsed by the 2019 AHA/ACC/HRS focused update. Like ATRIA and HAS-BLED, ORBIT identifies *modifiable* bleeding-risk factors (anemia → workup; renal function → dose adjustment) — NOT a reason to withhold anticoagulation if CHA2DS2-VASc indicates it.

## Source quote

"The ORBIT bleeding score is a simple bedside risk score to assess bleeding risk in patients with AF. It is simpler than HAS-BLED, HEMORR2HAGES, and ATRIA and showed superior discriminatory performance compared with these other scores." — O'Brien 2015 §Conclusions.

## Renderer assertions

Verified locally:
- `META['orbit-bleeding'].derivation` has every required field per `lib/derivation.js validate()` and exactly 5 components.
- Components sum equals `orbitBleeding().score` at three boundary points (zero, intermediate 3, max 7).

## Defects opened
None.
