# v11 audit - CO / Cyanide / Smoke-Inhalation Antidotes (`co-cn-antidote`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Cyanokit (hydroxocobalamin) FDA-approved labeling on DailyMed (current revision): adult 5 g IV over 15 min, may repeat to total 10 g; pediatric 70 mg/kg IV (max 5 g) over 15 min. Nithiodote (sodium nitrite + sodium thiosulfate) FDA-approved labeling: sodium thiosulfate 12.5 g IV (50 mL of 25% solution) adult, 400 mg/kg (max 12.5 g) pediatric. Undersea & Hyperbaric Medical Society (UHMS) indications for HBO in CO poisoning.

## Boundary examples added
Reference content is rendered as static `<h3>` + `<p>` blocks; the audit confirms each numeric against the FDA label.
- Hydroxocobalamin adult: 5 g IV over 15 min; may repeat once for total 10 g. PASS (Cyanokit label).
- Hydroxocobalamin pediatric: 70 mg/kg IV (max 5 g) over 15 min. PASS.
- Sodium thiosulfate adult: 12.5 g IV (50 mL of 25% solution) over 10-30 min. PASS (Nithiodote label).
- Sodium thiosulfate pediatric: 400 mg/kg (max 12.5 g). PASS.
- HBO indication thresholds: COHb >25% (>15% in pregnancy), syncope or LOC at any point, neurologic deficit, persistent symptoms after normobaric O2. PASS (UHMS guidance).

## Cross-implementation differential
- Reference implementation: Cyanokit DailyMed entry; Nithiodote DailyMed entry; UHMS Indications for Hyperbaric Oxygen Therapy (current edition).
- Test case: pediatric hydroxocobalamin.
- Sophie result: 70 mg/kg IV (max 5 g) over 15 min.
- Reference result: Cyanokit pediatric label = 70 mg/kg up to 5 g over 15 min.
- Delta: 0%. PASS.
- Test case: HBO indication for CO.
- Sophie result: COHb >25% (>15% in pregnancy), syncope/LOC, neurologic deficit, persistent symptoms.
- Reference result: matches UHMS standard indications.
- Delta: 0%. PASS.

## Edge-input handling notes
- Pure reference tile; no inputs. The wording carefully distinguishes adult vs pediatric weight-based dosing so a reader cannot accidentally apply the adult flat dose to a child.
- The HBO section is framed as "Consider HBO if..." rather than mandating it, matching UHMS guidance language.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- `<h2>` heading; three `<h3>` subsections (cyanide-hydroxocobalamin, cyanide-thiosulfate, CO-HBO); output region role="region" with `aria-live="polite"`; sources footer is class="muted". `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
