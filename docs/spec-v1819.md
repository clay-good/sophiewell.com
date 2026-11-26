# spec-v1819 — A year has at most 366 days

> Status: **SHIPPED (2026-11-26)**: the "entered, and asked for again" category goes from **12 to 9**, and
> the three that moved needed no clinical judgement at all. 2 library files, 1 adapter, 2 tests. No
> published number changed; the catalog stays 2,390.

## What was left after five waves

[spec-v1806](spec-v1806.md) through [spec-v1811](spec-v1811.md) took this category from 225 rows to 12, and
stopped on the rule that a ceiling is a clinical judgement belonging with its source
([spec-v1206](spec-v1206.md)). Reading the 12 split them in two.

**Five state their own range and were already fine.** *"Enter the days supplied, from 1 to 365"*,
*"Enter the sampling rate in samples per second (Hz), from 16 to 20,000"*, *"Enter the Breslow thickness in
mm (greater than 0, at most 100)"* — a reader who typed 999999 is told what the range is. They are in the
category only because a blank field gets the same sentence, which is right.

**Four answer with a LIST of fields** and say nothing about the one that was impossible. Those are the rows
worth having, and three of them needed no number anybody has to source.

## The two that moved

**`ilae-surgical-outcome`** classifies an epilepsy-surgery outcome from **seizure days per year**. Its
reader capped that at 100,000, so 999999 read as blank and the tool answered *"Enter current seizure
days/year and baseline (preoperative) seizure days/year (> 0), and mark seizure-free / auras-only"* — four
fields named, none of them the problem. A year has at most **366** days. That is arithmetic, not a clinical
cutoff, so it belongs here rather than with a source, and both surfaces state it; the baseline keeps its
`exclusiveMin`, because the classification divides by it.

**`lipi`** computes the dNLR as `ANC / (WBC − ANC)`. One branch answered a **missing** count and an
**impossible pair** with the same sentence, so an ANC of 999999 beside a white count of 7 was told to
*"Enter absolute neutrophil count and total WBC"*.

[spec-v1237](spec-v1237.md) decided there is no **envelope** for either count here, and that still holds:
the tile fixes the unit of neither (its own message asks for them "same units, whichever those are"), and a
unit-specific ceiling on a field whose unit is unstated is [spec-v1205](spec-v1205.md)'s trap exactly. But
**the order needs no unit.** The white count includes the neutrophils, so it has to be the larger, and the
dNLR divides by the difference — the relation is the arithmetic. `orderFault` says it:

> The absolute neutrophil count (999999) is above the total white count (7); the dNLR divides by the
> difference, so the white count includes the neutrophils and has to be the larger. Check the values entered.

A genuinely missing count still asks for it, which the test pins in both directions.

## What is left

Nine rows. `dose-index` wants a ceiling for an FEV1 percent predicted and a yearly exacerbation count, and
`denial-next-step` wants the bound of a claim adjustment reason code — a number that lives in a code set
rather than in a range. Those are the sourced kind, and spec-v1206's rule still applies to them.
