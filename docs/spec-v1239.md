# spec-v1239 — the probe was comparing prose

[spec-v1238](spec-v1238.md) took `probe-half-guarded` from 21 calculators to 18
by teaching its vocabulary one phrase. Reading the other eighteen **row by row,
on the sentence rather than the flag**, found that almost none of them was a
defect — and why.

> **21 → 5.** One real defect. The rest were the probe's own two blind spots.

## `band` is the sentence, not the verdict

`verdictKey` built its comparison from `['bandLabel', 'band', 'stage', …]`, and
`band` is the prose. So a tile that reaches **the same conclusion with a shorter
explanation** counted as a tile whose verdict moved:

```
nichd-fhr, with the late decelerations:     Category II ... Not Category I because
                                            variability is minimal, not moderate;
                                            late decelerations are recurrent.
nichd-fhr, without them:                    Category II ... Not Category I because
                                            variability is minimal, not moderate.
```

The tracing has minimal variability, so neither Category I nor Category III is
reachable and the decelerations **cannot** change it. `Category II` both ways.
What got shorter was the reason list, and the probe called that answering in
silence from a field that decides the answer.

The classification fields now come first, and `band` is the fallback only for a
tile that has none of them — many do, and dropping it outright would blind the
probe on those.

## …and the list of classification fields was short

Measured across the catalog, a tile's structured verdict also arrives as `tier`
(87 tiles), `grade` (76), `stage` (60), `category` (50), `severity` (28), `group`
(28), `risk` (27), `verdict` (18), `classification` (17), `gradeLabel` (16) and
`bandKey`. Only seven of those were in the list.

`truelove-witts` returns `bandKey: 'severe'` whichever systemic criterion is
dropped — the grade is severe either way, because the others are met — and was
flagged for a criteria list that got shorter. `type` and `basis` are deliberately
left out: they name what kind of calculation ran, not what it concluded.

**The negative test is built in.** `hf-ef-classification` drops its baseline LVEF
and goes `HFimpEF` → `HFmrEF`, a genuinely different entity. It is still flagged.

## One real defect: `kennedy-edentulous`

```js
function modCount(v) {
  if (v === '' || v === null || v === undefined) return 0;   // <- a claim
```

A blank read as zero, and **zero here is a claim**: that there are no additional
edentulous areas besides the class-determining one. The modification number is
part of the classification, not a decoration on it — Class II mod 1 is a
different arch from Class II, and a partial denture is designed to it.

The class itself is settled by the most-posterior area alone, so an unstated
count cannot change it and refusing would be wrong. The tile answers the part it
knows and names the part it does not — the shape `duke-treadmill` uses. Class IV
is the exception in the other direction: the Applegate rule admits no
modifications, so nothing is left unstated and nothing is said.

Its test asserted the defect, and its title said so: **"modifications default to
0 when omitted"**. That is the fifth test in this run found pinning the behaviour
it should have caught.

## A seventh hand on the same sentence

`not classifiable without` (`ph-hemodynamics-2022`), `not defined without`
(`rope-score`), `not staged without` (`aortic-stenosis-stage`), and `cannot be
assigned / applied / excluded without` across seven more files. Measured, as the
vocabulary file requires: 18 → 17 on this probe, 51 → 49 fields on
`probe-omitted-field-decides`.

## The five left, and why each stays

| tile | what it says with the field dropped |
| --- | --- |
| `hear` | *"HEAR score **at least** 3: not in the very-low-risk band (> 1)"* — a correct monotone rule-out from a partial score. `at least \d` appears 80 times in 41 files, mostly static prose, so it is **not** safe to add |
| `tls-cairo-bishop` | *"no end-organ (clinical) criterion entered"* |
| `hf-ef-classification` | *"With no baseline measurement this is HFmrEF … a single ejection fraction cannot settle this"* |
| `niss` | *"an AIS 6 (unsurvivable by convention) forces the maximal score"* — the missing AIS cannot change 75 |
| `palm-coein` | the field's own label ends *"optional"* |

Three of those five are disclosing in wording the vocabulary does not know, and
each phrasing appears in **one file**. Adding a one-file phrase to a shared
vocabulary is the tile-specific carve-out that file's header rules out, so they
are recorded here instead. The honest reading of this probe is now: five rows,
one of which was a defect, and four of which are the cost of asking the question
by matching sentences.
