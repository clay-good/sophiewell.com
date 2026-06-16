# v12 audit - asa-ps

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: American Society of Anesthesiologists. ASA Physical Status Classification System (last amended December 13, 2020, with approved examples).

`lib/rheum-periop-v89.js asaPs()` maps the selected descriptor (I–VI) to the ASA Physical Status class, its published definition, and the 2020 approved example conditions, and applies the emergency (E) modifier. The E modifier is appended (e.g. "ASA III-E") for an emergency, but is NOT assignable to ASA I (normal healthy) or ASA VI (organ donor); the tile enforces that and surfaces a note when the modifier is suppressed. ASA-PS describes preoperative physical status and is not, by itself, a predictor of operative risk (stated in the output).

## Boundary worked examples added
- Class III elective -> "ASA III"; class III emergency -> "ASA III-E".
- Class I emergency -> "ASA I" (E suppressed, note); class VI emergency -> "ASA VI" (E suppressed).
- Classes II–V emergency -> all carry the -E suffix.
- Blank / 0 / 7 / 3.5 -> select-the-class fallback.

## Cross-implementation differential
- Reference: ASA 2020 definitions and the E-modifier rule (no E on I or VI), hand-checked. Sophie matches. PASS.

## Edge-input handling notes
- asaClass is validated to an integer 1–6; anything else returns valid:false. The emergency flag accepts boolean true or the strings "yes"/"on". No non-finite value reaches a returned string (spec-v59 fuzz harness covers the module, zero leaks).

## A11y / keyboard notes
- Two labeled selects (class, emergency); output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
