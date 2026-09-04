# spec-v1062 — The other SOWS

spec-v1061 built Gossop's **Short** Opiate Withdrawal Scale and, in doing so, discovered that the
build queue's "SOWS" row meant a different instrument: Handelsman 1987's **Subjective** Opiate
Withdrawal Scale, sixteen items. This builds that one. The catalog now carries both, and each says
which it is.

## The item list was findable after all

The queue recorded this as blocked on "the 16-item list", in a 1987 paper that is not open access.
The list is in open access, in a table in someone else's trial:

- **PMC7530570**, Table 1 — *"COWS and SOWS items and scoring"* — prints all sixteen items in order
  beside COWS's eleven, with *"Items Scored Variably from 0-4"* and *"Total Score Range: 0-64"*.
- **PMC11016949** — *"patients rate 16 items from a score of 'not at all' to 'extremely' (0 to 4)"*.
- **PMC12429306** — a fentanyl-withdrawal trial reporting per-item means under the same wording.

Three sources, agreeing. This is the same lesson spec-v958 recorded for VExUS, in a new form: **the
instrument may be readable in a paper that merely used it**, not only in the one that introduced it.
A "not open access" verdict on the derivation is not a verdict on the instrument.

## The bands belong to a different version

Bands do circulate for this scale — 1-10 mild, 11-20 moderate, ≥21 severe — and PMC10499405 prints
them in a sentence that also says: *"The **modified** scale contained **15 items** ... Total scores
for the modified scale range from **0 to 60**."*

They are the fifteen-item variant's bands, on a different denominator, and the item they drop is
craving. Putting them on a sixteen-item total out of 64 would be quoting a threshold from an
instrument the reader is not using. The tile states the total and says exactly that — and a unit test
asserts the sentence names the fifteen-item version, so the omission reads as a decision rather than
an oversight.

## Two scales, one acronym

| | `sows` (spec-v1061) | `sows-subjective` (this) |
| --- | --- | --- |
| Name | **Short** Opiate Withdrawal Scale | **Subjective** Opiate Withdrawal Scale |
| Source | Gossop 1990 | Handelsman 1987 |
| Items | 10, rated 0-3 | 16, rated 0-4 |
| Total | 0-30 | 0-64 |
| Bands | none published | none for 16 items; the circulating ones are the 15-item version's |

Both tiles name the other in their first sentence, both `related` to each other, and a search for
"sows" offers both — because a reader who types the acronym has not yet told anyone which one they
meant. A unit test pins the distinction by asserting the two totals differ for the same rating, so
that a future "cleanup" cannot quietly merge them.

Handelsman's companion **OOWS** — thirteen observer-rated signs — is still absent, and still blocked:
the sources found name three of its thirteen signs and no more.

Catalog 1,705 → 1,706. The queue is down to five: T-MACS (blocked on one unit, see spec-v1061),
GARFIELD-AF, CRIB-II, PRISM III, the Kramer zones, plus OOWS.
