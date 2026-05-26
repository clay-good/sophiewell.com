# v48 derivation provenance — SOS (`sos`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-3c
- Citation re-verified against: Ista E, van Dijk M, de Hoog M, Tibboel D, Duivenvoorden HJ. *Construction of the Sophia Observation withdrawal Symptoms-scale (SOS) for critically ill children.* Intensive Care Med. 2009;35(6):1075-1081.

## Components — verbatim source mapping

Fifteen binary symptom items observed over the prior 4-hour window per Ista 2009 Appendix. Each scored 0 (absent) or 1 (present). Total 0-15.

| Item | Source row |
|---|---|
| Tachycardia | Ista 2009 Appendix row 1 (autonomic) |
| Tachypnea | row 2 |
| Fever | row 3 |
| Sweating | row 4 |
| Agitation | row 5 (behavioral) |
| Anxiety | row 6 |
| Grimacing | row 7 |
| Sleeplessness | row 8 |
| Hallucinations | row 9 |
| Motor disturbance | row 10 (motor) |
| Hypertonia | row 11 |
| Tremor | row 12 |
| Vomiting | row 13 (GI) |
| Diarrhea | row 14 |
| Inconsolable crying | row 15 |

## Bands — source mapping

| Range | Source label |
|---|---|
| 0-3 | no significant withdrawal |
| ≥ 4 | iatrogenic withdrawal present (Ista 2009 Youden-optimal cutoff) |

## Population

Ista 2009: derivation in 79 pediatric ICU patients on opioids or benzodiazepines ≥5 days. Reference standard: clinical withdrawal diagnosis by attending intensivist. The ≥4 cutoff is the Youden-optimal threshold from the derivation cohort.

## Validity

Pediatric ICU patients on opioids / benzodiazepines for at least 5 days. SOS is observed over the **4-hour window** preceding scoring; point-in-time observations are not the intended use. The companion WAT-1 (Withdrawal Assessment Tool) is a separate Sophie tile. NOT validated in neonates (use a neonate-specific tool such as Finnegan or NWAT).

## Source quote

"The SOS is a clinically useful tool to detect iatrogenic withdrawal in critically ill children ... a score of 4 or more had a sensitivity of 83% and a specificity of 96% for the detection of withdrawal." — Ista 2009 §Conclusion.

## Renderer assertions

Verified locally:
- `META.sos.derivation` has every required field per `lib/derivation.js validate()` and exactly 15 components.
- Components sum equals `sos().score` at three boundary points (zero, cutoff 4 with `withdrawal === true`, max 15).

## Defects opened
None.
