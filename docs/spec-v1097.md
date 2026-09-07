# spec-v1097 — the same rule, phrased three ways

Four of the finder's remaining nine rows were tiles that had **already done the
right thing** and said so in wording the shared lists do not carry. Sorting them
took the [spec-v1094](spec-v1094.md) method — count where each phrasing is used,
then change the list if it is the house's and the tile if it is one tile's.

| Tile | Its wording | Used in | Verdict |
|---|---|---|---|
| `hf-ef-classification` | "an ejection fraction **is needed**" | 20 files, 26 times | the **list** was incomplete |
| `delta-check` | "No threshold **was entered**" | 1 file | the **tile**'s phrasing |
| `modified-marshall` | "all **assessed** systems below 2" | — | genuinely incomplete |
| `sea-guideline` | "the next step is a sedimentation rate" | — | correct as it stands |

## `is needed` was the list's gap

`ASKING` carried `is required` and not `is needed`, though the house refuses with
the second 26 times across 20 files. That is the drift spec-v1094 found with
`can only raise` versus `can only add points`: one rule, two phrasings, one of
them recognised.

Measured before adding, as `asking-language.js` requires: exactly **one** tile
moves from flagged to exempt, `hf-ef-classification`, which answers *"Not
classified: an ejection fraction is needed"* and gives no reading at all. The
other nineteen files were already exempt on other phrases.

## `was entered` was the tile's

`delta-check` says *"No threshold **was** entered, so nothing is flagged: the
thresholds are local and nothing here supplies them"* — a good disclosure, and
the only file in the repo phrasing it that way. The list carries "not entered".

One file is a tile's idiom, and widening a list used by a real gate for a single
tile is precisely what `asking-language.js` forbids. So the sentence became "A
delta threshold **was not** entered", which says the same thing and is
recognised.

## `modified-marshall` was half-right

*"No organ failure (all assessed systems below 2; assessed: renal 0)"* is honest
about **which** systems it had and silent about the direction the others can move
it. The score is the worst of three organ systems, so an unassessed one can only
raise it — and "no organ failure" is the Revised Atlanta line between mild and
moderately severe pancreatitis.

It now names how many systems were not entered and which way they can move the
answer. `assessed:` was *not* added to the shared list: it is a formatting prefix
that happens to appear in 8 files, not a sentence disclosing anything, and a
label is a weak thing to grant an exemption on.

## `sea-guideline` is correct and always was

*"A risk factor is present and there is no deficit, so the next step is a
sedimentation rate. Over 20 mm per hour, image."*

It is a decision tree, and asking for the next test **is its answer**. The probe
flags it because supplying the sedimentation rate changes the recommendation —
which is the tile working exactly as designed. **Fix: nothing.** Recorded here so
the next pass over this list does not spend the same hour on it.

## Result

The finder read 9 fields across 7 calculators after
[spec-v1096](spec-v1096.md) and reads **5 across 4** now: `nhsn-vae` (2),
`loe-silness-gingival-index`, `aortic-stenosis-stage`, and `sea-guideline`, which
is a permanent and correct entry.
