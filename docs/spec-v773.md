# spec-v773.md — CTS-6 (carpal tunnel syndrome clinical diagnosis)

> Status: **SHIPPED (2026-08-26).** Builds the `cts6` tile. Catalog **1564 → 1565**, group G.

## Why

Carpal tunnel syndrome is one of the most common conditions a primary-care, hand or
occupational clinician sees, and the catalog had **nothing** for it — no diagnostic score, no
severity instrument. The only carpal entry was `geissler-carpal`, a ligament-injury
classification. CTS-6 is the standard bedside score for "how likely is this actually carpal
tunnel before I order a nerve conduction study."

## What it does

Six weighted clinical findings, summed (maximum 26):

| Finding | Points |
| --- | --- |
| Numbness mainly or only in the median nerve territory | 3.5 |
| Numbness at night | 4 |
| Thenar atrophy or weakness | 5 |
| Positive Phalen test | 5 |
| Loss of 2-point discrimination in the median territory | 4.5 |
| Positive Tinel sign | 4 |

**Interpretation:** a total above 12 corresponds to roughly an 80% probability of carpal
tunnel syndrome; a total above 5 to roughly 25%, rising with the total.

**Worked example:** median-territory numbness + numbness at night + a positive Phalen test
= 3.5 + 4 + 5 = **12.5 of 26**, high likelihood.

## Posture (spec-v97)

CTS-6 estimates the probability of a *clinical* diagnosis. It is not a nerve conduction
study, not a severity grade, and not an order for splinting, injection or surgery.

## Files

- `lib/cts6-v773.js` — `cts6()`, `CTS6_NOTE`.
- `views/group-v773.js` (RV773) — six checkboxes; a11y-checked, no innerHTML.
- `mcp/adapters/cts6-v773.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, weights + thresholds, related (quickdash, geissler-carpal, onls).
- `test/unit/cts6.test.js` — 5 tests (0, 3.5, 7.5, the 12.5 worked example, 26 maximum).
- `docs/spec-v773.md` (this file).

## Sourcing (spec-v97)

Graham B, Regehr G, Naglie G, Wright JG. Development and validation of diagnostic criteria for
carpal tunnel syndrome. *J Hand Surg Am.* 2006;31(6):919-924 (PMID 16843150). The six item
weights (3.5 / 4 / 5 / 5 / 4.5 / 4) and the >12 and >5 probability thresholds were confirmed
against two independent reproductions of the original Table 1, which agreed item-for-item.
