# Tasks — Biosignal analysis from the reader's own recordings

> Before building, confirm the seven ids are absent from the catalog (they were on November 7, 2026);
> tools 1, 2, 3 and 7 are build-gated on Pan and Tompkins 1985, the 1996 Task Force document and Van
> Bortel 2012, and tool 6's variance components on Bland and Altman 2007.
>
> Ids: `id: 'qrs-detect-trace'`, `id: 'hrv-time-domain'`, `id: 'hrv-frequency-domain'`,
> `id: 'eeg-band-power'`, `id: 'ectopy-burden'`, `id: 'spo2-arms-accuracy'`, `id: 'pwv-carotid-femoral'`.

## 1. Read the gated sources
- [ ] 1.1 Pan and Tompkins 1985: every filter coefficient, window, threshold and refractory rule, and the
      sampling-rate assumption (tool 1). Check PMC, institutional repositories and open reprints; a
      verifiable reprint is allowed.
- [ ] 1.2 Task Force 1996: time-domain definitions, triangular-index bin width, band edges, normalized
      units, recording-length rules (tools 2 and 3). The ESC and AHA copies both count as the original.
- [ ] 1.3 Van Bortel 2012: path-length rule and any reference value (tool 7).
- [ ] 1.4 Bland and Altman 2007, section 3: between- and within-subject variance and limits of agreement
      with multiple observations per subject (tool 6).
- [ ] 1.5 FDA's January 2025 pulse oximeter draft: record its status; when final, re-specify tool 6
      against it.

## 2. Lib
- [ ] 2.1 `lib/dsp-vNNNN.js`: radix-2 FFT with zero-padding, Hann window, segment averaging, linear
      detrend, cubic or linear resampling (method stated), IIR filtering for tool 1.
- [ ] 2.2 `lib/biosignal-vNNNN.js`: the seven computes.
- [ ] 2.3 Unit tests: every scenario in the spec delta; a pure sine lands in its band within one frequency
      bin; Parseval's identity holds for the periodogram; an impulse train gives the exact beat count;
      Arms on constructed differences; the pigmentation minimum at 10, 13, 14 and 20 subjects.
- [ ] 2.4 Tool 1 validation on MIT-BIH records with sensitivity and positive predictivity written into
      META (ship gate).

## 3. Views, META, agents
- [ ] 3.1 Group E renderers beside `qtc` and `ecg-axis`; CSV intake via the file-intake drop target;
      plots in the shared chart component.
- [ ] 3.2 Refresh manifest: page watch on FDA's pulse oximeter guidance pages, fail closed for tool 6.
- [ ] 3.3 MCP adapters taking `{ samples: number[], fs: number }` or `{ rr_ms: number[] }`; synonyms:
      "HRV", "heart rate variability", "RMSSD", "SDNN", "pNN50", "LF/HF", "QRS detection", "R peak",
      "Pan-Tompkins", "EEG band power", "alpha power", "PVC burden", "AF burden", "pulse oximeter
      accuracy", "Arms", "PWV", "arterial stiffness".

## 4. Ship
- [ ] 4.1 Count surfaces; `node scripts/build-search-corpus.mjs`; `node scripts/build-unbuilt-index.mjs`;
      `npm run release:check`; CHANGELOG; `docs/spec-vNNNN.md` build record.
