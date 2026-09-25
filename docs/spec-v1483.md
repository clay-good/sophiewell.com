# spec-v1483 — Simplified Oral Hygiene Index (OHI-S)

The catalog had the Silness-Löe plaque index and the Löe-Silness gingival index, but not the
Greene-Vermillion Simplified Oral Hygiene Index, the most widely used oral hygiene index in surveys.

## What it does

The reader chooses a debris score and a calculus score, 0 to 3, for each of the six index teeth: 16,
11, 26 and 31 (buccal or labial surfaces) and 36 and 46 (lingual surfaces).

- The debris index (DI-S) is the mean of the debris scores over the teeth scored, and the calculus
  index (CI-S) is the same for calculus.
- The OHI-S is their sum, 0 to 6. Rounded to one decimal, it reads as good (0.0 to 1.2), fair (1.3 to
  3.0) or poor (3.1 to 6.0).

A tooth left blank is a tooth not examined, not a score of 0. Each index averages over the teeth
scored, and the answer says when fewer than six were. With nothing scored, it asks.

## Sources

- Greene JC, Vermillion JR. J Am Dent Assoc 1964;68:7-13.
- The index teeth, the 0-3 scoring, the averaging and the bands as applied in Pathogens 2026
  (PMC13304723).

## Tests

`test/unit/ohi-s.test.js`: the worked example; the bands at their edges; a blank tooth not read as 0;
nothing scored is asked for.
