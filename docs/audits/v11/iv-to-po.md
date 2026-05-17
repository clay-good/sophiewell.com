# v11 audit - IV-to-PO Conversion Reference (`iv-to-po`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: FDA-approved labeling on DailyMed for each bundled drug, specifically the "Pharmacokinetics - Absorption" section that reports oral bioavailability (F).

## Boundary examples added (table coverage rows)
This is a pure reference table tile. Per spec-v11 §3.3 step 10, coverage rows are individual entries verified against DailyMed.
- levofloxacin: F = 0.99, ratio 1:1. Matches DailyMed (Tavanic / Levaquin) PK section.
- ciprofloxacin: F = 0.70, ratio 1:1 (for most indications). Matches DailyMed; the "for most indications" caveat preserves the standard ID-pharmacist note that IV is preferred for serious systemic infection despite high F.
- metronidazole: F = 1.00, ratio 1:1. Matches DailyMed.
- linezolid: F = 1.00, ratio 1:1. Matches DailyMed (Zyvox).
- fluconazole: F = 0.90, ratio 1:1. Matches DailyMed (Diflucan).
- azithromycin: F = 0.38, ratio "500 mg IV ~ 500 mg PO (per label)". Matches DailyMed; the label-based 1:1 dose framing (despite F = 0.38) reflects the label's specific recommendation, not a mathematical inversion of F.
- doxycycline: F = 0.95, ratio 1:1. Matches DailyMed (Vibramycin).

All seven rows verified against the cited DailyMed package inserts.

## Cross-implementation differential
- Reference implementation: DailyMed package insert PK sections.
- Test case: levofloxacin IV-to-PO conversion.
- Sophie reference: F = 0.99, ratio 1:1.
- Reference result: F approximately 1 (99% per DailyMed), 1:1 conversion (label).
- Delta: 0%. PASS.

## Edge-input handling notes
- No interactive inputs; renders the full table with a built-in search field via `renderTable`. The search input is keyboard-reachable and filters all three columns. PASS.

## A11y / keyboard notes
- `renderTable` emits a search input + `<table>` with semantic headers; both reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
