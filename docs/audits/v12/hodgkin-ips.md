# v12 audit - hodgkin-ips

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Hasenclever D, Diehl V. A prognostic score for advanced Hodgkin's disease. N Engl J Med. 1998;339(21):1506-1514.

`lib/lymphoma-v135.js hodgkinIps()` returns the adverse-factor count (0-7) with the freedom-from-progression framing. Class A (fixed derivation paper; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / weight note
- Seven adverse factors, one each: serum albumin < 4 g/dL; hemoglobin < 10.5 g/dL; male sex; age >= 45; Ann Arbor stage IV; WBC >= 15 x10^9/L; lymphocytopenia (lymphocytes < 600/uL OR < 8% of WBC).
- Each factor lowers 5-yr freedom from progression ~7-8% (~84% at 0 down to ~42% at >= 5).

## Boundary worked examples added
- 0 factors; the albumin 4 / Hgb 10.5 strict edges; the inclusive age >= 45 and WBC >= 15 edges; the lymphocytopenia OR-rule (< 600/uL or < 8%); a 4-factor worked example; the 7-factor maximum.

## Edge-input handling notes
- Age clamped to <= 130; the lymphocyte count and percent are separate inputs so the OR-rule is explicit; any blank surfaces valid:false. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Six labeled number inputs + two labeled yes/no selects; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
