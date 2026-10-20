# spec-v1658 — Laboratory quality control and proficiency-testing arithmetic

> Status: **SHIPPED (2026-10-19)**: five tools. One more is specified and gated (below).

The build of the [laboratory-quality-control](../openspec/changes/laboratory-quality-control/proposal.md) change
proposed in [spec-v1654](spec-v1654.md). The CLIA sections were read on the eCFR (title 42 current to October 16,
2026) on October 19, 2026.

## What shipped

| Tool | What it answers | Source |
|---|---|---|
| `levey-jennings-limits` | Mean, sample SD, CV and the 1, 2 and 3 SD limits from a control series; results beyond 2 SD named | identity |
| `clia-pt-acceptance` | Whether a PT result is within the limit, for 38 chemistry and 9 hematology rows; the limit as a percent at a decision level | 42 CFR 493.931, 493.941, Table 2 to (c)(2) |
| `pt-event-score` | Analyte and event scores, the 80% line, and the two-consecutive and two-of-three rules | 493.931(c)(4)-(5), 493.941(c)(4)-(5), 493.841, 493.851, 493.2 |
| `calibration-verification` | Recovery at each level against the laboratory's limit, the line, and range coverage | 493.1255(b) |
| `turnaround-time-percentile` | Median, nearest-rank percentile, mean, share meeting a target | identity |

Mean, SD, percentile and the least-squares line are in one shared module, `lib/lab-stats.js`.

## The gates, as read

| Gate | Answer |
|---|---|
| 1.1 Westgard 1981 | Not read: the publisher's page returned a bot check to both curl and the browser. Tool 1 stays gated. |
| 1.3 Successful participation | §493.803 only says participation must be successful. The numbers are in the specialty standards: §493.841 (routine chemistry) and §493.851 (hematology) set 80% per analyte and per event, and call two consecutive or two of three unsatisfactory events unsuccessful. §493.2 defines it the same way. |
| The score formulas | Images on the eCFR page (Federal Register ER25SE06.022 and .023), read: acceptable responses ÷ challenges × 100, per analyte and over all challenges. |
| 1.4 Calibration verification | §493.1255(b): the laboratory's own limits; at least a minimal (or zero), a mid-point and a maximum value near the upper limit; at least every 6 months and after the listed events. |

Both CLIA tables matched the design row for row.

## What changed from the proposal

- **The pass rules come from §493.841 and §493.851**, not §493.803 as the design expected.
- **The event history is entered as the previous two events' overall results.** The per-analyte history rule is
  stated on the page, not computed.
- **Series are pasted lines**, not a dropped file, and the Levey-Jennings result lists outlying points rather than
  drawing a chart.
- **"Near the upper limit" is not judged.** The calibration tool reports how much of the reportable range the
  levels span and leaves "near" to the laboratory.
- **The CLIA tools' names carry no section numbers.** The related-tools picker weighs rare name words, and "42" and
  "CFR" made a CLIA tool look like a sibling of `restraint-timer` (42 CFR 482.13), pushing one of its four timers
  off its shortlist. The citations still name the sections.
- **Search phrases avoid "pt".** A first draft sent the bare query "pt" (prothrombin time, physical therapy) to the
  event score; the phrases now say "proficiency testing".

## Specified, not built

### 1. `westgard-multirule` — Westgard Multirule QC Evaluation (Two Levels, Across Runs)

**Build gate.** Westgard JO, Barry PL, Hunt MR, Groth T, *Clin Chem* 1981;27:493-501 was not read: the publisher's
article page returned a bot check on October 19, 2026, and PubMed blocks the fetch. The design requires the
paper's own rule statements before the tool states them. A copy the owner saves would unblock it, as for spec-v1636.

## Proof

- `test/unit/lab-quality-v1658.test.js`: the shared statistics, every greater-of branch on both sides (creatinine at
  targets 1.0 and 4.0), pH ±0.04, the differential's ±3 SD, the 80% line, both history rules, three-level
  calibration and range coverage, and nearest rank on odd and even counts.
- `test/unit/fuzz-tools.test.js` runs all five modules; `test/mcp/mcp-search-relevance.test.js` has one probe per tool.
