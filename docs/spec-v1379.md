# spec-v1379 — Medi-Cal TAR rules, and three rules that satisfied their own triggers

Correcting Medi-Cal rules 001–010 against the Medi-Cal Part 1 TAR Overview
turned up a defect in three rules this program shipped in the previous two
slices. Both are fixed here.

## Three rules that could never fire

A packet-declared rule triggers on one list of phrases, then looks for its
required support in a second list. When a support phrase is a substring of a
trigger phrase, the trigger satisfies the check by itself and the rule can never
fire on it:

| Rule | Trigger | Support phrase it already contained |
|---|---|---|
| `R-PA-MCOH-015` (v1376) | "written order required" | "written order" |
| `R-PA-MCOH-017` (v1376) | "transplant evaluation request" | "transplant evaluation" |
| `R-PA-MCIL-009` (v1377) | "less expensive alternative" | "less expensive" |

It surfaced while writing Medi-Cal `010`, which had the same shape before it was
rewritten. The support lists no longer overlap their triggers, and a new test
probes **every** packet-declared rule with a packet holding only one of its
trigger phrases — 68 anchors across the corrected payers — and requires each to
produce a finding. Reintroducing the Ohio overlap turns it red.

## Medi-Cal rules 001–010

Medi-Cal's authorization request is the **Treatment Authorization Request
(TAR)**, and its Part 1 overview is specific:

- `002` asks a TAR for the four items Medi-Cal says it "must include": the
  diagnoses, the practitioner's signed prescription or inpatient doctor's order,
  the medical condition, and the type, number, and frequency of services. A test
  confirms the word "star" no longer reads as "TAR".
- `003` follows Medi-Cal's one real channel rule: "With the exception of drug
  TARs, no reauthorization TARs will be accepted for processing when submitted
  via telephone or fax."
- `005` checks, once a TAR is adjudicated, for the TAR Control Number and its
  Pricing Indicator — a claim without the PI as the 11th digit is denied.
- `006` follows Medi-Cal's inpatient forms (the 18-1 for the days of an emergency
  admission, the 50-1 admit TAR, the 18-3 for mental health) and asks a
  retroactive hospital TAR for the discharge summary consultants start from.
- `009` follows Medi-Cal's setting rule, which runs the other way from
  site-of-care steering: moving an authorized stay to a different facility needs
  a new TAR with written justification.
- `001` and `004` become informational pointers; `007`, `008`, and `010` run only
  on packet-declared workflows, `010` now with the formatted-NDC check.

Fourteen focused tests cover the TAR content, the reauthorization channel rule,
the TCN and Pricing Indicator, the retroactive discharge summary, the facility
change, and the three repaired rules.

The source ledger contains 91 registered authorities: 47 fresh and 44 warning
by age, with no failures, source orphans, or coverage gaps. Registering the TAR
Overview moved the Medi-Cal source to fresh. Rule citations reference 241
distinct URLs, all among the 302 registered and none behind a sign-in wall. Of
876 PA rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,337 PA-engine tests, 14,656 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
