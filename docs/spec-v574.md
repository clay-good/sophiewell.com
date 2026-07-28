# spec-v574.md — COMPERA 2.0 tile

> Status: **SHIPPED (2026-07-28).** Builds the `compera-2` tile. Catalog **1423 → 1424**, group G.

## Why

A **companion and successor at once**. `reveal-lite-2` is in the catalog; COMPERA 2.0 is the European
counterpart adopted by the 2022 ESC/ERS guidelines at follow-up — and by its own footnote it **borrows**
REVEAL Lite 2's 6MWD and BNP cut points, so the two are not independent instruments.

## What it does

Grade each available variable 1-4, take the **mean**, round to the **nearest integer**.

| Variable | 1 | 2 | 3 | 4 |
| --- | --- | --- | --- | --- |
| WHO FC | I or II | III | IV | *(none)* |
| 6MWD (m) | >440 | 440-320 | 319-165 | <165 |
| BNP (ng/L) | <50 | 50-199 | 200-800 | >800 |
| NT-proBNP (ng/L) | <300 | 300-649 | 650-1100 | >1100 |

**Strata:** 1 low · 2 intermediate-low · 3 intermediate-high · 4 high.

## The five rules a plausible implementation breaks

**1. WHO functional class has only three grades in a four-grade model.** No class scores 4. A four-column
table whose first row stops at three looks like a missing cell — "completing" it would push every class IV
patient a whole stratum higher. A test asserts grade 4 is unreachable on that row.

**2. Three rows have numeric gaps**, because the table assumes integer inputs. 6MWD runs 440-320 then
319-165; NT-proBNP to 649 then from 650; BNP to 199 then from 200. A walk distance of **319.5 m falls in no
band** — and walk distances are routinely recorded to the metre. The lib **refuses** and names the gap
rather than rounding into the nearer neighbour.

**3. The denominator is the number of variables actually available, not a fixed three.** A patient with two
of three is scorable. Treating a missing variable as zero, or holding the denominator at 3, drags every
incomplete patient toward low risk.

**4. BNP and NT-proBNP are mutually exclusive, and NT-proBNP takes precedence.** They are not two variables
that both count — scoring both would give the peptide axis double the weight of functional class and walk
distance combined.

**5. The rounding rule differs from the three-stratum model.** COMPERA 2.0 rounds the mean to the *nearest
integer*; the older three-stratum model uses banded rounding with different boundaries. Reusing one for the
other is the classic error.

## A deliberate omission

**This paper publishes no per-stratum mortality percentages of its own**, so none is quoted. The four-strata
figures that circulate come from other cohorts, and attaching them to this citation would attribute numbers
to a source that does not contain them (spec-v97).

## Scope (spec-v11 §5.3)

A **follow-up risk stratification**, not a diagnosis. It does **not** diagnose pulmonary arterial
hypertension, which requires right heart catheterization, and does not distinguish it from the other groups
of pulmonary hypertension — left heart disease, lung disease and chronic thromboembolic disease are managed
completely differently and are not what this model was built on. It does not select or escalate therapy, and
is not by itself an indication for combination treatment, parenteral prostacyclin, or transplant referral.

## Files

- `lib/compera-2-v574.js` — `compera2()`, `WHO_FC_GRADES`, `SIX_MWD_BANDS`, `BNP_BANDS`, `NT_PROBNP_BANDS`,
  `STRATA`, `MAX_WHO_FC_GRADE`.
- `views/group-v574.js` (RV574) — all four inputs optional under an **h2**, with the peptide precedence
  stated beneath them.
- `mcp/adapters/compera-2-v574.js` — wave 399.
- `test/unit/compera-2.test.js` — 19 tests.
- `docs/spec-v574.md` (this file).

## Sourcing (spec-v97)

Table 1 transcribed from the paper's own full text; the scoring rule independently restated by two later
publications.

- Hoeper MM, Pausch C, Olsson KM, et al. COMPERA 2.0. *Eur Respir J.* 2022;60(1):2102311.
