# v11 audit - sos

- Auditor: CG
- Date: 2026-05-21
- Citation re-verified against: Ista E, van Dijk M, de Hoog M, Tibboel D, Duivenvoorden HJ. *Construction of the Sophia Observation withdrawal Symptoms-scale (SOS) for critically ill children.* Intensive Care Med. 2009;35(6):1075-1081. Fifteen binary items observed over a 4-hour window: tachycardia, tachypnea, fever (>38.4 C), sweating, agitation, anxiety, grimacing, sleeplessness, hallucinations, motor disturbance / movement disorder, hypertonia / increased muscle tone, tremor, vomiting, diarrhea, inconsolable crying. Total 0-15. Cutoff >=4 indicates clinically relevant iatrogenic withdrawal (Ista 2009 Youden-optimal derivation).

`lib/scoring-v4.js sos()` validates each binary item as 0 or 1, sums to 0-15, and returns `{score, parts, withdrawal, band, text}`.

## Boundary examples added

- 0 (no symptoms; tile example) -> no significant withdrawal.
- 3 (sub-threshold; tachycardia + sweating + tremor) -> no significant withdrawal.
- 4 (lower edge of cutoff; tachycardia + sweating + tremor + agitation) -> withdrawal present.
- 15 (all items present) -> withdrawal present.

## Cross-implementation differential

- Reference: Ista 2009 derivation reports the >=4 cutoff as the Youden-optimal threshold for "clinically relevant iatrogenic withdrawal" against the clinician-gold-standard reference.
- Sophie result: a score of 3 returns `withdrawal: false`; a score of 4 returns `withdrawal: true`. PASS.

## Edge-input handling notes

- Non-integer / out-of-range items throw via the shared `checkOrdinal` helper used elsewhere in the binary-item scales (WAT-1, CRIES, FLACC).

## A11y / keyboard notes

- Fifteen labeled 0-1 range inputs with linked output spans; Tab-reachable; aria-live result region wrapping the tile output. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
