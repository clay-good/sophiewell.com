# v11 audit - START Adult MCI Triage (`start-triage`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Super G, et al. START: Simple Triage and Rapid Treatment. Newport Beach Fire Department / Hoag Hospital, 1983. Public-domain MCI triage protocol. Algorithm: can walk -> Minor; not breathing + breaths return after airway -> Immediate, else Expectant; RR > 30 -> Immediate; absent radial pulse or cap refill > 2s -> Immediate; cannot follow commands -> Immediate; otherwise -> Delayed.

## Boundary examples added
`startTriage({...})` in [lib/field.js:111](../../../lib/field.js#L111).
- low (META example: canWalk=true): "Minor (green)". PASS (matches META expected).
- not breathing, no breaths after airway reposition: "Expectant (black)". PASS.
- not breathing, breaths return after reposition: "Immediate (red)". PASS.
- RR > 30 (canWalk=false, breathing=true, RR=34): "Immediate (red)". PASS.
- absent radial pulse: "Immediate (red)". PASS.
- cannot follow commands: "Immediate (red)". PASS.
- high-end pass (canWalk=false, breathing, RR=24, pulse+capRefill, follows commands): "Delayed (yellow)". PASS.

## Cross-implementation differential
- Reference implementation: original START flowchart (Newport Beach FD / Hoag Hospital 1983).
- Test case: META example.
- Sophie result: Minor (green): patient can walk.
- Reference result: Minor (green) - first decision node.
- Delta: 0/0. PASS.

## Edge-input handling notes
- Walk takes priority over all other inputs (algorithm intent: ambulatory patients are Minor regardless of other findings).
- `breathsAfterReposition` is tri-valued (yes/no/n.a.); the renderer maps the "Not applicable" select option to `undefined` so the branch falls through cleanly.
- `num('respiratoryRate', ...)` rejects negative values; an empty field is treated as 0 (which triggers neither RR > 30 nor the RR<10 fallthrough, leaving the perfusion/command branches to decide).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Checkboxes + select + number input, all labelled; output is class="notice" and `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
