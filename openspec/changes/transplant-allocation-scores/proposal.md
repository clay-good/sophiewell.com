# Change: Transplant allocation scores and ischemia clocks

**Status:** Partly built October 19, 2026: tools 3 and 4 shipped ([docs/spec-v1661.md](../../../docs/spec-v1661.md)).
KDPI and EPTS (tools 1 and 2) wait for a human download of the OPTN guides.
scores are build-gated**: the OPTN guides that print their formulas returned HTTP 403 to every
fetch attempted for this spec, so no coefficient is stated here.
**Audience:** the transplant coordinator, the organ procurement organization staff, the
nephrologist and the patient reading an offer.
**Program index:** [docs/spec-v1654.md](../../../docs/spec-v1654.md).

## Why

The catalog has the liver side of allocation (`meld3`, `meld-na`, `peld-score`, Milan, UCSF,
Up-to-Seven) and the rejection grading schemes. A name search of the live catalog on
October 19, 2026 for "KDPI", "KDRI", "EPTS", "cold ischemia", "donor" and "living donor" found
nothing on the kidney side: no Kidney Donor Profile Index, no Estimated Post-Transplant Survival
score, and no ischemia-time clock.

Both scores are published by the OPTN with every coefficient, a worked example and an annual
mapping table ("A Guide to Calculating and Interpreting the Kidney Donor Profile Index",
updated October 10, 2024 after race and hepatitis C were removed from the KDRI; "A Guide to
Calculating and Interpreting the Estimated Post-Transplant Survival Score", updated
April 21, 2025). They are deterministic, cited, and already shown to candidates on every offer.

## What changes

Four new tools, group E (Clinical Math & Conversions):

| # | id | Name | Source |
|---|---|---|---|
| 1 | `kdri-kdpi` | Kidney Donor Risk Index and Profile Index (OPTN) | OPTN KDPI guide, October 2024 (**not opened: 403**; build gate) |
| 2 | `epts-score` | Estimated Post-Transplant Survival Score (OPTN) | OPTN EPTS guide, April 2025 (**not opened: 403**; build gate) |
| 3 | `ischemia-time-clock` | Cold and Warm Ischemia Time From Clamp, Flush and Reperfusion Times | arithmetic identity over timestamps; OPTN data definitions (build gate on the definitions) |
| 4 | `donor-recipient-size-match` | Donor-to-Recipient Weight and Height Ratios | arithmetic identity |

## What the search established about the scores

- KDPI combines eight donor factors since October 2024; the earlier ten included race and
  hepatitis C, now removed (OPTN "Learn about KDPI" page, as summarized by the search; not
  opened).
- The June 2024 OPTN policy notice (policy 8.4.B) gives the steps: sum the KDRI components,
  take the antilog, divide by the median KDRI of the reference population, map to KDPI by the
  annual table. The notice shows the pre-refit hepatitis C coefficient (0.2400), so it is not
  the current formula.
- EPTS uses four factors: time on dialysis, diabetes, prior solid organ transplant, age; the
  raw value maps to a percentage by an annually updated table; 20% is the allocation threshold.
- Both mapping tables change every year. Each is a dated constant that must be fetched,
  hashed and printed with its vintage (spec-v1614), never typed.

## Why this passes the admission rule

Each score is a published, deterministic formula over inputs the coordinator has. Each ships
only after its guide is read, with the guide's worked example as the test. The mapping tables
are versioned data. No tool ranks candidates or recommends acceptance; each reports the number
the OPTN would print and what the guide says it means.

## Impact

- New capability `transplant-allocation-scores`.
- A build session must obtain the two guides (a browser download works where the fetchers
  were refused; the owner saved an ASHP PDF by hand for spec-v1636 the same way).
