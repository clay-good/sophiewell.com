# spec-v1148 — four more, and one where the declaration was the wrong half

Second batch out of [spec-v1146](spec-v1146.md)'s backlog.

## Three tiles that printed a zero

| Tile | Blank | It said |
| --- | --- | --- |
| `crrt-dose` | the prescribed effluent rate | *"**0 mL/kg/h** — Below the KDIGO 2012 target of 20-25"* — an adequacy judgment about a prescription nobody had written down |
| `pca-pump` | the demand (bolus) dose | *"Maximum demand delivery: **0 mg/h**"* — an opioid PCA whose bolus had simply not been typed |
| `qbl-pph` | the dry-pad tare | the dry pad and the irrigation counted **as blood** |

`pca-pump` is the [spec-v1146](spec-v1146.md) shape once more: `pcaPump` bounds
the concentration at 0.001 and the lockout at 1, and allows a demand dose of 0
because a basal-only order is real. Two of the three required fields reject a
blank on their own, the third does not, and the sweep only ever cleared the
first.

`qbl-pph` runs the other way. The tare is subtracted from the soaked pad weight,
so a blank one **overstates** the loss — 1,200 mL where the tare-corrected figure
is 1,100. Rule 6: an alarm from nothing is not the safe direction either. It
matters only when pads were weighed, so that is when it is asked for (rule 25:
guard a reading, not a field) — with pads blank, [spec-v1038](spec-v1038.md)'s
*"at least 300 mL"* disclosure still stands untouched.

## `insulin-correction`: the browser was right

The sweep flagged `ic-carbs` and `ic-icr`, and the tile's own label reads:

> Carbs to be eaten (g; **leave blank for correction only**)

A correction-only dose is the ordinary inpatient case. The browser was right to
answer and the `required` declaration was wrong — so the agent surface has been
refusing input it could have answered from, on every correction-only call.

That is the **other half of what this sweep is for**, and it is worth saying
plainly because it is easy to read a disagreement as "the browser is lax". The
gate's message has always offered both: *"either the browser should ask too, or
the field is not really required and the declaration is wrong — fixing either one
is a fix."* This is the first row in this programme where the second was the
answer.

## Backlog

**50 → 45.** Left in this group: `saps-ii`, `lvh-criteria` and `vanc-auc`, each
of which needs the instrument read rather than the pattern applied.
