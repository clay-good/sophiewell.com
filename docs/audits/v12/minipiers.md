# v12 audit - minipiers

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: Payne BA, Hutcheon JA, Ansermino JM, et al. A risk prediction model for the assessment and triage of women with hypertensive disorders of pregnancy in low-resourced settings: the miniPIERS model. PLoS Med. 2014;11(1):e1001589 (re-fetched; coefficients cross-read across the open PLoS Medicine journal PDF and the PMC full text).

`lib/ob-v138.js miniPiers()` computes log-odds = -5.77 - 0.298 x multiparity
- 1.07 x ln(GA wk) + 1.34 x ln(SBP mmHg) + dipstick term + 1.18 x (vaginal bleeding with
abdominal pain) + 0.422 x (headache/visual) + 0.847 x (chest pain/dyspnea), then
1/(1+e^-logit). Class A (fixed 2014 coefficients; journal+author citation, no
ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Source-governance catches
- Gestational age AND systolic blood pressure enter as NATURAL LOGS, not linearly.
- Dipstick proteinuria enters as THREE categorical indicators relative to trace/1+/none:
  2+ carries the published NEGATIVE weight -0.218, 3+ +0.424, 4+ +0.512 (non-monotonic as
  published). The compute keys DIP_BETA on '2+'/'3+'/'4+'; trace/1+/none default to 0.
- Threshold per the paper: >= 25% high-risk rule-in (positive likelihood ratio 5.09,
  sensitivity 41.4%, specificity 91.9%); > 15% increased surveillance. Not invented.

## Boundary worked examples added
- multiparous, GA 34, SBP 160, 3+ proteinuria, headache -> 10%, lower risk.
- a severe profile crosses the >= 25% rule-in flag.
- dipstick 2+ yields a lower probability than 3+ (the published negative coefficient).
- a missing GA or SBP -> valid:false (no ln of a bad input).

## Edge-input handling notes
- Two required positive number inputs (GA, SBP) plus booleans and a select; any blank
  required value surfaces a complete-the-fields fallback. Probability always finite.

## A11y / keyboard notes
- Two number inputs + one select + four checkboxes; output aria-live="polite". 320px, no
  hscroll.

## Defects opened
- none
