# spec-v1705 — Biosignal analysis, spectral slice (tools 3 and 4) and `lib/dsp.js`

> Status: **SHIPPED (2026-11-07)**: `hrv-frequency-domain`, `eeg-band-power`, and the signal library they run on. Open in
> [biosignal-analysis](../openspec/changes/biosignal-analysis/tasks.md): tool 1 (QRS detection, with its resampler,
> filters and MIT-BIH validation) and the file path for tools 1-4 in `analyze_file`.

## What shipped

| Piece | What it does |
|---|---|
| `lib/dsp.js` | Radix-2 FFT, periodic Hann window, Welch's averaged one-sided PSD (Parseval holds), least-squares detrend, natural cubic spline, band power |
| `hrv-frequency-domain` | VLF, LF, HF, normalized units and LF/HF by Task Force Table 2: RR resampled at 4 Hz by a natural cubic spline, detrended, 64-second Hann windows with 50% overlap; draws the spectrum |
| `eeg-band-power` | Delta to gamma by the IFCN glossary (Kane 2017; beta as corrected in 2019), relative power, peak frequency and resolution; draws the spectrum |

## Choices made at build

- **Recording length, by the Task Force's sentences.** HF needs about 1 minute and LF about 2; VLF from 5 minutes or less
  is called dubious; and fewer than two Welch windows refuses, so the shortest analyzable series is 96 seconds. design.md's
  vector that a 90-second series prints HF and LF contradicts both of its own rules, so the rules were followed: 100 s
  prints HF only, 150 s adds LF, and VLF waits for more than 5 minutes (or a 24-hour recording).
- **The spline test.** design.md asked for "spline exactness on a cubic polynomial"; a natural spline does not reproduce
  a general cubic (its end conditions force a zero second derivative), so the test checks the knots and a straight line.
- **Float noise reads 0.** A band share below a millionth of a percent is printed as 0, not 4.753e-13%.
- **The lower edge of delta** is 0.5 Hz unless the reader picks the glossary's 0.1 Hz, and the result says which.
- **Search wording**: drafts took "alpha" (`aat-deficiency`, alpha-1 antitrypsin) and "hf" (`framingham-hf-criteria`,
  heart failure), so the EEG tool's name no longer lists the band names and the HRV phrases spell out the frequencies.

## Proof

- `test/unit/dsp.test.js` (5 tests): an impulse and a cosine through the FFT, Parseval to 1e-9, a unit sine's power of
  0.5, the Hann 1 : 4 : 1 spread, detrending, and the spline.
- `test/unit/biosignal-v1705.test.js` (4 tests): the 5-minute LF, HF and LF/HF within 5%; the length rules; the EEG
  shares at 10, 13.5 and 13 Hz; the Nyquist note and refusals.
