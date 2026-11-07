# Spec Delta — biosignal-analysis

## ADDED Requirements

### Requirement: Pan-Tompkins QRS detection with the corrected high-pass filter

The catalog SHALL provide `qrs-detect-trace` running the 1985 detector at 200 samples/s with every published
constant, building the high-pass filter from the paper's described construction rather than its misprinted
equation, resampling other rates to 200 samples/s, and reporting R-peak times, RR intervals and mean heart rate with
no rhythm label.

#### Scenario: The high-pass filter is a high-pass
- **WHEN** the high-pass filter's impulse and frequency response are computed
- **THEN** the impulse response is zero after sample 32, the gain is 32 in the passband, and the −3 dB point is
  4.72 Hz

#### Scenario: Synthetic trace
- **WHEN** a trace sampled at 360 Hz carries a QRS-shaped complex every 1.000 s for 10 s
- **THEN** 10 R-peaks, 9 RR intervals of 1,000 ms and a heart rate of 60 per minute are reported

### Requirement: QRS detection ships only after validation

`qrs-detect-trace` SHALL ship only if its aggregate sensitivity and positive predictivity on the non-paced MIT-BIH
Arrhythmia records, at a 150 ms match tolerance, are both at least 99%, with per-record figures in the build record
and the aggregate on the page.

#### Scenario: Below the line
- **WHEN** the aggregate sensitivity is 98.5%
- **THEN** the tool does not ship and the build record says why

### Requirement: HRV time domain by the Task Force definitions

The catalog SHALL provide `hrv-time-domain` computing mean NN, SDNN (sample standard deviation, stated), RMSSD, NN50,
pNN50 over the total number of NN intervals (the alternative denominator shown), and the triangular index with
1/128 s bins starting at 0 ms, printing the Task Force's warning against comparing recordings of different length and
listing, not removing, suspect intervals.

#### Scenario: Five steady intervals
- **WHEN** the RR intervals are 800, 810, 790, 820 and 800 ms
- **THEN** RMSSD prints 21.21 ms, NN50 0 and pNN50 0%

#### Scenario: The pNN50 denominator
- **WHEN** the RR intervals are 800, 860, 800, 860 and 800 ms
- **THEN** RMSSD prints 60.00 ms, SDNN 32.86 ms, NN50 4, pNN50 80% by the Task Force denominator with 100% shown as
  the per-difference alternative, and the triangular index 1.667

### Requirement: HRV frequency domain with stated method

The catalog SHALL provide `hrv-frequency-domain` resampling the RR series by natural cubic spline at 4 Hz, detrending,
estimating power with a 64-second Hann Welch periodogram at 50% overlap, and reporting the Task Force bands, normalized
units over total power minus VLF, and LF/HF, withholding bands the recording is too short for.

#### Scenario: Known modulation
- **WHEN** a 5-minute series at mean RR 1,000 ms carries 30 ms of 0.1 Hz and 50 ms of 0.25 Hz modulation
- **THEN** LF is within 5% of 450 ms², HF within 5% of 1,250 ms², and LF/HF within 5% of 0.36

#### Scenario: Short recording
- **WHEN** the series is 90 seconds long
- **THEN** LF and HF print and VLF is withheld with the reason

### Requirement: EEG band power on the glossary's bands

The catalog SHALL provide `eeg-band-power` computing absolute and relative power on Kane's bands with the corrected
beta edge (a 13 Hz bin is alpha, a 30 Hz bin beta), stating the window and resolution, and reporting a band above the
Nyquist frequency as not measurable.

#### Scenario: Pure alpha
- **WHEN** a 10 Hz sine is sampled at 256 Hz for 4 seconds with 2-second segments
- **THEN** the peak prints 10 Hz and alpha holds 100% of relative power

#### Scenario: Leakage across the corrected edge
- **WHEN** a 13.5 Hz sine is analyzed the same way
- **THEN** beta prints 83.33% and alpha 16.67%, and the page explains the window's leakage into the 13 Hz bin

#### Scenario: Low sampling rate
- **WHEN** the sampling rate is 100 Hz
- **THEN** gamma above 50 Hz is reported as not measurable at this rate

### Requirement: Ectopy and arrhythmia burden

The catalog SHALL provide `ectopy-burden` computing beat burden, time burden and beats per hour, shipping no risk
threshold that has not been read.

#### Scenario: PVC burden
- **WHEN** a 24-hour monitor reports 100,000 beats and 12,000 ventricular ectopic beats
- **THEN** the burden prints 12.0% and 500 per hour, with no threshold claimed

### Requirement: Pulse oximeter accuracy under the guidance in force

The catalog SHALL provide `spo2-arms-accuracy` computing Arms over all pairs, mean bias, Bland and Altman 2007
within- and between-subject variance and 95% limits, and the 2013 guidance's study-size and pigmentation checks,
failing closed when a watched guidance page changes.

#### Scenario: Small study
- **WHEN** three subjects have differences (1, 3), (2, 4) and (0, 2)
- **THEN** Arms prints 2.380, bias 2.000, within-subject variance 2.000, between-subject variance 0, and limits
  −0.772 to 4.772

#### Scenario: The published worked example
- **WHEN** the Bland and Altman 2007 example's mean squares and counts are entered
- **THEN** the limits print −1.33946 to 2.54379

#### Scenario: Pigmentation minimum
- **WHEN** a study has 20 subjects, 2 of them darkly pigmented
- **THEN** the minimum prints 3 and the study is reported as short by one

### Requirement: The 2025 draft is shown as a draft

`spo2-arms-accuracy` SHALL show the January 2025 draft's countable criteria labeled "draft, not in force", SHALL
NOT compute its confidence-interval or hypothesis-test criteria, and SHALL NOT print a draft pass.

#### Scenario: Draft panel
- **WHEN** a study of 150 participants is checked against the draft
- **THEN** each Monk group's minimum prints 38, point Arms is compared with 3%, and no overall draft verdict prints

### Requirement: Carotid-femoral PWV by method

The catalog SHALL provide `pwv-carotid-femoral` computing PWV from path length and transit time by the 80% or
subtraction method, showing the 10 m/s reference value only beside an 80%-method result.

#### Scenario: 80% method
- **WHEN** the direct distance is 600 mm and the transit time 60 ms
- **THEN** PWV prints 8.0 m/s with the 10 m/s reference value quoted

#### Scenario: Subtraction method
- **WHEN** the distances are 700 mm and 150 mm and the transit time 60 ms
- **THEN** PWV prints 9.17 m/s and no reference value is shown
