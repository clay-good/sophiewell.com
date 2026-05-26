# v48 derivation provenance — CAGE (`cage`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4b
- Citation re-verified against: Ewing JA. *Detecting alcoholism. The CAGE questionnaire.* JAMA. 1984;252(14):1905-1907.

## Screener-renderer integration

CAGE uses `lib/screener.js renderScreener` (the wave-48-3d pattern). Component `inputKey`s are the item index as a string (`'0'`-`'3'`); the tile view (`views/group-g.js cage()`) converts the screener's numeric-indexed `answers` array into a keyed input object.

## Components — verbatim source mapping

Four binary questions per Ewing 1984. Each scored 0 (no) or 1 (yes). Mnemonic CAGE.

| Index | Letter | Question (Ewing 1984) |
|---|---|---|
| 0 | C | "Have you ever felt the need to Cut down on your drinking?" |
| 1 | A | "Have people Annoyed you by criticizing your drinking?" |
| 2 | G | "Have you ever felt Guilty about your drinking?" |
| 3 | E | "Eye-opener: have you ever had a drink first thing in the morning to steady your nerves or get rid of a hangover?" |

## Bands — source mapping

| Range | Source label |
|---|---|
| 0-1 | negative |
| 2-4 | positive — clinically significant suspicion of alcohol use disorder |

## Population

Ewing 1984: derived from clinical experience with 130 alcoholic patients, refined and validated across multiple psychiatric / primary-care cohorts in the 1970s-80s. The CAGE is the most-cited brief alcohol-screening instrument in the literature.

## Validity

Adults. The cutoff of ≥2 yes responses is the published positive-screen threshold. CAGE is more *specific* than sensitive; AUDIT-C (a separate Sophie tile) detects risky drinking that CAGE misses. NOT designed for adolescents or pregnant women (use CRAFFT or T-ACE/TWEAK). The questions are framed *lifetime* — a positive CAGE in a patient who quit years ago still merits inquiry but does not mean active disease.

## Source quote

"Four clinical interview questions, the CAGE questions, have proved useful in helping to make a diagnosis of alcoholism." — Ewing 1984 §Abstract.

## Renderer assertions

Verified locally:
- `META.cage.derivation` has every required field per `lib/derivation.js validate()` and exactly 4 components.
- Components sum equals `scoreScreener()` total at three boundary points (zero, positive 2, max 4).

## Defects opened
None.
