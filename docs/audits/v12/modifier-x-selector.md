# v12 audit - modifier-x-selector

- Auditor: CG
- Date: 2026-06-13
- Citation re-verified against: CMS MLN "Proper Use of Modifiers 59 & X{EPSU}"; CMS Pub. 100-04 Ch. 23 and the NCCI Policy Manual. XE = separate encounter, XS = separate structure/anatomic site, XP = separate practitioner, XU = unusual non-overlapping service; 59 only when no X-modifier describes the situation, and CMS prefers the specific X-modifier over the blunt 59.

`lib/billing-v79.js modifierXSelector()` takes the clinical-scenario decision tree and returns the single most specific X-modifier (precedence XE > XS > XP > XU, XU being the residual subset), 59 only when a distinct service exists but no X-subset fits, or a hard refusal when there is no distinct-service basis at all.

## Boundary examples added
- distinct service + separate site -> XS.
- distinct service + separate encounter + separate site -> XE (most specific), with XS named as also-applicable.
- distinct service, no X-subset -> 59 fallback, flagged as the most-audited modifier.
- no distinct-service basis (even with separate encounter checked) -> hard refusal: a distinct-procedure modifier is NOT appropriate.

## Cross-implementation differential
- Reference: the MLN guidance ("use the most specific X{EPSU}; reserve 59 for when none fits") applied by hand.
- Test case: multiple X-subsets apply -> exactly one (the most specific) is returned, the rest named. PASS.
- No basis -> refusal, never a permissive default. PASS.

## Edge-input handling notes
- All inputs are booleans coerced truthily; the adversarial fuzz matrix (NaN/Infinity/'' etc.) never throws and never leaks a banned token (string fields are fixed text + validated modifiers).

## A11y / keyboard notes
- Five labeled checkboxes (each `<label>` wraps its box so the whole row is the hit target); output region `aria-live="polite"`. `npm run test:a11y` clean; 320px no-horizontal-scroll sweep passes.

## Defects opened
- none

## Status
- PASS
