# Change: Occupational and employee health rules as arithmetic

**Status:** Built October 19, 2026: all six tools shipped, recorded in [docs/spec-v1656.md](../../../docs/spec-v1656.md),
which lists every change from this proposal (Stage 3 is written "and" in the appendix).
**Audience:** the occupational health nurse, the employee health clinic, the certified
medical examiner for commercial drivers, the audiometric technician, and the worker reading
a hearing test or a blood lead result.
**Program index:** [docs/spec-v1654.md](../../../docs/spec-v1654.md).

## Why

The catalog serves occupational health at its edges: `noise-exposure` (the OSHA permissible
exposure table), `niosh-lifting`, `heat-index`, `wbgt`, the Cal/OSHA heat and smoke triggers,
`bbp-exposure` and `hiv-pep-occupational`, and the CDC blood lead reference value for
children. A name search on October 19, 2026 for "threshold shift", "hearing conservation",
"noise dose", "medical removal", "blood lead" (adult), "FMCSA", "CDL", "commercial driver",
"cadmium" and "return to work" found nothing for the rules an employee health program applies
daily: the OSHA noise dose and time-weighted average from a day's exposures, the standard
threshold shift with the regulation's age-correction tables, the lead standard's medical removal
and monitoring triggers, and the commercial driver certification intervals for blood pressure.

Each is a federal regulation or its official advisory criteria, read in full for this spec on
October 19, 2026 (29 CFR 1910.95 and its Appendices A and F; 29 CFR 1910.1025; 49 CFR Part 391
Appendix A as amended at 89 FR 3579, January 19, 2024).

## What changes

Six new tools, group H (Workflow & Documentation), beside the Cal/OSHA tiles:

| # | id | Name | Source |
|---|---|---|---|
| 1 | `osha-noise-dose` | OSHA Noise Dose and 8-Hour TWA From a Day's Exposures (29 CFR 1910.95 App. A) | read |
| 2 | `osha-standard-threshold-shift` | Standard Threshold Shift With Age Correction (29 CFR 1910.95(g)(10), App. F) | read, tables F-1 and F-2 in full |
| 3 | `osha-lead-medical-removal` | Lead Standard: Blood Lead Monitoring Frequency and Medical Removal (29 CFR 1910.1025) | read |
| 4 | `fmcsa-bp-certification` | Commercial Driver Blood Pressure Certification Interval (49 CFR 391 App. A) | read |
| 5 | `fmcsa-hearing-standard` | Commercial Driver Hearing Standard: Whisper Test and ISO-to-ANSI Audiometric Average (49 CFR 391.41(b)(11)) | read in part; build gate on the 40 dB figure in §391.41(b)(11) |
| 6 | `osha-lead-airborne-pel-shift` | Lead Airborne Limit for a Shift Longer Than 8 Hours (29 CFR 1910.1025(c)(2)) | read |

## Why this passes the admission rule

Each tool applies a CFR paragraph or table to the reader's measurements and returns the
regulation's answer with the paragraph cited. The age-correction tables are a non-mandatory
appendix of the regulation itself, reproduced in full with the reader's choice to apply them.
No tool decides fitness for duty; each reports what the rule says for the numbers.

## What this does not do

- It does not compute OSHA recordability (29 CFR 1904), a judgment over the whole case.
- It does not cover the cadmium, benzene, asbestos or silica standards' medical triggers until
  those sections are read; each is a natural follow-on with the same shape.
- It does not cover the FMCSA vision standard until §391.41(b)(10) is read (the appendix read
  does not contain it) or diabetes certification (the 2018 rule's forms are judgment over the
  record).

## Impact

- New capability `occupational-employee-health`.
- `noise-exposure` (live) and tool 1 are neighbors: the live tile states the permissible
  durations; tool 1 computes the dose over a day. Cross-link; consider folding the table into
  tool 1's page at build.
- `pure-tone-average` (live) and tool 5 share the audiometric average arithmetic; reuse.
