# v48 derivation provenance — Mini-Cog (`mini-cog`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4b
- Citation re-verified against: Borson S, Scanlan J, Brush M, Vitaliano P, Dokmak A. *The Mini-Cog: a cognitive 'vital signs' measure for dementia screening in multi-lingual elderly.* Int J Geriatr Psychiatry. 2000;15(11):1021-1027.

## Components — verbatim source mapping

Two components per Borson 2000. Total 0-5.

| Component | Source levels |
|---|---|
| Words recalled | 3-word recall after a brief distractor (clock-draw test). Each correctly recalled word: +1. Range 0-3. |
| Clock-draw test | Clinician-judged binary: normal (all numbers in correct positions; hands at specified time, e.g., 11:10) = +2; abnormal = 0 |

The `clockNormal` component contributes literal `points: 2` when true.

## Bands — source mapping

| Range | Source label |
|---|---|
| 0-2 | positive screen — further cognitive evaluation indicated |
| 3-5 | negative for cognitive impairment screen |

Cutoff <3 = positive screen per Borson 2000.

## Population

Borson 2000: derivation in 249 community-dwelling older adults at risk for cognitive impairment, multi-lingual (English, Spanish, Tagalog) recruitment to validate language-independence of the clock-draw component. Validation studies place Mini-Cog at sensitivity ~76% and specificity ~89% for dementia at the <3 cutoff.

## Validity

Older adults in primary-care and ED settings. Mini-Cog is a brief (~3 minutes) screen designed to be administered in any clinical setting; it is more concise than the MMSE/MoCA but less detailed. NOT designed to track severity over time (use MMSE/MoCA for that). Word-recall scoring requires the clinician to use a consistent 3-word list across patients. Clock-draw scoring is binary (normal vs abnormal) per Borson 2000; more elaborate clock-scoring systems (Sunderland, Shulman) are not part of Mini-Cog.

## Source quote

"The Mini-Cog ... combines an uncued 3-item recall test with a clock-drawing test (CDT) that serves as a recall distractor. It can be administered in about 3 minutes, requires no special equipment, and is relatively uninfluenced by level of education or language variations." — Borson 2000 §Abstract.

## Renderer assertions

Verified locally:
- `META['mini-cog'].derivation` has every required field per `lib/derivation.js validate()` and exactly 2 components.
- Components sum equals `miniCog().score` at three boundary points (max 5 = negative screen, positive 2, cutoff 3 = negative screen).

## Defects opened
None.
