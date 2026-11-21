# spec-v1757 — Dates that passed while the copy still said "is due"

> Status: **SHIPPED (2026-11-21)**: 3 tools. The catalog stays 2,387.

Main's nightly CI went red on November 19 with no new commit: the state-law ledger row for
`nurse-license-training-requirements` was due for review on November 18, the day after New York's deadline for the
updated child-abuse course. The tool reads no clock, so it kept saying the course "is due by November 17, 2026".

| Tool | Before | Now | Source re-read |
|---|---|---|---|
| `nurse-license-training-requirements` | "is due by November 17, 2026" | "was due by November 17, 2026. If it is not done, take it now." Ledger review moves to 2027-01-02 | NYSED Office of the Professions page, 2026-11-21: deadline unchanged, no extension |
| `entity-340b` (Part D) | "The CY2027 physician fee schedule proposed rule would require submission ... check the final rule." | Mandatory from January 1, 2027; Q1 and Q2 2027 due together by September 30, 2027; each later quarter within one calendar quarter after it closes | Final rule, 91 FR 70992 (November 9, 2026), pages 71311-71312; 42 CFR 428.203 |
| `anticoag-reversal` (andexanet note) | FDA said "it will no longer be manufactured ... after December 22, 2025" | "would" (reported speech; the date has passed) | wording only |

Checked and left alone: DEA's telemedicine rule (21 CFR 1307.41) still expires at the end of December 31, 2026 (no
fifth extension in the Federal Register as of 2026-11-21, and the tool already hedges past that date). The California
psychiatric staffing emergency rule (22 CCR 71215.1) has no readoption notice yet; its ledger row stays due
2026-11-28.

## The finder

Only state-law tools have a ledger date, so a federal rule, a payer program or an FDA notice goes stale with
nothing to catch it. `scripts/probe-dated-claims.mjs` lists every non-comment line in `lib/`, `views/` and
`mcp/adapters/` where a date on or before today sits beside future-tense words ("is due by", "will", "takes
effect", "until", "proposed rule"). `--ahead 30` adds the next month's dates. At this spec it lists 20 rows; the
rest are worked examples built from their own dates, or branches that compare against an entered date.

Tests: `test/unit/nurse-training-v1397.test.js` expects the past tense; a new `entity-340b-v1509` case pins the
final rule.
