# Design — Occupational and employee health rules as arithmetic

Read on osha.gov (the regulation text pages) and law.cornell.edu (49 CFR Part 391 Appendix A,
shown as current eCFR text amended at 89 FR 3579) on October 19, 2026. Re-read on the eCFR at
build and add each section to the weekly eCFR watch.

## Tools

### 1. `osha-noise-dose` — OSHA Noise Dose and 8-Hour TWA From a Day's Exposures (29 CFR 1910.95 App. A)

**Input.** Up to twelve exposure segments, each a sound level (dBA, slow response) and a
duration (hours and minutes); optionally, instead, a dosimeter dose percentage.
**Compute.** Reference duration per segment: T = 8 ÷ 2^((L − 90) ÷ 5) hours (Table G-16a's
formula, as the appendix prints it). Dose D = 100 × Σ (Cₙ ÷ Tₙ). TWA = 16.61 × log10(D ÷ 100) +
90. Then the comparisons the standard draws: action level reached when TWA ≥ 85 dBA or dose ≥
50% (§1910.95(c)); permissible exposure limit exceeded when dose > 100% (TWA > 90 dBA, Table
G-16); any segment at or above 115 dBA beyond 0.25 hour, or impulse noise above 140 dB peak
(reader-ticked), named.
**Output.** The dose, the TWA, each segment's C/T, and the three sentences (action level,
PEL, Table G-16 ceiling) each marked met or not, citing the paragraph.
**Source, read.** Appendix A §I(1)(ii): "D = 100(C1 / T1 + C2 / T2 + Cn / Tn)"; §II: "TWA =
16.61 log10 (D/100) + 90"; Table G-16a's formula; Table A-1 rows (50% → 85.0; 100% → 90.0;
200% → 95.0; 500% → 101.6) as tests. §1910.95(c)(1)-(2): program required at TWA 85 dBA; 85
dBA or a 50% dose is the action level. Table G-16: 8 h at 90, 6 at 92, 4 at 95, 3 at 97, 2 at
100, 1.5 at 102, 1 at 105, 0.5 at 110, 0.25 or less at 115.
**Verify at build.** Whether Appendix A excludes levels below 80 dBA from the dose (the page
read did not say; Table G-16a starts at 80 dBA). Ship the rule the appendix states.
**Rule.** A total duration over 24 hours is refused; a level outside 80 to 130 dBA is named
(Table G-16a's range).

### 2. `osha-standard-threshold-shift` — Standard Threshold Shift With Age Correction (29 CFR 1910.95(g)(10), App. F)

**Input.** Per ear: baseline audiogram thresholds at 1000, 2000, 3000, 4000 and 6000 Hz and
the age at the baseline; the most recent audiogram's thresholds and the age at that test; sex
(for the table); whether to apply the age correction (the appendix is non-mandatory; the
employer may apply it).
**Compute.** Uncorrected shift per frequency = recent − baseline. STS test: the average shift
at 2000, 3000 and 4000 Hz ≥ 10 dB in either ear (§1910.95(g)(10)(i)). Age correction (Appendix
F): for each frequency, correction = table value at the recent age − table value at the baseline
age (Tables F-1 males, F-2 females); corrected recent threshold = recent − correction;
corrected shift = corrected recent − baseline; the STS test again on the corrected values.
**Output.** Both results (uncorrected and age-corrected), the per-frequency table with the
corrections used, which ear triggered, and the follow-up sentences from §1910.95(g)(8): written
notice within 21 days of the determination; fit or refit hearing protectors; referral when
needed; the revised-baseline rule in (g)(9) stated as the audiologist's or physician's call, not
the tool's.
**Source, read.** §1910.95(g)(10)(i): "a change in hearing threshold relative to the baseline
audiogram of an average of 10 dB or more at 2000, 3000, and 4000 Hz in either ear."
§1910.95(g)(8)(i)-(iii), (g)(9). Appendix F procedure and worked example: a 32-year-old male
with a 4000 Hz recent threshold of 25 and baseline 5 (shift 20); corrections 10 (age 32) and 7
(age 27), difference 3; corrected recent 22; corrected shift 17. Tables F-1 and F-2 were read
in full (ages "20 or younger" through "60 or older", five frequencies each) and are transcribed
into the data module at build from the eCFR, then diffed against the values read here:

Table F-1 (males), dB, at 1000 / 2000 / 3000 / 4000 / 6000 Hz:
20 or younger 5/3/4/5/8; 21 5/3/4/5/8; 22 5/3/4/5/8; 23 5/3/4/6/9; 24 5/3/5/6/9; 25 5/3/5/7/10;
26 5/4/5/7/10; 27 5/4/6/7/11; 28 6/4/6/8/11; 29 6/4/6/8/12; 30 6/4/6/9/12; 31 6/4/7/9/13;
32 6/5/7/10/14; 33 6/5/7/10/14; 34 6/5/8/11/15; 35 7/5/8/11/15; 36 7/5/9/12/16; 37 7/6/9/12/17;
38 7/6/9/13/17; 39 7/6/10/14/18; 40 7/6/10/14/19; 41 7/6/10/14/20; 42 8/7/11/16/20;
43 8/7/12/16/21; 44 8/7/12/17/22; 45 8/7/13/18/23; 46 8/8/13/19/24; 47 8/8/14/19/24;
48 9/8/14/20/25; 49 9/9/15/21/26; 50 9/9/16/22/27; 51 9/9/16/23/28; 52 9/10/17/24/29;
53 9/10/18/25/30; 54 10/10/18/26/31; 55 10/11/19/27/32; 56 10/11/20/28/34; 57 10/11/21/29/35;
58 10/12/22/31/36; 59 11/12/22/32/37; 60 or older 11/13/23/33/38.

Table F-2 (females):
20 or younger 7/4/3/3/6; 21 7/4/4/3/6; 22 7/4/4/4/6; 23 7/5/4/4/7; 24 7/5/4/4/7; 25 8/5/4/4/7;
26 8/5/5/4/8; 27 8/5/5/5/8; 28 8/5/5/5/8; 29 8/5/5/5/9; 30 8/6/5/5/9; 31 8/6/6/5/9;
32 9/6/6/6/10; 33 9/6/6/6/10; 34 9/6/6/6/10; 35 9/6/7/7/11; 36 9/7/7/7/11; 37 9/7/7/7/12;
38 10/7/7/7/12; 39 10/7/8/8/12; 40 10/7/8/8/13; 41 10/8/8/8/13; 42 10/8/9/9/13; 43 11/8/9/9/14;
44 11/8/9/9/14; 45 11/8/10/10/15; 46 11/9/10/10/15; 47 11/9/10/11/16; 48 12/9/11/11/16;
49 12/9/11/11/16; 50 12/10/11/12/17; 51 12/10/12/12/17; 52 12/10/12/13/18; 53 13/10/13/13/18;
54 13/11/13/14/19; 55 13/11/14/14/19; 56 13/11/14/15/20; 57 13/11/15/15/20; 58 14/12/15/16/21;
59 14/12/16/16/21; 60 or older 14/12/16/17/22.

**Rule.** Ages below 20 use the "20 or younger" row and above 60 the "60 or older" row, as the
table is written; a missing frequency in the 2000 to 4000 Hz set leaves the STS test blank with
the frequency named (the average is not taken over two).

### 3. `osha-lead-medical-removal` — Lead Standard: Blood Lead Monitoring Frequency and Medical Removal (29 CFR 1910.1025)

**Input.** The last blood lead result and its date; the previous results with dates (for the
average and the "two consecutive" rules); whether a follow-up sample confirmed the last result;
whether the employee is currently removed.
**Compute.** From §1910.1025 as read:
- Monitoring frequency (j)(2)(i): at least every 6 months for covered employees; at least every
  2 months for an employee whose last result was at or above 40 µg/100 g, until two consecutive
  results are below 40.
- Medical removal (k)(1)(i): required when a periodic and a follow-up test are both at or above
  60 µg/100 g; or when the average of the last three results (or of all results in the past six
  months, whichever is longer, as the paragraph specifies; **verify the exact averaging rule at
  build**) is at or above 50, unless the last result is below 40.
- Return (k)(1)(iii)(A)(1): two consecutive results below 40 µg/100 g.
**Output.** The next monitoring due date, whether removal is required and under which
subparagraph, whether return criteria are met, each with the paragraph quoted.
**Source, read.** §1910.1025(b) action level 30 µg/m³; (c)(1) PEL 50 µg/m³ 8-hour TWA; (j)(2)(i)
monitoring triggers; (k)(1)(i)(A)-(B) removal; (k)(1)(iii)(A)(1) return. Units: blood lead in
µg/100 g whole blood (the page converts from µg/dL as equivalent for whole blood and says so
only if a source states the equivalence; otherwise it takes µg/100 g as entered).
**Rule.** With one result only, the average rule is not evaluable and says so; the construction
standard (29 CFR 1926.62) has different removal thresholds and is out of scope until read (the
page says so).

### 4. `fmcsa-bp-certification` — Commercial Driver Blood Pressure Certification Interval (49 CFR 391 App. A)

**Input.** Systolic and diastolic blood pressure at the examination; whether this is the first
examination, an annual recertification, or a recheck after a one-time 3-month certificate;
whether the driver is on treatment and tolerating it.
**Compute.** From Appendix A section E, as read:
- Stage 1: 140-159 systolic and/or 90-99 diastolic: certify 1 year; at the annual exam the
  driver should be at or below 140/90; a later reading between 140/90 and 160/100 may get a
  one-time 3-month certificate to reach 140/90 or less.
- Stage 2: 160-179 and/or 100-109: a one-time 3-month certificate to start or adjust therapy;
  with treatment tolerated and pressure at or below 140/90, certify 1 year.
- Stage 3: 180 or more and/or 110 or more: not qualified, even briefly, until at or below
  140/90 with tolerated treatment; then certify 6 months, and every 6 months while the recheck
  is at or below 140/90.
- At or below 140/90: the ordinary interval (the appendix's criteria are advisory; the
  certificate length otherwise follows §391.45, which was not read; **build gate on the
  non-hypertensive interval**).
**Output.** The stage, the certification interval the criteria give, and the appendix sentence
that the criteria are advisory and do not have the force of law.
**Source, read.** 49 CFR Part 391 Appendix A, section E, as amended 89 FR 3579 (January 19,
2024), on law.cornell.edu's eCFR mirror; the stage sentences quoted in the design were read
there. **Verify at build** on ecfr.gov directly, and read the current FMCSA Medical Examiner
Handbook's hypertension section, which restates the same table (the search found secondary
restatements that differ on the Stage 1 three-month window's lower bound, 140/90 vs 141/91;
ship the appendix's "greater than 140/90").
**Rule.** The stage is the higher of the systolic and diastolic stages ("and/or"); a reading
with one value blank is refused by name.

### 5. `fmcsa-hearing-standard` — Commercial Driver Hearing Standard: Whisper Test and ISO-to-ANSI Audiometric Average (49 CFR 391.41(b)(11))

**Input.** Forced-whisper result (the distance at which the better ear perceives a forced
whisper, in feet); or audiometric thresholds at 500, 1000 and 2000 Hz in the better ear, with
the calibration (ANSI or ISO).
**Compute.** Whisper: passes when perceived at not less than 5 feet. Audiometric: ISO results
convert to ANSI by subtracting 14 dB at 500 Hz, 10 dB at 1,000 Hz and 8.5 dB at 2,000 Hz; then
average the three; passes when the average is not greater than the regulation's limit.
**Output.** Pass or not on each test the reader gave, the converted thresholds, and the average,
with the appendix sentence that failing the whisper test in both ears calls for audiometry.
**Source, read in part.** Appendix A section I: the 5-foot whisper distance and the ISO-to-ANSI
subtractions. **Build gate:** the 40 dB average limit is in §391.41(b)(11) itself, which was not
read; read it before the tool states the limit. Reuse `pure-tone-average`'s averaging.
**Rule.** The regulation uses the better ear; the tool asks for one ear and says so.

### 6. `osha-lead-airborne-pel-shift` — Lead Airborne Limit for a Shift Longer Than 8 Hours (29 CFR 1910.1025(c)(2))

**Input.** Hours worked in the day (over 8); the measured 8-hour TWA airborne lead (µg/m³).
**Compute.** Allowable TWA for the shift = 400 ÷ hours worked (µg/m³), per (c)(2); compare the
measured TWA to it and to the action level of 30 µg/m³.
**Output.** The reduced limit, whether it is exceeded, and whether the action level is reached,
with (b), (c)(1) and (c)(2) quoted.
**Source, read.** §1910.1025(c)(2): "400 ÷ hours worked"; (b) and (c)(1) as above.
**Rule.** Hours at or below 8 reports the unreduced PEL of 50 µg/m³; hours above 24 refused.

## Decisions

**D1 — the CFR is the only constant, and every section is watched.** eCFR watch rows for
1910.95, 1910.1025 and Part 391 Appendix A; fail closed on change.

**D2 — the appendix tables are reproduced in full** because the regulation itself publishes
them for this purpose and they are not licensed.

**D3 — the tools report the rule, not fitness.** Every page says the examiner or the employer
decides; the tool shows what the regulation's numbers say for the inputs.

## Risks

- **Advisory criteria read as law.** The FMCSA page says so on screen.
- **Averaging rules in the lead standard.** Marked verify-at-build; the tool refuses to evaluate
  the average rule when its exact window is not yet read.
