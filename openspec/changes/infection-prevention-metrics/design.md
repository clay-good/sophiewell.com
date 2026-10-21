# Design — Infection prevention and healthcare epidemiology arithmetic

Every number below was read on the page named on October 19, 2026, unless the line says
"not opened". A number not read is a build gate, not a fact. Re-read each at build (the
spec-v97 discipline); the text here is a transcription target.

## Sources read

| Source | What was read | How |
|---|---|---|
| CDC NHSN, *The NHSN Standardized Infection Ratio (SIR): A Guide to the SIR*, "Updated March 2024" | SIR formula; the 1.0-predicted minimum; CAD definition; mid-P exact test for the p-value; the 95% CI rule for SIR = 0 | PDF text extracted and read |
| CDC NHSN Patient Safety Component Manual, chapter 4 (CLABSI), January 2026 | CLABSI rate per 1,000 central line days; "Central Line Utilization Ratio" = central line days ÷ patient days; device days counted once daily at the same time | PDF text extracted and read |
| CDC NHSN PSC Manual chapter 16, *General Key Terms*, January 2026 | device days and patient days definitions; SUR is a modeled quantity (not built) | PDF text extracted and read |
| CDC, *Infection Control in Healthcare Personnel: Epidemiology and Control of Selected Infections*, "Summary of Recommendations", published May 15, 2024, updated August 31, 2026 | every numeric window in the measles, mumps, rubella, varicella-zoster, pertussis, group A streptococcus, diphtheria, meningococcal, parvovirus B19 and viral respiratory sections | page read |
| CDC, *Principles of Epidemiology in Public Health Practice*, 3rd ed., Lesson 3 §2 (archived page) | incidence proportion, overall attack rate, food-specific attack rate, secondary attack rate, with the worked shigellosis and potato-salad examples | page read |
| CDC NHSN AU Option training materials (2020 and 2022 decks, via search summary) | "antimicrobial days per 1,000 days present"; days present definition | **not opened**; build gate on PSC Manual chapter 11 |
| WHO *Hand Hygiene Technical Reference Manual* (2009) | compliance = actions ÷ opportunities × 100 | **not opened**; build gate |

## Tools

### 1. `nhsn-sir` — Standardized Infection Ratio (Observed Over Predicted)

**Input.** Observed infections (integer, 0 or more); predicted infections (decimal, from the
facility's NHSN report); optional SIR goal (decimal, default blank).
**Compute.** SIR = observed ÷ predicted. Refuse the ratio when predicted < 1.0 and say why in the
guide's words: "SIRs are currently not calculated when the number of predicted infections is less
than 1.0" (minimum precision criterion). When a goal is entered, CAD = observed − (predicted ×
goal), the guide's cumulative attributable difference, shown as the number of infections to
prevent to reach the goal (negative CAD reads "already below the goal").
**Output.** The SIR to three decimals, the reading (below 1.0: fewer observed than predicted;
1.0: the same; above 1.0: more), the CAD when a goal was given, and the refusal when predicted is
under 1.0 with the guide's three alternatives (a longer period, an infection rate, the TAP report).
**Statistics.** The guide says NHSN computes p-values with a mid-P exact test and reports a 95%
interval, and that when the SIR is 0.000 the lower bound is not calculated. The exact-Poisson
interval for observed ÷ predicted is standard (Garwood 1936; Ulm 1990), but neither paper was
opened. **Build gate on the interval:** ship the interval only after the formula is read in a
source; until then the tool prints the SIR and CAD and says the interval is on the NHSN report.
**Source.** NHSN SIR Guide, March 2024, "How is the SIR calculated?" and the interpretation
section. Worked example in the guide: 5 CLABSIs observed, 2.365 predicted, SIR 2.114.
**Rule.** Observed must be a whole number; predicted may be fractional; a predicted value of 0 is
refused as impossible (a model never predicts exactly 0 over a nonzero denominator).

### 2. `device-utilization-ratio` — Device Utilization Ratio (Device Days Over Patient Days)

**Input.** Device type (central line, urinary catheter, ventilator); device days; patient days;
optional location label.
**Compute.** DUR = device days ÷ patient days. Refuse when device days exceed patient days (a
device day needs a patient day) and when patient days is 0.
**Output.** The ratio to two decimals, read as the share of patient days with the device, and the
manual's caution that DURs are for tracking use over time and internal trends, not comparison
between facilities (the SUR does that and is modeled).
**Source.** NHSN PSC Manual chapter 4, "Device Utilization Ratio", January 2026: "The Central Line
Utilization Ratio is calculated by dividing the number of central line catheter days by the number
of patient days." CAUTI and VAE chapters state the same ratio for their devices; **verify at build**
that chapters 6 (CAUTI) and 10 (VAE) still do, since only chapter 4 was read.
**Note.** The live `device-day-counter` produces the numerator from a daily count; link it.

### 3. `device-infection-rate` — Device-Associated Infection Rate per 1,000 Device Days

**Input.** Infections (integer); device days; device type.
**Compute.** Rate = infections ÷ device days × 1,000.
**Output.** The rate to two decimals with its denominator named ("per 1,000 central line days").
**Source.** NHSN PSC Manual chapter 4: "The CLABSI rate per 1000 central line days is calculated
by dividing the number of CLABSIs by the number of central line days and multiplying the result
by 1000." Same build-time check of chapters 6 and 10 as tool 2.
**Rule.** Infections must not exceed device days; both whole numbers.

### 4. `antimicrobial-days-rate` — Antimicrobial Days per 1,000 Days Present (NHSN AU Option)

**Input.** Antimicrobial days (an agent counted once per patient per calendar day in a location,
whatever the number of doses); days present; optional agent or class label.
**Compute.** Rate = antimicrobial days ÷ days present × 1,000. Refuse when antimicrobial days for
a single agent exceed days present (the AU Option's own validity rule, as the training deck
states it for the SAAR).
**Output.** The rate and the two definitions beside it, so the reader does not use patient days
as the denominator: days present counts a patient in a location at any time during a day, so it
runs higher than patient days.
**Build gate.** The definitions above come from CDC training decks as summarized by a search
result; the NHSN PSC Manual chapter 11 (Antimicrobial Use and Resistance) was not opened. Read
chapter 11's "antimicrobial day" and "days present" definitions and cite the chapter and its
January 2026 date before building.
**Difference from the live tile.** `ddd-rate` (defined daily doses per 100 bed-days and
per 1,000 patient-days) is the WHO ATC/DDD metric; this one is the NHSN days-of-therapy metric.
The page says so and links the other.

### 5. `hand-hygiene-compliance` — Hand Hygiene Compliance Rate From Observed Opportunities

**Input.** Opportunities observed; actions performed (hand rub or wash); optionally the same two
by WHO moment (1 to 5) and by role, each row blank-allowed.
**Compute.** Compliance = actions ÷ opportunities × 100, overall and per row; actions must not
exceed opportunities on any row.
**Output.** The percentage overall and per moment or role, with the number of opportunities
behind each so a 100% on two observations is read as two observations.
**Build gate.** The WHO *Hand Hygiene Technical Reference Manual* (2009) defines opportunity,
action and the compliance formula; it was not opened. Read the formula on the page and cite the
manual's section before building. The tool ships no target rate.

### 6. `outbreak-attack-rate-table` — Outbreak Attack-Rate Table From a Line List

**Input.** A pasted or dropped CSV line list with one column per exposure (ate the item or not,
yes/no) and one column for ill (yes/no); or, without a file, a 2×2 per exposure typed in.
**Compute.** For each exposure: attack rate among exposed = ill exposed ÷ all exposed; among
unexposed = ill unexposed ÷ all unexposed; risk ratio = the former ÷ the latter; risk difference.
Overall attack rate = ill ÷ all persons. Secondary attack rate, when household size and primary
cases are given: cases among contacts ÷ (household members − primary cases).
**Output.** One row per exposure sorted by risk ratio, each with both attack rates, the ratio and
the counts behind them; the overall attack rate; the secondary attack rate when asked for.
Intervals for the risk ratio reuse the live `two-by-two-effect` lib so the two tools cannot
disagree.
**Source.** CDC *Principles of Epidemiology*, 3rd ed., Lesson 3 §2, read: food-specific attack
rate (30 ill ÷ 99 who ate the potato salad = 30.3%); overall attack rate (18 ÷ 1,000 = 1.8%);
secondary attack rate (17 ÷ (86 − 18) = 25.0%). Those three are the worked examples.
**Rule.** A row with no exposed or no unexposed persons prints the attack rate it can and leaves
the ratio blank with the reason; the file never leaves the browser and no value enters a link
(the `data-private` convention: `trackHashState` never serializes such fields).

### 7. `hcp-exposure-clock` — Healthcare Personnel Exposure: Monitoring and Exclusion Dates

**Input.** Pathogen (the list below); date of first exposure; date of last exposure (defaults to
the first); presumptive evidence of immunity (yes / no / unknown, with the CDC's evidence list
quoted beside the control); for varicella, whether VariZIG was given; for pertussis, whether
the person works with high-risk patients and whether post-exposure prophylaxis was taken.
**Compute.** From the CDC summary, as read on October 19, 2026:

| Pathogen | Immune, exposed: monitor | Not immune, exposed: exclude |
|---|---|---|
| Measles | day 5 after first exposure through day 21 after last | day 5 through day 21 after last exposure, "regardless of prophylaxis" |
| Mumps | day 10 after first through day 25 after last | day 10 through day 25 after last exposure |
| Rubella | day 7 after first through day 23 after last | day 7 through day 23 after last exposure |
| Varicella-zoster | day 8 after first through day 21 after last | day 8 through day 21 after last exposure; through day 28 if varicella-zoster immune globulin was given; a second vaccine dose within 5 days of exposure (for one prior dose) removes the restriction |
| Pertussis | high-risk contact: prophylaxis, or restrict for 21 days after last exposure; otherwise prophylaxis or daily monitoring for 21 days | same windows |
| Diphtheria | monitor daily for 7 days after last exposure | (not stated as a separate column) |
| Parvovirus B19 | asymptomatic exposed: source control through day 14 after last exposure | (no exclusion stated) |
| Viral respiratory infection | source control from first exposure through at least day 5 after last; monitor at least 5 days after last | (no exclusion stated) |

The tool prints the calendar dates for the window's first and last day, counting "day N after
exposure" with the exposure date as day 0.
**Output.** The dates, the status they apply to, and the CDC sentence they come from. When
immunity is "unknown", both windows print with the instruction to establish immunity first.
**Source.** CDC, *Infection Control in Healthcare Personnel*, "Summary of Recommendations",
updated August 31, 2026 (the page reviewed January 31, 2025). The 1998 guideline is superseded
for these sections; the tool must not cite it.
**Verify at build.** Whether CDC counts the exposure date as day 0 or day 1 (the summary says
"the 5th day after their first exposure"; read the measles section's own example if it has one).
The pertussis section's own wording on who counts as high-risk.
**Watch.** A dated constant: the page carries an "updated" date; the tool's page prints it and
the weekly refresh compares the page's last-updated field; a change stops the tool from
answering until re-read (the spec-v1501 §2 fail-closed rule).

### 8. `hcp-illness-return-date` — Healthcare Personnel Illness: Earliest Return Date

**Input.** Condition; the anchor date it needs (rash onset, parotitis or symptom onset, cough
onset, start of effective antimicrobial therapy, the date lesions dried and crusted); for
respiratory illness, the date the person was last febrile and whether symptoms are improving.
**Compute.** From the same CDC summary:

| Condition | Exclude until |
|---|---|
| Measles (case) | 4 days after the rash appears |
| Mumps with parotitis | 5 days after parotitis onset; without parotitis, 5 days after first symptom |
| Rubella (case) | 7 days after the rash appears |
| Varicella / disseminated zoster | lesions dried and crusted; non-vesicular lesions: no new lesions in 24 hours |
| Pertussis (symptomatic) | 21 days from cough onset, or 5 days after starting effective antimicrobial therapy, whichever comes first |
| Group A streptococcus | infection ruled out, or 24 hours after starting effective therapy |
| Meningococcal disease | 24 hours after starting effective therapy |
| Diphtheria (respiratory) | therapy complete, then two consecutive negative nasal and pharyngeal culture pairs at least 24 hours apart, the first at least 24 hours after therapy |
| Parvovirus B19 prodrome | at least 5 days from symptom onset, fever-free 24 hours without antipyretics, improving |
| Viral respiratory infection | at least 3 days from symptom onset, fever-free 24 hours without antipyretics, improving; source control through day 7 (day 0 = onset) |

**Output.** The earliest return date and, where the rule has a non-date condition (cultures,
crusted lesions, improving symptoms), that condition stated as unmet until the reader ticks it.
**Rule.** The tool never prints an earlier date than the rule allows on a partly filled form: with
the anchor date blank it names the date it needs. Conjunctivitis has no numeric window
("duration of symptoms"); it is listed with that sentence and no date.
**Source and watch.** As tool 7.

## Decisions

**D1 — predicted counts are inputs.** The SIR tool never estimates a predicted count; the models
are NHSN's. The page says where the number is on the NHSN report.

**D2 — the 2024 CDC summary, not the 1998 table.** Many institutional policies still copy the
1998 guideline (its pertussis rule differs). Tools 7 and 8 cite only the current CDC summary and
its dated sections.

**D3 — day 0 is the exposure date** until the build reads otherwise (see "verify at build").

**D4 — no targets.** No tool ships a benchmark compliance rate or a goal SIR; the goal is reader
input.

## Risks

- **Window drift.** CDC adds sections ("Additional updated sections are forthcoming"). The watch
  in D2 and the fail-closed rule cover it.
- **Denominator confusion.** Days present vs patient days (tool 4) and device days vs patient
  days (tool 2) are the two mistakes the pages must prevent in copy, with both definitions on
  screen.
