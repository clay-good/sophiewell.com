# v48 derivation provenance — FOUR Score (`four-score`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-2a
- Citation re-verified against: Wijdicks EFM, Bamlet WR, Maramattom BV, Manno EM, McClelland RL. *Validation of a new coma scale: The FOUR score.* Ann Neurol. 2005;58(4):585-593.

## Components — verbatim source mapping

Four ordinal items from Wijdicks 2005 Table 1. Each scored integer 0-4. The score function `lib/scoring-v4.js fourScore()` validates that each is an integer 0-4 and throws otherwise; the derivation's `points` callback clamps to [0, 4] before summation.

| Letter | Component | Source levels (Wijdicks 2005 Table 1) |
|---|---|---|
| E | Eye response (0-4) | 4 = eyelids open or opened, tracking, or blinking to command; 3 = eyelids open but not tracking; 2 = eyelids closed but open to loud voice; 1 = eyelids closed but open to pain; 0 = eyelids remain closed with pain |
| M | Motor response (0-4) | 4 = thumbs-up / fist / peace sign; 3 = localizing to pain; 2 = flexion response to pain; 1 = extension response to pain; 0 = no response to pain OR generalized myoclonus status |
| B | Brainstem reflexes (0-4) | 4 = pupil AND corneal reflexes present; 3 = one pupil wide and fixed; 2 = pupil OR corneal reflexes absent; 1 = pupil AND corneal reflexes absent; 0 = absent pupil, corneal, AND cough reflex |
| R | Respiration (0-4) | 4 = not intubated, regular breathing pattern; 3 = not intubated, Cheyne-Stokes breathing pattern; 2 = not intubated, irregular breathing; 1 = breathes above ventilator rate; 0 = breathes at ventilator rate or apnea |

## Bands — source mapping

The bands reflect the existing `META['four-score'].interpretation.bands` text and the AAN 2010 brain-death determination workup:

| Range | Sophie label |
|---|---|
| 0 | all four components absent (E0 M0 B0 R0); very poor prognosis; AAN 2010 brain-death workup applies |
| 1-15 | intermediate pattern; report per-component E/M/B/R for the bedside hand-off |
| 16 | no observed coma signs (E4 M4 B4 R4) |

## Population

120 ICU patients at the Mayo Clinic with impaired consciousness (Wijdicks 2005 §Methods). Subsequent multi-center validation including Iyer 2009 (Crit Care Med).

## Validity

Adult ICU patients with impaired consciousness. FOUR was designed to overcome GCS limitations in intubated and brainstem-injured patients — the brainstem and respiration components fill the gap where GCS Verbal cannot be scored. NOT validated for pediatric coma assessment (preliminary pediatric FOUR data only). The R component requires knowing the ventilator setting; the bedside RN may need to consult RT or check the vent display.

## Source quote

"The FOUR (Full Outline of UnResponsiveness) score is a new coma scale that overcomes some of the limitations of the Glasgow Coma Scale. ... The four components are eye response, motor response, brainstem reflexes, and respiration; each is graded 0-4. The total ranges from 0 to 16." — Wijdicks 2005 §Abstract.

## Renderer assertions

Verified locally:
- `META['four-score'].derivation` has every required field per `lib/derivation.js validate()`.
- Components sum equals `fourScore()` total at three boundary points (max 16, intermediate 10, zero 0).

## Defects opened
None.
