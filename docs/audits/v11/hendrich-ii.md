# v11 audit - hendrich-ii

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Hendrich AL, Bender PS, Nyhuis A. *Validation of the Hendrich II Fall Risk Model: a large concurrent case/control study of hospitalized patients.* Appl Nurs Res. 2003;16(1):9-21. Seven binary risk factors (confusion/disorientation/impulsivity +4, symptomatic depression +2, altered elimination +1, dizziness/vertigo +1, male +1, antiepileptic +2, benzodiazepine +1) plus get-up-and-go test (able 0 / pushes-up 1 / needs-help 3 / unable 4). Validated cutoff: >=5 -> high fall risk.

`lib/scoring-v4.js hendrichII()` sums the eight weighted inputs and returns `{score, parts, highRisk, band, text}`.

## Boundary examples added
- 0 (nothing endorsed; tile example) -> not high risk.
- 4 (confusion only, below cutoff) -> not high risk.
- 5 (confusion + benzodiazepine; cutoff edge) -> high risk.
- 6 (confusion + depression) -> high risk.
- 16 (all flags + unable-to-rise) -> high risk.

## Cross-implementation differential
- Reference: Hendrich 2003 Table 2 worked example "5+ -> high risk."
- Sophie result: confusion + benzo -> score 5 -> high. PASS.

## Edge-input handling notes
- Unknown get-up-and-go tokens default to "able" (0 points).

## A11y / keyboard notes
- Seven checkboxes and one labeled select; Tab-reachable; aria-live result region.

## Defects opened
- none

## Status
- PASS
