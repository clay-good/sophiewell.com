# v12 audit - ufr-dialysis

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Flythe JE, Kimmel SE, Brunelli SM. Kidney Int. 2011;79(2):250-257 (re-fetched; the formula and the > 13 mL/kg/hr tertile cutoff cross-read across the Nature Reviews Nephrology highlight and PMC10278854).

`lib/nephro-v127.js ufrDialysis()` computes the ultrafiltration rate = volume /
(post-dialysis weight x session hours), in mL/kg/hr, flagging > 13 mL/kg/hr. Class A
(journal+author citation, no ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- 3.5 L over 3 h at 70 kg -> 16.67 mL/kg/hr, above the threshold.
- 2.0 L over 4 h at 80 kg -> 6.25 mL/kg/hr, not flagged.
- zero/blank denominator -> valid:false (no divide-by-zero).

## Cross-implementation differential
- Reference: the rate is scaled to POST-dialysis weight per hour; the > 13 mL/kg/hr
  cutoff is the Flythe 2011 tertile threshold (the > 10 figure is later literature, not
  used). Volume entered in liters and converted to mL internally. Match. PASS.

## Edge-input handling notes
- Three number inputs; hours and weight must be positive (denominators guarded). A
  scalar fuzz arg -> valid:false.

## A11y / keyboard notes
- Three labeled number inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
