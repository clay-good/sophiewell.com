# v48 derivation provenance — Alvarado + PAS (`alvarado-pas`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4h
- Citations re-verified against:
  - Alvarado A. *A practical score for the early diagnosis of acute appendicitis.* Ann Emerg Med. 1986;15(5):557-564.
  - Samuel M. *Pediatric appendicitis score.* J Pediatr Surg. 2002;37(6):877-881.

Two derivation blocks land on this tile: the primary `derivation` field (Alvarado MANTRELS) and the sibling `derivationPas` field (Pediatric Appendicitis Score), following the dual-block pattern from `qsofa-sofa` (wave 48-1c), `centor` / `derivationMcisaac` (wave 48-2a), and `aldrete-padss` / `derivationPadss` (wave 48-4f).

## Components (Alvarado MANTRELS) — verbatim source mapping

Eight criteria; range 0-10. Two +2 weights (RLQ tenderness, leukocytosis).

| # | Criterion | Points |
|---|---|---|
| 1 | M — Migration of pain to RLQ | +1 |
| 2 | A — Anorexia | +1 |
| 3 | N — Nausea / vomiting | +1 |
| 4 | T — Tenderness in RLQ | +2 |
| 5 | R — Rebound tenderness | +1 |
| 6 | E — Elevated temperature (>= 37.3 °C) | +1 |
| 7 | L — Leukocytosis (WBC > 10 x10^9/L) | +2 |
| 8 | S — Shift of WBC to the left (> 75% neutrophils) | +1 |

Bands per Alvarado 1986: 0-4 low (unlikely); 5-6 equivocal (observe / image); 7-10 high (probable).

## Components (PAS) — verbatim source mapping

Eight criteria; range 0-10. Two +2 weights (cough/hop/percussion tenderness, RLQ tenderness).

| # | Criterion | Points |
|---|---|---|
| 1 | Cough / hop / percussion tenderness | +2 |
| 2 | RLQ tenderness | +2 |
| 3 | Migration | +1 |
| 4 | Anorexia | +1 |
| 5 | Fever (>= 38.0 °C) | +1 |
| 6 | Nausea / vomiting | +1 |
| 7 | Leukocytosis (WBC > 10 x10^9/L) | +1 |
| 8 | Polymorphonuclear neutrophilia (> 75% PMNs) | +1 |

Bands per Samuel 2002: 0-3 low; 4-6 equivocal; 7-10 high.

## Population

- Alvarado 1986: retrospective derivation in 305 adult / adolescent patients hospitalized with abdominal pain at a US center; outcome was histologically-confirmed acute appendicitis at appendectomy. Predates routine CT imaging.
- Samuel 2002: prospective derivation in 1170 children aged 4-15 with suspected acute appendicitis at a pediatric tertiary center; outcome was histologically-confirmed appendicitis at surgery or 2-week clinical follow-up.

## Validity

- Alvarado: adults / adolescents; sensitivity drops in pregnant patients, elderly, and immunocompromised hosts. Modern ED practice combines Alvarado with imaging and serial exam rather than acting on the score alone.
- PAS: children aged ~4-15. Modern practice pairs PAS with US or staged imaging; pARC (Kharbanda 2018) is an alternative continuous-risk pediatric model.

Neither is a substitute for surgical evaluation in patients with genuine clinical concern despite a low score.

## Source quotes

- "Eight predictive factors of acute appendicitis ... were identified ... A score of 7 or more is highly indicative of appendicitis." — Alvarado 1986 §Results.
- "The Pediatric Appendicitis Score (PAS) is a clinical scoring system specifically designed to evaluate children with suspected appendicitis." — Samuel 2002 §Abstract.

## Renderer assertions

Verified locally:
- `META['alvarado-pas'].derivation` and `META['alvarado-pas'].derivationPas` each have every required field per `lib/derivation.js validate()` and exactly 8 components.
- Component sums equal `alvarado().score` and `pediatricAppendicitis().score` at multiple boundary points including the two +2 weights in each block.

## Defects opened
None.
