# spec-v1816 — Thirty-eight instruments that turn on purpose

> Status: **SHIPPED (2026-11-26)**: `probe-reversal`'s 97 outputs across 39 calculators are read and judged,
> and the finder is gated at zero — the 31st. Every row is a false positive of the honest kind its own
> header predicted; the 25 calculators that had appeared since its first review are read here for the first
> time. No library file changed. The catalog stays 2,390.

## What the probe is for

[spec-v1718](spec-v1718.md) built it after `kdri-kdpi`: OPTN's two creatinine terms sum to a slope of
**−0.0071 per mg/dL** above 1.5, so the published formula FALLS as creatinine rises, and without the guide's
cap at 8 the guide's own donor read **KDPI 67% at a creatinine of 1.7 and 54% at 20** — a sicker kidney
reported as a better one. The shape is findable without reading a source: one clean turn that runs on to the
edge of the range is the smell of a cap nobody read.

Its first run read 93 rows across 37 calculators and found exactly one defect
(`bess-balance-error`, whose `errs()` returned 0 for a value it did not like, so 11 errors on a stance
scored as none). It has been at 93-97 rows since, and the 25 calculators that arrived after that review had
never been read.

## The honest false-positive profile, written down

Every one of the 97 is a tool turning on purpose, and the reasons collapse to seven. The unit of judgement
is the **calculator**, because each reason is a property of the instrument — `apache2` turns in all
fourteen of its measured outputs for one reason, and nothing is learned by writing it fourteen times.

| Why it turns | Instruments |
|---|---|
| A **symmetric severity score**: points for a value too high *or* too low | APACHE II, SAPS II, NEWS2, MEWS, REMS, LODS, OASIS, PIM3, FGSI, MEOWS, psofa, ISS-RTS, CRUSADE |
| A **banded criterion whose own label states the bands** | CPIS-VAP, refeeding risk, Erez DIC, ARC-HBR, McIsaac, King's College |
| A **published squared, logarithmic or reciprocal term** | predicted spirometry, PALBI, PREVENT, fullPIERS, two-compartment params, static AUCR, T>MIC, vancomycin AUC, delta gap, sample size for a proportion, minimum weighable quantity |
| A **two-sided reference interval** | MGUS risk |
| A **reciprocal of a difference**, turning at its smallest denominator | NNT/ARR, OR-RR to NNT |
| A **distance** between two figures, smallest where they agree | pregnancy dating, INR variability, PPPA packaging, compounding copy check |
| A **policy parameter** driven into an order its author would not write | hospital FAP discount |

Two are worth reading rather than skimming. `niosh-lifting` is in the table as none of these: it **already
says** the cap, in the reading itself — *"The recommended weight limit computes to 0 lb because a vertical
height of 71 inches, beyond the 70 inch limit. That is the equation saying this task is outside what it can
evaluate, not that the safe weight is zero."* And `fap-discount` is the only row where the swept field is
not a measurement: pushing the tier-1 ceiling above the tier-2 ceiling makes a schedule whose discounts rise
with income, and the reading names the tier it used and its discount while the note says the tiers are the
hospital's own policy as entered.

## The count is part of the judgement

A ledger keyed by calculator would hide a **new field** turning in an instrument somebody has already read.
So each entry records how many of that tool's outputs turned when it was judged, and a tool whose count
moves prints again. All three directions were negative-tested: removing an entry, adding a bogus one, and
changing `apache2`'s count from 14 to 13.
