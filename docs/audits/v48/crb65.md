# v48 derivation provenance — CRB-65 (`crb65`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4h
- Citation re-verified against: Lim WS, van der Eerden MM, Laing R, Boersma WG, Karalus N, Town GI, Lewis SA, Macfarlane JT. *Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study.* Thorax. 2003;58(5):377-382.

## Components — verbatim source mapping

Four yes/no criteria, each +1; range 0-4. CRB-65 is the lab-free / outpatient-friendly variant of CURB-65.

| # | Criterion | Points |
|---|---|---|
| 1 | C — Confusion (new disorientation or AMTS <= 8) | +1 |
| 2 | R — Respiratory rate >= 30 / min | +1 |
| 3 | B — SBP < 90 mmHg OR DBP <= 60 mmHg | +1 |
| 4 | 65 — Age >= 65 years | +1 |

## Bands — source mapping (Lim 2003 §Results, 30-day mortality)

| Range | Mortality | Action |
|---|---|---|
| 0 | ~1.2% | Outpatient management likely appropriate |
| 1-2 | ~8.2% | Consider hospital management |
| 3-4 | ~31.4% | Urgent hospital management indicated |

## Population

Lim 2003: international derivation and validation across three prospective cohorts (1068 derivation UK, 1675 validation New Zealand, 295 validation Netherlands) of adults with community-acquired pneumonia.

## Validity

Adults with community-acquired pneumonia in primary care or community / outpatient settings without rapid access to laboratory testing. Full CURB-65 (with Urea / BUN) discriminates slightly better in the inpatient setting. ATS/IDSA 2019 (Metlay 2019) lists CRB-65 / CURB-65 alongside PSI/PORT and clinical judgement as inputs to admission triage. Not validated for healthcare-associated pneumonia, immunocompromised patients, or pediatric pneumonia.

## Source quote

"The CRB-65 score can be calculated without urea results and may be of particular value in primary care." — Lim 2003 §Discussion.

## Renderer assertions

Verified locally:
- `META.crb65.derivation` has every required field per `lib/derivation.js validate()` and exactly 4 components.
- Components sum equals `crb65().score` at multiple boundary points (none -> 0; confusion + age -> 2; all four -> 4).

## Defects opened
None.
