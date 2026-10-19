# Change: Infection prevention and healthcare epidemiology arithmetic

**Status:** Proposed, October 19, 2026. Specs only; nothing here is built.
**Audience:** the infection preventionist, the hospital epidemiologist, the employee-health
nurse, and the antimicrobial stewardship pharmacist.
**Program index:** [docs/spec-v1654.md](../../../docs/spec-v1654.md).

## Why

The catalog carries the NHSN *definitions* (`nhsn-clabsi`, `nhsn-cauti`, the VAE tile, the
C. difficile LabID tile), a device-day counter, defined daily doses per 1,000 patient-days, and a
cumulative antibiogram builder. It carries none of the arithmetic an infection preventionist
does every month once the cases are counted: the standardized infection ratio with its
minimum-precision rule, the device utilization ratio, the infection rate per 1,000 device days,
antimicrobial days per 1,000 days present, hand hygiene compliance, an outbreak's attack-rate
table, and the exposure and exclusion clocks for exposed or infected healthcare personnel.

A name search of the live catalog on October 19, 2026 for "SIR", "standardized infection",
"utilization ratio", "hand hygiene", "attack rate", "days of therapy", "exclusion", "exposure
window", "measles", "varicella", "pertussis" and "mumps" found the two CDC/CSTE case-definition
tiles and the immune-globulin dose tile, and nothing that answers any of the questions above.

Every item is a published formula or a dated CDC table, and every one was read on its own page
on October 19, 2026 (the sources are listed in `design.md` with what was and was not read).

## What changes

Eight new tools, all group J (Immunization & Infectious Disease) except the personnel clock,
which the integrator may place in group H (Workflow & Documentation):

| # | id | Name | Source read |
|---|---|---|---|
| 1 | `nhsn-sir` | Standardized Infection Ratio (Observed Over Predicted) | NHSN SIR Guide, updated March 2024 |
| 2 | `device-utilization-ratio` | Device Utilization Ratio (Device Days Over Patient Days) | NHSN PSC Manual ch. 4, January 2026 |
| 3 | `device-infection-rate` | Device-Associated Infection Rate per 1,000 Device Days | NHSN PSC Manual ch. 4, January 2026 |
| 4 | `antimicrobial-days-rate` | Antimicrobial Days per 1,000 Days Present (NHSN AU Option) | NHSN AU Option training, CDC (build gate on the protocol chapter) |
| 5 | `hand-hygiene-compliance` | Hand Hygiene Compliance Rate From Observed Opportunities | WHO Hand Hygiene Technical Reference Manual 2009 (build gate: not opened) |
| 6 | `outbreak-attack-rate-table` | Outbreak Attack-Rate Table From a Line List | CDC *Principles of Epidemiology*, 3rd ed., Lesson 3 §2 |
| 7 | `hcp-exposure-clock` | Healthcare Personnel Exposure: Monitoring and Exclusion Dates | CDC *Infection Control in Healthcare Personnel*, summary updated August 31, 2026 |
| 8 | `hcp-illness-return-date` | Healthcare Personnel Illness: Earliest Return Date | same CDC summary |

Two of the eight carry a build gate (tools 4 and 5) because the primary document was not
opened; their arithmetic is specified and their source sentence must be read before shipping.

## Why this passes the admission rule

Each tool takes counts or dates the reader already has and returns a number or a date with the
rule that produced it. None is a table: `hcp-exposure-clock` is a date computation over a
pathogen's window, not a reprint of the CDC table, and the SIR tool enforces the "no SIR below
1.0 predicted" rule rather than printing a quotient. No tool recommends an isolation order, a
drug, or a staffing decision; each reports what the cited rule says for the inputs.

## What this does not do

- It does not compute the *predicted* count behind an SIR. That number comes from NHSN's
  negative-binomial and logistic models over 2015 baseline data, and the facility reads it off
  its own NHSN report. The tool takes it as an input and says so.
- It does not compute a SAAR, a SUR, or any risk-adjusted expectation. Same reason.
- It does not store a line list, a roster or a surveillance log. Files are read in the browser
  and nothing persists (the standing no-persistence decision in `docs/product-decisions.md`).
- It does not decide whether an employee is immune; immunity status is an input, with the
  CDC's presumptive-evidence list quoted beside the control.

## Impact

- New capability `infection-prevention-metrics` (this change's `specs/` folder).
- At build: eight lib modules, eight renderers, eight META entries with worked examples, eight
  MCP adapters, synonym rows, and the count surfaces (`node scripts/check-catalog-truth.mjs`).
- No existing tile changes. `device-day-counter` (the CDC device-day counter already live) is
  the natural neighbor of tools 2 and 3; the integrator should cross-link them in `META.related`.
