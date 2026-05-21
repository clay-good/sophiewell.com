# v11 audit - beers-check

- Auditor: CG
- Date: 2026-05-21
- Citation re-verified against: 2023 American Geriatrics Society Beers Criteria® Update Expert Panel. *American Geriatrics Society 2023 updated AGS Beers Criteria® for potentially inappropriate medication use in older adults.* J Am Geriatr Soc. 2023;71(7):2052-2081. Table 2 (PIM by drug category), Table 3 (drug-disease interactions), Table 6 (drug-drug interactions of high severity). The implementation models 15 PIM categories from Table 2, 8 comorbidities from Table 3, and the three highest-severity drug-drug rows from Table 6 (opioid + benzodiazepine, opioid + gabapentinoid, opioid + Z-drug).

`lib/medication-v4.js beersCheck()` validates inputs (age 18-120; medications and comorbidities are arrays of closed-vocabulary keys), deduplicates inputs, emits PIM flags from `BEERS_PIM`, cross-product flags from `BEERS_DISEASE_INTERACTIONS`, and combination flags from `BEERS_DRUG_DRUG`. The < 65 banner is set when age is below the AGS band; the in-band banner is set otherwise.

## Boundary examples added

- Age 78, benzodiazepine + opioid, history of falls -> 5 flags (2 PIM, 2 drug-disease, 1 drug-drug).
- Age 72, glyburide + diphenhydramine, no comorbid -> 2 PIM, 0 disease, 0 drug-drug.
- Age 80, digoxin > 0.125 mg/day + heart failure -> 1 PIM + 1 Table 3 (HF) flag.
- Age 70, empty medication list -> no-meds summary; no flags.
- Age 60 (below Beers band) -> "< 65" banner present; flags still computed for educational use.
- Age 65 boundary -> "aged 65+" in-band banner.
- NSAID + CKD + HF + GI-bleed -> three separate Table 3 flags.
- Opioid + Z-drug -> Table 6 moderate-severity flag.
- Duplicate medication entries collapse.

## Cross-implementation differential

- Reference: AGS 2023 Beers Criteria, Table 2 (statement: "Avoid benzodiazepines for treatment of insomnia, agitation, or delirium in older adults; strong recommendation"). Worked example: age 78, benzodiazepine -> PIM recommendation includes "Avoid for insomnia, agitation, or delirium (AGS 2023 Table 2, strong recommendation)." PASS.
- Reference: AGS 2023 Table 3, row "Benzodiazepines + history of falls or fractures - increased fall risk; avoid." Sophie result for age 78, benzodiazepine, history-of-falls: disease flag text "Benzodiazepine + falls/fractures: increased fall risk. Avoid (AGS 2023 Table 3, strong)." PASS.
- Reference: AGS 2023 Table 6, row "Opioids + benzodiazepines - high respiratory depression and overdose-death risk." Sophie result includes drug-drug flag "Opioid + benzodiazepine: high respiratory-depression and overdose-death risk. Avoid concurrent use (AGS 2023 Table 6, strong)." PASS.

## Edge-input handling notes

- Out-of-range age (< 18 or > 120) throws. Non-numeric age throws.
- Unknown medication category throws with a clear message.
- Unknown comorbidity throws.
- Non-array medications or comorbidities throw.
- Duplicate entries in the medications array are deduplicated and produce a single flag.

## A11y / keyboard notes

- One number input (age), two grouped checkbox lists (medications, comorbidities). Each checkbox has a paired `<label for=>`; Tab-reachable; result region is aria-live polite; `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
