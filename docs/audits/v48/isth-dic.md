# v48 derivation provenance — ISTH overt DIC (`isth-dic`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4h
- Citation re-verified against: Taylor FB Jr, Toh CH, Hoots WK, Wada H, Levi M; Scientific Subcommittee on Disseminated Intravascular Coagulation of the International Society on Thrombosis and Haemostasis. *Towards definition, clinical and laboratory criteria, and a scoring system for disseminated intravascular coagulation.* Thromb Haemost. 2001;86(5):1327-1330.

## Gate

An underlying disorder known to be associated with DIC must be present (sepsis, trauma, malignancy, obstetric complication, severe liver disease, vascular abnormalities) before the lab score is interpreted. The gate is surfaced in the tile but does not modify the lab sum.

## Components — verbatim source mapping

Four laboratory components per Taylor 2001; range 0-8.

| # | Component | Bands |
|---|---|---|
| 1 | Platelet count | > 100: 0 / 50-100: +1 / < 50: +2 |
| 2 | Elevated fibrin-related marker (D-dimer / FDP / soluble fibrin monomers) | none: 0 / moderate: +2 / strong: +3 |
| 3 | Prolonged PT (seconds above ULN) | < 3 s: 0 / 3-6 s: +1 / > 6 s: +2 |
| 4 | Fibrinogen | > 1 g/L: 0 / <= 1 g/L: +1 |

## Bands — source mapping (Taylor 2001 §Algorithm)

| Range | Action |
|---|---|
| < 5 | Not compatible with overt DIC; repeat scoring 1-2 days as clinically indicated |
| >= 5 | Compatible with overt DIC |

## Population

Taylor 2001: consensus-built ISTH SSC scoring system. Validation cohorts include Bakhtiari 2004 (217 ICU patients with suspected DIC; sensitivity ~91%, specificity ~97%) and additional cohorts in septic, obstetric, and trauma DIC.

## Validity

Adult patients with an underlying disorder known to be associated with DIC. The score identifies *overt* DIC; a separate "non-overt" ISTH template tracks day-over-day trends in subclinical DIC. The fibrin-marker rubric is intentionally semi-quantitative because cutoffs are assay-specific; institutional D-dimer / FDP thresholds for "moderate" and "strong" should be defined locally. Not validated for pediatric or neonatal DIC, or for liver-disease-driven coagulopathy without an additional DIC-associated trigger.

## Source quote

"A scoring system for overt DIC may be derived from changes in platelet count, increased levels of soluble fibrin or fibrin degradation products, prolongation of prothrombin time and decreasing fibrinogen levels." — Taylor 2001 §Algorithm.

## Renderer assertions

Verified locally:
- `META['isth-dic'].derivation` has every required field per `lib/derivation.js validate()` and exactly 4 components.
- Components sum equals `isthDic().score` at multiple boundary points (gate met, all "none" -> 0; platelet <50 + strong fibrin marker -> 5 -> overt-DIC band).

## Defects opened
None.
