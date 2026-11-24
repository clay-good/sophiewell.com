# spec-v1780 — The bound that held on one branch

> Status: **SHIPPED (2026-11-23)**: 25 fields across 24 libraries guarded, 1 judged. No tool's arithmetic
> changed; the catalog stays 2,390.

[spec-v1779](spec-v1779.md) taught the three gates that police a declaration to read a resolved range, and
the configuration probe then reported what the single-configuration one never could: **26 fields where the
library answers past a bound its own agent contract declares**, in some configuration. `mcp/fields.js`
refuses an agent's value outside a declared `min`/`max` before the library runs, and the browser page calls
the library directly, so every one of those is [spec-v1743](spec-v1743.md)'s divergence: the reader on the
page is answered from a value the agent is refused.

Every one had the same cause, and the cause is not a missing guard. **The guard existed and sat inside a
branch.** Fourteen of the 26 were not enforced even in their tool's own worked-example configuration, which
is how they survived: all fourteen are fields that example leaves blank, the class
[spec-v1778](spec-v1778.md) had just finished mapping.

The house answer was written down two specs ago. `iron-supplement-who` carries it as a comment from
spec-v1744: *"the adapter declared 0.3-6 kg; the page passed 60 through for a non-preterm group (where the
weight is unused) and the tile answered; refused now"* -- a `gradeFault` hoisted above the branch split.
`gradeFault` skips a blank, so every tool keeps its own missing-value sentence, and only a value the reader
actually typed is judged. 25 fields now carry that hoist:

| Shape | Fields |
|---|---|
| Guarded inside one group's branch | `who-tb-fdc-dose` age (HPMZ only), `pc-dose-pole` age (the by-age drugs), `who-cotrimoxazole` CD4 (adults), `deworming-dose-who` age in months (children), `enteric-fever-regimen` weight (children), `iron-supplement-who` hemoglobin (pregnancy), `crag-screen-fluconazole` weight (adolescents), `chagas-stage-treatment` LVEF (chronic), `newborn-hypoglycemia-who` weight (sick infants), `f100-rutf-amount` sachet energy, `schisto-community-treatment` baseline, `td-pregnancy-schedule` adult doses, `aware-child-oral-dose` age in days, `cholera-rehydration` systolic pressure, `hat-treatment` CSF white cells, `iptp-sp-schedule` weeks since the last dose, `wbct20` hours since the loading dose, `pph-who-2025` minutes since tranexamic acid |
| Guarded behind a second condition as well | `labor-care-guide-alert` dilatation, lag hours and second-stage hours -- the lag hours only once a dilatation was entered, the second-stage hours only once parity was chosen |
| Guarded on one route or estimation path | `ddi-static-aucr` fu,p (only when the concentrations are estimated from the dose, not when [I]h and [I]g are given), `dose-history-level` bioavailability F (only on the oral route) |
| Checked after an early return | `preventive-owed` age -- a grandfathered plan returned its "no list applies" answer before the age was ever range-checked |
| The mirror of a fix already made | `abg` FiO2. spec-v1758 fixed the same shape on the field beside it: *"An entered PaO2 was only checked when an FiO2 came with it."* An entered FiO2 was only checked when a PaO2 came with it. |

`abg`'s range is the field's declared 0 to 1 rather than `BOUNDS.fio2`, because the catalog's FiO2 fields
disagree about the floor -- 0.21 in four tools, 0.01 in the P/F ratio -- and
[spec-v1777](spec-v1777.md) already records that disagreement as a question of its own. Enforcing the
declaration is the fix this spec is for; choosing between the floors is not.

## The one left

`peds-weight-est` declares its years field 1 to 14, and the library answers at 0.5 by converting to months
and applying APLS's 0-12 month formula -- which is the right weight for an infant's age typed into the years
box, and a fallback added on purpose. Closing the gap means either widening the declaration **and its label**
to 0-14, or refusing that fallback. That is a reader-facing choice, so it is judged in the probe's ledger
with both options stated rather than decided here. It is the row `probe-adapter-only-bounds` has reported
since spec-v1744, and the probe now prints nothing until a new one appears.

One hoist cleared a row out of a different finder's ledger, which is the kind of thing only the gates
notice. `probe-half-step` had `dose-history-level`'s bioavailability judged as "a fraction by definition" --
true, but the half step it was driving was **1.5**, outside the fraction entirely. The range check sat on
the oral route, so the finder reached the field on another route and the tool answered. Hoisted, the tool
refuses 1.5 and the finder no longer reaches the field, so the judgement went stale and
`test/unit/finder-ledgers.test.js` failed until it was removed. A judged row is a claim about reach, and
reach moves when a guard moves.

## Where this leaves the four finders

| | |
|---|---|
| `probe-declared-cap-configs` | 329 configurations across 26 fields → **0, with 1 judged**, over 1,304 declared fields in 11,342 configurations |
| `probe-adapter-only-bounds` | the same 2 rows of 2,588 declared edges it has reported since spec-v1744: the `peds-weight-est` years judged above, and `o2-cylinder-duration`'s flow (owner decision of 2026-11-17, spec-v1759). It has no ledger of its own, so it still prints both |
| `probe-undeclared-cap` | 1,004 caps still enforced and undeclared, and 11 envelope rows |
| `probe-absent-example-field` | 0 open, 7 judged |

A declared bound now means the same thing on both surfaces, in every configuration a tool accepts.
