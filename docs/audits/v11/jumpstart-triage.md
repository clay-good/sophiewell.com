# v11 audit - JumpSTART Pediatric MCI Triage (`jumpstart-triage`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Romig LE. JumpSTART pediatric MCI triage tool. CHOC Children's Hospital. Public-domain pediatric variant of START (intended ages 1-8). Algorithm: can walk -> Minor; not breathing + breaths return after 5 rescue breaths -> Immediate, else Expectant; RR <15 or >45 -> Immediate; absent peripheral pulse -> Immediate; AVPU inappropriate (P inappropriate or U) -> Immediate; otherwise -> Delayed.

## Boundary examples added
`jumpStartTriage({...})` in [lib/field.js:126](../../../lib/field.js#L126).
- low (META example: canWalk=true): "Minor (green)". PASS (matches META expected).
- apnea, breaths return after 5 rescue breaths: "Immediate (red)". PASS.
- apnea persists after 5 rescue breaths: "Expectant (black)". PASS.
- RR outside 15-45 (canWalk=false, breathing=true, RR=10): "Immediate (red)". PASS.
- RR outside high (RR=50): "Immediate (red)". PASS.
- absent peripheral pulse: "Immediate (red)". PASS.
- AVPU inappropriate (P inappropriate or U): "Immediate (red)". PASS.
- delayed pass (breathing, RR=30, pulse, AVPU appropriate): "Delayed (yellow)". PASS.

## Cross-implementation differential
- Reference implementation: Romig JumpSTART flowchart (CHOC, public domain).
- Test case: META example (canWalk=true).
- Sophie result: Minor (green): child can walk.
- Reference result: Minor (green) - first decision node.
- Delta: 0/0. PASS.

## Edge-input handling notes
- Pediatric RR thresholds (<15, >45) differ from adult START (<10 or >30 in some variants; this implementation uses Romig's 15-45 window).
- `breathsAfterRescue` is tri-valued via the select (yes/no/n.a.); na maps to undefined.
- The renderer's footer cites Romig and CHOC explicitly so the audience understands this is the pediatric algorithm, not START.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Checkboxes + select + number input, all labelled; output `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
