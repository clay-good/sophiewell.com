# spec-v1811 — The guard the next wave wrote twice

> Status: **SHIPPED (2026-11-26)**: the strong "entered, and asked for again" category goes from **21 to
> 12**. Two kinds of change: 17 functions carrying two generated range checks are merged into one that
> keeps the tighter edge of each pair, and four fields take a ceiling that was already a literal in the
> library's own reader. 21 files. No tool's arithmetic changed; the catalog stays 2,390.

## Two waves, one function, and the second one dead

Five waves have placed a generated range check into a library function. [spec-v1806](spec-v1806.md) through
spec-v1808 placed each one **before the first `=== null`**; [spec-v1809](spec-v1809.md) replaced that rule
with **before the branch that returns the sentence**, because the first rule had misfired three times.

Both rules are right about where a check goes. Neither noticed that the *other* wave had already put one
there. In 17 functions the two blocks sit a few lines apart, and **only the first one ever runs** — so a
field whose edge the later wave tightened kept the earlier, looser edge, and the probe kept reporting it.

The merge is mechanical and it has one rule: for each argument, keep the **tighter** edge of the two blocks,
and carry over any argument only the later block names. A first attempt kept the *last* block instead,
which looks equivalent and is not: it dropped nine tightened edges, and the finder went from 18 rows back
to 27 in the same run that was meant to clear them. That is the whole lesson of this wave — **when a
codemod rewrites a hundred call sites, the finder is the only reader who checks all hundred.**

## Four ceilings that were already written down

[spec-v1810](spec-v1810.md) took every ceiling the agent surface declared. Four of the remaining rows have
a ceiling in a third place: **the library's own reader**, as a literal argument.

| Tool | Field | The reader | Now refused as |
|---|---|---|---|
| `capra-score` | positive biopsy cores | `cores > 100` in the asking branch | 0 to 100 (a percent) |
| `eutos` | basophils, spleen size | `nonNeg(o.basophils, 100)`, `nonNeg(o.spleenCm, 40)` | 0 to 100, 0 to 40 |
| `maximum-operating-depth` | FO2, PO2 limit | `fin(o.fo2, 0.21, 1)`, `fin(o.po2max, 1.0, 2.0)` | 0.21 to 1, 1 to 2 |
| `dpc-hsa-check` | year | `year < 2026 \|\| year > 2100` | 2026 to 2100, a whole number |

Each tool already refused those values. It refused them with the sentence an **empty** box gets — *"Enter
age, PSA (ng/mL), ... and the percent of positive biopsy cores (0-100)"* for a `cores` of 150 — which is
the shape this family of waves exists to remove. The number did not move; the sentence did.

All four are now stated on the agent surface too, so the pair lives in one place and
`probe-declared-cap-configs` drives it. `maximum-operating-depth` is the clean case: its sibling
`equivalent-air-depth` **already declared** `min: 0.21, max: 1` for the same oxygen fraction, so the
declaration was not a new opinion, it was the one the catalog had already formed about the same quantity.

## What is left

12 rows. Every one needs a **sourced clinical ceiling** — an exacerbation count, a Breslow thickness, an
FEV1 percent predicted, a sampling rate — and [spec-v1206](spec-v1206.md) settled that such a choice
belongs with its source rather than with a wave. The codemod has taken what a codemod can; what is left is
reading.
