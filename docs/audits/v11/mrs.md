# v11 audit - Modified Rankin Scale Reference (`mrs`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: van Swieten JC, Koudstaal PJ, Visser MC, et al. *Interobserver agreement for the assessment of handicap in stroke patients.* Stroke. 1988;19(5):604-607. UK-TIA Study Group. *United Kingdom transient ischaemic attack (UK-TIA) aspirin trial: interim results.* BMJ. 1988;296(6618):316-320. Definitions retained verbatim from the canonical seven-level scale.

mRS is an investigator-rated *reference* instrument, not auto-computed. The tile renders the seven canonical levels (0-6) with their published definitions and a muted explanatory caption.

## Boundary examples added (level coverage rows)
All seven mRS levels rendered against `lib/scoring-v4.js MRS_DESCRIPTIONS`, verified verbatim:
- 0: No symptoms at all.
- 1: No significant disability despite symptoms; able to carry out usual duties and activities.
- 2: Slight disability; unable to carry out all previous activities, but able to look after own affairs without assistance.
- 3: Moderate disability; requires some help, but able to walk without assistance.
- 4: Moderately severe disability; unable to walk without assistance and unable to attend to own bodily needs without assistance.
- 5: Severe disability; bedridden, incontinent, requiring constant nursing care and attention.
- 6: Dead.

All seven definitions match the van Swieten 1988 / UK-TIA 1988 / Banks & Marotta 2007 canonical wording.

## Cross-implementation differential
- Reference implementation: Banks JL, Marotta CA. *Outcomes Validity and Reliability of the Modified Rankin Scale: Implications for Stroke Clinical Trials.* Stroke. 2007;38(3):1091-1096, Table 1 (which reproduces the canonical mRS definitions verbatim).
- Test case: text comparison of every Sophie level against the Banks 2007 table.
- Sophie result: identical wording for all seven levels.
- Reference result: same.
- Delta: 0%. PASS.

## Edge-input handling notes
- No inputs; this is a reference-only tile. The muted caption "Reference instrument; calculation is investigator-rated, not auto-computed." sits below the seven-item list so the user cannot mistake the rendering for a self-scoring tool. PASS.

## A11y / keyboard notes
- Renders as `<ol class="mrs-list" start="0">` with seven `<li>` items, each carrying a `<strong>` numeric label and a descriptive `Text` node. Standard semantic markup. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
