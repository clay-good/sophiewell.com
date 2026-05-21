# v11 audit - heatstroke-decision

- Auditor: CG
- Date: 2026-05-21
- Citation re-verified against: Bouchama A, Knochel JP. *Heat stroke.* N Engl J Med. 2002;346(25):1978-1988 (heat stroke = core >40 C OR CNS dysfunction; classic anhidrotic vs exertional sweating subtype). Lipman GS, Gaudio FG, Eifling KP, Ellis MA, Otten EM, Grissom CK. *Wilderness Medical Society Clinical Practice Guidelines for the Prevention and Treatment of Heat Illness: 2019 Update.* Wilderness Environ Med. 2019;30(4S):S33-S46 (field algorithm: CWI to 38.9 C, cool-first-transport-second, target cooling rate >=0.15 C/min). Casa DJ, McDermott BP, Lee EC, Yeargin SW, Armstrong LE, Maresh CM. *Cold-water immersion: the gold standard for exertional heatstroke treatment.* Exerc Sport Sci Rev. 2007;35(3):141-149 (survival approaches 100% if core lowered below 40 C within 30 minutes).

`lib/scoring-v4.js heatstrokeDecision()` validates inputs (temperature finite and 35-47; cns in {none, mild-confusion, altered}; setting in {field, hospital}), classifies heat exhaustion vs heat stroke per Bouchama 2002, assigns subtype (exertional if sweating preserved, classic if anhidrotic), and emits the field- or hospital-specific cooling algorithm + surveillance banners.

## Boundary examples added

- 39.5 C, no CNS, sweating, field -> heat exhaustion; oral / IV rehydration + passive cooling.
- 40.0 C exactly, no CNS -> heat exhaustion (Bouchama 2002 threshold is >40 C).
- 41.2 C, mild confusion, sweating, field -> exertional heat stroke; CWI to 38.9 C; cool-first-transport-second; 30-minute survival banner.
- 41.0 C, coma, anhidrotic, hospital -> classic heat stroke; CWI preferred, evaporative + ice packs acceptable.
- 39.0 C, altered LOC, sweating, field -> heat stroke (CNS dysfunction independent of temperature).
- Rhabdo / DIC / AKI surveillance banner appears for any heat-stroke outcome.

## Cross-implementation differential

- Reference: Bouchama 2002 Table 1 (case definition). Worked example "41.2 C with mild confusion" qualifies for heat stroke by either criterion.
- Sophie result: stage "heat stroke", subtype "exertional", action "Cold-water immersion (CWI) to target core 38.9 C (102 F). Cool first, transport second per WMS 2019 (Lipman 2019). Target cooling rate >=0.15 C/min." PASS.
- Reference: Lipman 2019 (WMS) field algorithm. The hospital-setting branch substitutes evaporative + ice-pack as the fallback when CWI is unavailable; the 38.9 C overshoot-cutoff is preserved in both branches.
- Sophie result: hospital branch produces "Cold-water immersion preferred. If CWI not available: evaporative cooling + ice packs to groin/axilla/neck. Stop active cooling at 38.9 C to avoid overshoot hypothermia." PASS.

## Edge-input handling notes

- Out-of-range temperature (below 35 or above 47) throws. Non-numeric temperature throws. Unknown cns / setting throws. Sweating is a boolean; defaults to true (exertional).

## A11y / keyboard notes

- One number input (core temp), one picker (cns), one checkbox (sweating), one picker (setting). All Tab-reachable; aria-live result region; `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
