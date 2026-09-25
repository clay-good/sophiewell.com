# spec-v1498 — Essex-Lopresti calcaneal fracture types

The radiographic sibling of the Sanders CT classification. Essex-Lopresti (1952) separates extra-articular fractures from the two intra-articular types by where the secondary fracture line runs.

## Inputs

`el-subtalar` (subtalar joint involved, required) and `el-exit` (where the secondary line runs), asked only when the joint is involved.

## What it does

Extra-articular (AO 82A); tongue-type, the secondary line exiting through the tuberosity (AO 82B); joint-depression, the line through or behind the posterior facet, which is displaced downward (AO 82C).

## Sources

Essex-Lopresti P. Br J Surg 1952;39(157):395-419. Types and AO mapping as stated in Unfallchirurgie 2026 (PMC13216127), translated from the German; J Orthop Surg Res 2026 (PMC13540938) reports cases by the same types.

## Tests

`test/unit/essex-lopresti-calcaneal.test.js`: the worked example, every class, blanks and contradictions.
