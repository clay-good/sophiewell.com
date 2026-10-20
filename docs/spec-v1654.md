# spec-v1654 — Seven expansion programs, proposed as OpenSpec changes

> Status: **PROPOSED (2026-10-19).** Specs only. Nothing here is built, and no catalog count moves.
>
> Correction, the same day: infection-prevention-metrics tool 4 duplicated the live `au-rate-saar`, which a
> name search for "days of therapy" missed. It was dropped at build; [spec-v1655](spec-v1655.md) records the build.
>
> occupational-employee-health was built the same day, all six tools; [spec-v1656](spec-v1656.md) records it.
>
> unit-operations-metrics was built the same day, eleven of twelve tools; [spec-v1657](spec-v1657.md) records it.
>
> laboratory-quality-control was built the same day, five tools; [spec-v1658](spec-v1658.md) records it.
>
> Second correction, the same day: every proposed tool in the other six changes was re-checked against live
> names, agent summaries and citations, and each near neighbor was run. Two more were dropped:
> genetic-counseling-risk's `screen-ppv-from-prior` duplicates `fagan-post-test`, and
> laboratory-quality-control's `total-error-vs-clia` overlaps `sigma-metric` and `biological-variation-goals`.
> unit-operations-metrics now names `nursing-home-staffing-check` as the neighbor of its PBJ tool. The table
> below carries the corrected counts.

## What this is

Seven change proposals under `openspec/changes/`, each a program for an audience the catalog
serves thinly or not at all. Each follows the structured format the project adopted for
discrete capability proposals (`proposal.md`, `design.md`, `tasks.md`, and a `specs/<capability>/spec.md`
with requirements and scenarios), and each keeps the standing rules: an input and a computed
output, a named primary source read on its own page, deterministic, no network, no account, no
benchmark or recommendation, and a number is specified only if it was read. Where a source could
not be opened on October 19, 2026, the design says so and the tool is a build gate.

The scope does not change. These add to what the site does for the people already named in the
README (the nurse, the pharmacist, the laboratory, quality and safety); they do not add a model, a
feed, a licensed table, or a tool whose correctness decays within a year (spec-v5 §6 is unchanged).

## The seven

| Change | Audience | New tools | Of which build-gated | The source read |
|---|---|---|---|---|
| [infection-prevention-metrics](../openspec/changes/infection-prevention-metrics/proposal.md) | infection preventionist, employee health, stewardship | 7 (6 built) | 1 | NHSN SIR Guide (March 2024); NHSN PSC Manual ch. 4 and 16 (January 2026); CDC *Infection Control in Healthcare Personnel* summary (updated August 31, 2026); CDC *Principles of Epidemiology* Lesson 3 |
| [public-health-epidemiology](../openspec/changes/public-health-epidemiology/proposal.md) | health department, public health nurse, quality analyst | 11 | 6 | CDC *Principles of Epidemiology*, 3rd ed., Lesson 3 §2, §3, §5, §6 |
| [unit-operations-metrics](../openspec/changes/unit-operations-metrics/proposal.md) | nurse manager, nursing home DON and administrator | 12 | 3 | CMS Nursing Home Five-Star Technical Users' Guide (September 2026), including the staffing cut points; CMS Hospital Cost Report Data Dictionary |
| [laboratory-quality-control](../openspec/changes/laboratory-quality-control/proposal.md) | bench technologist, laboratory quality manager, point-of-care coordinator | 6 | 3 | 42 CFR 493.931 and 493.941 (eCFR, as amended 2022), read in full; Westgard's rule set as restated by its author |
| [genetic-counseling-risk](../openspec/changes/genetic-counseling-risk/proposal.md) | genetic counselor, prenatal and pediatric clinicians, patients | 6 | 4 presets | Hardy 1908, Bayes 1763, Wright 1922 (cited; to be read at build) |
| [transplant-allocation-scores](../openspec/changes/transplant-allocation-scores/proposal.md) | transplant coordinator, OPO, nephrology | 4 | 2 | The OPTN KDPI and EPTS guides returned 403 to every fetch; no coefficient is stated |
| [occupational-employee-health](../openspec/changes/occupational-employee-health/proposal.md) | occupational health nurse, certified medical examiner, audiometric technician | 6 | 2 partial | 29 CFR 1910.95 with Appendices A and F (age-correction tables in full); 29 CFR 1910.1025; 49 CFR Part 391 Appendix A (as amended January 19, 2024) |

Fifty-two tools after the corrections above (fifty-five as first proposed). Every id was checked against
the live catalog, `app.js` and the agent registry on October 19, 2026, and none collides; the subjects were
re-checked the same day, which found the three duplicates.

## How the gaps were found

The live catalog (every id and name from `UTILITIES`) was swept by audience with the domain
words each audience uses, and every near neighbor was read by name before a tool was called
absent. The sweep that produced these seven also showed where the catalog is already deep and
where a program would duplicate it: respiratory therapy, rehabilitation measures, dentistry,
audiology and optometry, dialysis, anesthesia airway and reversal, wound and burn care, sleep,
EMS triage and the WHO field programs all returned long lists of live tools and were left alone.

## What a build session does first

1. Read each change's `tasks.md` section 1 (the gated sources) before writing a lib. A gated
   tool ships only after its checkbox is ticked with what was read.
2. Build in the order the programs are independent: any change can go first; none depends on
   another. Two shared functions are named so they are written once: observed-over-expected
   (`nhsn-sir` and `smr`) and the laboratory statistics helper (`levey-jennings-limits`,
   `calibration-verification`, `turnaround-time-percentile`, and `bland-altman` where it already
   has them).
3. Record the build in a new `docs/spec-vNNNN.md` per change, with the edition or point-in-time
   date of every source transcribed, as the pharmacy and public-utility programs did.

## What was deliberately left out of these seven

| Idea | Why |
|---|---|
| Blood bank dosing (component increments, massive-transfusion ratios beyond the live tile) | the AABB Technical Manual is licensed; the open arithmetic is already live (the Corrected Count Increment tile) or is a rule of thumb without a primary source |
| Sports and exercise prescription (target heart rate, one-repetition maximum, sweat rate) | prescriptive by nature; the catalog computes, it does not prescribe |
| OSHA recordability, fitness-for-duty, return-to-work decisions | judgment over the case, not arithmetic over the inputs |
| A payer, hospital or nursing-home ranking | a model with hidden weights; the Five-Star tool applies CMS's published cut points to the reader's own numbers and says so |
| Risk-adjusted expectations (NHSN predicted counts, SAAR, SUR, hospital expected mortality) | models over data the reader cannot see; the tools take the published expected count as input |
| Westgard three-material rules, CLIA specialties beyond chemistry and hematology, cadmium and silica medical triggers, the FMCSA vision standard | not yet read; each is a natural follow-on in the same shape once its section is read |
