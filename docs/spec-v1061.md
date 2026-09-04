# spec-v1061 — SOWS, and the bands it does not have

`docs/spec-v957.md` listed seven instruments verified absent from the catalog while their siblings
were built. VExUS shipped at spec-v958; six remained. This is one of them.

**SOWS** — the Short Opiate Withdrawal Scale (Gossop 1990) — sits beside `cows`, and the pair is the
point. COWS is rated by a clinician from signs. SOWS is rated by the **patient** from symptoms. Ten
items, none/mild/moderate/severe, 0–3 each, total 0–30.

## Sourcing

The 1990 paper is not open access — `elink` returns only papers citing it, so the PMC route that
rescued VExUS does not apply here. The instrument is instead taken from **three independent
open-access descriptions that agree item for item**:

| Source | What it gives |
| --- | --- |
| PMC11036405 | all ten items, the four response options, total 0–30 |
| PMC9992259 | the same ten, same options, 0–30, and "a change score of 2–4 points indicates a clinically meaningful change" |
| PMC6968526 (the lofexidine trials) | the same ten as the primary efficacy endpoint, 0–30, same 2–4 point threshold |

Three documents, no disagreement — which is what spec-v97 asks for before building.

## The bands it does not have

**No source publishes a severity cut-off.** All three say only that a higher score is a worse
withdrawal, and two give the 2–4 point change as the meaningful unit.

Its sibling has four bands (COWS 5–12 mild, 13–24 moderate, 25–36 moderately severe, >36 severe), and
the whole temptation of building this tile was to write that shape again. So the tile states the
total, what it is out of, and the change threshold — and then says in words that **there is no
published band**, because a reader arriving from COWS will be looking for one and their eye will
supply it if the page does not.

`META['sows']` carries no `interpretation.bands` for the same reason, and a unit test asserts the
output never classifies: no `": moderate"`, no "indicates severe". The comparative the sources
themselves use — *"higher is a more severe withdrawal"* — is allowed, and that distinction is written
into the test so the next person does not "fix" it.

## The controls

The ten items are **selects with a blank first option**, not sliders and not number inputs defaulting
to 0. A slider parked at its minimum looks like a rating somebody made — that was WAT-1's defect for
nineteen specs (spec-v1047) — and on a self-report scale an unrated symptom is one the patient has
not been asked about yet.

The scale is monotone, so the family rule from spec-v1028 applies: below a complete rating there is
no total, only what is outstanding.

> SOWS is at least 15 from 9 of 10 symptoms. Rate yawning: each can only add points, so the total is
> not yet the patient's score.

Every item is `required` on the agent surface too, so an agent omitting one gets `MISSING_INPUT` with
the field named rather than a lower bound presented as a score.

## Two scales abbreviate to SOWS, and the queue meant the other one

The build queue's SOWS row cites **Handelsman 1987** — the *Subjective* Opiate Withdrawal Scale,
sixteen items, with an observer companion called the OOWS. What is built here is **Gossop 1990's
*Short* Opiate Withdrawal Scale**, ten items. Same acronym, different instrument, and their totals
are not comparable.

Nothing shipped is mislabelled: the tile is named "Short", cites Gossop, and its synonyms do not
claim the word "subjective". But **the queue row is not closed by it**, and I said otherwise in the
commit that added the tile. Handelsman's SOWS and its OOWS companion are both still absent, both
still blocked on an item list in a 1987 paper that is not open access. The queue has six items left,
not five.

The tile now says which scale it is in its first sentence rather than in a footnote, because a reader
who meant the sixteen-item one should find that out before they finish reading the total.

## And T-MACS is blocked on less than the queue records

Chasing the next build turned up the T-MACS model in open access (PMC8499458), which the queue lists
as missing:

> l = 1.713·x_e + 0.847·x_a + 0.607·x_r + 1.417·x_v + 2.058·x_s + 1.208·x_h + 0.089·x_t − 4.766

The four risk strata are in PMC10599640. **One thing is still missing: the unit of x_t**, the
high-sensitivity troponin T. No source found states it, and at a coefficient of 0.089 the choice
between ng/L and anything else moves a patient between "discharge" and "admit". Plausibility argues
for ng/L. Plausibility is not a source, and this is a chest-pain rule-out — the exact class of
reading spec-v1006 through spec-v1057 exist to stop a tile from producing on a guess. Not built, on
purpose, and the queue now records the equation so the next attempt starts from it.

Catalog 1,704 → 1,705.
