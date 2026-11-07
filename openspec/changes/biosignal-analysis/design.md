# Design — Biosignal analysis from the reader's own recordings

Read on November 7, 2026 unless marked "not opened". Every number in **Tests** was recomputed independently on that
date (scratch scripts, not repository code), and the two filter and resampling decisions below were tested, not
assumed.

## Sources

| Source | Status |
|---|---|
| Pan J, Tompkins WJ. A real-time QRS detection algorithm. *IEEE Trans Biomed Eng* 1985;32:230-236 (PMID 3997178) | read, pp. 231-234, from a scan of the published paper (an archived University of Washington course copy; copyrighted, not openly licensed). Decision rules cross-checked against open restatements (PMC5492002, PMC8818419, PMC9920820, arXiv 2211.03171), which agree on them and disagree with each other on the filters |
| The authors' erratum to the filter equations, as cited by the Wikipedia article on the algorithm | **not opened**; not needed (see **The high-pass filter**) |
| MIT-BIH Arrhythmia Database, PhysioNet (doi:10.13026/C2F305) | read: "Anyone can access the files"; Open Data Commons Attribution License v1.0; "360 samples per second per channel with 11-bit resolution over a 10 mV range" |
| Task Force of the ESC and NASPE. Heart rate variability: standards of measurement, physiological interpretation and clinical use. *Circulation* 1996;93:1043-1065; *Eur Heart J* 1996;17:354-381 | read: the ESC PDF (archived copy of escardio.org, 28 pages, Tables 1 and 2) and the Circulation full text (archived); publisher pages return 403 to scripts. Not openly licensed; facts with attribution |
| Shaffer F, Ginsberg JP. *Front Public Health* 2017 (PMC5624990, CC BY) | read as a cross-check; it **differs** from the Task Force on VLF's lower edge (0.0033 Hz) and on normalized units (LF ÷ (LF + HF)). The Task Force is followed |
| Kane N, et al. *Clin Neurophysiol Pract* 2017;2:170 (PMC6123891, CC BY-NC-ND), and its 2019 corrigendum (PMC6606822) | read: delta "0.1–<4 Hz" (0.5 Hz "for practical purposes"), theta "4−<8 Hz", alpha "8–13 Hz inclusive", gamma ">30 to 80 Hz"; corrigendum: beta ">13–30 Hz inclusive" (the 2017 text said 14-30) |
| FDA, *Pulse Oximeters - Premarket Notification Submissions [510(k)s]*, final, March 4, 2013 | read: 10 or more healthy subjects, 200 or more paired points, at least 2 darkly pigmented subjects or 15% of the pool (whichever is larger); report bias, between- and within-subject variance and 95% limits of agreement per Bland and Altman 2007; Table 3 typical Arms ≤ 3.0% (transmittance), ≤ 3.5% (ear clip, reflectance); Arms formula deferred to ISO 80601-2-61 (licensed; not read) |
| FDA draft guidance, *Pulse Oximeters for Medical Purposes ...*, January 7, 2025 (fda.gov/media/184896) | read: "Draft – Not for Implementation", still listed as draft in FDA's guidance index on November 7, 2026. Arms defined in a footnote as "the root mean square deviation between SpO2 and SaO2 across all paired repeated measures and study participants"; 150 or more participants; Monk Skin Tone groups 1-4, 5-7, 8-10 each at least 25%; at least 50% of group 8-10 with ITA ≤ −50°; at least 40% of each sex per group; 3,000 or more pairs; Arms < 3% (two-sided 95% CI upper limit); bias differences between groups < 3.5% for 70% ≤ SaO2 ≤ 85% and < 1.5% for 85% < SaO2 ≤ 100%. The per-participant pair count is stated two ways (20 or more; 17 to 30 with an average of 20-24) |
| Bland JM, Altman DG. Agreement between methods of measurement with multiple observations per individual. *J Biopharm Stat* 2007;17:571-582 | read: the authors' post-referee version (White Rose eprints 3411, December 22, 2006; all rights reserved). Its worked example was reproduced to the published digits (see Tests), which is the verification |
| Van Bortel LM, et al. *J Hypertens* 2012;30:445-448 (PMID 22278144) | full text **not opened**; the abstract (primary) read: "the use of 80% of the direct carotid-femoral distance as the most accurate distance estimate" and "10 m/s as new cut-off value" |
| Townsend RR, et al. AHA Scientific Statement on arterial stiffness. *Hypertension* 2015 (PMC4587661) | read: Recommendation 6.1, the subtraction method or "multiplying the total directly measured distance by 0.8 (Class I, LOE B)"; the 10 m/s threshold "derived by multiplying 12 m/s by 0.8 and then rounding up" |

## The high-pass filter (tested)

The paper prints the high-pass filter as H(z) = (−1 + 32z⁻¹⁶ + z⁻³²) ÷ (1 + z⁻¹) (eq 4) and
y(nT) = 32x(nT − 16T) − [y(nT − T) + x(nT) − x(nT − 32T)] (eq 6). Computed on November 7, 2026, that filter is
**not a high-pass**: its gain is about 16 from DC to 20 Hz and grows without bound toward 100 Hz, and its impulse
response rings at ±32 forever (a pole on the unit circle at z = −1 that no zero cancels).

The same page describes the design in words: "subtracting the output of a first-order low-pass filter from an
all-pass filter (i.e., the samples in the original signal)", with "low cutoff frequency ... about 5 Hz, the gain is
32, and the delay is 16 samples". Built literally from that sentence, a 16-sample delay with gain 32 minus a
32-sample running sum, H(z) = 32z⁻¹⁶ − (1 − z⁻³²) ÷ (1 − z⁻¹), which is the difference equation

y(n) = y(n − 1) − x(n) + 32x(n − 16) − 32x(n − 17) + x(n − 32).

Tested: −3 dB at 4.72 Hz, gain 32 in the passband, zero gain at DC, and a finite impulse response (nothing after
33 samples). Cascaded with the paper's low-pass (eq 3, gain 36), the −3 dB band is 4.91 to 11.78 Hz, matching the
paper's text ("about 5–12 Hz"; its figure caption says 5-11). **The tool builds this form, cites the sentence it
comes from, and records on the page that the printed equation is not used and why.** It equals, times 32, the form
the erratum is reported to give.

## HRV resampling (tested)

The Task Force does not fix a resampling method for frequency analysis. On a synthetic 5-minute series with known
LF (0.1 Hz, 30 ms) and HF (0.25 Hz, 50 ms) modulation, linear interpolation at 4 Hz recovered 94% of LF power and
**66% of HF power**, because linear interpolation of beat-spaced samples is itself a low-pass filter. A natural
cubic spline at 4 Hz recovered 99.9% of LF and 97% of HF (LF/HF 0.371 against a true 0.360). The tool uses the
natural cubic spline at 4 Hz and says so.

## Shared rules

- **Input.** Pasted numbers or a dropped CSV (one column, or a named column) through the existing file intake; the
  sampling rate is always stated by the reader, never guessed from the file.
- **No diagnosis.** One `.clinical-notice` per tile: a measurement from the reader's data, not a diagnosis.
- **Plots.** The catalog has no plot component (`docs/design.md` §4). Plots are a prerequisite design-system change
  (inline SVG, tokens only, `role="img"` with a text alternative, values repeated in a table). Every answer here is
  complete without one.
- **Size.** Samples are streamed; a 24-hour single-lead recording at 250 Hz is 21.6 million samples. Tools 1, 3 and
  4 state a maximum they will process in the page (set at build from a measured run on a mid-range phone) and refuse
  above it with the reason, never truncating silently.

## Tools

### 1. `qrs-detect-trace` — R-Peaks From a Single-Lead ECG Trace (Pan-Tompkins)

**Input.** Samples (pasted or CSV), the sampling rate, the unit.
**Compute, as the paper states it, at 200 samples/s:** low-pass eq 3 (delay 6, gain 36); the high-pass above (delay
16, gain 32); derivative eq 9, y(nT) = (1/8T)[−x(nT − 2T) − 2x(nT − T) + 2x(nT + T) + x(nT + 2T)] (delay 2); squaring;
moving-window integration over 30 samples (150 ms); thresholds SPKI = 0.125 PEAKI + 0.875 SPKI, NPKI = 0.125 PEAKI +
0.875 NPKI, THRESHOLD I1 = NPKI + 0.25 (SPKI − NPKI), I2 = 0.5 I1, and the same for the filtered signal (F1, F2);
search-back updates with 0.25 and 0.75; thresholds halved for an irregular rhythm; RR AVERAGE1 over the last eight
intervals, RR AVERAGE2 over the last eight within 92% to 116%, RR MISSED LIMIT 166%; 200 ms refractory period; within
360 ms of the previous QRS, a candidate whose maximal slope is less than half the previous QRS's is a T wave.
**Other sampling rates.** The signal is resampled to 200 samples/s first (windowed-sinc low-pass at 80 Hz, then
interpolation), so every published constant applies unchanged; detected times are mapped back to the reader's
sample indices after removing the summed filter delay.
**Project additions, labeled as such.** The learning phase (the first 2 seconds set the initial SPKI and NPKI, as the
paper describes in prose) and a final R-peak location as the largest absolute sample of the band-passed signal within
75 ms of the detection.
**Output.** R-peak times and sample indices, RR intervals (ms), mean heart rate, count of search-back detections; a
link that prefills tools 2 and 3 with the RR list.
**Ship gate (validation, not a source).** Run against the 48 MIT-BIH records with the reference annotations, a match
tolerance of 150 ms, and print sensitivity and positive predictivity per record and in aggregate in the build record
and on the page. The tool ships only if both aggregate figures on the non-paced records are at least 99%. Pan and
Tompkins reported a 0.675% failed-detection rate on this database; a lower result means the implementation is wrong.
**Rule.** "Beats detected" only; no rhythm or ectopy label.

### 2. `hrv-time-domain` — HRV Time Domain

**Input.** RR (NN) intervals in ms, pasted or from tool 1; whether the series has been edited for ectopic beats.
**Compute, Task Force Table 1:** mean NN; SDNN; RMSSD = √(mean of squared successive differences); NN50 = pairs of
adjacent intervals differing by more than 50 ms; pNN50 = NN50 ÷ **total number of NN intervals** (the Task Force's
denominator; many programs divide by the number of differences instead, and the page says which it uses); HRV
triangular index = number of intervals ÷ the height of the histogram with bins of 7.8125 ms (1/128 s), bins starting
at 0 ms; SDANN and SDNN index when the recording is long enough for 5-minute segments.
**Choices the source does not make.** SDNN uses the sample standard deviation (n − 1); the Task Force says only
"standard deviation". NN50 counts both directions (the Task Force notes "three variants are possible"). Both printed.
**Output.** Each measure with the recording length, and the Task Force's sentence that "it is inappropriate to compare
SDNN measures obtained from recordings of different durations."
**Rule.** Intervals are not edited silently: intervals that differ from the previous by more than a reader-set
percentage are counted and listed, and the reader decides.

### 3. `hrv-frequency-domain` — HRV Frequency Domain

**Input.** As tool 2; recording type (short-term or 24-hour).
**Compute.** Natural cubic spline of the RR series at 4 Hz; linear detrend; Welch periodogram with a 256-sample (64 s)
Hann window and 50% overlap; band powers by summation. Bands, Task Force Table 2: short-term VLF ≤ 0.04 Hz, LF 0.04 to
0.15 Hz, HF 0.15 to 0.4 Hz; 24-hour adds ULF ≤ 0.003 Hz and VLF 0.003 to 0.04 Hz. The Task Force writes the edges
without saying which side is included; the tool assigns each edge to the lower band (an interval is (lower, upper])
and says so. Normalized units: LF ÷ (total power − VLF) × 100, and the same for HF.
**Output.** Absolute powers (ms²), normalized units, LF/HF, peak frequencies, and the resampling and window used.
**Rule.** The Task Force: about 1 minute is needed for HF and about 2 for LF, with 5-minute stationary recordings
preferred; a shorter recording prints only the bands it supports. A recording with fewer than two Welch segments
refuses.

### 4. `eeg-band-power` — EEG Band Power

**Input.** Samples of one channel, the sampling rate, the segment length (default 2 s).
**Compute.** Remove the mean; Welch periodogram with a periodic Hann window and 50% overlap; band power by summing bins:
delta 0.5 to < 4 Hz (0.1 Hz offered), theta 4 to < 8, alpha 8 to 13 inclusive, beta > 13 to 30 inclusive, gamma > 30
to 80 Hz, capped at the Nyquist frequency. A bin at exactly 13 Hz is alpha; at exactly 30 Hz, beta.
**Output.** Absolute power per band, relative power (band ÷ sum of bands), peak frequency, frequency resolution, and
the window, so a reader understands leakage.
**Rule.** A band above the Nyquist frequency is "not measurable at this sampling rate". The page cites the glossary for
band names and edges only.

### 5. `ectopy-burden` — Ectopic Beat and Arrhythmia Burden

**Input.** Total beats with ventricular and supraventricular ectopic counts; or monitored time and time in an
arrhythmia.
**Compute.** Beat burden = ectopic ÷ total × 100; time burden = time in arrhythmia ÷ monitored time × 100; ectopic beats
per hour.
**Output.** The figures with their denominators.
**Rule.** No risk or treatment threshold ships until a guideline sentence is read and cited; the reader may enter a
reference value. Ectopic count above total refuses.

### 6. `spo2-arms-accuracy` — Pulse Oximeter Accuracy From Paired Readings

**Input.** Paired readings: subject id, SpO2, co-oximeter SaO2, and per subject the skin-tone category the study
recorded (and, for the draft check, Monk Skin Tone group, ITA and sex); sensor type.
**Compute.** d = SpO2 − SaO2; Arms = √(Σd² ÷ n) over all pairs (FDA's definition); mean bias; Bland and Altman 2007,
true value varying: within-subject variance = residual mean square of a one-way analysis of variance of d by subject;
between-subject variance = (MS between − MS within) ÷ [((Σmᵢ)² − Σmᵢ²) ÷ ((n − 1)Σmᵢ)] (equal to m when every subject
has m pairs), floored at 0; total variance = sum; 95% limits = bias ± 1.96 × √total.
**Output, 2013 guidance (in force).** Arms against Table 3's typical value for the sensor type; bias, both variance
components and the limits; and whether the study meets 10 subjects, 200 pairs and the pigmentation minimum
(max(2, ⌈0.15 × subjects⌉); the rounding up is the project's reading and is said).
**Output, January 2025 draft (labeled "draft, not in force").** Participants (≥ 150), each Monk group's share (≥ 25%),
ITA share in group 8-10 (≥ 50% at ≤ −50°), sex share per group (≥ 40%), pairs (≥ 3,000), point Arms against 3%, and the
largest difference in mean bias between Monk groups in the two SaO2 bands against 3.5% and 1.5%. The draft's
confidence-interval and hypothesis-test criteria are **not** computed (the draft does not give the method) and the page
says so; no draft "pass" is ever printed.
**Rule.** A page watch on both guidance pages fails the tool closed when either changes; when the draft is finalized
the tool is re-specified against it.

### 7. `pwv-carotid-femoral` — Carotid-Femoral Pulse Wave Velocity

**Input.** Method: 80% of the direct carotid-femoral distance, or subtraction (sternal notch to femoral minus sternal
notch to carotid); the distances; the transit time.
**Compute.** PWV = path length ÷ transit time.
**Output.** PWV in m/s, the method, and, for the 80% method only, the 10 m/s value from the 2012 consensus and the 2015
AHA statement, quoted as a reference value, not a diagnosis.
**Rule.** The 10 m/s value is not printed beside a subtraction-method result (it was derived for the 80% method). No
conversion factor between methods ships (one paper's 1.1 factor was seen and not adopted).

## Tests

- `qrs-detect-trace`: the high-pass impulse response is zero after sample 32, its gain at 50 Hz is 32 ± 0.1%, and its
  −3 dB point is 4.72 ± 0.05 Hz; the cascade's −3 dB band is 4.91 to 11.78 Hz. A synthetic trace at 360 Hz with a
  QRS-shaped complex every 1.000 s for 10 s → 10 R-peaks, 9 intervals of 1,000 ms (± 1 sample), 60 per minute. MIT-BIH
  aggregate sensitivity and positive predictivity ≥ 99% on the non-paced records (ship gate).
- `hrv-time-domain`: RR 800, 810, 790, 820, 800 → RMSSD 21.21 ms, NN50 0, pNN50 0%. RR 800, 860, 800, 860, 800 →
  RMSSD 60.00 ms, SDNN 32.86 ms (n − 1; 29.39 with n), NN50 4, pNN50 80% (Task Force denominator; 100% by differences,
  shown as the alternative), triangular index 1.667 (bins 102 and 110 hold 3 and 2).
- `hrv-frequency-domain`: 5-minute synthetic series, mean RR 1,000 ms, LF modulation 30 ms at 0.1 Hz and HF 50 ms at
  0.25 Hz → LF within 5% of 450 ms², HF within 5% of 1,250 ms², LF/HF within 5% of 0.36; a 90-second series prints HF
  and LF and withholds VLF.
- `eeg-band-power` (256 Hz, 4 s, 2 s segments, resolution 0.5 Hz): 10 Hz sine → peak 10 Hz, alpha 100.0%; 13.5 Hz →
  beta 83.33%, alpha 16.67% (Hann leakage into the 13.0 Hz bin, explained on the page); 13.0 Hz → alpha 83.33%, beta
  16.67%; total power equals the signal variance (Parseval); at 100 Hz sampling, gamma above 50 Hz is not measurable.
- `ectopy-burden`: 12,000 of 100,000 beats over 24 h → 12.0%, 500 per hour; 2 h of AF in 48 h → 4.17%.
- `spo2-arms-accuracy`: three subjects with differences (1, 3), (2, 4), (0, 2) → Arms 2.380, bias 2.000, within-subject
  variance 2.000, between-subject variance 0, limits −0.772 to 4.772. The Bland and Altman 2007 worked example (n 12,
  Σm 60, Σm² 312, MS between 4.2090856, MS within 0.170714026, bias 0.6021667) → divisor 4.9818, total variance
  0.98134, limits −1.33946 to 2.54379. Pigmentation minimum: 10 subjects → 2, 13 → 2, 14 → 3, 20 → 3. Draft: 150
  participants → each Monk group needs at least 38.
- `pwv-carotid-femoral`: 80% of 600 mm over 60 ms → 8.0 m/s with the 10 m/s reference shown; subtraction 700 − 150 mm
  over 60 ms → 9.17 m/s with no reference shown.

## MCP

One adapter per tool with the existing field kinds; samples or intervals as one `string` field, one value per line,
with the sampling rate as a `number`. Recordings larger than a tool argument should carry go through `analyze_file`
(tools 1 to 4 join `ANALYZABLE` in `mcp/file-tools.js`), which reads only inside a directory the client shares.

## Decisions

**D1 — Build from the paper's words where its printed equation contradicts them,** and say so (the high-pass filter).

**D2 — Choose and state what the sources leave open** (SDNN denominator, band-edge inclusion, resampling method,
Welch settings), each tested.

**D3 — The 2013 FDA guidance governs; the 2025 draft is shown as a draft,** never as a pass.

**D4 — Zero dependencies.** FFT, spline, filters and resampling live in one lib module with tests against closed-form
signals.

## Verify at build

- Re-read the Pan-Tompkins scan for eq 3, 9, 11-29 and the high-pass sentence; if the authors' erratum becomes
  readable, compare it with the form built here.
- Confirm the MIT-BIH paced-record list from PhysioNet's record descriptions before excluding any record.
- Re-check FDA's guidance index for the draft's status.
- Measure the in-page sample limits on a mid-range phone.

## Risks

- **A wrong filter that still "finds beats".** Mitigated by the MIT-BIH ship gate and the impulse-response test.
- **Misuse as a diagnostic.** Every result says it is a measurement.
- **Readers comparing HRV across software.** The page prints every choice that differs between programs.

## Rejected

| Idea | Why not |
|---|---|
| SpO2 from raw red/infrared PPG (ratio of ratios) | The calibration curve is empirical and device-specific; no primary source a reader's device shares. |
| Arrhythmia classification (AF detection, VT labeling) | Classification models; a diagnostic claim. |
| Stand-alone filter designer | Engineering, not a health answer. Admission rule 1. |
| EMG fatigue indices | No clinical decision attached and no primary source read. |
| Live device streaming (Web Serial, Web Bluetooth) | Out of the catalog's posture; the reader exports and drops a file. |
| A subtraction-to-80% PWV conversion factor | One paper's factor, not a consensus. |
