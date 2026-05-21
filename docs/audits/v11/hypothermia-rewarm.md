# v11 audit - hypothermia-rewarm

- Auditor: CG
- Date: 2026-05-21
- Citation re-verified against: Durrer B, Brugger H, Syme D. *The medical on-site treatment of hypothermia: ICAR-MEDCOM recommendation.* High Alt Med Biol. 2003;4(1):99-103 (Swiss staging HT I-IV by consciousness / shivering / vital signs / arrest). Brown DJ, Brugger H, Boyd J, Paal P. *Accidental hypothermia.* N Engl J Med. 2012;367(20):1930-1938 (rewarming-pathway mapping: HT I passive; HT II active external + minimally invasive; HT III active internal; HT IV ECPR). Lott C, Truhlář A, Alfonzo A, et al. *European Resuscitation Council Guidelines 2021: Cardiac arrest in special circumstances.* Resuscitation. 2021;161:152-219 (§4 Hypothermia; ECPR exclusion thresholds: K+ > 12 mmol/L, known asystole, lethal injury, non-compressible chest).

`lib/scoring-v4.js hypothermiaRewarm()` validates inputs (temperature finite and 0-38; state in the closed picker set; potassium 0-30 if provided), assigns the Swiss stage from the state picker, selects the rewarming pathway, and emits banners (do-not-declare-death-until-32 C and the < 13.7 C lowest-reported-survival note from Gilbert 2000).

## Boundary examples added

- 33.5 C, alert + shivering -> HT I, passive external.
- 30 C, impaired consciousness -> HT II, active external + minimally invasive; jostling-precaution banner.
- 26 C, unconscious with pulse -> HT III, active internal; ECMO/CPB consideration.
- 22 C, cardiac arrest, no exclusion -> HT IV, ECPR first-line.
- 22 C, cardiac arrest, K+ 14 -> HT IV, ECPR NOT indicated (K+ > 12 cut-off).
- 22 C, cardiac arrest, lethal-injury flag -> HT IV, ECPR NOT indicated.
- 22 C, cardiac arrest, K+ 12 exactly (boundary) -> HT IV, ECPR still indicated.
- 13.0 C -> lowest-reported-survival banner present.

## Cross-implementation differential

- Reference: Brown 2012 NEJM Figure 1 (the bedside-staging-to-pathway figure). Worked example "26 C, unconscious, pulse present" maps to HT III, active internal rewarming with ECMO/CPB consideration.
- Sophie result: stage HT III, pathway "Active internal rewarming: warm IV, body-cavity (peritoneal/pleural) lavage; consider ECMO/CPB if hemodynamically unstable." PASS.
- Reference: Lott 2021 §4.7 (ERC) hypothermia-arrest decision: ECPR indicated for HT IV unless serum K+ > 12 mmol/L, asystole pre-cooling, or chest non-compressible.
- Sophie result: at K+ 14, "ECPR not indicated (serum K+ 14 mmol/L (> 12 cut-off))". PASS.

## Edge-input handling notes

- Out-of-range temperature throws. Non-numeric throws. Unknown picker values throw. Optional potassium accepts blank / undefined.

## A11y / keyboard notes

- One number input (core temp), one structured picker (state), one checkbox (ECPR exclusion), one optional number input (K+). All Tab-reachable; aria-live result region; `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
