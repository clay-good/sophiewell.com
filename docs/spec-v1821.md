# spec-v1821 — A gap owned in a list, not a sentence

> Status: **SHIPPED (2026-11-26)**: the shared vocabulary learns to read a tile's **structure** as well as
> its words, and thirteen rows across three calculators turn out to have been owning their gaps all along.
> 1 shared module, 3 finders, 1 test. No library file changed; the catalog stays 2,390.

## Nine elements of a Texas statute

`tx-prescriptive-authority-agreement` checks the nine elements Texas Occupations Code 157.0512 requires of
a prescriptive authority agreement. Drop one and it puts that element's name into an `unanswered` array:

> unanswered: ["In writing, signed and dated by the parties"]

That is a tile owning the gap exactly, and `probe-omitted-item` reported all nine of its elements as
answers given in silence. The vocabulary could not see it for a reason worth stating: **the sentence is the
element's own name, and the meaning is in the key.** No list of phrases can recognize "In writing, signed
and dated by the parties" as an admission; only the field it sits in says that.

140 (tile, field) pairs across the catalog do this, under eleven key names — `missing` (47), `unrated`
(22), `unanswered` (19), `notEntered` (15), `unscored` (13), `unassessed` (11), `intensityMissing` (6),
`unadministered` (3), `missingAtCeiling` (2), `missingCriteria` and `unassessedSupporting`.

## The two rules it has to keep

**The movement rule still governs** ([spec-v1196](spec-v1196.md)). A tile whose `missing` array is
non-empty whatever you drop is describing something else, and exempting it would be the static-prose trap in
another shape. So `ownsAGapKey(after, before)` asks for an entry the **full** reading did not have: the
field that was dropped has to be what the list gained. A list that shrank, or stayed the same, owns nothing.

**A substring is not a word** — the rule `scripts/lib/quantity-name.mjs` had to learn in
[spec-v1796](spec-v1796.md). The key is matched on its **camelCase segments**, so `intensityMissing` and
`missingAtCeiling` both carry `missing` while `dismissing` does not; and `notEntered` is two segments, so
the joined form is tested as a phrase as well.

## Measured before adding

Across every tile and every dropped field it moves **thirteen** rows across three calculators and nothing
else: `probe-omitted-item` 131 fields to 118, and `probe-omitted-field-decides` 121 to 108 in its third
section. Sections 1, 2 and 4 do not move, `probe-half-guarded` stays at zero with no judgement going stale,
and `probe-static-exemption` still reports zero — which is the check that none of the thirteen rests on a
list that was already populated before a field was dropped.

The other two are `hpa-glaucoma`, which puts each unmeasured visual-field measure into `unassessed` ("the
mean deviation"), and `igg4-rd-2020`, which names the one it did not get in `missing` ("item 2, a serum IgG4
of 135 mg/dL or more").
