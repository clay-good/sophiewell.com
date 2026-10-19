# Tasks — Laboratory quality control and proficiency-testing arithmetic

> Docs-only proposal. Confirm the seven ids absent (they were on October 19, 2026); re-read
> 42 CFR 493.931 and 493.941 on the eCFR at build and diff against the tables in `design.md`.

## 1. Read the gated sources
- [ ] 1.1 Westgard et al. 1981, *Clin Chem* 27:493: the rule statements (tool 1).
- [ ] 1.2 A Westgard paper stating TE = |bias| + 1.65 CV (tool 4).
- [ ] 1.3 42 CFR 493.803 and 493.2: successful and unsuccessful participation (tool 5).
- [ ] 1.4 42 CFR 493.1255: calibration verification rules (tool 6).
- [ ] 1.5 Levey and Jennings 1950, if reachable; otherwise leave "not opened" on the page.

## 2. Lib
- [ ] 2.1 `lib/lab-stats-vNNNN.js` (mean, sample SD, CV, nearest-rank percentile, least squares);
      `lib/lab-qc-vNNNN.js` (multirule, CLIA limits table with the eCFR date, acceptance
      check, total error, event score, calibration verification, turnaround).
- [ ] 2.2 Unit tests: each multirule fires on a constructed series and reports "not
      evaluable" short of its run count; every CLIA row at its boundary (percent vs unit
      "greater" branches, e.g., creatinine target 1.0 → ±0.2 mg/dL wins over 10%; target 4.0 →
      ±0.4 wins); pH ±0.04; the event score; recovery and range coverage; nearest-rank
      percentile on an odd and even count.

## 3. Views, META, agents
- [ ] 3.1 Group E renderers; tools 2 and 7 use the file-intake drop target for a series.
- [ ] 3.2 META: citations name the CFR section, table and amendment; the Westgard page is
      cited beside the paper as a verified restatement by its author.
- [ ] 3.3 eCFR watch rows for 493.931 and 493.941 in the refresh manifest; fail closed.
- [ ] 3.4 `sigma-metric` backfill: a "fill TEa from CLIA" link that prefills from tool 3.
- [ ] 3.5 MCP adapters; synonyms: "Westgard rules", "QC rules", "Levey-Jennings", "control
      limits", "CLIA limits", "proficiency testing", "PT acceptance", "total error", "TEa",
      "calibration verification", "linearity", "turnaround time".

## 4. Ship
- [ ] 4.1 Count surfaces; `node scripts/build-search-corpus.mjs`; `npm run release:check`;
      CHANGELOG; `docs/spec-vNNNN.md` build record.
