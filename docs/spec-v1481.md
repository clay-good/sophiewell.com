# spec-v1481 — Basic Periodontal Examination (BPE)

[spec-v1480](spec-v1480.md) added the periodontitis staging and grading. The screen that comes before
it, the Basic Periodontal Examination, was not in the catalog.

## What it does

The reader chooses the code for each of the six sextants and marks any furcation involvement. The
answer gives the highest code (with * for a furcation), where it was found, and what it calls for:

| Code | Descriptor | Calls for |
|---|---|---|
| 0 | no pocket over 3.5 mm, no calculus, no bleeding | |
| 1 | bleeding after probing | |
| 2 | calculus or an overhang | |
| 3 | pocket 3.5 to 5.5 mm (probe's black band partly visible) | indicates periodontitis; more detailed charting |
| 4 | pocket over 5.5 mm (black band hidden) | indicates periodontitis; full charting, six sites per tooth |

A sextant left blank is not scored as 0. The highest code is taken over the sextants entered, and while
a blank sextant could still raise it (below code 4), the answer names how many were not entered. With
nothing entered, it asks. Every answer notes that the BPE is a screen, and that the full assessment and
then staging and grading follow when it indicates periodontitis.

## Source

Preshaw PM. Detection and diagnosis of periodontal conditions amenable to prevention. BMC Oral Health
2015;15 Suppl 1:S5 (PMC4580822): Table 1, the BPE codes, and the charting each calls for.

## Tests

`test/unit/bpe-periodontal.test.js`: the worked example; each code and what it calls for; the
furcation mark; a blank sextant disclosed, not read as 0; nothing entered is asked for.
