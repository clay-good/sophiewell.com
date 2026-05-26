# v48 derivation provenance — GAD-7 (`gad7`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-3d
- Citation re-verified against: Spitzer RL, Kroenke K, Williams JBW, Löwe B. *A brief measure for assessing generalized anxiety disorder: the GAD-7.* Arch Intern Med. 2006;166(10):1092-1097.

## Screener-renderer integration

GAD-7 uses `lib/screener.js renderScreener`. The wave-48-3d `opts.onUpdate(answers, score, band)` extension lets the screener's radio form drive live updates of the derivation steps. Component `inputKey`s are the item index as a string (`'0'`-`'6'`); see the PHQ-9 audit log for the integration pattern.

## Components — verbatim source mapping

Seven items per Spitzer 2006 Table 1. Each scored 0-3 against a 4-option Likert scale (over the prior 2 weeks).

| Index | Item phrasing |
|---|---|
| 0 | Q1: "Feeling nervous, anxious, or on edge" |
| 1 | Q2: "Not being able to stop or control worrying" |
| 2 | Q3: "Worrying too much about different things" |
| 3 | Q4: "Trouble relaxing" |
| 4 | Q5: "Being so restless that it is hard to sit still" |
| 5 | Q6: "Becoming easily annoyed or irritable" |
| 6 | Q7: "Feeling afraid as if something awful might happen" |

Each option set: 0 (not at all) / 1 (several days) / 2 (more than half the days) / 3 (nearly every day).

## Bands — source mapping

From Spitzer 2006:

| Score | Source label |
|---|---|
| 0-4 | minimal anxiety |
| 5-9 | mild anxiety |
| 10-14 | moderate anxiety |
| 15-21 | severe anxiety |

The cutoff of ≥10 is the standard treatment-threshold cutoff.

## Population

Spitzer 2006: 2740 adult primary-care patients across 15 sites. Reference standard: structured psychiatric interview (MINI). The 5/10/15 boundaries are the validated cutoffs from the derivation cohort.

## Validity

Adults in primary-care settings. GAD-7 was developed as a screen for generalized anxiety disorder but performs reasonably for panic, social anxiety, and PTSD as well (sensitivity drops for the non-GAD anxiety disorders — Spitzer 2006 §Discussion). NOT a stand-alone diagnostic test — a positive screen should prompt clinical interview.

## Source quote

"The GAD-7 is a valid and efficient tool for screening for GAD and assessing its severity in clinical practice and research." — Spitzer 2006 §Conclusion.

## Renderer assertions

Verified locally:
- `META.gad7.derivation` has every required field per `lib/derivation.js validate()` and exactly 7 components.
- Components sum equals `scoreScreener()` total at two boundary points (max 21, worked example 7).
- Bands span 0-21 contiguously.

## Defects opened
None.
