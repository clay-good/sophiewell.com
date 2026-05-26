# v48 derivation provenance — PHQ-9 (`phq9`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-3d
- Citation re-verified against: Kroenke K, Spitzer RL, Williams JBW. *The PHQ-9: validity of a brief depression severity measure.* J Gen Intern Med. 2001;16(9):606-613.

## Screener-renderer integration

PHQ-9 (and GAD-7) use `lib/screener.js renderScreener` rather than the per-tile imperative pattern used by most other derivation tiles. Wave 48-3d added an optional `opts.onUpdate(answers, score, band)` callback to `renderScreener` so the screener's existing radio-button form can drive live updates of the derivation steps. The tile view (`views/group-g.js phq9()`) calls `renderScreener` with `{ onUpdate: ... }`, then appends the derivation block, then primes the initial step list from `PHQ9_CONFIG.exampleAnswers` (which pre-fills the form).

Component `inputKey`s are the item *index* as a string (`'0'`-`'8'`); the tile view converts the screener's numeric-indexed `answers` array into `{ '0': v0, '1': v1, ... }` for the derivation renderer.

## Components — verbatim source mapping

Nine items per Kroenke 2001. Each scored 0-3 against a 4-option Likert scale (over the prior 2 weeks).

| Index | Item phrasing (Kroenke 2001 Appendix) |
|---|---|
| 0 | Q1: "Little interest or pleasure in doing things" |
| 1 | Q2: "Feeling down, depressed, or hopeless" |
| 2 | Q3: "Trouble falling or staying asleep, or sleeping too much" |
| 3 | Q4: "Feeling tired or having little energy" |
| 4 | Q5: "Poor appetite or overeating" |
| 5 | Q6: "Feeling bad about yourself - or that you are a failure or have let yourself or your family down" |
| 6 | Q7: "Trouble concentrating on things, such as reading the newspaper or watching television" |
| 7 | Q8: "Moving or speaking so slowly that other people could have noticed; or the opposite — being so fidgety or restless that you have been moving around a lot more than usual" |
| 8 | Q9: "Thoughts that you would be better off dead, or of hurting yourself in some way" |

Each option set: 0 (not at all) / 1 (several days) / 2 (more than half the days) / 3 (nearly every day).

## Bands — source mapping

From Kroenke 2001 Table 4 (severity stratification):

| Score | Source label |
|---|---|
| 0-4 | minimal depression |
| 5-9 | mild depression |
| 10-14 | moderate depression |
| 15-19 | moderately severe depression |
| 20-27 | severe depression |

The cutoff of ≥10 is the standard treatment-threshold cutoff.

## Population

Derivation and validation: 6000 patients across 8 primary-care clinics and 7 obstetrics-gynecology clinics (Kroenke 2001). Reference standard: SCID structured psychiatric interview.

## Validity

Adults (≥18) in primary-care and obstetrics-gynecology settings. PHQ-9 is a SCREEN, not a diagnostic test — a positive score (≥10) should prompt a clinical interview to confirm DSM diagnosis. **Item 9 (suicidality) is a critical-action flag regardless of the aggregate**: any non-zero Q9 response should trigger immediate suicide-risk evaluation (C-SSRS is a separate Sophie tile for that workflow). NOT validated in patients with cognitive impairment that precludes self-report, or in non-English-speaking populations using non-validated translations.

## Source quote

"The PHQ-9 is a 9-item, self-administered version of the PRIME-MD diagnostic instrument for common mental disorders. ... [It] is a reliable and valid measure of depression severity. These characteristics plus its brevity make the PHQ-9 a useful clinical and research tool." — Kroenke 2001 §Abstract.

## Renderer assertions

Verified locally:
- `META.phq9.derivation` has every required field per `lib/derivation.js validate()` and exactly 9 components.
- Components sum equals `scoreScreener()` total at three boundary points (max 27, worked example 7, zero).
- Bands span 0-27 contiguously.

## Defects opened
None.
