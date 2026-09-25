# spec-v1487 — Jemt papilla index

The catalog had no measure of the papilla beside a dental implant. The Jemt index (1997) scores each
papilla next to a single implant from 0 to 4.

## What it does

The reader chooses a score for the mesial and the distal papilla. The answer reports each one, and
names the side with incomplete fill (0 to 2) or hyperplastic tissue (4):

| Score | Meaning |
|---|---|
| 0 | no papilla |
| 1 | less than half of the papilla height |
| 2 | at least half of the height, but the proximal space is not filled |
| 3 | the papilla fills the whole proximal space |
| 4 | hyperplastic papilla |

The index has no combined score, so none is made up. A papilla left blank is named as not entered.
With nothing entered, the tool asks.

## Sources

- Jemt T. Int J Periodontics Restorative Dent 1997;17(4):326-333.
- Scores as stated in J Clin Med 2026 (PMC13207090).

## Tests

`test/unit/jemt-papilla.test.js`: the worked example, flagging, and a blank papilla.
