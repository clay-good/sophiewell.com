# spec-v1704 — Biosignal analysis, first slice (tools 2, 5, 6 and 7)

> Status: **SHIPPED (2026-11-07)**: `hrv-time-domain`, `ectopy-burden`, `spo2-arms-accuracy`, `pwv-carotid-femoral`.
> Open in [biosignal-analysis](../openspec/changes/biosignal-analysis/tasks.md): the DSP library and tools 3 and 4
> (HRV frequency domain, EEG band power), and tool 1 (QRS detection), which ships only after its MIT-BIH validation.

## What shipped

| Tool | What it answers | Source |
|---|---|---|
| `hrv-time-domain` | Mean NN, SDNN, RMSSD, NN50, pNN50, the triangular index, SDANN and the SDNN index | Task Force 1996, Table 1 |
| `ectopy-burden` | Ectopic beats as a percent of beats and per hour; arrhythmia time as a percent of monitored time | Stated arithmetic |
| `spo2-arms-accuracy` | Arms, bias and Bland-Altman limits for repeated measures; FDA's 2013 figures and, labeled as a draft, the 2025 draft's | FDA 2013 and 2025 draft; Bland and Altman 2007 |
| `pwv-carotid-femoral` | PWV by the 80% or the subtraction method, with the 10 m/s reference for the 80% method only | Van Bortel 2012; AHA 2015 |

`lib/fda-pulse-oximeter.js` holds the guidance figures as route-B constants; both PDFs are under the weekly page watch.

## The gates, as read

| Gate | Answer |
|---|---|
| 1.2 Task Force | Read for the design the same day; the DOI confirmed through Crossref (10.1161/01.cir.93.5.1043) |
| 1.4 FDA guidances | Both PDFs re-read November 7, 2026. 2013: 10 subjects, 200 pairs, "at least 2 darkly pigmented subjects or 15% of your subject pool, whichever is larger", Table 3 (3.0%, 3.5%, 3.5%). 2025 draft, still "Draft - Not for Implementation": the Arms definition, 150 participants, 25% per MST group, 50% of group 8-10 at ITA -50 degrees or below, 40% of each sex per group, 3,000 pairs, Arms less than 3%, bias gaps less than 3.5% and 1.5%. All match design.md |
| 1.5 Van Bortel | PMID 22278144 confirmed; the full text is still not open |

## Choices made at build

- **Fail-closed by date.** A page watch reports a changed guidance weekly but cannot stop a tool, so
  `spo2-arms-accuracy` also stops answering after the constants' `validThrough` (May 7, 2027) until they are re-read.
- **The 15% minimum rounds up**, and a floating-point guard keeps 15% of 20 at 3 (0.15 x 20 is 3.0000000000000004).
- **The draft's significance tests and its ITA-slope criterion are not computed** (the draft gives no method); each
  draft figure is compared as a point value and no draft "pass" is printed.
- **HRV intervals outside 200 to 3,000 ms are refused**, which catches intervals entered in seconds.
- **Search wording** audited word by word: a draft took "variability" from `inr-variability`, and "rr" and
  "intervals" through a pNN50 phrase; reworded.

## Proof

`test/unit/biosignal-v1704.test.js` (9 tests): every design.md vector for the four tools, Bland and Altman's own worked
example to five decimals, the pigmentation minimum at 10, 13, 14 and 20 subjects, the draft's 38 per MST group, the
refusals and the re-read date.
