# v48 derivation provenance — Katz ADL (`katz-adl`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-3a
- Citation re-verified against: Katz S, Ford AB, Moskowitz RW, Jackson BA, Jaffe MW. *Studies of illness in the aged. The index of ADL: a standardized measure of biological and psychosocial function.* JAMA. 1963;185(12):914-919.

## Components — verbatim source mapping

Six binary items per Katz 1963 Table 1. Each scored 0 (dependent) or 1 (independent). Total 0-6.

| Item | Source phrasing (Katz 1963 Table 1) |
|---|---|
| Bathing | "Receives no assistance (gets in and out of tub if tub is usual means of bathing)" → 1 |
| Dressing | "Gets clothes from closets and drawers and puts on clothes and outer garments and uses fasteners (including braces, if worn)" → 1 |
| Toileting | "Goes to 'toilet room' for bowel and urine elimination; cleans self after elimination and arranges clothes without assistance" → 1 |
| Transferring (in/out of bed or chair) | "Moves in and out of bed as well as in and out of chair without assistance (may use object such as cane or walker for support)" → 1 |
| Continence | "Controls urination and bowel movement completely by self" → 1 |
| Feeding | "Feeds self without assistance" → 1 |

## Bands — source mapping

Sophie collapses Katz 1963's A-G letter grading into the standard contemporary discharge-planning stratification:

| Score | Source equivalent | Sophie label |
|---|---|---|
| 6 | A — Independent in all 6 ADLs | full independence in all 6 ADLs |
| 5 | B — Independent in all but 1 | mild impairment (independent in 5 of 6 ADLs) |
| 3-4 | C-D — Independent in 3-4 | moderate impairment |
| 0-2 | E-G — Dependent in 4+ | severe functional impairment |

## Population

Katz 1963: 1001 patients across hip-fracture and stroke rehabilitation cohorts. Validated extensively in geriatric care, rehabilitation, and discharge planning.

## Validity

Older adults (geriatric population), discharge-planning and rehabilitation contexts. Katz ADL measures basic ADLs (the "self-maintenance" half of geriatric function); the companion Lawton IADL covers instrumental ADLs (the "community living" half). The bands above reflect the conventional discharge-planning stratification — the 1963 paper itself uses an A-G letter grading. NOT designed for acute-illness severity scoring; baseline ADLs are typically assessed pre-illness via caregiver interview.

## Source quote

"The Index of Independence in Activities of Daily Living was developed to study results of treatment and prognosis in the elderly and chronically ill. ... The Index ranks adequacy of performance in the six functions of bathing, dressing, toileting, transferring, continence, and feeding." — Katz 1963 §Summary.

## Renderer assertions

Verified locally:
- `META['katz-adl'].derivation` has every required field per `lib/derivation.js validate()` and exactly 6 components.
- Components sum equals `katzAdl().score` at two boundary points (full 6, severe 2).

## Defects opened
None.
