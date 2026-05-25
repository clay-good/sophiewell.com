# v48 derivation provenance — Centor & McIsaac (`centor`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-2a
- Citations re-verified against:
  - Centor RM, Witherspoon JM, Dalton HP, Brody CE, Link K. *The diagnosis of strep throat in adults in the emergency room.* Med Decis Making. 1981;1(3):239-246.
  - McIsaac WJ, White D, Tannenbaum D, Low DE. *A clinical score to reduce unnecessary antibiotic use in patients with sore throat.* CMAJ. 1998;158(1):75-83.

## Two derivation blocks on a single tile

The `centor` tile renders both Centor (1981) and the McIsaac age modification (1998). Following the wave-48-1c precedent (`derivationSofa` on `qsofa-sofa`), this tile delivers the second block via a sibling field `META.centor.derivationMcisaac`. The view (`views/group-g.js centor()`) calls `renderDerivation` for both — Centor first, then McIsaac — appending two `<details>` blocks in DOM order.

## Centor components — verbatim source mapping

Four binary criteria from Centor 1981.

| Component | Source phrasing | Points |
|---|---|---|
| Tonsillar exudate | "Tonsillar exudate" | 1 |
| Tender anterior cervical adenopathy | "Tender anterior cervical adenopathy" | 1 |
| Fever history (>38°C) | "History of fever (temperature > 100°F)" — Sophie uses the >38°C metric equivalent | 1 |
| Absence of cough | "Absence of cough" | 1 |

## Centor bands — verbatim source mapping

From Centor 1981 §Results (GAS pharyngitis probability):

| Score | Source probability | Sophie label |
|---|---|---|
| 0-1 | < 10% | low |
| 2-3 | 15-32% | intermediate |
| 4 | ~56% | high |

## McIsaac components — verbatim source mapping

Centor's four criteria PLUS the age modifier from McIsaac 1998 Table 2:

| Age years | Modifier (McIsaac 1998) |
|---|---|
| 3-14 | +1 |
| 15-44 | +0 |
| ≥ 45 | -1 |

The age modifier is a function-typed component (`points: (v) => { ... }`) — the value is the patient's age in years, mapped to the modifier via the age-range lookup.

## McIsaac bands

From McIsaac 1998 Table 4 management bands:

| Score | Action |
|---|---|
| ≤ 1 | no test / no antibiotics |
| 2-3 | rapid antigen test |
| 4-5 | empiric treatment may be considered |

## Population

- **Centor 1981**: 286 adults with acute pharyngitis at an inner-city ED.
- **McIsaac 1998**: 521 patients with sore throat (children and adults) at family-practice teaching units in Toronto. Re-derives Centor with an empirically fit age modifier.

## Validity

- **Centor**: adults with acute pharyngitis. Targets pretest probability of GAS pharyngitis; does NOT address rare-but-serious differentials (peritonsillar abscess, Lemierre, epiglottitis). NOT validated in immunocompromised hosts.
- **McIsaac**: children and adults with acute pharyngitis. The age modifier is the key McIsaac addition; everything else is identical to Centor. NOT validated in immunocompromised hosts.

## Source quotes

Centor 1981: "Patients with four positive findings had a 56% probability of streptococcal infection." (§Results)
McIsaac 1998: "A clinical score based on five criteria (fever, absence of cough, tender anterior cervical lymphadenitis, tonsillar exudate, and age) reduced antibiotic prescriptions and use of laboratory tests without sacrificing diagnostic accuracy." (§Abstract)

## Renderer assertions

Verified locally:
- Both `META.centor.derivation` and `META.centor.derivationMcisaac` have every required field per `lib/derivation.js validate()`.
- Centor components sum equals `centor()` at the worked example (4).
- McIsaac components sum equals `mcisaac()` at three age-modifier boundary points: age 12 (+1, all four → 5), age 50 (−1, all four → 3), age 30 (+0, two positive → 2).

## Defects opened
None.
