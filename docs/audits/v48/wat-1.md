# v48 derivation provenance — WAT-1 (`wat-1`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4c
- Citation re-verified against: Franck LS, Harris SK, Soetenga DJ, Amling JK, Curley MAQ. *The Withdrawal Assessment Tool-1 (WAT-1): an assessment instrument for monitoring opioid and benzodiazepine withdrawal symptoms in pediatric patients.* Pediatr Crit Care Med. 2008;9(6):573-580.

## Components — verbatim source mapping

Eleven items aggregating to 0-12 per Franck 2008 Appendix. The WAT-1 has a structured observation protocol: 12-h pre-period + 2-min pre-stimulus + 1-min stimulus + post-stimulus recovery.

| Item | Window | Points |
|---|---|---|
| Loose / watery stools | prior 12 h | 0/1 |
| Vomiting / retching / gagging | prior 12 h | 0/1 |
| Fever (T > 37.8°C) | prior 12 h | 0/1 |
| SBS state ≥ +1 (or NRS ≥ 1) | pre-stimulus 2-min | 0/1 |
| Tremor | pre-stimulus 2-min | 0/1 |
| Sweating | pre-stimulus 2-min | 0/1 |
| Uncoordinated / repetitive movement | pre-stimulus 2-min | 0/1 |
| Yawning or sneezing | pre-stimulus 2-min | 0/1 |
| Startle to touch | during 1-min stimulus | 0/1 |
| Increased muscle tone | during 1-min stimulus | 0/1 |
| Post-stimulus recovery time to calm | post-stimulus | <2 min → 0; 2-5 → 1; >5 → 2 |

The `recoveryMinutes` component uses a callback that maps the numeric minutes to the 0/1/2 banded contribution per Franck 2008.

## Bands — source mapping

| Range | Source label |
|---|---|
| 0-2 | no significant withdrawal |
| ≥ 3 | iatrogenic opioid/benzodiazepine withdrawal present (sensitivity 0.87, specificity 0.88) |

## Population

Franck 2008: derivation in 83 pediatric ICU patients on opioids / benzodiazepines undergoing wean. Reference standard: clinical withdrawal diagnosis and concurrent Sophia Observation withdrawal Symptoms (SOS — separate Sophie tile) scoring.

## Validity

Pediatric ICU patients on opioid / benzodiazepine wean. WAT-1 has a STRUCTURED observation protocol — point-in-time observations are NOT the intended use. The 4-segment timing (prior 12 h + 2-min pre-stimulus + 1-min stimulus + post-stimulus recovery) is what gives WAT-1 better specificity than simpler instruments. The companion SOS (Ista 2009) uses a simpler observation window and may be preferred when the structured WAT-1 protocol is impractical. NOT validated in neonates (use a neonate-specific tool such as Finnegan or NWAT).

## Source quote

"The WAT-1 is a brief, focused, and easily administered measure of withdrawal symptoms in pediatric patients ... a WAT-1 score of 3 or more was identified as the cutoff value for indicating clinically significant withdrawal." — Franck 2008 §Conclusions.

## Renderer assertions

Verified locally:
- `META['wat-1'].derivation` has every required field per `lib/derivation.js validate()` and exactly 11 components.
- Components sum equals `wat1().score` at four boundary points (zero, cutoff 3, max 12, and a parameterized loop over recoveryMinutes values verifying the banded callback maps 0/1/2/5/6/60 minutes to 0/0/1/1/2/2 points correctly).

## Defects opened
None.
