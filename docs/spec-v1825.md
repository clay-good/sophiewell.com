# spec-v1825 — The envelope an assay draws, not a case report

> Status: **SHIPPED (2026-11-26)**: a **spot urine creatinine** envelope, fenced by CDC's own laboratory
> reportable range; **seven** fractional-excretion and ratio tools stop answering a urine creatinine no
> laboratory would report; and a field whose unit is *shared* with the analyte beside it can no longer be
> matched to a unit-specific envelope at all. 5 library files, 2 adapters. The catalog stays 2,390.

## A fence read off the instrument

Every other envelope in `lib/bounds.js` sits past the highest value the **literature** reports. This one
sits past the highest value a **laboratory will report**, which is the stronger claim, and it came from
reading CDC's own manual rather than a summary of it.

From the NHANES **August 2021 – August 2023** Laboratory Procedure Manual, analyte *Urine Creatinine*,
method Roche Cobas 8000 (University of Minnesota ARDL), §9 *Reportable range of results*, page 15 of 22 —
extracted from the PDF because the fetch returned raw bytes and a search summary is not a source:

> "Analytical Measurement Range: 1.1-610 mg/dL"
> "Clinically Reportable Range: 5-1525 mg/dL"
> "Specimens exceeding the high limit are automatically diluted (1:2.5) by the instrument"
> "Limit of Detection (standard 1 + 3SD) 1.1 mg/dL"

So **1,525 mg/dL** is the top of what that assay reports *after its maximum dilution*. The fence is **1 to
2,000 mg/dL** — past it rather than at it, because another laboratory's assay may report further, which is
the margin [spec-v1734](spec-v1734.md) uses throughout.

## The decision it reverses, and why that is allowed

`lib/renal-v128.js` has carried this comment since [spec-v1233](spec-v1233.md):

> a fraction has two ends and only one of them is a quantity BOUNDS names — `BOUNDS.scr` is a SERUM
> creatinine, and a urine creatinine runs in the hundreds (spec-v1205). So the plasma creatinine is checked
> and its urine partner is not.

That was right, and it was **contingent**: the urine partner went unchecked because no envelope named it.
One does now, so seven tools take it — `fepo4`, `femg`, `fe-bicarbonate`, `fena-feurea` (both halves),
`uacr-upcr`, `fractional-excretion-potassium` and `feua`. A urine creatinine of 4,000 mg/dL used to drive
each ratio toward the reassuring end; the comment is updated in place rather than replaced, so the next
reader sees what changed and what did not — there is still no envelope for a **urine potassium**, and the
`fek` comment now says exactly that.

**The unit was never in doubt here**, and that was checked rather than assumed: both creatinine fields of
every pair are declared `mg/dL`, and the plasma side has refused a value of 90 — a micromolar figure — since
each tool's own envelope landed. "Consistent units within each pair" has only ever meant mg/dL in practice.

`feua` is the exception and keeps its own narrower fence: its reader states **1 to 500 mg/dL**, which is a
validated population ([spec-v1781](spec-v1781.md)), so it declares 500 as a literal. Only the ceiling — at a
urine creatinine of exactly 1 its fractional excretion leaves the range the tool reports, which is the
unanswerable-edge case [spec-v1822](spec-v1822.md) describes.

## A field whose unit is borrowed has no unit of its own

The new envelope immediately claimed `urine-calcium-cr`'s creatinine, whose label reads *"spot; same mass
unit as calcium"* — and `scr` had long been claiming `hdmtx-leucovorin-rescue`'s baseline creatinine,
labelled *"same unit as the current value"*, where the paired level can be micromolar. **17 fields** say
this in their label, and a mg/dL fence on an unstated unit is [spec-v1205](spec-v1205.md)'s trap exactly —
the reason [spec-v1237](spec-v1237.md) left `lipi` without one.

`scripts/lib/quantity-name.mjs` disqualifies them now, in the same shape as its compartment and
`NOT_THE_TOTAL` rules. It changes no declaration: neither of the two matched fields declared an envelope, and
the second states a literal 0 to 2,000 covering both units, which is the right handling.

Three tools keep the shared-unit reading on purpose — `cccr`, `tmp-gfr` and `urine-calcium-cr` ask for the
creatinine in whatever unit its partner uses, and no unit-specific fence can apply to them.

## The count caught itself

[spec-v1823](spec-v1823.md) added a test reading CONTRIBUTING.md's envelope count against
`Object.keys(BOUNDS).length`, after finding the prose stale at 45 against 47. One spec later it failed at
**47 against 48** — on the first envelope added after it existed. That is the whole return on a gate: the
drift it catches is the next one, not the one that prompted it.
