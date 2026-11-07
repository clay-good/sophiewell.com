# Spec Delta — biosignal-analysis

## ADDED Requirements

### Requirement: QRS detection ships only after its paper is read

The catalog SHALL provide `qrs-detect-trace` implementing Pan and Tompkins' detector with every constant
taken from the 1985 paper, reporting R-peak times, RR intervals and mean heart rate with no rhythm label,
publishing its sensitivity and positive predictivity on an open annotated database, and SHALL NOT ship
before the paper has been read.

#### Scenario: Impulse train
- **WHEN** a synthetic trace sampled at 360 Hz carries a QRS-shaped complex every 1.000 s for 10 s
- **THEN** 10 R-peaks are reported, 9 RR intervals of 1,000 ms, and a mean heart rate of 60 per minute

#### Scenario: Gate unmet
- **WHEN** the paper has not been read
- **THEN** the tool is listed as specified and not built, with that reason

### Requirement: HRV time domain after the Task Force is read

The catalog SHALL provide `hrv-time-domain` computing mean NN, SDNN, RMSSD, NN50, pNN50 and the triangular
index with definitions taken from the 1996 Task Force document, reporting suspect intervals rather than
removing them silently, and SHALL NOT ship before that document has been read.

#### Scenario: Five intervals
- **WHEN** the RR intervals are 800, 810, 790, 820 and 800 ms
- **THEN** RMSSD prints 21.21 ms, NN50 prints 0 and pNN50 prints 0%

### Requirement: HRV frequency domain after the Task Force is read

The catalog SHALL provide `hrv-frequency-domain` computing VLF, LF, HF, total power, normalized units and
LF/HF with band edges and method from the Task Force document, stating the resampling rate and window, and
SHALL NOT ship before that document has been read.

#### Scenario: Respiratory modulation
- **WHEN** an RR series is modulated by a pure 0.25 Hz sinusoid
- **THEN** the spectral peak falls in the HF band and HF holds most of the modulated power

### Requirement: EEG band power on the glossary's bands

The catalog SHALL provide `eeg-band-power` computing absolute and relative band power from a Hann-windowed,
segment-averaged periodogram on the bands of Kane 2017 with the 2019 corrigendum's beta band (delta 0.5 to
<4 Hz, theta 4 to <8, alpha 8 to 13 inclusive, beta >13 to 30 inclusive, gamma >30 to 80), reporting a band
above the Nyquist frequency as not measurable.

#### Scenario: Pure alpha
- **WHEN** a 10 Hz sine is sampled at 256 Hz for 4 seconds
- **THEN** the peak frequency prints 10 Hz and alpha holds more than 95% of relative power

#### Scenario: The corrected beta edge
- **WHEN** a 13.5 Hz sine is analyzed
- **THEN** its power falls in beta, and the page notes that the 2017 text had left 13 to 14 Hz unassigned

#### Scenario: Low sampling rate
- **WHEN** the sampling rate is 100 Hz
- **THEN** gamma above 50 Hz is reported as not measurable at this rate

### Requirement: Ectopy and arrhythmia burden

The catalog SHALL provide `ectopy-burden` computing beat burden as ectopic ÷ total beats × 100, time burden
as time in arrhythmia ÷ monitored time × 100, and beats per hour, shipping no risk threshold that has not
been read.

#### Scenario: PVC burden
- **WHEN** a 24-hour monitor reports 100,000 beats and 12,000 ventricular ectopic beats
- **THEN** the burden prints 12.0% and 500 per hour, with no threshold claimed

### Requirement: Pulse oximeter accuracy against the FDA guidance

The catalog SHALL provide `spo2-arms-accuracy` computing Arms = √(Σ(SpO2 − SaO2)² ÷ n) and mean bias from
paired readings, comparing Arms with the 2013 guidance's typical value for the sensor type, and checking 10
or more subjects, 200 or more points and at least 2 darkly pigmented subjects or 15% of the pool (whichever
is larger, rounded up), adding variance components only after Bland and Altman 2007 is read, and failing
closed when the watched guidance changes.

#### Scenario: Within the typical value
- **WHEN** four paired differences are +2, −2, +2 and −2 percentage points for a transmittance sensor
- **THEN** Arms prints 2.00%, bias 0.00, and Arms is within the guidance's typical ≤ 3.0%

#### Scenario: Pigmentation minimum
- **WHEN** a study has 20 subjects, 2 of them darkly pigmented
- **THEN** the minimum prints 3 (15% of 20) and the study is reported as short by one

### Requirement: Carotid-femoral PWV after the consensus is read

The catalog SHALL provide `pwv-carotid-femoral` computing PWV from path length and transit time with the
path-length rule from Van Bortel 2012, and SHALL NOT ship before that document has been read.

#### Scenario: Direct distance
- **WHEN** the direct distance is 600 mm, the transit time 60 ms, and the consensus confirms the 0.8 factor
- **THEN** PWV prints 8.0 m/s with the path method named
