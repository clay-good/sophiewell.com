# Change: Biosignal analysis from the reader's own recordings

**Status:** Proposed November 7, 2026; hardened the same day. Every source the first draft gated was found and read,
the Pan-Tompkins high-pass filter was tested and found misprinted (see `design.md`), and the HRV resampling method was
chosen by test. Docs-only: no catalog-count or code change. Seven tools; none is build-gated. `qrs-detect-trace` has a
validation ship gate on the MIT-BIH database.
**Audience:** the cardiology and neurology trainee, the clinical engineer and sleep or EEG technologist, the
open-hardware builder validating an ECG, PPG or EEG board, and an AI agent handed raw telemetry over MCP.

## Why

The catalog reads numbers a clinician has already measured off a tracing (`qtc`, `ecg-axis`, `lvh-criteria`,
`tpe-qt-ratio`, `lown-ectopy`, `anaqeeb-aeeg`, `nichd-fhr`) and has `bland-altman` for method agreement. It has
nothing that computes from the samples themselves.

A name search of the live catalog on November 7, 2026 for "HRV", "heart rate variability", "RMSSD", "SDNN", "QRS
detection", "R-peak", "band power", "spectral", "PVC burden", "Arms", "pulse oximeter accuracy" and "pulse wave
velocity" found nothing.

## What changes

| # | id | Name | Source |
|---|---|---|---|
| 1 | `qrs-detect-trace` | R-Peaks, Heart Rate and RR Intervals From a Single-Lead ECG Trace (Pan-Tompkins) | Pan and Tompkins 1985 (read); MIT-BIH for validation |
| 2 | `hrv-time-domain` | Heart Rate Variability, Time Domain (SDNN, RMSSD, pNN50, Triangular Index) From RR Intervals | Task Force 1996 (read) |
| 3 | `hrv-frequency-domain` | Heart Rate Variability, Frequency Domain (VLF, LF, HF, LF/HF) From RR Intervals | Task Force 1996 (read) |
| 4 | `eeg-band-power` | EEG Absolute and Relative Band Power From a Sampled Channel | Kane 2017 and its 2019 corrigendum (read) |
| 5 | `ectopy-burden` | Ectopic Beat and Arrhythmia Burden From Monitor Counts | arithmetic identity |
| 6 | `spo2-arms-accuracy` | Pulse Oximeter Accuracy From Paired SpO2 and SaO2 (Arms, Bias, Limits, Study Size) | FDA 2013 guidance and 2025 draft; Bland and Altman 2007 (read) |
| 7 | `pwv-carotid-femoral` | Carotid-Femoral Pulse Wave Velocity From Distance and Transit Time | Van Bortel 2012 abstract; AHA 2015 statement (read) |

## Why this passes the admission rule

Each takes the reader's samples, intervals, counts or paired readings and returns computed values with the method
shown. No tool ships a recording, a device calibration curve or a threshold that was not read.

## What this does not do

- It does not diagnose an arrhythmia, a seizure or a device fault.
- It does not ship filter design as a tool, or compute SpO2 from raw PPG (device-specific calibration).
- It does not print a pass against FDA's 2025 draft; draft criteria are shown as a draft.
- It does not stream from hardware. The reader pastes, drops a CSV, or an agent passes a string or a file.

## Impact

- New capability `biosignal-analysis`.
- Prerequisite shared with `drug-interaction-kinetics`: a plot component in `docs/design.md`; answers never depend on it.
- Backfills (links only): `qtc` and `lown-ectopy` link tools 1 and 5; `bland-altman` links tool 6; `anaqeeb-aeeg`
  links tool 4.
- Refresh: page watches on FDA's two pulse oximeter guidance pages, failing tool 6 closed on a change.
- MCP: one adapter per tool; tools 1-4 also through `analyze_file` for large recordings.
