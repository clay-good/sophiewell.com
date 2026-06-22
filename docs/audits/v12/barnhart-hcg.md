# v12 audit - barnhart-hcg

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: Barnhart KT, Sammel MD, Rinaudo PF, Zhou L, Hummel AC, Guo W. Symptomatic patients with an early viable intrauterine pregnancy: HCG curves redefined. Obstet Gynecol. 2004;104(1):50-55 (re-fetched; the 24%/48h minimal-rise figures cross-read across the PubMed abstract and the Morse 2012 re-analysis).

`lib/ob-v138.js barnhartHcg()` computes the observed rise = (repeat - initial)/initial x
100 and compares it to the minimal expected rise scaled log-linearly from the 53%/48h
anchor as (1.53^(hours/48) - 1) x 100. Class A (fixed 2004 threshold; journal+author
citation, no ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Source-governance notes
- The 2004 paper reports a slowest normal 48-h rise of 53% (the 99% lower bound) and a
  24-h minimum of 24%. The tile flags against the 53% original; the more conservative 35%
  from the 2012 Morse re-analysis (99.9% bound) is noted but not used as the flag.
- The expected minimum is scaled log-linearly because hCG rises log-linearly; it cannot be
  prorated linearly across the interval. At exactly 48 h the expected minimum is 53.0%.

## Boundary worked examples added
- 1000 -> 1400 over 48 h -> 40% observed < 53% expected -> sub-minimal (flagged).
- 1000 -> 1700 over 48 h -> 70% -> at or above the minimum (not flagged).
- a 24-h interval scales the expected minimum below 53%.
- falling hCG -> negative observed rise, flagged.
- a zero or missing initial value -> valid:false (no divide by zero).

## Edge-input handling notes
- Three positive number inputs; a zero or blank initial value surfaces a
  complete-the-fields fallback rather than dividing by zero.

## A11y / keyboard notes
- Three labeled number inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
