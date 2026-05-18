# v11 audit - TCCC Tourniquet & Wound-Packing (`tccc`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Committee on Tactical Combat Casualty Care (CoTCCC) Tactical Combat Casualty Care Guidelines for Medical Personnel (current public release). Tourniquet application criteria, conversion timing, and indications for leave-in-place per the public TCCC guidelines. Bundled shard `data/tccc/tccc.json`.

## Boundary examples added (coverage rows per spec-v11 §3.3 step 10)
- Tourniquet apply-within: "As soon as life-threatening external hemorrhage on a limb is identified." PASS.
- Tourniquet conversion timing: "2 hours of total tourniquet time before conversion is considered." PASS (matches TCCC 2-hour conversion guidance).
- Tourniquet leave-in-place criteria: "Patient in shock, transport time short, or amputation distal to TQ." PASS.
- Wound packing not-for: "Junctional or torso non-junctional bleeding only (not chest, abdomen)." PASS (confirms wound packing is for compressible junctional / extremity sites; chest/abdomen call for different management).
- Wound packing material: combat gauze hemostatic preferred; plain gauze if hemostatic unavailable. PASS.
- Wound packing pressure minutes: 3 minutes of direct pressure after packing. PASS.

## Cross-implementation differential
- Reference implementation: CoTCCC TCCC Guidelines (public release, current edition) and Joint Trauma System Clinical Practice Guidelines.
- Test case: tourniquet conversion timing.
- Sophie result: "2 hours of total tourniquet time before conversion is considered."
- Reference result: TCCC guidance recommends consideration of tourniquet conversion when total tourniquet time approaches 2 hours, provided patient is not in shock and conditions allow.
- Delta: text-faithful summary. PASS.

## Edge-input handling notes
- Pure reference tile; no inputs.
- Bundled shard hash gated by `scripts/verify-integrity.mjs`.
- The "not for chest/abdomen" wording in the wound-packing section is the safety guardrail; packing torso bleeding is dangerous and the renderer surfaces this explicitly.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- `<h2>` heading, two `<h3>` subsections (Tourniquet / Wound packing) with `<ul>` of key/value lines; output region role="region" with `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
