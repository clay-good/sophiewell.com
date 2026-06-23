# v12 audit - ves-13

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Saliba D, Elliott M, Rubenstein LZ, et al. The Vulnerable Elders Survey: a tool for identifying vulnerable older people in the community. J Am Geriatr Soc. 2001;49(12):1691-1699. The point allocation, the 0-10 range, and the >= 3 threshold were cross-verified across 4+ sources (RAND/ACOVE, Min et al. PMC3710109, eviQ instrument PDF, medcalcu).

`lib/frailty-v143.js ves13()` computes the 0-10 total from age (75-84 -> 1,
>= 85 -> 3), fair/poor self-rated health (1), physical-function difficulty (1 per
task rated "a lot"/"unable", capped at 2), and a single 4-point block for any of
five ADL/IADL disabilities. A score >= 3 = vulnerable. Class A.

## Source-governance notes
- The two most error-prone rules were pinned with direct quotes:
  - PHYSICAL FUNCTION: 1 point for each of the 6 tasks rated "a lot of difficulty"
    or "unable to do", CAPPED at 2 ("a little"/"some" score 0). Quote: "1 point
    for each 'A Lot of Difficulty' response. Maximum of 2 points."
  - DISABILITY: ALL-OR-NOTHING -- any one of the 5 ADL/IADL disabilities scores
    the full 4 points (never additive). Quote (Min et al., restating Saliba):
    "presence of any of 5 disabilities ... is assigned four points."
- The 4-point disability rule (not 1) is what makes the maximum 3+1+2+4 = 10; two
  online instrument reproductions (eviQ PDF, medcalcu) mis-print it as 1 point and
  one secondary source mis-prints the age band as "73-84" -- both rejected in
  favor of the original Saliba definition that yields the universally-cited 0-10
  range. A score >= 3 carries about a 4.2-fold two-year risk of functional decline
  or death.

## Boundary worked examples added
- young, healthy, no limitations -> 0, not vulnerable.
- the >= 3 vulnerable flip: age 75-84 + fair health + one "a lot" task = 3.
- just below: "some difficulty" does not count (= 2).
- disability all-or-nothing 4 points; any single ADL crosses the threshold; five
  disabilities still scores exactly 4.
- physical-function points cap at 2; max total is 10.

## Edge-input handling notes
- Age and health are selects (unknown value -> 0 for that domain); physical
  function and disability default to 0 when blank. A bounded sum -- no non-finite
  path. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- Two labeled selects, six difficulty selects, five disability checkboxes; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
