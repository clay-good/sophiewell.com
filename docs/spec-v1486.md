# spec-v1486 — Periapical Index (PAI)

The catalog graded caries (DMFT, ICDAS) and periodontitis, but not the periapical radiograph. The
Periapical Index (Ørstavik 1986) is the standard score for apical periodontitis on a radiograph.

## What it does

The reader chooses a PAI score, 1 to 5, for up to four roots. The tooth takes the highest root score,
and the answer reads it as healthy or apical periodontitis:

| Score | Meaning | Read as |
|---|---|---|
| 1 | normal periapical structure | healthy |
| 2 | small changes in bone structure | healthy |
| 3 | changes in bone structure with some mineral loss | apical periodontitis |
| 4 | periodontitis with a well-defined radiolucent area | apical periodontitis |
| 5 | severe periodontitis with exacerbating features | apical periodontitis |

A root left blank is not scored; the answer says how many roots it was scored from, and that a root
not entered can only raise the tooth's score. With nothing entered, the tool asks.

## Sources

- Ørstavik D, Kerekes K, Eriksen HM. Endod Dent Traumatol 1986;2(1):20-34.
- Scores as stated in Iran Endod J 2018 (PMC5911286).
- The highest-root rule and the 2/3 cut-off as stated in Int Endod J 2020 (PMC7894281).

## Tests

`test/unit/pai-periapical.test.js`: the worked example, the cut-off, and blank roots.
