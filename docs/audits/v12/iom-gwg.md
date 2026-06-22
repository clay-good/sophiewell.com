# v12 audit - iom-gwg

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: Institute of Medicine and National Research Council. Weight Gain During Pregnancy: Reexamining the Guidelines. Washington, DC: National Academies Press; 2009; carried in ACOG Committee Opinion 548 (re-fetched; the singleton and twin ranges and the weekly rates cross-read across the NAP report, Rasmussen & Yaktine 2010, ACOG CO 548, and the MSD Manual table).

`lib/ob-v138.js iomGwg()` derives the pre-pregnancy BMI (703 x lb / in^2), maps it to the
IOM category, and returns the recommended total gain range and 2nd/3rd-trimester weekly
rate (singleton) or the provisional total range (twin). Class B (the IOM/ACOG ranges are
revisable -> docs/citation-staleness.md row; the citation names ACOG, which is in the
issuer acronym set, so the row is gate-forced).

## Source-governance notes
- Singleton totals: underweight (BMI < 18.5) 28-40 lb, normal (18.5-24.9) 25-35 lb,
  overweight (25-29.9) 15-25 lb, obese (>= 30) 11-20 lb; weekly 2nd/3rd-trimester rates
  1.0/1.0/0.6/0.5 lb/wk respectively. Twin provisional totals: normal 37-54, overweight
  31-50, obese 25-42 lb; NO IOM recommendation exists for an underweight twin pregnancy --
  the tile reports that rather than inventing a range.
- The optional current-gain-versus-target comparison from spec-v138 §2.6 is deliberately
  not shipped: the IOM does not publish a cumulative point target at an arbitrary
  gestational age, so a deterministic "on track" verdict would require interpolating a
  value the source does not state. The tile reports the published target range; the
  individualized comparison stays with the clinician. (Same no-fabrication discipline as
  the gwtg-hf deferral and the npcr-pna two-point form.)

## Boundary worked examples added
- 200 lb / 64 in -> BMI 34.3, obese, 11-20 lb singleton.
- 130 lb / 65 in -> normal weight, 25-35 lb.
- 170 lb / 64 in twin -> overweight, 31-50 lb provisional.
- 100 lb / 66 in twin -> underweight, no IOM twin recommendation.
- non-positive / missing inputs -> valid:false.

## Edge-input handling notes
- Two positive number inputs plus a boolean; any non-positive or blank weight/height
  surfaces a complete-the-fields fallback.

## A11y / keyboard notes
- Two labeled number inputs + one checkbox; output aria-live="polite". 320px, no hscroll.

## Defects opened
- none
