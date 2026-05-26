# v48 derivation provenance — Lawton IADL (`lawton-iadl`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-3a
- Citation re-verified against: Lawton MP, Brody EM. *Assessment of older people: self-maintaining and instrumental activities of daily living.* Gerontologist. 1969;9(3):179-186.

## Components — verbatim source mapping

Eight binary items per Lawton & Brody 1969. Each scored 0 (needs help) or 1 (independent). Total 0-8.

| Item | Source phrasing |
|---|---|
| Ability to use telephone | "Operates telephone on own initiative; looks up and dials numbers" → 1 |
| Shopping | "Takes care of all shopping needs independently" → 1 |
| Food preparation | "Plans, prepares, and serves adequate meals independently" → 1 |
| Housekeeping | "Maintains house alone or with occasional assistance (heavy work)" → 1 |
| Laundry | "Does personal laundry completely" → 1 |
| Mode of transportation | "Travels independently on public transportation, or drives own car" → 1 |
| Responsibility for own medications | "Is responsible for taking medication in correct dosages at correct time" → 1 |
| Ability to handle finances | "Manages financial matters independently (budgets, writes checks, pays rent, bills)" → 1 |

The Sophie tile uses the modern **unisex** form — all 8 items are scored for all patients. The original 1969 paper used sex-stratified scoring (men were not scored on food prep, housekeeping, laundry); that variant is NOT implemented here, by design.

## Bands — source mapping

| Score | Source band |
|---|---|
| 8 | full independence across all 8 IADLs |
| 6-7 | mild IADL impairment |
| 3-5 | moderate IADL impairment |
| 0-2 | severe IADL impairment |

## Population

180 community-dwelling and institutionalized older adults (Lawton & Brody 1969 §Methods). Subsequently validated in multiple geriatric, dementia, and discharge-planning cohorts.

## Validity

Older adults (geriatric population). Lawton IADL measures higher-level instrumental ADLs (those required for community living); the companion Katz ADL covers basic ADLs (bathing, dressing, etc.). The Sophie tile uses the unisex modern form — the original 1969 sex-stratified scoring is NOT implemented. NOT validated in acutely-ill inpatients (their pre-illness baseline must be inferred from caregiver report).

## Source quote

"The Instrumental Activities of Daily Living Scale (IADL) measures more complex skills which require some cognitive ability ... performance on these tasks ... reflects ability to function independently in the community." — Lawton & Brody 1969 §Method.

## Renderer assertions

Verified locally:
- `META['lawton-iadl'].derivation` has every required field per `lib/derivation.js validate()` and exactly 8 components.
- Components sum equals `lawtonIadl().score` at two boundary points (full 8, severe 2).

## Defects opened
None.
