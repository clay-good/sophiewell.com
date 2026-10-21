# spec-v1670 — Independent review of the record, file-intake and coverage tools (v1600 to v1626)

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1669](spec-v1669.md).

Two reviewers ran the library modules behind spec-v1600 to v1626 (they carry no version suffix) on edge inputs.
Fifteen defects are fixed.

| Tool or module | Input | Was | Now |
|---|---|---|---|
| `lib/record-units.js` | calcium 5 mEq/L from a record | read as 5 mmol/L: 20.04 mg/dL (calcium is divalent; 5 mEq/L is 10.02 mg/dL) | mEq/L converts only where a concept lists it (sodium, potassium, chloride, bicarbonate); calcium in mEq/L is shown, not filled |
| claims, itemized-bill and pharmacy-spread readers | "1,250.00" in a comma-and-space line | split into 1 and 250.00 ($1 allowed, 250 units) | `lib/typed-money.js` joins an amount with cents or a dollar sign; a compact line or a bare "1,250" is left as typed |
| `lib/nadac-reference.js` | a blank NADAC price cell | $0 a unit | the row is skipped |
| `lib/mue-reference.js` | a blank MUE cell | MUE 0 | the row is skipped (a real 0 stays 0) |
| `lib/record-ccda.js` | a PQ value with no value attribute | creatinine 0 | not read |
| `lib/record-pick.js` | a creatinine dated 2062 | the "most recent" value | set aside: dated after today |
| `lib/record-pick.js` | a derived eGFR from a 45-month-old creatinine | no note, and today's age | the age at the draw, and the creatinine's age note carried over |
| `claims-pct-medicare` | allowed −50 | "-72.2% of Medicare" | the line is refused as a reversal to net first |
| `medicare-ffs-pa-required` | no state entered | date checks skipped: WISeR, ASC and RSNAT "required" before they began; a phased DMEPOS item "not until" its last phase while live in four states | each program's earliest start is checked; a live phase is reported as such, with its states |
| `preventive-owed` | Medicare or Medicaid expansion | "your plan must cover at $0" beside "Medicare does not follow this list" | the list is shown for reference, and the band says so |
| `dpc-hsa-check` | $150.004 a month | "$150.00 ... against the limit of $150.00", over | $150.004 |
| `itemized-bill-check` | $100.03 for 3 units at a posted $33.34 | "none above what the hospital posted" | compared as totals in cents: $0.01 above |
| `tic-file-check` | over 100,000 provider group references | the rest silently unchecked | an advisory says so |
| `tic-rate-lookup` | an item with more than 20,000 rates | the rest dropped, no truncation note | flagged as truncated |
| `hsa-predeductible-check` | telehealth, plan year beginning 2019 or 2020; 2022 | "no safe harbor" for 2019; 2020 "applies"; 2022 named only January to March | depends: the CARES Act relief ran from March 27, 2020 for plan years beginning on or before 2021; for a 2022 plan year, any 2023 months were not covered either |

## Proof

`test/unit/review-fixes-v1600-v1626.test.js`; one older test that expected "not" for a 2019 plan year is updated.
