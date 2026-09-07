# spec-v1103 — the guard that only one surface had

A pass through the finder's second section, the one
[spec-v1099](spec-v1099.md) added for the 698 tiles that never set `abnormal`.
Thirteen fields across six calculators. Twelve are correct. One is
`toxic-alcohol`, and the reason it was still open is that **the fix had already
been written — on the other surface**.

## An omitted chemistry panel indicated a drug

The osmolar gap is *measured* osmolality minus *calculated*, and the calculation
is additive:

```
calculated = 2 × Na + glucose/18 + BUN/2.8 + ethanol/3.7
```

`lib/tox-v86.js` read the glucose and the BUN through `nn()`, which returns **0**
for anything non-finite. A term read as zero makes the calculated osmolality too
**low**, which makes the gap — a subtraction — too **wide**. And the AACT
fomepizole limbs turn on *"osmolar gap over 10"*.

A glucose of 180 mg/dL and a BUN of 28 mg/dL are 10 mOsm/kg each: **exactly the
size of the limb**. On a measured osmolality of 300 against a sodium of 140:

| | calculated | gap | verdict |
|---|---|---|---|
| with the panel | 300 | 0 | No AACT fomepizole indication met |
| without it | 280 | **20** | **Fomepizole indicated per the AACT criteria** |

An antidote and a dialysis referral, from two labs nobody entered. This is
rule 6 — *an alarm from nothing is not the safe direction* — and rule 11 as well,
because the tile printed **"Calculated osmolality: 280 mOsm/kg"** as a
number it had observed.

## Why it survived nine waves of this programme

`views/group-v12.js` has refused this since [spec-v1065](spec-v1065.md), with the
reasoning written out in a comment above `needValues`. The *library* did not.
So the browser asked for the glucose and the BUN, and every API caller got the
answer the browser would not give.

This is [spec-v1073](spec-v1073.md)'s surface split from a new direction. That
wave found questions the browser makes unavoidable and the adapter never
declared. This is the mirror: a question the browser *does* insist on, guarded in
the renderer instead of in the function both surfaces call — so the guard was
real, tested, and reachable from exactly one of the two places the tile is used.

**Rule 18: a guard in a renderer is a guard for one surface.** Where a missing
value changes the answer, the refusal belongs in the pure function; the renderer
may repeat it in its own words, but it cannot be the only place it lives.

`required-field-agreement.spec.js` ([spec-v1025](spec-v1025.md)) is the gate for
the opposite direction — the browser answering something the agent surface
requires — so it had nothing to say here. The finder that did find it is
`probe-omitted-field-decides.mjs`, and only because
[spec-v1099](spec-v1099.md) gave the unflagged tiles a section of their own
rather than letting them fall into a weaker one.

## The fix

The guard moved into `toxicAlcohol`, which now returns
`{ valid: false, band, missing }` — the shape `mcp/tools.js` turns into an
`INCOMPLETE` with the reason in the message:

> Enter a glucose and a BUN: each is a term in the calculated osmolality, so
> leaving one out widens the osmolar gap and can indicate fomepizole on its own.

Both fields are `required: true` in `mcp/adapters/tox-v86.js` now, beside the
osmolality and the sodium that always were. The view keeps its `needValues` call
— it names the on-screen labels, which is better copy — and gained a one-line
fallthrough so a refusal can never reach `fmt(undefined)`.

**What stays optional, and why.** The ethanol is the third additive term and it
still defaults to 0. A patient with no ethanol on board is the ordinary case, its
term genuinely drops out, and the tile's note says so. Rule 12 is the test —
*is the missing value expected to be there?* — and a glucose and a BUN come off
the same basic panel as the sodium the tile already requires. An osmolality
without them is a gap in the workup. An ethanol without them is a Tuesday.

## The other twelve fields, and why they are not defects

| Tile | Fields | Reading |
|---|---|---|
| `smart-cop` | `sc-pao2`, `sc-spo2`, `sc-pf` | The oxygenation criterion takes **any one** of the three. The example supplies all three as normal, so dropping one leaves two, and "low risk" is correct. `smartCopOxLow` already treats a blank as `NaN` ([spec-v930](spec-v930.md)) and the score already refuses to say "low risk" with none of them ([spec-v1020](spec-v1020.md)). The probe's substituted `PaO2 = 0` is not a plausible value. |
| `mayo-uc` | `mu-en` | Labelled *"optional"*, and the verdict names which instrument answered: **"Partial Mayo score"** without it, **"Full Mayo score"** with. That is a disclosure, not a silence. |
| `iol-power` | `iol-target` | Labelled *"0 for emmetropia"*, and the answer reads **"Emmetropic IOL power"** when it is absent. The default is the field's documented meaning. |
| `tls-cairo-bishop` | `tl-cr`, `tl-uln` | Says **"no end-organ (clinical) criterion entered"** in the verdict itself. |
| `pk-suite` | `pk-vd`, `pk-cl`, `pk-cp`, `pk-tau` | Omitting a parameter drops the derived quantities that need it rather than computing them from a zero. Fewer lines, no invented ones. |

Recorded here so a later pass recognises them instead of re-investigating, the
practice [spec-v1098](spec-v1098.md) started.
