# v11 audit - oxygenation-index

- Auditor: CG
- Date: 2026-06-06 (spec-v55). Guideline-derived (PALICC-2 consensus): carries citationAccessed + a docs/citation-staleness.md row.
- Citation re-verified against: PALICC-2, Emeriaud G, et al. Pediatr Crit Care Med. 2023;24(2):143-168. OI = (FiO2 x mean airway pressure x 100) / PaO2; OSI = (FiO2 x MAP x 100) / SpO2. Invasive bands (OI): mild 4-8, moderate 8-16, severe >=16; (OSI): mild 5-7.5, moderate 7.5-12.3, severe >=12.3.

`lib/clinical-v6.js oxygenationIndex()` returns OI (when PaO2 given) and OSI (when SpO2 given) with the PALICC-2 severity bands. OSI is the saturation-only proxy when no ABG is available.

## Boundary examples added
- moderate: FiO2 0.6, MAP 15, PaO2 80, SpO2 92 -> OI 11.3 (moderate), OSI 9.8 (moderate).
- mild: FiO2 0.5, MAP 12, PaO2 100 -> OI 6.0 (mild), no OSI.
- severe: FiO2 1.0, MAP 20, PaO2 50 -> OI 40.0 (severe).
- OSI-only (no ABG): FiO2 0.5, MAP 12, SpO2 90 -> OSI 6.7 (mild), OI null.

## Cross-implementation differential
- Hand-calc OI 0.6*15*100/80 = 900/80 = 11.25 -> 11.3. Sophie 11.3. PASS.

## Edge-input handling notes
- FiO2 bounded [0.21, 1.0]; PaO2/SpO2 optional; null denominators impossible (num floors).

## A11y / keyboard notes
- Four labeled inputs (PaO2/SpO2 optional), aria-live results. test:a11y clean.

## Defects opened

- none

## Status
- PASS
