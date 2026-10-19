# Tasks — Occupational and employee health rules as arithmetic

> Docs-only proposal. Confirm the six ids absent (they were on October 19, 2026); re-read every
> paragraph on ecfr.gov at build and diff Appendix F's tables against `design.md`.

## 1. Read the gated items
- [ ] 1.1 29 CFR 1910.95 Appendix A: whether levels below 80 dBA are excluded from the dose.
- [ ] 1.2 29 CFR 1910.1025(k)(1)(i)(B): the exact averaging window for the 50 µg/100 g rule.
- [ ] 1.3 49 CFR 391.41(b)(11): the audiometric average limit; §391.45: the ordinary
      certification interval; the current Medical Examiner Handbook's hypertension section.
- [ ] 1.4 Whether µg/100 g whole blood and µg/dL are stated equivalent in a source (tool 3).

## 2. Lib
- [ ] 2.1 `lib/occ-health-vNNNN.js`: `noiseDose`, `standardThresholdShift` (with the F-1/F-2
      tables in a data module), `leadMedicalRemoval`, `fmcsaBpInterval`, `fmcsaHearing`
      (reusing the pure-tone average), `leadPelForShift`.
- [ ] 2.2 Unit tests: Table A-1 rows (50% → 85.0 dBA, 100% → 90.0, 200% → 95.0, 500% → 101.6);
      Table G-16 durations reproduce a 100% dose; the Appendix F worked example (shift 20
      uncorrected, 17 corrected); STS on the average of three frequencies only; each FMCSA stage
      boundary (139/89, 140/90, 159/99, 160/100, 179/109, 180/110) with "and/or"; the lead
      monitoring frequency switch at 40; removal at two results ≥ 60; return on two consecutive
      < 40; 400 ÷ 10 hours = 40 µg/m³; ISO-to-ANSI conversion.

## 3. Views, META, agents
- [ ] 3.1 Group H renderers; audiogram entry as a 2 × 5 grid per ear.
- [ ] 3.2 META: citations name the paragraph; examples are the regulation's own (Appendix F).
- [ ] 3.3 eCFR watch rows for 1910.95, 1910.1025 and Part 391 Appendix A.
- [ ] 3.4 MCP adapters; synonyms: "noise dose", "TWA noise", "standard threshold shift", "STS",
      "age correction audiogram", "hearing conservation", "blood lead removal", "medical
      removal protection", "DOT physical blood pressure", "CDL blood pressure", "whisper test",
      "lead PEL 10 hour shift".

## 4. Ship
- [ ] 4.1 Count surfaces; `node scripts/build-search-corpus.mjs`; `npm run release:check`;
      CHANGELOG; `docs/spec-vNNNN.md` build record.
