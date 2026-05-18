# v11 audit - NEXUS + Canadian C-Spine (`nexus-cspine`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Hoffman JR, Mower WR, Wolfson AB, Todd KH, Zucker MI. Validity of a set of clinical criteria to rule out injury to the cervical spine in patients with blunt trauma (NEXUS). NEJM. 2000;343(2):94-99. Stiell IG, Wells GA, Vandemheen KL, et al. The Canadian C-spine rule for radiography in alert and stable trauma patients. JAMA. 2001;286(15):1841-1848.

## Boundary examples added
The renderer checks all five NEXUS low-risk criteria via boolean AND; the Canadian C-Spine rule is narrative guidance.
- low (no criteria checked): "NEXUS: imaging IS required (one or more criteria not met)". PASS.
- META example (all five low-risk criteria met): "NEXUS: cervical spine imaging NOT required." PASS.
- four of five met: still "imaging IS required" (NEXUS requires ALL five). PASS.
- single criterion missing: same behavior. PASS.

## Cross-implementation differential
- Reference implementation: NEXUS criteria per Hoffman 2000 (NSAID = No tenderness, No intoxication, Normal alertness, No focal deficit, No distracting injury).
- Test case: META example.
- Sophie result: "NEXUS: cervical spine imaging NOT required."
- Reference result: all five low-risk criteria present -> NSAID rule applies -> no imaging required.
- Delta: 0/0 (categorical match). PASS.

## Edge-input handling notes
- Pure checkbox UI; non-binary input impossible.
- Canadian C-Spine guidance is rendered as a narrative paragraph beneath the NEXUS verdict (covers high-risk factors, low-risk factors, and the 45-degree active rotation gate), so the audience sees both rules without conflating them.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Five labelled checkboxes; output region `aria-live="polite"`; the canadian-c-spine paragraph is class="muted" so it visually steps back from the NEXUS verdict heading. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
