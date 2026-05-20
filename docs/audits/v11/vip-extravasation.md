# v11 audit - vip-extravasation

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Jackson A. *Infection control - a battle in vein: infusion phlebitis.* Nurs Times. 1998;94(4):68-71 (VIP picker 0-5). Infusion Nurses Society (INS) *2021 Standards of Practice*, sec 38 (infiltration / extravasation grading 0-4). INS Table 38-3 governs vesicant antidote decisions for grade 4 events.

`lib/scoring-v4.js vipExtravasation()` returns `{vip, insGrade, vesicant, vipLabel, insLabel, banners, text}`. Banners are appended when VIP >=3, INS >=3, and (INS 4 + vesicant).

## Boundary examples added
- VIP 0 / INS 0 (tile example) -> no banners.
- VIP 3 -> remove cannula banner.
- INS grade 3 -> escalate banner.
- INS grade 4 + vesicant -> antidote banner.
- INS grade 4 without vesicant -> escalate but no antidote banner.
- VIP 99 and INS -1 -> clamped to 5 and 0.

## Cross-implementation differential
- Reference: Jackson 1998 VIP cutoff (>=3 remove) and INS 2021 sec 38 escalation (>=3 stop infusion).
- Sophie result: banner set matches across all five boundary cases above. PASS.

## Edge-input handling notes
- VIP clamps to [0, 5]; INS grade clamps to [0, 4]; vesicant coerced via Boolean().

## A11y / keyboard notes
- Two labeled range inputs with linked outputs plus one checkbox; Tab-reachable; aria-live result region.

## Defects opened
- none

## Status
- PASS
