# Tasks — Biosignal analysis from the reader's own recordings

> Docs-only proposal, hardened November 7, 2026. No tool is build-gated on a source; `qrs-detect-trace` ships only
> after the MIT-BIH validation in task 2.4. Confirm the seven ids are still absent (`qrs-detect-trace`,
> `hrv-time-domain`, `hrv-frequency-domain`, `eeg-band-power`, `ectopy-burden`, `spo2-arms-accuracy`,
> `pwv-carotid-femoral`; they were on November 7, 2026), then re-read the sources in `design.md`.

## 0. Prerequisite
- [x] 0.1 (landed in spec-v1703, shared with drug-interaction-kinetics) The plot component in `docs/design.md` (shared with `drug-interaction-kinetics` task 0.1). Answers ship
      without it if it has not landed.

## 1. Re-read at build
- [ ] 1.1 Pan-Tompkins eq 3, 9, 11-29 and the high-pass sentence; the erratum if it has become readable.
- [x] 1.2 (read for the design the same day; the DOI confirmed through Crossref for spec-v1704) Task Force Tables 1 and 2 and the recording-length sentences.
- [x] 1.3 (spec-v1705: read for the design the same day; both PMC records cited) Kane 2017 bands and the 2019 corrigendum.
- [x] 1.4 (spec-v1704: both PDFs re-read, figures match design.md, the draft still marked "Draft - Not for Implementation"; hashes recorded) FDA's guidance index for the 2025 draft's status; both guidance pages hashed in
      `scripts/data/page-hashes.json`.
- [x] 1.5 (spec-v1704: the PMID confirmed; full text still not open, so the abstract and AHA 2015 are cited) Van Bortel 2012 full text if it has become open; AHA 2015 Recommendation 6.1.

## 2. Lib
- [ ] 2.1 (spec-v1705 built `lib/dsp.js`: FFT, periodic Hann, Welch, detrend, natural cubic spline, band power; windowed-sinc resampling and the IIR filters land with tool 1) `lib/dsp-vNNNN.js`: radix-2 FFT with zero-padding, periodic Hann window, Welch averaging, linear detrend,
      natural cubic spline, windowed-sinc resampling, integer-coefficient IIR filters.
- [ ] 2.2 (six of seven built, one lib per tool: spec-v1704 tools 2, 5, 6, 7; spec-v1705 tools 3, 4; tool 1 open) `lib/biosignal-vNNNN.js`: the seven computes, including the Pan-Tompkins state machine.
- [ ] 2.3 Unit tests: every vector in `design.md` **Tests**; Parseval for the periodogram; the high-pass impulse
      response and −3 dB point; spline exactness on a cubic polynomial.
- [ ] 2.4 Validation (ship gate for tool 1): MIT-BIH fixtures under the ODC-By attribution; per-record and aggregate
      sensitivity and positive predictivity at 150 ms, written to the build record and META.

## 3. Views, META, agents
- [ ] 3.1 Group E renderers beside `qtc` and `ecg-axis`; CSV intake through the file-reader archetype; in-page sample
      limits measured on a mid-range phone and stated.
- [x] 3.2 (spec-v1704: both guidance PDFs under the weekly page watch; the tool stops answering after its validThrough, 2027-05-07, until they are re-read) Refresh: page watches on both FDA pulse oximeter guidance pages, failing tool 6 closed on a change.
- [ ] 3.3 MCP adapters with the existing field kinds (samples as one string, one value per line); tools 1-4 added to
      `ANALYZABLE` for files. Synonyms: "HRV", "heart rate variability", "RMSSD", "SDNN", "pNN50", "LF/HF", "QRS
      detection", "R peak", "Pan-Tompkins", "EEG band power", "alpha power", "PVC burden", "AF burden", "pulse
      oximeter accuracy", "Arms", "PWV", "arterial stiffness".

## 4. Ship
- [ ] 4.1 Count surfaces; `node scripts/build-search-corpus.mjs`; `node scripts/build-unbuilt-index.mjs`;
      `npm run release:check`; CHANGELOG; `docs/spec-vNNNN.md` build record.
