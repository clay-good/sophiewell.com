# spec-v1169 — a picklist on the page, free text in the contract

[spec-v1168](spec-v1168.md) counted the field kinds after normalising them:
`{bool: 3076, number: 3544, enum: 2360, string: 59}`. The 59 were the leftover —
the kind with no vocabulary, published to an agent as
`{"type":"string","maxLength":2048}`.

**23 of them are `<select>` elements on the page.** A reader gets a closed
picklist; an agent gets free text and whatever the label happens to say.

## The label was the whole contract, and six labels were wrong

`values` is what a field descriptor uses to publish an option set. With
`kind: 'string'` there is no `values`, so the only place the vocabulary existed
was the English label — which nothing checks against the tile. Six had drifted:

| tile / field | the label said | the tile accepts |
| --- | --- | --- |
| `nsa-cost-share` / `nsa-cat` | e.g. emergency, **non-emergency, air-ambulance** | emergency, ancillary-in-network-facility, non-protected |
| `em-mdm-2023` / `emm-setting` | e.g. ed, **office-new, office-est, inpatient** | office, inpatient-initial, inpatient-subsequent, ed, snf-initial, snf-subsequent, home-new, home-established |
| `timely-filing` / `tf-payer` | e.g. medicare, **medicaid, commercial** | medicare, other |
| `therapy-units` / `tu-rule` | medicare or **ama** | medicare, rule-of-eights |
| `multi-surgeon-pay` / `ms-role` | assistant, **co-surgeon**, team | assistant, co, team |
| `global-period` / `gp-nat` | unrelated-em, **related**, staged | unrelated-em, staged, return-to-or, unrelated-procedure, decision-for-surgery, related-postop |

Ten documented values are rejected by the tool that documents them:

```
nsa-cost-share|nsa-cat=non-emergency
  -> Computation failed: serviceCategory must be one of:
     emergency, ancillary-in-network-facility, non-protected
```

Six more labels were merely short — `medicare-cost-share` said "A or B" for a
select carrying A, B and SNF; `cob-calc` named two of four COB methods;
`appeal-deadline` named three of five levels; `pa-turnaround` two of three;
`global-period`'s indicator list omitted MMM; and four unit fields wrote "e.g.
mg, mcg, units" for a fixed set of five.

## Nothing computed a wrong answer

Every one of the 23 libraries rejects a value outside its set — checked by
running each tile's worked example with `zz-not-an-option` in the field, and by
running each option the select offers back through the library. That is the same
shape as spec-v1168: **the libraries defend themselves, so the scoring was right
while the contract was wrong.** What it cost was a rejected call, an agent with
no way to know the vocabulary, and six labels actively pointing at values that
do not exist.

## The fix

All 23 are `kind: 'enum'` with `values` matching the rendered select. That
changes four things at once, none of them in a library:

- the published schema is `{"type":"string","enum":[…]}` instead of
  `maxLength: 2048`;
- `validateInputs` rejects an unlisted value at the contract, naming the set,
  before the library is called;
- `toArgs` is unchanged — `enum` and `string` both coerce with `String(raw)`;
- `field-values-match-dom.spec.js` now covers them, so the two lists cannot
  drift again.

Labels were rewritten to name the question rather than a sample of the answers,
except where a code is opaque and the gloss earns its place (`an-dir` keeps
"aa, qz (100%), qy, qk, qx (50%), ad (flat 3 base units)").

`timely-filing|tf-payer` is the one judgment call. The library branches only on
`payer === 'medicare'`; every other string takes the same path and needs
`customLimitDays`. Declaring `['medicare', 'other']` therefore rejects
`commercial`, which used to be accepted — and loses nothing, because it behaved
exactly as `other`. The old label invited a payer NAME, which reads as though the
tool knows payer policies; its own source comment says the opposite ("no payer
directory is shipped or browsable").

## The gate, and the reach it was missing

`field-values-match-dom` has been the wrong shape for this since spec-v770. Every
assertion in it compares a **declared** list against the rendered options, so a
field that declares nothing was never a subject — the check could not be wrong
about these 23, because it never looked at them. This is
[spec-v1099](spec-v1099.md)'s rule at the level of the gate's *subject
selection* rather than its filter: **a check that only examines fields carrying
an optional property is silent about every field that does not carry it.**

So it now asks a second question in the same page pass: *is any field the tile
renders as a `<select>` published without a value list?* `bool` is exempt — its
schema is `{"type":"boolean"}` and its select is the two boolean values, so
there is no vocabulary left to declare. Both arms assert their own reach: 887
tiles / 2,935 fields for the new one, almost all of them plain number inputs
that render no options and produce no row.

Negative-tested by putting `kind: 'string'` back on `em-time|enc`, which brings
the row straight back.

### And widening the subject list broke the perturbation

`rucam` failed on the first run of the widened gate. The perturbation loop skips
every dom in the target list so it does not move the field under comparison —
and the second arm had just added `rucam`'s four plain number inputs to that
list. Its scale is chosen by an R ratio computed from exactly those four, so the
two cholestatic options went back out of reach: the mechanism this gate's own
header names `rucam-course` as the reason for.

The skip is now over the fields being **compared**, not the fields being read.
Same lesson as the perturbation bug spec-v1106 fixed, arrived at from the
opposite direction — there the perturbation was too narrow to reach a subject,
here a wider subject list made the perturbation too broad.

## Verification

`npm run lint`, `npm test` (13,364), `npm run test:mcp` (448) and `npm run
build` all green. `field-values-match-dom` passes in 2.6 min (1.8 before the
widening) and fails on the reintroduced defect.
