# spec-v1796 — Ask every envelope the question

> Status: **SHIPPED (2026-11-25)**: the borrowed-envelope class [spec-v1794](spec-v1794.md) found one row at
> a time now has a finder of its own, which reports **163 of 773** envelope declarations naming a quantity
> the field is not. Six are fixed here, including three whose leftover scale published an eGFR of up to
> 2,000. No tool's arithmetic changed; the catalog stays 2,390.

`bound: 'weightKg'` resolves against `lib/bounds.js` on every read, so a declaration cannot fall behind the
envelope it names ([spec-v1779](spec-v1779.md)). spec-v1794 found that mechanism pointed at the wrong
quantity sixteen times — audiogram thresholds in dB declaring `ageYears` because its ceiling of 130 fitted,
a refractive sphere declaring `platelets` at a hundredth, a proficiency-testing panel declaring `hcg` as a
stand-in for *some analyte, some unit*. All sixteen surfaced sideways, through
`probe-adapter-only-bounds`, and only because the borrowed **floor** happened to be wrong. Nothing had asked
the question directly.

`scripts/probe-borrowed-envelope.mjs` asks it of all 773. A declaration is accepted on either of two
grounds, because either one settles it:

* **The library names it.** The library behind the tool mentions the envelope in its own source, so the
  declaration restates a rule the tool applies. 569 of them.
* **The field names it.** The envelope's key is in the field's own argument, label or unit —
  `bound: 'platelets'` on a field called `platelets`. 41 more.

The remaining **163** are a field whose own words have nothing to do with the envelope it names and whose
library never mentions that envelope either. Every one of them has a range of its own to state, which is the
one good piece of news in the report: **none publishes a range nothing enforces**.

## The finder was wrong four times first

Each was found by a suggestion that was visibly absurd, and each is worth recording because the same trap is
available to any finder that reads names.

**A substring is not a word.** The first draft matched the envelope key inside the field's argument and
label. `rr` matched "cu**rr**entCr", `alt` matched "tot**alt**ime in minutes", `ast` matched "w**ast**e",
and `ph` matched "**ph**armacists" — it called a creatinine a respiratory rate and a pharmacy staff count a
pH. Worse, the same looseness quietly **accepted** real borrowings on the other side, so the error ran both
ways. Words now, split at camelCase boundaries and at anything that is not a letter or a digit.

**An alias that is also a unit is not an alias.** `mg` for magnesium matched every label that states a mass
— a CRP in mg/L, a serum IgG4 in mg/dL — and `be` for base excess matched the English word, in
"beneficiaries for the cap year (may **be** ...)". Both are gone, along with `ca`.

**The same analyte in another compartment is a different quantity.** `BOUNDS.sodium` is a *serum* sodium,
90 to 208 mEq/L; a urine sodium of 20 is ordinary. So "urine sodium declares `bound: 'platelets'`" is a
borrowed envelope that renaming to `sodium` would only replace with a closer borrow. Fifteen suggestions
went this way, across urine, pleural and other fluid fields, and a ratio or an index of two analytes is a
third quantity by the same argument.

**A library names an envelope two ways.** `boundsAdvisory('albumin', v)` passes the key as a string;
`albi-grade` and `nafld-fibrosis` write `if (albuminDl > BOUNDS.albumin.max)` and quote nothing. Reading
only the quoted form reported both as borrowing an envelope they apply **exactly**, and chasing that
produced three wrong fixes before the real cause showed up. Closing it moved 73 declarations from the report
to accepted, and took the RENAME verdict — *an envelope exists that does fit* — from 48 to **0**. There was
never a one-word fix in this vein; that was the finder's own blind spot talking.

## The six, and the leftover scale

| Field | Declared | Now |
|---|---|---|
| `albi-grade`, `nafld-fibrosis` serum albumin | `albumin` × **0.1** | `albumin` |
| `refeeding-risk` days with no intake | `daysNoIntake` × **0.1** | `daysNoIntake` |
| `mecki` MDRD-eGFR | `magnesium` × 10 | **3 to 250**, the library's own |
| `peds-transfusion-volume` weight | `lactate` × 10 | **0 to 500**, the library's own |
| `iss-rts` systolic BP | `lactate` × 10 | **0 to 500**, the library's own |

Every one carried a `boundScale` **chosen to make the borrowed envelope's numbers land**, which is the
clearest evidence that the borrowing was deliberate rather than a typo — and the reason renaming alone is
never the fix. Correcting the name while keeping the scale published an albumin ceiling of 0.7 g/dL, a
40-day intake limit where the envelope says 400, and an eGFR reaching **2,000**; `declared-cap-honest` and
`probe-declared-cap-configs` caught all five between them, in that order, within the minute.

The last three keep no envelope at all, because none fits: those libraries guard with a literal of their own
that is **looser** than the envelope for the same quantity — a weight from 0 rather than 0.2 kg, a systolic
pressure from 0 rather than 20 mmHg. That is a finding in its own right, left for the vein that owns it;
what is stated here is what the tool does.
