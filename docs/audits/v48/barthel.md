# v48 derivation provenance — Barthel Index (`barthel`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-3b
- Citations re-verified against:
  - Mahoney FI, Barthel DW. *Functional evaluation: the Barthel Index.* Md State Med J. 1965;14:61-65.
  - Shah S, Vanclay F, Cooper B. *Improving the sensitivity of the Barthel Index for stroke rehabilitation.* J Clin Epidemiol. 1989;42(8):703-709.

## Components — verbatim source mapping

Ten weighted ADL items per Mahoney & Barthel 1965. Each has a published closed set of allowed values (the underlying `lib/scoring-v4.js barthel()` throws on off-grid values).

| Item | Allowed values (source) |
|---|---|
| Feeding | 0 unable / 5 needs help / 10 independent |
| Bathing | 0 dependent / 5 independent |
| Grooming | 0 needs help / 5 independent |
| Dressing | 0 dependent / 5 needs help / 10 independent |
| Bowel control | 0 incontinent / 5 occasional accident / 10 continent |
| Bladder control | 0 incontinent or catheterized / 5 occasional accident / 10 continent |
| Toilet use | 0 dependent / 5 needs help / 10 independent |
| Transfers (bed to chair and back) | 0 unable / 5 major help / 10 minor help / 15 independent |
| Mobility (on level) | 0 immobile / 5 wheelchair independent / 10 walks with help / 15 walks independently |
| Stairs | 0 unable / 5 needs help / 10 independent |

Each `points` callback clamps to `[0, max]` (where max is 5, 10, or 15 per the item's allowed set). The Sophie tile's view uses `<select>` inputs constrained to the source-defined values; the derivation callback is a defensive clamp.

## Bands — source mapping (Shah 1989)

| Score | Source label |
|---|---|
| 100 | independent |
| 91-99 | slight dependency |
| 61-90 | moderate dependency |
| 21-60 | severe dependency |
| 0-20 | total dependency |

## Population

- **Mahoney & Barthel 1965**: chronic-disease inpatients at the Maryland State Chronic Diseases Hospital.
- **Shah 1989**: 258 stroke-rehab patients in Australia; introduced the 5-band severity stratification.

## Validity

Adult rehabilitation and chronic-disease inpatients. Widely used in stroke rehabilitation, geriatrics, and discharge planning. Each item has a published *closed set* of allowed values (e.g., feeding is 0, 5, or 10 — there is no 7); the underlying calculator throws on off-grid values to prevent silent rounding. The Shah 1989 5-band severity scheme is the contemporary stratification; the 1965 paper did not specify bands. NOT designed for acute-illness severity scoring.

## Source quote

"The total score depends on the patient's ability to perform the items independently. ... This index is sensitive to changes in functional status in chronically ill patients." — Mahoney & Barthel 1965 §Summary.

## Renderer assertions

Verified locally:
- `META.barthel.derivation` has every required field per `lib/derivation.js validate()` and exactly 10 components.
- Components sum equals `barthel().score` at three boundary points (max 100, zero, moderate 70).

## Defects opened
None.
