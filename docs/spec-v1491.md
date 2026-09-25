# spec-v1491 — PUFA/pufa index

DMFT counts caries experience but not what untreated caries has done. PUFA counts teeth with pulp involvement (P), ulceration (U), a fistula (F) or an abscess (A).

## Inputs

Eight optional whole-number counts, permanent (upper case, 0-32) and primary (lower case, 0-20).

## What it does

PUFA and pufa are the sums of their four counts, reported apart, with how many teeth show infection (U, F or A). One score per tooth, so each dentition's counts cannot exceed its teeth. A count not entered is disclosed; nothing entered is asked for.

## Sources

Monse B et al. Community Dent Oral Epidemiol 2010;38(1):77-82. Rules as stated in BMC Oral Health 2017 (PMC5504620) and Int J Clin Pediatr Dent 2017 (PMC5360799); codes in Oral Health Prev Dent 2025 (PMC12246806).

## Tests

`test/unit/pufa-index.test.js`: the worked example, every category, blanks and bounds.
