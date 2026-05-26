# v48 derivation provenance — FLACC (`flacc`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4a
- Citation re-verified against: Merkel SI, Voepel-Lewis T, Shayevitz JR, Malviya S. *The FLACC: a behavioral scale for scoring postoperative pain in young children.* Pediatr Nurs. 1997;23(3):293-297.

## Components — verbatim source mapping

Five nurse-observed behaviors per Merkel 1997 Table 1. Each scored 0-2; range 0-10.

| Component | Source levels (Merkel 1997) |
|---|---|
| Face | 0 no particular expression or smile / 1 occasional grimace or frown, withdrawn, disinterested / 2 frequent to constant frown, clenched jaw, quivering chin |
| Legs | 0 normal position or relaxed / 1 uneasy, restless, tense / 2 kicking, or legs drawn up |
| Activity | 0 lying quietly, normal position, moves easily / 1 squirming, shifting back and forth, tense / 2 arched, rigid, or jerking |
| Cry | 0 no cry (awake or asleep) / 1 moans or whimpers, occasional complaint / 2 crying steadily, screams or sobs, frequent complaints |
| Consolability | 0 content, relaxed / 1 reassured by occasional touching, hugging, or talking; distractible / 2 difficult to console or comfort |

Each `points` callback clamps to [0, 2].

## Bands — source mapping

| Range | Source label |
|---|---|
| 0 | relaxed / comfortable |
| 1-3 | mild discomfort |
| 4-6 | moderate pain |
| 7-10 | severe pain or severe discomfort |

## Population

Merkel 1997: derivation in 89 children aged 2 months to 7 years undergoing postoperative pain assessment at the University of Michigan. Reference standards: patient self-report when possible and clinician observation.

## Validity

Infants and young children (~2 months to 7 years) who cannot self-report pain reliably. For verbal children old enough to use the Wong-Baker faces or numeric rating scale, those are the preferred tools. Validated extensively in postoperative, procedural, and ICU settings. The companion PAINAD (Warden 2003) is a separate Sophie tile for nonverbal adults with advanced dementia and uses the identical 0/1-3/4-6/7-10 band structure.

## Source quote

"The FLACC scale provides a simple framework for quantifying pain behaviors in children who may not be able to verbalize the presence or severity of pain." — Merkel 1997 §Abstract.

## Renderer assertions

Verified locally:
- `META.flacc.derivation` has every required field per `lib/derivation.js validate()` and exactly 5 components.
- Components sum equals `flacc().score` at three boundary points (zero relaxed, moderate 5, max 10).

## Defects opened
None.
