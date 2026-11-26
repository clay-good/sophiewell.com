# spec-v1812 — The anchor that could never match

> Status: **SHIPPED (2026-11-26)**: the shared asking/disclosing vocabulary learns one house phrasing it did
> not know, and four finders stop joining a tile's reading into one blob before testing it against a
> pattern anchored to the start of a reading. Six rows across three tiles were tiles disclosing correctly.
> `probe-half-guarded` gets a JUDGED ledger for its eleven read rows and becomes the 22nd gated finder. No
> tool's arithmetic changed; the catalog stays 2,390.

`test/lib/asking-language.js` is the one list of the words a calculator uses when it is asking for an input
rather than answering, and of the words it uses when it answers and says what it was missing. Seven
consumers read it. Its own comment carries the rule for editing it: **measure which rows a phrase moves
before adding it**, because a phrase missing from one sweep is paid for in ledger exemptions, and a phrase
too loose buys a false exemption.

Both of this wave's findings came from walking `probe-half-guarded`'s rows and asking, of each one, whether
the tile actually discloses.

## A verb the list knew in the singular

`'no [a-z][a-z -]{0,40} (?:is|was) (?:entered|recorded)'` has been in the list since spec-v1196. The house
also writes the sentence in the **plural** — 33 singular uses across `lib/` and 10 plural ones in 8 files:

> No deaths were entered, so this is the disability side only and not the full burden of the cause.
> No predicted antimicrobial days were entered, so no SAAR is shown.
> No units on hand were entered, so only the ceiling is given.

Each names the gap *and* says which side of the answer the entered figures support. Three tiles were being
read as answering in silence for want of one verb. Measured before adding, as the rule requires:
`probe-half-guarded` 14 calculators to 12; `probe-omitted-field-decides` 128 fields to 124 in its third
section; `probe-omitted-item` 150 to 147. Sections 1, 2 and 4 do not move, and neither empty-form sweep
reads the disclosing list at all.

## An anchored pattern tested against a joined blob

Two phrases in the vocabulary are **anchored to the start of a reading** on purpose.
`^[^.]{0,40}\bat least \d` is the total stated as a floor — *"HEAR score at least 3"*, *"SCORAD at least
35/103"* — and [spec-v1805](spec-v1805.md) anchored it after measuring a bare `at least \d` at 30 rows and
finding five of them a **criterion quoted mid-sentence** rather than a floor.

Four finders build a tile's reading by walking its result object and **joining every string with a space**,
then test the join. Whatever `Object.entries` reaches first lands in front of the band, so an anchor can
never match. `hear` — the tile spec-v1805 measured that very pattern on — was still printing in two
finders' reports while saying *"HEAR score at least 3: not in the very-low-risk band"*.

The fix is a one-line helper, `saysGap(parts)`, that asks the question of **each string** rather than the
join, and the four finders use it. A phrase matched anywhere still matches, because every string is still
read; only the anchored ones change, and they change to the behavior their comment claims. It moves exactly
`hear`'s three rows in each of the three finders that reach it, and the static-exemption finder examines
four more readings and still reports zero.

`ownsTheGap` is the same shape and is deliberately **left alone**: its callers are the browser sweeps, where
the reading is one live-region string, and splitting it would *grant* exemptions rather than find them. That
is the unsafe direction, and it needs its own measurement inside those sweeps.

## Eleven read rows, and why they need a ledger

`probe-half-guarded` is a prioritizer: inside one tile, it drops each field in turn, and a tile that
**guards** one gap and is **silent** on another has already agreed the question matters. Two reviews
(2026-11-15, 2026-11-24) read every row it printed and fixed four tiles. The rows that survived kept
printing — so a new row would arrive into a report of eleven known ones and nobody could tell it apart.
That is the pattern [spec-v1775](spec-v1775.md) set for the four hand-run finders, and this one now follows
it: thirteen fields across eleven tiles are in a JUDGED ledger with the reason, the probe prints nothing
else, and `test/unit/finder-ledgers.test.js` fails on an unjudged row **and** on a judged row the probe no
longer reaches. Both directions were negative-tested by removing a ledger row and by adding a bogus one.

The reasons are worth reading as a set, because they are the three honest shapes of silence: the verdict
**cannot move** (`niss`, where an AIS 6 forces 75 by convention), the gap is **visible in what is printed**
(`palm-coein` leaves the tertiary type out of the notation; `levodopa-equivalent-dose` itemizes every drug
it scored and counts them), or the field is an **optional extra** feeding a line the tool then does not
print (`dropper-calibration`, `leprosy-reaction-prednisolone`). One row is a limit of the probe rather than
of the tile: `osha-lead-airborne-pel-shift` asks for the measured TWA in its top-level `note`, which the
probe skips because a note is usually standing prose.
