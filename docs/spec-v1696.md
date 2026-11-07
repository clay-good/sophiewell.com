# spec-v1696 — Cairo-Bishop's other half could not say "not measured"

> Status: **SHIPPED (2026-11-07)**. One defect, found by running the repo's own
> `probe-half-guarded.mjs`. No new tile, no changed threshold.

## The defect

`tls-cairo-bishop` has two halves. The **metabolic** half was fixed in spec-v1163 to carry three
states — met, not met, **not measured** — because "3 of 4" read as three met and one ruled out when the
fourth had never been drawn. Its band says "Not entered: potassium, phosphate … any of these can meet a
criterion, so this does not rule laboratory TLS out", and its rows print "not entered" rather than a
dash.

**The end-organ half never got that fix.** Two consequences:

**A fabricated observation on the agent surface.** `renalCriterion` was a bare boolean:

```js
const renalCriterion = crRatio != null && crRatio >= 1.5;   // false when nothing was drawn
```

So `criteria.renalCriterion: false` was all an agent saw for a patient with **no creatinine drawn** —
indistinguishable from a creatinine measured at 0.8× ULN. That is the thing spec-v1163 called a
fabricated observation, in the one place it was not repaired.

**A real assessment reported as absent.** The band read:

> Laboratory tumor lysis syndrome: 2 or more metabolic criteria met; no end-organ (clinical) criterion
> **entered**.

and it read that way **whether or not they had been entered**. A clinician who entered a creatinine of
0.8× ULN and explicitly selected *no arrhythmia* and *no seizure* was told nothing had been entered —
sent back to check what they had just finished checking. The inverse error to the first, on the same
line.

Both reduce to one thing: the end-organ half had two states where the question has three.

## The fix

| What was looked at | What it now says |
|---|---|
| Nothing | "No end-organ criterion has been entered, so clinical TLS is **not ruled out**: enter the creatinine with its upper limit of normal, the arrhythmia finding, the seizure finding." |
| Some of it, all negative | "The end-organ criteria entered are negative (no arrhythmia, no seizure), but the creatinine with its upper limit of normal was not entered, so clinical TLS is **not ruled out**." |
| All of it, all negative | "All three end-organ criteria were entered and none is met (creatinine 0.8x ULN, no arrhythmia, no seizure), so this is **laboratory and not clinical** TLS." |

Only the third rules clinical TLS out, and only it says so.

`criteria.renalCriterion` is now `true` / `false` / `null`, through the same `tri()` helper its four
siblings use, and the view prints a "Creatinine ≥ 1.5 × ULN" row with "not entered" for `null` — a row
it did not have at all before. `criteriaMet.renalCriterion` stays a boolean, because that object is
documented as the booleans the arithmetic used, kept separate from what the reader is shown.

**An omitted arrhythmia or seizure no longer reads as "none".** `{ none: 0, … }[arrhythmia] || 0` gave
an omitted select the same grade as an explicit "no arrhythmia". The browser's selects always carry a
value, so this was invisible there — but neither field is `required` on the agent surface, so an agent
omitting both got a clinical reading built on two findings nobody made. Assessment is now
`hasOwnProperty` on the grade table, and `endOrganAssessed` reports what was looked at.

## How it was found

`node scripts/probe-half-guarded.mjs` — "tiles that guard at least one missing input and stay silent on
another, where the silent one moves the answer". It named 21 suspects; this is the one where the tile
had *already been fixed for exactly this defect on its other half*, which is what made it worth opening
first. The probe was in the repo the whole time.

## Proof

- `test/unit/tls-end-organ-three-states-v1696.test.js` — seven cases: a creatinine nobody drew reads
  `null` and not `false`; one that was drawn and is normal reads `false`; the three readings are three
  **different** sentences, asserted pairwise so a future edit cannot collapse two of them; an omitted
  arrhythmia or seizure is not "none"; a met criterion still grades clinical TLS (renal → II, prolonged
  seizure → IV); and the arithmetic booleans stay booleans.
- Driven on screen: with the creatinine pair cleared the page says "not ruled out" and the new row says
  "not entered"; filling 1.0 against a ULN of 1.2 flips it to "All three end-organ criteria were entered
  and none is met".
- 18,775 unit tests, 494 MCP tests, lint, build; example-correctness, answer-said-once,
  `incomplete-scores` and the 320px catalog sweep green (44 passed).
