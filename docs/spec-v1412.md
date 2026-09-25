# spec-v1412 — adult ETT depth at the corner of the mouth

The bedside search program ([spec-v1185](spec-v1185.md) onward) found five bedside questions
the catalog could not answer at all. `ett depth` reached only the pediatric tube calculator
(`peds-ett`), which is built on age and does not apply to an adult. This adds the adult companion.

## What it does

`adult-ett-depth` takes the sex, the height, or both, and gives the starting mark for an **oral**
tube in an **adult**, read at the corner of the mouth:

| rule | mark | source |
|---|---|---|
| by sex | 21 cm women, 23 cm men | Roberts JR et al, *Acad Emerg Med* 1995;2:20-24: 83 critically ill adults; at those marks 81 of 83 tubes would have sat at least 2 cm above the carina |
| by height | height (cm) / 5 - 13, to the half centimeter | Cherng CH et al, *J Clin Anesth* 2002;14:271-274: 293 adults measured with a fiberoptic scope, head neutral, tip 5 cm above the carina |

Both abstracts were read on 2026-09-24. Neither study is preferred over the other, so with both
inputs the answer is both marks, shown as a range, and a note when they differ by 2 cm or more
(the sex rule is the same for every woman, so it runs deep in a short patient).

## What it will not say

- **That the tube is in the trachea.** The first step printed is waveform capnography; a depth mark
  says nothing about placement.
- **That the depth is right.** Breath sounds and a chest radiograph check it; the mark is where to
  start.
- **Anything for a child or a nasal tube.** A height too short for the adult formula to give a
  positive depth is refused and points to `peds-ett`.

An impossible height is refused with the shared `BOUNDS.heightM` envelope. Height takes centimeters
or inches on the page (inches preselected) and centimeters on the agent surface.

## Search

Synonyms route only adult-specific phrasing (`adult ett depth`, `adult tube depth`). A synonym is a
hard route, so bare `ett depth` is left to the ranker, where a pediatric reader still finds
`peds-ett`.

## Tests

`test/unit/adult-ett-depth.test.js`: both marks, the half-centimeter rounding, the range and the
disagreement note, one input naming the other, the capnography-first steps, and the refusals.
