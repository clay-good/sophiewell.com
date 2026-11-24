# spec-v1778 — The optional field no finder drove

> Status: **SHIPPED (2026-11-23)**: 1 tool guarded, 863 fields reached for the first time, 7 rows judged.
> The catalog stays 2,390.

863 of the catalog's 4,544 free number fields -- nearly one in five -- are **absent from their tool's own
worked example**. Every whole-catalog sweep that asks what a tool does with an impossible value starts from
that example, and all three of them skip or defer this class:

| Finder | What it does with a field absent from the example |
|---|---|
| `probe-impossible-changes-nothing` (spec-v1217) | skips it outright: `if (!hasOwnProperty(example, dom)) continue`. There is no value to perturb. |
| `probe-impossible-reads-as-absent` (spec-v1218) | the same skip, plus a second one for a value present but blank. |
| `probe-adapter-only-bounds` (spec-v1744) | drives it, then skips the row when the answer did not move -- "the field changed nothing: another finder's job", which is the first finder above. |

Each of the three is right about its own question. Together they leave a field a reader can type 999999 into
and be answered as though the box were empty, while an agent sending the same value is refused by the
adapter -- spec-v1214's silent substitution on exactly the surface [spec-v1743](spec-v1743.md) cares about,
in the one place no gate looks. [spec-v1777](spec-v1777.md) found this seam while reading the 26 fields its
configuration probe reported: every one of them turned out to be a field its example never fills.

## The finder

`scripts/probe-absent-example-field.mjs`. Driving these needs a configuration where the field is actually
**read**: an absent field is usually absent because the example takes a branch that does not use it, and
filling it then changes nothing for an honest reason. So for each field it walks configurations -- each enum
at every option it lists -- filling the field from a ladder of plausible values until the answer MOVES. That
configuration is the proof the tool reads the field, and only then is 999999 entered there.

Reach: 2,346 tools, 863 absent number fields. 480 never moved the answer in any configuration tried, which
is the discarded-input class two other finders already own (`probe-unsupplied-input`,
`probe-omitted-field-decides`) and not this one. Of the rest, **eight** discarded an impossible value in the
configuration that reads them. Seven are judged, in the finder's own ledger, so it prints nothing until a new
row appears:

| Judged | Why |
|---|---|
| `copay-card-runout` per-fill maximum | a maximum of 999,999 covers every fill, which is what no maximum does. The value was used. |
| `vial-rounding` vial sizes 2 and 3 | a 999,999 mg vial cannot fill a 420 mg dose, so the plan is the one with no second vial. Used, and found unusable. |
| `phoenix-sepsis` D-dimer, fibrinogen | read as absent, and the reading SAYS so: "a D-dimer" stays on the not-entered list. [spec-v1218](spec-v1218.md)'s disclosed case. |
| `tls-cairo-bishop` uric acid baseline | the same, disclosed as "No baseline entered", with the note naming what was used instead. |
| `o2-cylinder-duration` target duration | owner decision of 2026-11-17 ([spec-v1759](spec-v1759.md)). |

## The one defect

`hvpg` reads three catheter pressures and range-checked none of them. The IVC pressure is the optional one,
and Baveno VII 1.8 is the only thing that uses it: "If the free hepatic vein pressure is more than 2 mmHg
above IVC pressures, the presence of a hepatic vein outflow obstruction should be ruled out." At an IVC
pressure of 999999, `free - ivc > 2` is false. So the note did not appear, the gradient was reported as
though no IVC pressure had been given, and **nothing in the reading mentioned the number the reader had
entered** -- no "not entered", no mention of the IVC pressure at all. It is the undisclosed case, and the
only one of the eight.

All three pressures now go through `gradeFault` (which skips a blank, so the tool keeps its own "Enter the
wedged hepatic vein pressure and the free" sentence) with a ceiling of `BOUNDS.dbp.max`, the recorded
diastolic arterial extreme sourced at spec-v1763. A venous pressure above the highest diastolic pressure
ever recorded is not a measurement; nothing clinical is decided by the number, and a tracing at the extreme
still answers. The three fields now declare `min: 0, max: 400` to agents as well, by
[spec-v1777](spec-v1777.md)'s rule.

## What this says about the gates

Three finders each deferred a class to another, and the catalog read clean. The deferral was written down
each time -- "another finder's job" is a comment in `probe-adapter-only-bounds` -- and it was true of the
finder it named and false of the set. The rule worth keeping: a finder's reach is a claim, and a reach
stated as "every field with a worked example" is not the same claim as "every field". Each of these three
reports its reach in those terms, which is how the gap was readable at all once someone asked.
