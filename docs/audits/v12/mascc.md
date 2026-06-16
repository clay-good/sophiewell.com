# v12 audit - mascc

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Klastersky J, Paesmans M, Rubenstein EB, et al. The Multinational Association for Supportive Care in Cancer risk index. J Clin Oncol. 2000;18(16):3038-3051.

`lib/hemonc-v94.js mascc()` sums the seven weighted MASCC items (max 26); a total >= 21 identifies a low-risk febrile-neutropenic patient. The tile reports the index only.

## Boundary worked examples added
- favorable profile -> 26, low risk.
- low-risk cut: 21 low, 20 not low.
- moderate-burden combination -> 19, not low.
- severe burden contributes 0.

## Cross-implementation differential
- Reference: Klastersky 2000 point table; >= 21 low risk. Match. PASS.

## Edge-input handling notes
- Burden-of-illness select maps no/mild 5, moderate 3, severe 0; out-of-set -> 0. Binary factors default absent. Fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- One burden <select> + six yes/no <select>s; output aria-live="polite". 320px sweep passes with no horizontal scroll. Reports the index only, not the admission decision.

## Defects opened
- none

## Status
- PASS
