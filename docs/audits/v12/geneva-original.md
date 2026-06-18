# v12 audit - geneva-original

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Wicki J, Perneger TV, Junod AF, Bounameaux H, Perrier A. Arch Intern Med. 2001;161(1):92-97.

`lib/vte-v106.js genevaOriginal()` sums the objective clinical, arterial-blood-gas,
and chest-film items to a total clamped 0-16 and maps it to the low / intermediate /
high pretest-probability bands. Class A.

## Boundary worked examples added
- young, no findings -> 0, low (~10% PE prevalence).
- age bands: 60-79 +1, >= 80 +2.
- band flip: total 8 (intermediate) -> 9 (high) crossing the published boundary.
- ABG bands score per the paper (PaCO2 < 36 mmHg +2, PaO2 < 48.7 mmHg +4).
- unrecognized ABG select value defaults to the 0-point normal band.
- age required; blank age -> surfaced fallback.

## Cross-implementation differential
- Reference: items/points re-fetched from the Wicki 2001 paper and cross-verified
  against practical-haemostasis and Wikipedia. The paper reports ABG in kPa; the tile
  encodes both the kPa thresholds (PaCO2 < 4.8 / 4.8-5.19; PaO2 < 6.5 / 6.5-7.99 /
  8-9.49 / 9.5-10.99) and the rounded mmHg conversions (x 7.5). Bands low 0-4 (~10%),
  intermediate 5-8 (~38%), high >= 9 (~81%) -- a score of exactly 5 is intermediate,
  high is >= 9. Match. PASS.

## Edge-input handling notes
- the ABG inputs are explicit band selects (kPa + mmHg labeled) to avoid any unit
  ambiguity; HR is an optional numeric threshold.

## A11y / keyboard notes
- Labeled number inputs, selects, and checkboxes; output aria-live="polite". 320px
  sweep passes with no horizontal scroll. The pre-Wells objective predecessor model.

## Defects opened
- none

## Status
- PASS
