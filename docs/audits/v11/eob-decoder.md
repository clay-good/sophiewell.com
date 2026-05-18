# v11 audit - Explanation of Benefits Decoder (`eob-decoder`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: X12 Claim Adjustment Reason Codes (CARC) and Remittance Advice Remark Codes (RARC), maintained under HIPAA Transaction & Code Set rules per 45 CFR 162. Code lists are public-domain externally maintained by WPC/X12. Backed by `data/crosswalks/carc.json` and `data/crosswalks/rarc.json`.

## Boundary examples added
- META example: an EOB string with "Allowed: $185.00 / Plan paid: $148.00 / Adjustment: $37.00 / Patient responsibility: $37.00 / CARC 45 RARC N143" -> renderer parses each dollar amount, looks up CARC 45 and RARC N143 in the bundled crosswalks, and emits authoritative descriptors plus a plain-English summary.
- Arithmetic check: allowed $185 = plan-paid $148 + adjustment $37 (passes the internal consistency check the renderer performs).

## Cross-implementation differential
- N/A (parser + lookup, no numeric formula). The CARC/RARC lookups draw from the bundled X12 crosswalks audited under [[carc]] and [[rarc]].

## Edge-input handling notes
- Multi-line EOB strings are parsed line-by-line; lines that look like dollar amounts are summed and reconciled; CARC/RARC codes are matched by regex and looked up.
- Plain-English summaries are by the project author (not X12-licensed long descriptors).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- One labelled textarea; output region lists parsed fields and code definitions. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
