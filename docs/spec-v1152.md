# spec-v1152 — two calculators on one page, and a label that argued with its own flag

Sixth batch out of [spec-v1146](spec-v1146.md)'s backlog: the group triaged as
*"suites of independent readings"*.

## The defect: `abg`

```js
num('pH', pH, { min: 6, max: 8 });  num('paco2', paco2, { min: 0 });  num('hco3', hco3, { min: 0 });
```

The pH is bounded at 6 to 8, so a blank one already threw. PaCO2 and HCO3 are
bounded at zero, so `nv()` reading a blank as zero passed straight through:

```
pH 7.30, PaCO2 30, HCO3 not entered
  "Primary disorder: Metabolic acidosis
   Winter formula: expected PaCO2 6 to 10 mmHg"
```

Winter's rule applied to a bicarbonate of nothing. **The first required field was
guarded and the other two were not** — [spec-v1146](spec-v1146.md)'s shape for the
seventh time, and the reason the sweep beside it never saw any of them.

## Four suites where the declaration was the wrong half

Each of these is genuinely two calculators sharing a page, and each page says so.

| Tile | The halves | The label that gives it away |
| --- | --- | --- |
| `infusion-time-remaining` | volume + rate → time to empty; volume + hours → rate to last | *"**Or:** make this volume last (hours)"* |
| `o2-cylinder-duration` | size + pressure → usable volume; ÷ flow → duration | *"**Or:** target transport time"* |
| `digoxin` | clearance + indication → maintenance dose; level + hours → interpretation | *"Measured level (**optional**)"* |
| `heparin-nomogram` | weight + indication → bolus and rate; aPTT → adjustment | *"Current aPTT (**optional**)"* |

The last two are worth reading twice. Their **`mcp/fields.js` labels literally
said "(optional)" beside `required: true`** — and `o2-cylinder-duration`'s
residual pressure said *"Residual pressure (default 200)"*, which is a field that
cannot be required by definition. The view substitutes 200 psi when it is blank
and the reading names it (*"above the 200 psi residual"*), which is the
[spec-v1133](spec-v1133.md) model.

## A gate measured and not built

That contradiction is mechanical, so it looked like a cheap check: **a `required`
field whose own label says "optional", "default", "leave blank", "if known" or
"if available"**. Measured across the catalog: **three hits.** One is
`heparin-nomogram`'s aPTT, already a backlog row and fixed here. The other two are
false:

- `heaven-criteria` — the phrase is inside the criterion's clinical description.
- `mbi-validate` — *"11 characters, hyphens optional"* describes the **format**,
  not the field.

One true positive out of three, and it found nothing the probe had not already
flagged. **Not built.** The finding belongs here as a thing to read for by hand
when touching an adapter, not as a gate at 33% precision.

## Backlog

**27 → 18.** Left: `ecmo-titration` (5), `rosendaal-ttr` (2),
`posas-patient-scar` (2), and nine singles — `capra-score`, `anticoag-reversal`,
`gap`, `mgap`, `acetaminophen-nomogram`, `nsa-cost-share`, `rox`, `tsat`,
`weight-dose`.
