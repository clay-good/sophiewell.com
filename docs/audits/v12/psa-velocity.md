# v12 audit - psa-velocity

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Carter HB, et al. JAMA. 1992;267(16):2215-2220. Cross-read against StatPearls NBK557495, PMC3375697, and Carter 2006 (lower-baseline thresholds).

`lib/uro-v130.js psaVelocity()` computes the two-point rate = (later PSA − earlier PSA) / interval-in-years, flagging > 0.75 ng/mL/yr. Class A (journal+author citation — no docs/citation-staleness.md row).

## Source-governance / method note
- The validated Carter method averages consecutive yearly rates over at least three
  measurements spanning at least 18 months. This tile computes the two-point bedside
  approximation and says so explicitly in the note; the > 0.75 ng/mL/yr threshold is the
  original cutoff.
- A lower threshold (~0.35-0.4 ng/mL/yr) applies when baseline PSA < 4; this is stated in
  the note but not hard-coded as a separate band (the tile does not know the baseline
  category beyond the entered earlier value).

## Boundary worked examples added
- 3 → 4.5 over 12 months → +1.5 ng/mL/yr (flagged).
- 4 → 4.5 over 24 months → +0.25 ng/mL/yr (not flagged; interval scales to years).
- 5 → 4 over 12 months → −1 ng/mL/yr (falling PSA, reported, not flagged).
- blank field → valid:false; scalar → valid:false.

## Edge-input handling notes
- Both PSA values and the interval must be positive; velocity rounded to two decimals;
  band classified on the rounded velocity. A signed velocity is shown (with a leading +).

## A11y / keyboard notes
- Three number inputs each labeled; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
