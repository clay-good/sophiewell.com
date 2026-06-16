# v12 audit - milan-criteria

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Mazzaferro V, Regalia E, Doci R, et al. Liver transplantation for the treatment of small hepatocellular carcinomas in patients with cirrhosis. N Engl J Med. 1996;334(11):693-699.

`lib/hepgi-v93.js milanCriteria()` evaluates the size/count limb as the documented OR (single <= 5 cm or <= 3 nodules each <= 3 cm) and the invasion/spread limbs as hard AND-gates, naming the failing limb.

## Boundary worked examples added
- 1 nodule 4.5 cm, no invasion/spread -> within (single <= 5 cm).
- 3 nodules 2.8 cm -> within (<= 3 each <= 3 cm).
- size edges: single 5.0 within / 5.1 exceeds; three 3.0 within / 3.1 exceeds.
- count > 3 exceeds; macrovascular invasion or extrahepatic spread fails the AND-gate.

## Cross-implementation differential
- Reference: Mazzaferro 1996 Milan criteria. Match. PASS.

## Edge-input handling notes
- A nodule count of zero or a missing largest size returns a surfaced "size and count required" rather than a vacuous within. Fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Two labeled numeric inputs + two labeled yes/no <select>s; output aria-live="polite". 320px sweep passes with no horizontal scroll. Reports the criterion only, not a listing decision.

## Defects opened
- none

## Status
- PASS
