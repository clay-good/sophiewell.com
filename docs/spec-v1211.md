# spec-v1211 — the rule-out the classifier could not read

`scripts/probe-envelope-unbounded.mjs` sorts its rows by one question, because
that question is the whole point: **did the impossible value produce a
RULE-OUT?** An alarm from a number nobody measured is wrong; a rule-out from one
is dangerous.

It reported:

```
REASSURING FROM AN IMPOSSIBLE VALUE -- 0
THE REST -- 122
```

That zero was a claim about the classifier's **vocabulary**, not about the
catalog. Four of the 122 were rule-outs.

## One word apart

Every term in the reassuring vocabulary is a fixed phrase, `\bno indication\b`
among them. A tile names the thing it is ruling out **in the middle** of the
phrase:

```
No AACT fomepizole indication met on the entered data.
```

Three words between the negation and the noun, so nothing matched and the row
sat in THE REST. The same held for *"RIFLE: no criteria met"* and *"AKIN: no AKI
criteria met"*.

The classifier now also recognizes the **negation of a finding**, which is a
separate rule from the `NEGATED` guard beside it — that one catches the negation
of a *reassurance* (`"not harmless"`, `"NOT a favorable trend"`), which runs the
opposite way. One pattern cannot do both, and the previous wave of this file
already learned that lesson once.

## What the four were

### The antidote

`toxic-alcohol` computes an osmolar gap as measured **minus** calculated, and
sodium, glucose and BUN are the three terms of the calculated side. An impossible
term does not merely distort the gap — it drives it far negative and **closes**
the limb that turns on "gap over 10":

```
recent ingestion, measured osmolality 330
  sodium  140  ->  Fomepizole indicated per the AACT criteria on the entered data.
  sodium 2000  ->  No AACT fomepizole indication met on the entered data.
```

Fomepizole is the time-critical antidote in methanol and ethylene-glycol
poisoning. This is the most consequential rule-out this probe has printed.

[spec-v1103](spec-v1103.md) fixed the same field's other end — a blank glucose
read as 0 manufactured a gap and indicated fomepizole from nothing. An alarm from
nothing is not the safe direction, and neither is a rule-out from an impossible
number.

### The staging

`rifle-aki` and `akin-aki` compare a **current** creatinine against a
**baseline**, so an impossible baseline makes a real current value look
unremarkable and the entire staging disappears:

```
current creatinine 3.0 mg/dL
  baseline 1.0  ->  RIFLE class Failure        AKIN stage 3
  baseline 250  ->  RIFLE: no criteria met     AKIN: no AKI criteria met
```

AKI staging drives nephrotoxin holds and renal-replacement timing.

**A ratio has two ends.** Every envelope wave so far has guarded the value the
reading is *about*; here the defect lives in what it is measured *against*.

All four envelopes were already written down in `lib/bounds.js`. Only the measured
serum osmolality needed one, and it is the assay's.

The creatinine arm of both AKI tiles stays optional — `gradeFault` skips a blank,
so a tile scored from urine output alone is untouched, and a test pins that.

## Two more tests had pinned the old behavior

A glucose of 0 and a BUN of 0 now fall outside the envelopes the table declares
(5-2000 and 1-300), and two tests — one unit, one MCP — used exactly those to
assert *"a typed zero is a measurement, not a gap"*.

That property is right and is **unchanged**; it is now asserted directly rather
than through a computed total. A typed 0 is judged as a value the reader entered
and produces a different sentence from the one a blank field produces. Both tests
say that, on both surfaces, and each gains a sibling pinning that the smallest
survivable glucose and BUN still compute the gap and still indicate.

## Proof

The probe is at **116 fields across 68 calculators**, from 122 and 71, and
`REASSURING` is back to 0 — this time with a classifier that can see the shape.
Lint (19 gates), 13,560 unit tests and 449 MCP tests pass.

The 116 that remain are alarms and neutral readings. Under
[spec-v53](spec-v53.md) the envelope is a **disclosure** boundary rather than a
refusal, so those are a different piece of work from this one.
