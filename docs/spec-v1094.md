# spec-v1094 — a tally that can only rise, and a rule the house wrote twice

Two thirds of the finder's backlog was two rows: `isth-bat` (14 fields) and
`pbac-hmb` (8). One was a real defect and one was the vocabulary's fault, and
telling them apart is the whole of this wave.

## `pbac-hmb` ruled out from a chart still being filled in

The PBAC is a weighted tally of eight counts — pads, tampons and clots — so it
can only **rise** as the chart is completed. It said:

> PBAC score 65 — **not in the heavy range** (<= 100).

from a chart with three of the eight types never entered. One of those, at a
plausible count, carried the same patient to **115: heavy menstrual bleeding
likely**.

[spec-v1088](spec-v1088.md) looked at this tile and judged it correct: *"no pads
counted yet is the normal state of a chart being filled in."* That is true about
the **arithmetic** and beside the point about the **sentence**. A blank may well
mean none used — the tile simply cannot tell that from *not yet counted*, and
only one of those two readings supports the words "not in the heavy range".

Below the threshold with types uncounted, the verdict now reads *"below the > 100
threshold on the item types counted so far"* with the standard footing. Ruling
**in** is untouched: above 100 the missing counts cannot lower it, so a heavy
result from a partial chart is already the floor.

That is the third judgment in spec-v1088 to be overturned by looking at the code
instead of at a probe's output.

## `isth-bat` was disclosing all along

It says:

> ISTH-BAT is at least 3 from 13 of 14 domains — below the ≥ 4 threshold so far,
> but each domain still unrated **can only add points**, so a partial score
> cannot yet read as within the normal range. Rate epistaxis.

That is exactly what this programme asks for, and both shared regexes missed it.

The house writes this rule two ways. **`can only raise` appears 28 times across
17 library files; `can only add points` appears 19 times across 10** — the same
sentence about the same monotone property, written by different hands, and
`DISCLOSING` knew only the first. This is the drift in
[spec-v1042](spec-v1042.md), not a tile-specific carve-out, so the fix belongs in
the shared list rather than in one tile's wording.

`asking-language.js` requires measuring before adding a phrase, so: across every
tile and every numeric field, dropping one field changes **exactly one** tile
from flagged to exempt — `isth-bat`, which discloses and then refuses the
reassuring reading rather than giving it. Nothing else is softened.

## Which fix, and how to tell

| The tile | Fix |
|---|---|
| answers reassuringly from a subset | change the tile (`pbac-hmb`) |
| discloses in wording the shared list happens to miss | change the tile — it is one tile's phrasing |
| discloses in wording the house uses everywhere and the list missed | change the **list** (`can only add`) |

The middle and bottom rows look identical from the probe's output. The only way
to separate them is to count where the phrasing is used: one file is a tile's
idiom, ten files is the house's.

## Result

The finder read 42 fields across 17 calculators after
[spec-v1093](spec-v1093.md) and reads **20 across 15** now — the two largest
blocks, and a little over half of what remained.
