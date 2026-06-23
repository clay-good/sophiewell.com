# v12 audit - mid-parental-height

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Tanner JM, Goldstein H, Whitehouse RH. Standards for children's height at ages 2-9 years allowing for height of parents. Arch Dis Child. 1970;45(244):755-762. Formula and +/- 8.5 cm target range cross-verified across independent reproductions.

`lib/peds-growth-v141.js midParentalHeight()` computes the Tanner mid-parental
target height: boy `(father + mother + 13)/2`, girl `(father + mother - 13)/2`,
with the +/- 8.5 cm target range (roughly the 3rd-97th percentile). Class A
(Clinical Math & Conversions, Group E).

## Source-governance notes
- The 13 cm adjustment converts both parents to a single sex-adjusted scale.
- The +/- 8.5 cm range is Tanner's stated target band; the spec text's "+/- 6.5 cm"
  was imprecise and corrected to the source value at implementation.
- Reports a genetic-potential estimate, not a guarantee; the growth assessment
  stays with the clinician.

## Boundary worked examples added
- boy, mother 165 + father 180 -> 179 cm (range 170.5-187.5).
- girl, same parents -> 166 cm (range 157.5-174.5).
- equal parents 170/170 -> boy 176.5, girl 163.5.
- missing parent / implausible height / missing sex -> valid:false.

## Edge-input handling notes
- Parent heights are bounded to 100-230 cm; outside that, or a blank, surfaces a
  complete-the-fields fallback. The arithmetic is finite for any in-range input.

## A11y / keyboard notes
- Sex select + two labeled number inputs; output aria-live="polite". 320px sweep,
  no hscroll.

## Defects opened
- none
