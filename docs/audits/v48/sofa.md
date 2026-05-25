# v48 derivation provenance — SOFA (second block on `qsofa-sofa`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-1c
- Citation re-verified against: Vincent JL, Moreno R, Takala J, Willatts S, De Mendonça A, Bruining H, Reinhart CK, Suter PM, Thijs LG. *The SOFA (Sepsis-related Organ Failure Assessment) score to describe organ dysfunction/failure.* Intensive Care Med. 1996;22(7):707-710. Recalibrated for Sepsis-3 in: Singer M, et al. JAMA. 2016;315(8):801-810. Seymour CW, et al. JAMA. 2016;315(8):762-774.

## Schema delivery — second `derivation` block on the same tile

The `qsofa-sofa` tile renders both qSOFA (wave 48-1a) and SOFA (this wave). To deliver two derivation blocks on a single META entry, wave 48-1c introduces an optional `derivationSofa` field alongside the existing `derivation` field. The view layer (`views/group-g.js qsofa-sofa()`) calls `renderDerivation(META['qsofa-sofa'])` for qSOFA and `renderDerivation({ derivation: META['qsofa-sofa'].derivationSofa })` for SOFA — appending two `<details>` blocks in DOM order. No schema changes are required for tiles with a single derivation block.

## Components — verbatim source mapping

Six organ systems from Vincent 1996 Table 1, each scored 0-4. The Sophie tile accepts pre-graded 0-4 values per system because the underlying clinical inputs require bedside judgment that does not collapse into a single numeric input (e.g., the cardiovascular score depends on MAP AND vasopressor dose tier).

| Organ system | Source criteria (Vincent 1996 Table 1) |
|---|---|
| Respiration (PaO2/FiO2) | ≥400 → 0; 300-399 → 1; 200-299 → 2; 100-199 (on respiratory support) → 3; <100 (on respiratory support) → 4 |
| Coagulation (platelets ×10³/µL) | ≥150 → 0; 100-149 → 1; 50-99 → 2; 20-49 → 3; <20 → 4 |
| Liver (bilirubin mg/dL) | <1.2 → 0; 1.2-1.9 → 1; 2.0-5.9 → 2; 6.0-11.9 → 3; ≥12 → 4 |
| Cardiovascular (MAP / vasopressors) | MAP ≥70 mmHg → 0; MAP <70 → 1; dopamine ≤5 µg/kg/min or dobutamine any → 2; dopamine >5 / epinephrine ≤0.1 / norepinephrine ≤0.1 → 3; dopamine >15 / epinephrine >0.1 / norepinephrine >0.1 → 4 |
| CNS (GCS) | 15 → 0; 13-14 → 1; 10-12 → 2; 6-9 → 3; <6 → 4 |
| Renal (creatinine mg/dL / urine output) | <1.2 (or UO normal) → 0; 1.2-1.9 → 1; 2.0-3.4 → 2; 3.5-4.9 or UO <500 mL/d → 3; ≥5.0 or UO <200 mL/d → 4 |

Each component's `points` is `(v) => Math.max(0, Math.min(4, Number(v) || 0))` — value is the component's contribution, clamped to [0, 4]. This mirrors `lib/scoring-v4.js sofa()`.

## Bands — verbatim source mapping

From Sophie's existing implementation in `lib/scoring-v4.js sofa()` (which reflects the conventional mortality stratification used in the original Vincent 1996 follow-up and subsequent literature):

| Total | Source-derived mortality band | Sophie label |
|---|---|---|
| 0-6 | ~10% ICU mortality | low |
| 7-9 | ~15-20% | moderate |
| 10-12 | ~40-50% | high |
| 13-24 | >50% | very high |

The Sepsis-3 operational definition (Singer 2016) treats a *change* of ≥2 SOFA points from baseline (in the setting of suspected infection) as the criterion for sepsis. Absolute SOFA bands above are the per-encounter score; the Sepsis-3 delta criterion is a separate use of the same score.

## Population

Originally derived from 1449 ICU patients across 40 European ICUs (Vincent 1996). Validated and recalibrated by Seymour 2016 (JAMA) on >700,000 electronic-health-record encounters from the UPMC, KPNC, and VA cohorts for the Sepsis-3 task force.

## Validity

Adult ICU patients. The Sophie tile accepts pre-graded 0-4 values per organ system because the underlying clinical inputs (PaO2/FiO2 with ventilator context, vasopressor dose tier, urine output trend) require bedside judgment that does not collapse into a single numeric input. NOT validated in pediatric ICU (use pSOFA, Matics 2017). The Sophie tile does not implement the delta-SOFA Sepsis-3 criterion; the user is responsible for comparing the current SOFA to the patient's baseline if Sepsis-3 operationalization is the intent.

## Source quote

"The SOFA score is a simple, but effective method to describe the dysfunction of vital organ systems on a daily basis... The use of the SOFA score allows quantification of organ dysfunction at any moment, and... [its] daily evaluation during the ICU stay allows quantification of the degree of dysfunction of single organs as well as of the cumulative dysfunction of all organs over time." — Vincent 1996 §Conclusion.

## Renderer assertions

Verified locally:
- `META['qsofa-sofa'].derivationSofa` has every required field per `lib/derivation.js validate()` (validated via the `derivation` shape, passed in as `{ derivation: derivationSofa }`).
- Components sum equals `sofa().score` at four boundary points: zero, worked example (2), max (24), and a clamped case (99 → 4).

## Defects opened
None.
