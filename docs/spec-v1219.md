# spec-v1219 — two helpers disagreeing about one value

[spec-v1218](spec-v1218.md) shipped a measurement — 38 fields where an impossible
value read as no value and the reading said nothing — and deliberately fixed none
of them, on the grounds that a probe wrong three times in an hour is not yet
authority to change 25 modules. This wave triages that list. **Most of it was the
probe, not the catalog.**

## The third way a tile discloses

`abi` says "the right ankle pressure was not entered". `kings-college` asks for
the INR. Both were already recognised. The commonest form was not:

```
CL 5       -> "half-life 6.93 h; steady state 34.65 h; loading dose 1000 mg; maintenance 1200 mg"
CL -999999 -> "loading dose 1000 mg."
```

`pk-suite` says nothing about the clearance it rejected and instead **enumerates
less**, and its renderer omits the rows whose value is null. `modified-marshall`
does the same — *"assessed: respiratory 3, renal 2"* becomes *"assessed: renal
2"*. A reader watches quantities disappear. That is weaker than naming the
rejected value and it is not silence, so the probe now separates it out, and
separates further the rows where the reading is **identical** to the normal one —
where nothing on screen moved at all.

`ecmo-titration` cost a fourth vocabulary entry: it discloses as *"Titrated to the
**default** target PaCO2 of 40 mmHg, because no target was entered"*, naming the
substitute rather than the rejection. `default` is safe to match only because the
movement rule already restricts matching to sentences the reading **added**, so a
standing note mentioning a default cannot exempt a tile.

**38 silent became 11**, five of them "nothing moved".

## What was actually wrong: `pbac-hmb`

The Pictorial Blood Assessment Chart tallies eight weighted item types — pads,
tampons, clots — against a > 100 threshold for heavy menstrual bleeding. Two
helpers looked at the same value and disagreed:

```js
if (!fieldEntered(o[key])) uncounted.push(label);   // a negative count IS entered
raw += cnt(o[key]) * weight;                        // cnt() returns 0 for it
```

`cnt` discards anything outside `0..1e6` and returns **0**. `fieldEntered` returns
**true** for the same value. So a negative count was *entered* for the purposes of
the footing — the disclosure written by [spec-v1093](spec-v1093.md) precisely to
say "scored from 2 of 8 item types" — and *worth zero* for the purposes of the
score. The footing never fired, the tally silently omitted an item type the reader
had filled in, and the result went to a threshold.

That is [spec-v1201](spec-v1201.md)'s lesson in a new place: one rule written
twice always drifts. Here the two copies are not even the same function.

`pbac` now refuses **exactly what `cnt` was already discarding** — no value that
used to score stops scoring — and says which item type is wrong. `gradeFault`
skips a blank, so an item type left empty still reaches the footing that exists to
report it, and a test pins both halves of that line.

## The eleven that remain, by cluster

| cluster | reading |
| --- | --- |
| `smart-cop` PaO2 / SpO2 / P:F | a high oxygenation value scores no points, and so does omitting it. A threshold artifact of comparing against omission |
| `pbac-hmb` (the three not "nothing moved") | fixed above; the rows now refuse |
| `fena-feurea`, `insulin-correction` | the derived quantity is nulled rather than miscomputed — correct in the library. What the **page** prints for a null is [spec-v1210](spec-v1210.md)'s question, not this one's |
| `popq-staging` point D | the label says it: "absent after hysterectomy" |
| `simon-broome-fh` LDL-C | inert on the example's branch, where a DNA criterion is already definite |

A field whose example value **equals** the value an omission produces makes this
probe's question unanswerable — "reads as absent" and "reads as the example" are
then the same observation. Six of the original rows were that, and it is the
fourth false-positive class this pair of probes has turned up.

## Proof

The new test fails on the old code and passes on the new. Every existing worked
example is unchanged — including the footing test, which is the half a guard like
this most easily breaks. The probe's own count drops from 18 rows to 11 as a
direct result of the fix.

Lint (19 gates), 13,575 unit tests and 449 MCP tests pass.
