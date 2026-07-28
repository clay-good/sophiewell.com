# spec-v579.md — Robarts Histopathology Index tile

> Status: **SHIPPED (2026-07-28).** Builds the `robarts-index` tile. Catalog **1428 → 1429**, group G.

## Why

A **companion to the Nancy index** shipped in the previous wave — not an alternative spelling of it. Nancy
is a **decision tree** emitting a single grade; Robarts is a **weighted sum**. The two disagree on real
biopsies, so choosing between them is a real choice.

## What it does

**RHI = 1×(chronic infiltrate) + 2×(LP neutrophils) + 3×(epithelial neutrophils) + 5×(erosion).**
Range **0-33**. Remission ≤3, response ≤9.

| Erosion descriptor | Raw | Contributes |
| --- | --- | --- |
| 5.0 No erosion, ulceration or granulation tissue | 0 | 0 |
| 5.1 Recovering epithelium + adjacent inflammation | **1** | 5 |
| 5.2 Probable erosion, focally stripped | **1** | 5 |
| 5.3 Unequivocal erosion | 2 | 10 |
| 5.4 Ulcer or granulation tissue | 3 | 15 |

## The four rules a plausible implementation breaks

**1. The erosion item has five descriptors but only four distinct values.** 5.1 and 5.2 **both** score raw 1
— the map is not injective. A 0-4 enum (five levels, five values) would give an item maximum of 20 and an
overall maximum of **38** against the published 15 and 33. The tile addresses the item **by descriptor**,
and a test computes the wrong maximum a naive implementation would report.

**2. Three Geboes grades contribute nothing.** Architectural change, lamina propria eosinophils and crypt
destruction are each graded 0-3 in the Geboes system the RHI derives from — and *every* level contributes
**0** here, including "severe diffuse architectural abnormality" and "unequivocal crypt destruction". They
are pathology descriptors, not calculator inputs, and are named so nobody hunts for missing fields.

**3. The epithelial-neutrophil bands overlap and leave a hole.** "<5% of crypts" is a strict **subset** of
"<50%", so 3% satisfies two levels at once, and **exactly 50% satisfies neither**. The tile takes the
**level**, not a percentage — a percentage cannot be mapped onto these bands without inventing a rule.

**4. The thresholds are the RHI's, not Geboes'.** Remission ≤3 and response ≤9 here; Geboes uses 2.0 and 3.0
on a differently constructed scale.

## A claimed oddity that did not survive checking

The research note asserted the range was sparse — that a weighted sum over four coarse items would skip most
integers. **It does not.** With these weights the range is fully dense: every integer from 0 to 33 is
attainable. `attainableTotals()` computes it and a test asserts all 34. The property is stated explicitly
*because the intuitive guess is the opposite* — and the claim was removed rather than shipped.

## Scope (spec-v11 §5.3)

A histologic **activity index**. It does **not** diagnose ulcerative colitis and does not separate it from
infectious, ischemic or drug-induced colitis or from Crohn colitis, all of which can show active
inflammation on a biopsy. It does **not** assess dysplasia, a separate reading of the same slide. It does
not measure endoscopic or symptomatic activity — histologic activity persists in patients who look healed
endoscopically. It does not select or escalate therapy.

## Files

- `lib/robarts-index-v579.js` — `robartsIndex()`, the four scored items, `GEBOES_GRADES_CONTRIBUTING_ZERO`,
  `attainableTotals()`, `RHI_MAX`, `REMISSION_MAX`, `RESPONSE_MAX`.
- `views/group-v579.js` (RV579) — the erosion item selected by **descriptor**; the three zero-contributing
  Geboes grades listed as descriptors.
- `mcp/adapters/robarts-index-v579.js` — wave 404.
- `test/unit/robarts-index.test.js` — 17 tests.
- `docs/spec-v579.md` (this file).

## Sourcing (spec-v97)

Transcribed from a review reproducing the already-weighted table and cross-checked against an independent
rendering in raw-score-×-weight form, which agrees on every level including the shared score.

- Mosli MH, Feagan BG, Zou G, et al. *Gut.* 2017;66(1):50-58.
