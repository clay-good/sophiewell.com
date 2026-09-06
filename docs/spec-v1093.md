# spec-v1093 — the rest of the family, and the sentence written once

[spec-v1092](spec-v1092.md) fixed `pasi` and `easi` and named the other four as
the next wave. This is that wave, plus the refactor it forced.

## One sentence, one place

Four more tiles needed the same disclosure, which is the point at which writing
it a fifth time becomes the actual risk. This repo has paid three times over for
a rule that lived in two places and quietly stopped agreeing — numeric-fact
extraction, the sweeps' asking vocabulary, and `optNum` across 64 view modules.
None of those drifts ever broke a build.

So `lib/region-footing-v1093.js` holds it once, and `pasi` and `easi` moved onto
it. The nouns are parameters, because these instruments do not all divide a body.

| Tile | Counts | Reads a blank as |
|---|---|---|
| `pasi`, `easi` | 4 regions | a region with no disease |
| `vasi` | 6 regions | a region with no depigmentation |
| `mswat` | 3 lesion categories | a category examined and found absent |
| `scorad` | 2 subjective scores | a symptom the patient denies |

The singular is passed explicitly rather than derived, because stripping a
trailing "s" turns "lesion categories" into "lesion categorie", and a footing
that exists to be read carefully cannot be the thing with the typo in it.

## What each one was doing

`vasi` reads an unrecorded area as 0 hand units. `mswat` reads a blank body
surface area as 0%, and it weights tumor most heavily — so the category most
likely to be left blank is the one that moves the total most.

`scorad` is the interesting one. Its extent (A) already refuses without a value,
from [spec-v1016](spec-v1016.md). The **subjective half** did not: C is worth up
to 20 of the 103, and an unasked pruritus VAS took a reading from **53.5,
severe** to **46, moderate**. Half the tile had been fixed and the other half was
still answering from a gap. The two VAS fields are number inputs, so unlike the
intensity selects the gap is expressible on both surfaces.

## The guard that hid the worst case

The first version of the helper returned `null` when **nothing** had been
entered, on the assumption that some other gate covers the empty form.

That is the same deference to an unchecked gate that produced the wrong
judgments in [spec-v1088](spec-v1088.md). Nothing entered is the worst version of
this defect, not the exempt one, and PASI with an empty form still bands
"mild psoriasis". The guard is gone and the footing fires at zero.

## `lund-browder` is deliberately left alone

It shares the arithmetic and not the reasoning. A burn chart is *marked*, not
graded region by region: unmarked means unburned, which is the charting
convention rather than a gap. The tile already refuses an entirely blank chart
([spec-v1016](spec-v1016.md)) and says in its own source that "the rest genuinely
are zero until charted."

This is [spec-v1089](spec-v1089.md)'s second cause — a documented convention
applied correctly — and the right fix there was words, not arithmetic. It has
them.

## Result

`scripts/probe-omitted-field-decides.mjs` read 47 fields across 19 calculators at
spec-v1092 and reads **42 across 17** now. The body-surface family is drained:
`pasi`, `easi`, `vasi`, `mswat` and `lund-browder` no longer appear in either
section, and `scorad`'s two rows are the last of it.

No score changes in any of the five tiles. A field entered as 0 still reads as
examined and clear, everywhere — that distinction is the whole programme.
