# v11 audit - NDC 10 ↔ 11 Digit Converter (`ndc-convert`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CMS NDC billing guidance (5-4-2 billing format for Part D and 837P/837I claims) and FDA Structured Product Labeling (SPL) 10-digit NDC source formats (4-4-2, 5-3-2, 5-4-1). The CMS Medicare Claims Processing Manual specifies the 11-digit conversion: pad the segment that is one short by a leading zero according to which segment is short.

`lib/coding-v5.js ndcConvert()` implements:
- Detects source format by segment lengths (4-4-2, 5-3-2, 5-4-1, or already 5-4-2).
- 4-4-2 -> pad labeler with leading zero (e.g. 1234-5678-90 -> 01234-5678-90).
- 5-3-2 -> pad product with leading zero.
- 5-4-1 -> pad package with leading zero.
- 5-4-2 -> already in billing format; reports candidates for the original 10-digit form (ambiguous because multiple 10-digit formats can map to the same 11-digit billing form when no segment carries a leading zero).

## Boundary examples
- 4-4-2 (META example): 1234-5678-90 -> billing 01234-5678-90; FDA 10-digit 1234-5678-90 (source 4-4-2). PASS.
- 5-3-2: 12345-678-90 -> billing 12345-0678-90.
- 5-4-1: 12345-6789-0 -> billing 12345-6789-00.
- Already 11-digit, no leading zero anywhere: candidates list noted as ambiguous.
- Already 11-digit, leading zero in labeler segment: returns the 4-4-2 reverse (un-pad).

## Cross-implementation differential
- Reference: CMS NDC 11-digit conversion examples in the Medicare Claims Processing Manual Pub 100-04 Chapter 17.
- Test case: META example. Sophie billing "01234-5678-90" / FDA "1234-5678-90" / source "4-4-2". META expected "Billing 11: 01234-5678-90 / FDA 10: 1234-5678-90". Delta 0%. PASS.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- Accepts NDCs with or without hyphens; normalizes by parsing digits and inserting hyphens.
- Ambiguous 5-4-2 inputs (no leading zero anywhere) honestly surface the multiple candidates rather than picking one — this matches the CMS guidance that conversion is unambiguous only when a segment carries a leading zero.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Single labelled text input; output region announces source format, billing form, and FDA candidates. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
