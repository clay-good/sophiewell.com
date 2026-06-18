# v12 audit - new-orleans-head

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Haydel MJ, Preston CA, Mills TJ, Luber S, Blaudeau E, DeBlieux PMC. N Engl J Med. 2000;343(2):100-105.

`lib/eddecision-v107.js newOrleansHead()` applies the 7-criterion any-positive rule
(headache, vomiting, age > 60, intoxication, anterograde amnesia, trauma above the
clavicles, seizure) in GCS-15 minor head injury; any positive criterion indicates a
head CT. Class A.

## Boundary worked examples added
- no criteria -> CT not indicated.
- band flip: one positive criterion flips no-CT -> CT.
- tile example: vomiting + age > 60 -> 2 positive, CT indicated, both listed.
- all 7 positive -> CT indicated.

## Cross-implementation differential
- Reference: criteria/entry-condition cross-verified against MDCalc and the NEJM
  text. Entry condition is GCS 15 with a normal brief neurologic exam after blunt
  head trauma; the rule is 100% sensitive for intracranial injury on CT but low
  specificity -- it flags ANY CT finding, not only clinically important injury (the
  Canadian CT Head rule is the higher-specificity companion). The tile states the
  entry condition and frames the verdict accordingly. Match. PASS.

## Edge-input handling notes
- the entry-condition note (GCS 15) renders above the criteria; the tile does not
  infer GCS and is a rule-out aid, not a substitute for judgment in the non-GCS-15
  patient.

## A11y / keyboard notes
- Labeled checkboxes; output aria-live="polite". 320px sweep passes with no
  horizontal scroll.

## Defects opened
- none

## Status
- PASS
