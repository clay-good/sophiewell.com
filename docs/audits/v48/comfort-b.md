# v48 derivation provenance — COMFORT-B (`comfort-b`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4c
- Citation re-verified against: van Dijk M, Peters JWB, van Deventer P, Tibboel D. *The COMFORT Behavior Scale: a tool for assessing pain and sedation in infants.* Am J Nurs. 2005;105(1):33-36.

## Components — verbatim source mapping

Six nurse-observed behaviors per van Dijk 2005 Table 1, each scored 1-5. Range 6-30. Target sedation band 11-22.

| Component | Source levels |
|---|---|
| Alertness | 1 deeply asleep / 2 lightly asleep / 3 drowsy / 4 fully awake and alert / 5 hyper-alert |
| Calmness / agitation | 1 calm / 2 slightly anxious / 3 anxious / 4 very anxious / 5 panicky |
| Respiratory response (intubated) OR crying (extubated) | 1 no spontaneous respiration / 2 spontaneous + ventilator / 3 restless against vent / 4 active breathing against vent or persistent cough / 5 fighting ventilator (or hysterical crying if extubated) |
| Physical movement | 1 no movement / 2 occasional slight / 3 frequent slight / 4 vigorous limited to extremities / 5 vigorous including torso and head |
| Muscle tone | 1 totally relaxed / 2 reduced / 3 normal / 4 increased and flexion of fingers/toes / 5 extreme rigidity |
| Facial tension | 1 totally relaxed / 2 normal / 3 some tension / 4 full facial tension / 5 grimacing |

Each `points` callback clamps to [1, 5]. **Important:** minimum aggregate is 6 (not 0) because every item starts at 1.

## Bands — source mapping

| Range | Source label |
|---|---|
| < 11 | over-sedation — consider lightening |
| 11-22 | adequate sedation (within target band) |
| > 22 | inadequate sedation / distress |

## Population

van Dijk 2005: PICU patients in the Netherlands. COMFORT-B is the "behavior-only" variant of the original COMFORT scale (Ambuel 1992), removing the physiologic items (HR, MAP) so the score does not double-count when sedation also affects vital signs.

## Validity

Pediatric ICU patients (intubated AND extubated). COMFORT-B is one of several PICU sedation instruments (SBS, FLACC, RASS for older children — all separate Sophie tiles); institutional preference governs which to use. Minimum aggregate is 6 (not 0).

## Source quote

"The COMFORT behavior scale is a valid and reliable instrument for assessing pain and sedation in infants and young children. ... The target sedation level on the COMFORT behavior scale is between 11 and 22." — van Dijk 2005 §Conclusion.

## Renderer assertions

Verified locally:
- `META['comfort-b'].derivation` has every required field per `lib/derivation.js validate()` and exactly 6 components.
- Components sum equals `comfortB().score` at three boundary points (target 18, minimum 6, maximum 30).

## Defects opened
None.
