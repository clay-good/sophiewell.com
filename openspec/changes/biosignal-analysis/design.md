# Design — Biosignal analysis from the reader's own recordings

Read on November 7, 2026 unless marked "not opened".

## Sources

| Source | Status |
|---|---|
| Pan J, Tompkins WJ. A real-time QRS detection algorithm. *IEEE Trans Biomed Eng* 1985;32:230-236 (PMID 3997178) | **not opened** (no PMC copy); build gate for tool 1 |
| Task Force of the ESC and NASPE. Heart rate variability: standards of measurement, physiological interpretation and clinical use. *Circulation* 1996;93:1043-1065 (PMID 8598068) | **not opened**: the AHA page returned 403 and the copies found were of unverified provenance; build gate for tools 2 and 3 |
| Kane N, et al. *Clin Neurophysiol Pract* 2017;2:170 (PMC6123891, CC BY-NC-ND) | read: delta "0.1–<4 Hz" (0.5 Hz lower limit "for practical purposes"), theta "4−<8 Hz", alpha "8–13 Hz inclusive", gamma ">30 to 80 Hz" |
| Corrigendum, *Clin Neurophysiol Pract* 2019 (PMC6606822) | read: beta band "Frequency band of >13–30 Hz inclusive" (the 2017 text said 14–30, leaving 13 to 14 Hz unassigned) |
| FDA, *Pulse Oximeters - Premarket Notification Submissions [510(k)s]*, final, March 4, 2013 | read: study of 10 or more healthy subjects and 200 or more paired points; at least 2 darkly pigmented subjects or 15% of the pool, whichever is larger; report mean bias, between- and within-subject variance and 95% limits of agreement per Bland and Altman 2007; Table 3 typical Arms: transmittance wrap and clip ≤ 3.0%, ear clip ≤ 3.5%, reflectance ≤ 3.5%; Arms formula deferred to ISO 80601-2-61 (licensed, not read) |
| FDA draft guidance on pulse oximeters, January 7, 2025 | **not opened**; reported not final as of this writing. It will supersede the 2013 guidance when final; a page watch is a build task |
| Bland JM, Altman DG. Agreement between methods of measurement with multiple observations per individual. *J Biopharm Stat* 2007;17:571-582 | **not opened**; build gate for the variance components in tool 6 |
| Van Bortel LM, et al. Expert consensus document on the measurement of aortic stiffness in daily practice using carotid-femoral pulse wave velocity. *J Hypertens* 2012;30:445-448 (PMID 22278144) | **not opened** (no PMC copy); build gate for tool 7 |

## Tools

### 1. `qrs-detect-trace` — R-Peaks From a Single-Lead ECG Trace — build-gated

**Input.** A pasted column or dropped CSV of samples, the sampling rate, and the unit (mV or raw counts).
**Compute.** Pan and Tompkins' stages as the paper states them: band-pass filter, derivative, squaring,
moving-window integration, adaptive thresholds with search-back, and the refractory period; all constants
taken from the paper and scaled to the reader's sampling rate as the paper allows.
**Output.** R-peak sample indices and times, RR intervals in ms, mean heart rate, and a plot of the trace
with peaks marked; a link that prefills tools 2 and 3 with the RR list.
**Build gate.** Read the paper for every filter coefficient, window width, threshold rule and the
refractory period. The paper's filters are designed at 200 Hz; the build states how other rates are
handled (resample or rescale), citing where the rule comes from. Validate on an open annotated record
(PhysioNet's MIT-BIH Arrhythmia Database, ODC-By) and report sensitivity and positive predictivity on the
page.
**Rule.** "Beats detected" only. No rhythm label, no ectopic label.

### 2. `hrv-time-domain` — HRV Time Domain — build-gated

**Input.** RR (NN) intervals in ms, pasted or from tool 1; recording length.
**Compute.** Mean NN, SDNN, RMSSD, NN50, pNN50, and the HRV triangular index, with each definition and
the SD denominator taken from the Task Force text.
**Output.** The values and the recording length, with the Task Force's statement on which measures fit
short (5-minute) and long (24-hour) recordings.
**Build gate.** Read the Task Force document for every definition, the histogram bin width for the
triangular index, and its rule on comparing recordings of different length.
**Rule.** Ectopic or artifact intervals are not removed silently; the reader marks them or the tool
reports how many intervals differ from the previous by more than the reader's stated limit.

### 3. `hrv-frequency-domain` — HRV Frequency Domain — build-gated

**Input.** As tool 2.
**Compute.** Resampling of the RR series to an even grid (rate stated), detrending, a windowed spectral
estimate, and band powers in ms² and normalized units, with the band edges and method as the Task Force
states them.
**Output.** VLF, LF, HF, total power, LF and HF in normalized units, LF/HF, and the spectrum plot.
**Build gate.** Read the Task Force band edges, the recommended recording length per band and the
normalized-unit definition. No band edge is written from memory.

### 4. `eeg-band-power` — EEG Band Power

**Input.** Samples of one channel (pasted or CSV), the sampling rate, the segment length.
**Compute.** Remove the mean; Hann-windowed periodogram averaged over 50%-overlapping segments; band power
by summing the spectrum over each band: delta 0.5 to <4 Hz (Kane's practical lower limit, the 0.1 Hz
formal limit available as an option), theta 4 to <8, alpha 8 to 13 inclusive, beta >13 to 30 inclusive
(2019 corrigendum), gamma >30 to 80 Hz, capped at the Nyquist frequency.
**Output.** Absolute power per band in the input unit squared, relative power (band ÷ sum of bands), the
peak frequency, the frequency resolution, and the spectrum with bands shaded.
**Rule.** A band above the Nyquist frequency is reported as not measurable at this sampling rate. The page
cites the glossary for the band names and edges only; the spectral method is standard signal processing
and is described on the page.

### 5. `ectopy-burden` — Ectopic Beat and Arrhythmia Burden

**Input.** From a monitor's summary: total beats and counts of ventricular and supraventricular ectopic
beats; or total monitored time and time in an arrhythmia (for example atrial fibrillation).
**Compute.** Burden = ectopic beats ÷ total beats × 100; time burden = time in arrhythmia ÷ monitored time
× 100; beats per hour.
**Output.** The percentages and rates with their denominators.
**Rule.** No threshold for cardiomyopathy risk or treatment ships until a guideline sentence is read and
cited; the reader may enter their own reference value.

### 6. `spo2-arms-accuracy` — Pulse Oximeter Accuracy From Paired Readings

**Input.** Paired readings (subject id, SpO2, co-oximeter SaO2), pasted or a CSV; sensor type; per-subject
skin pigmentation category as the study recorded it.
**Compute.** Differences d = SpO2 − SaO2; Arms = √(Σd² ÷ n); mean bias; counts of subjects and points;
the larger of 2 and 15% of subjects as the minimum darkly pigmented count; the share of points by SaO2
band (70-80, 80-90, 90-100%). After the gate: between- and within-subject variance and 95% limits of
agreement by Bland and Altman 2007.
**Output.** Arms against FDA Table 3's typical value for the sensor type, bias, and whether the study meets
the guidance's 10 subjects, 200 points and pigmentation minimum, each quoted.
**Rule.** The page says the 2013 guidance is current and that FDA's January 2025 draft, when final, will
replace it; a page watch fails the tool closed on the guidance changing.

### 7. `pwv-carotid-femoral` — Carotid-Femoral PWV — build-gated

**Input.** Surface distance (direct carotid-femoral, or the subtraction method's segments) and transit time.
**Compute.** PWV = path length ÷ transit time, with the path-length rule from the consensus (the 0.8
correction for the direct distance is to be confirmed there).
**Output.** PWV in m/s and the path method used.
**Build gate.** Read Van Bortel 2012 for the path-length correction and any reference value before
building. No threshold ships until read.

## Decisions

**D1 — Gate the classics rather than write them from memory.** Pan-Tompkins and the Task Force numbers are
widely restated, and that is exactly the case the project's spec-v941 to spec-v946 program warns about.

**D2 — The corrigendum wins.** The beta band follows the 2019 correction, and the page says the 2017 text
left 13 to 14 Hz unassigned.

**D3 — Zero dependencies.** FFT, filters and resampling are written in the lib, with tests against
closed-form signals (pure sines, impulse trains). No DSP package and no WebAssembly build step.

## Risks

- **Real traces are noisy.** Tool 1 reports its validation figures from the open database so the reader
  knows how it performs; it never claims clinical accuracy.
- **Misuse as a diagnostic.** Every result says it is a measurement from the reader's data, not a diagnosis.
- **Large files.** A 24-hour Holter at 250 Hz is about 21.6 million samples per lead; tools stream and
  report progress, and refuse past a stated size with the reason.

## Rejected

| Idea | Why not |
|---|---|
| SpO2 from raw red/infrared PPG (ratio of ratios) | The calibration curve is empirical and device-specific; no primary source a reader's device shares. |
| Arrhythmia classification (AF detection, VT labeling) | Classification models; not deterministic from a read primary source, and a diagnostic claim. |
| Stand-alone Butterworth or notch filter designer | Engineering, not a health answer. Admission rule 1. Filtering lives inside the tools that need it. |
| EMG fatigue indices | No clinical decision attached and no primary source read. |
| Live device streaming (Web Serial, Web Bluetooth) | Out of the catalog's posture; the reader exports and drops a file. |
