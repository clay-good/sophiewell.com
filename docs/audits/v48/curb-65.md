# v48 derivation provenance — CURB-65 (`curb-65`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-2a
- Citation re-verified against: Lim WS, van der Eerden MM, Laing R, Boersma WG, Karalus N, Town GI, Lewis SA, Macfarlane JT. *Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study.* Thorax. 2003;58(5):377-382.

## Components — verbatim source mapping

Five binary criteria from Lim 2003 Table 2; the mnemonic CURB-65.

| Letter | Component | Source phrasing (Lim 2003 Table 2) | Points |
|---|---|---|---|
| C | Confusion (new disorientation; AMTS ≤ 8) | "New mental confusion (defined as an Abbreviated Mental Test score of 8 or less)" | 1 |
| U | BUN > 20 mg/dL | "Urea > 7 mmol/L" — the Sophie tile uses BUN > 20 mg/dL as the standard US-clinical equivalent (urea 7 mmol/L ≈ BUN 19.6 mg/dL) | 1 |
| R | Respiratory rate ≥ 30/min | "Respiratory rate ≥ 30/min" | 1 |
| B | SBP < 90 mmHg or DBP ≤ 60 mmHg | "Blood pressure (systolic < 90 mm Hg or diastolic ≤ 60 mm Hg)" | 1 |
| 65 | Age ≥ 65 | "Age ≥ 65 years" | 1 |

## Bands — verbatim source mapping

From Lim 2003 Table 4 (30-day mortality):

| Score | Source mortality | Sophie band label |
|---|---|---|
| 0 | 0.7% | low severity |
| 1 | 2.1% | low severity |
| 2 | 9.2% | intermediate severity |
| 3 | 14.5% | severe |
| 4 | 40.0% | severe (ICU consideration) |
| 5 | 57.0% | severe (ICU consideration) |

Sophie collapses to a 3-band stratification (0-1 / 2 / 3-5) matching the site-of-care decision (outpatient / ward / ICU).

## Population

Derivation/validation: 1068 adults hospitalized with CAP, pooled from three prospective studies in the UK, the Netherlands, and New Zealand (Lim 2003 §Methods).

## Validity

Adults with community-acquired pneumonia. CURB-65 is a triage tool — its purpose is to direct site-of-care decision (outpatient vs ward vs ICU), not to choose specific antibiotic therapy. NOT validated in immunocompromised hosts, in hospital-acquired or ventilator-associated pneumonia, or in pediatric pneumonia (use age-appropriate criteria). The 4-5 ICU criterion can under-trigger early septic shock; the IDSA/ATS 2007 minor criteria (Mandell 2007 Table 4) are a recommended adjunct in possibly-septic patients.

## Source quote

"A simple six-point score, based on confusion, urea, respiratory rate, blood pressure, and age ≥ 65 years (CURB-65 score), enabled patients to be stratified according to increasing risk of mortality." — Lim 2003 §Abstract.

## Renderer assertions

Verified locally:
- `META['curb-65'].derivation` has every required field per `lib/derivation.js validate()`.
- Components sum equals `curb65()` total at three boundary points (0, 2, 5).

## Defects opened
None.
