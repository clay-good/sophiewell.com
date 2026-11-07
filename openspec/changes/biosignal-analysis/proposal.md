# Change: Biosignal analysis from the reader's own recordings

**Status:** Proposed November 7, 2026. Docs-only: no catalog-count or code change. Seven tools; four are
build-gated on a primary source.
**Audience:** the cardiology and neurology trainee, the clinical engineer and sleep or EEG technologist,
the open-hardware builder validating an ECG, PPG or EEG board, and an AI agent handed raw telemetry over MCP.

## Why

The catalog reads numbers a clinician has already measured off a tracing (`qtc`, `ecg-axis`,
`lvh-criteria`, `tpe-qt-ratio`, `lown-ectopy`, `anaqeeb-aeeg`, `nichd-fhr`) and has `bland-altman` for
method agreement. It has nothing that computes from the samples themselves: R-peaks from an ECG trace,
heart-rate variability from RR intervals, EEG band power, ectopy burden from Holter counts, or a pulse
oximeter's accuracy from paired readings.

A name search of the live catalog on November 7, 2026 for "HRV", "heart rate variability", "RMSSD",
"SDNN", "QRS detection", "R-peak", "band power", "spectral", "PVC burden", "Arms", "pulse oximeter
accuracy" and "pulse wave velocity" found nothing.

Sources read on November 7, 2026:

- Kane N, et al. A revised glossary of terms most commonly used by clinical electroencephalographers and
  updated proposal for the report format of the EEG findings. *Clin Neurophysiol Pract* 2017;2:170
  (PMC6123891, CC BY-NC-ND), with its 2019 corrigendum (PMC6606822) redefining the beta band.
- FDA, *Pulse Oximeters - Premarket Notification Submissions [510(k)s]*, final guidance, March 4, 2013.

## What changes

| # | id | Name | Source |
|---|---|---|---|
| 1 | `qrs-detect-trace` | R-Peaks, Heart Rate and RR Intervals From a Single-Lead ECG Trace (Pan-Tompkins) | Pan and Tompkins 1985 (**not opened; build gate**) |
| 2 | `hrv-time-domain` | Heart Rate Variability, Time Domain (SDNN, RMSSD, pNN50) From RR Intervals | Task Force 1996 (**not opened; build gate**) |
| 3 | `hrv-frequency-domain` | Heart Rate Variability, Frequency Domain (VLF, LF, HF, LF/HF) From RR Intervals | Task Force 1996 (**not opened; build gate**) |
| 4 | `eeg-band-power` | EEG Absolute and Relative Band Power From a Sampled Channel | Kane 2017 and its 2019 corrigendum (read) |
| 5 | `ectopy-burden` | Ectopic Beat and Arrhythmia Burden From Monitor Counts | arithmetic identity |
| 6 | `spo2-arms-accuracy` | Pulse Oximeter Accuracy From Paired SpO2 and SaO2 (Arms, Bias, Study Size) | FDA 2013 guidance (read) |
| 7 | `pwv-carotid-femoral` | Carotid-Femoral Pulse Wave Velocity From Distance and Transit Time | Van Bortel 2012 (**not opened; build gate**) |

## Why this passes the admission rule

Each takes the reader's samples, intervals, counts or paired readings and returns computed values with the
method shown. No tool ships a recording, a device calibration curve or a diagnostic threshold that was not
read. Tool 1's output is the input of tools 2 and 3, linked with prefill.

## What this does not do

- It does not diagnose an arrhythmia, a seizure or a device fault. Beat detection is not rhythm
  classification, and the page says so.
- It does not ship filter design as a tool. The band-pass and derivative steps live inside tool 1 as Pan and
  Tompkins describe them, stated on the page.
- It does not compute SpO2 from raw red and infrared PPG. The calibration curve is device-specific and no
  primary source gives one a reader's device shares.
- It does not stream from hardware. The reader pastes, drops a CSV, or an agent passes an array.

## Impact

- New capability `biosignal-analysis`.
- Backfills (links only): `qtc` and `lown-ectopy` link tools 1 and 5; `bland-altman` links tool 6;
  `anaqeeb-aeeg` links tool 4.
- MCP: one adapter per tool; tools 1 to 4 accept a sample or interval array with its sampling rate, which is
  the "local agent with raw telemetry" use the idea asked for, with no cloud.
