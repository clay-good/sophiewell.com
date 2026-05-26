# v48 derivation provenance — NIHSS (`nihss`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-3c
- Citation re-verified against: Brott T, Adams HP Jr, Olinger CP, et al. *Measurements of acute cerebral infarction: a clinical examination scale.* Stroke. 1989;20(7):864-870. Public-domain instrument maintained by NIH/NINDS.

## Components — verbatim source mapping

Thirteen rows in the Sophie tile, matching the public-domain NINDS NIHSS form (11 named items; rows 5 and 6 are entered as per-side sums covering motor arm L+R and motor leg L+R).

| Item | Max | Source row |
|---|---|---|
| 1a Level of consciousness | 3 | Brott 1989 Table 1 row 1a |
| 1b LOC questions (month, age) | 2 | Brott 1989 Table 1 row 1b |
| 1c LOC commands (open/close eyes; grip/release) | 2 | Brott 1989 Table 1 row 1c |
| 2 Best gaze | 2 | row 2 |
| 3 Visual fields | 3 | row 3 |
| 4 Facial palsy | 3 | row 4 |
| 5 Motor arm (sum L+R) | 8 | rows 5a + 5b (each 0-4; Sophie collapses to a single 0-8 sum) |
| 6 Motor leg (sum L+R) | 8 | rows 6a + 6b (each 0-4; Sophie collapses) |
| 7 Limb ataxia | 2 | row 7 |
| 8 Sensory | 2 | row 8 |
| 9 Best language | 3 | row 9 |
| 10 Dysarthria | 2 | row 10 |
| 11 Extinction and inattention | 2 | row 11 |

Each `points` callback clamps to `[0, max]` per the item's range. Total range 0-42.

## Bands — source mapping

| Range | NINDS interpretation |
|---|---|
| 0 | no stroke symptoms |
| 1-4 | minor stroke |
| 5-15 | moderate stroke |
| 16-20 | moderate-to-severe stroke |
| 21-42 | severe stroke |

## Population

Brott 1989 derivation: 65 patients with acute stroke at the University of Cincinnati. Subsequently used in nearly every major stroke trial (NINDS rt-PA, ECASS, IST-3, MR CLEAN, DAWN, DEFUSE 3, etc.). Maintained as a public-domain instrument by NIH/NINDS.

## Validity

Adults with acute stroke. NIHSS depends on the rater being NIHSS-certified for inter-rater reliability — uncalibrated scoring can vary by ±2 points across raters. NOT validated for pediatrics (use PedNIHSS). The Sophie tile collapses motor arm L+R and motor leg L+R into per-side sums (0-8 each) to compress the published 8-row sub-items into a single input per limb pair; this is the conventional bedside collapse used by the NINDS form.

## Source quote

"We have developed a clinical scale ... [it] examines the patient's level of consciousness, gaze, visual fields, facial palsy, motor function in each extremity, limb ataxia, sensory loss, language, dysarthria, and extinction and inattention." — Brott 1989 §Methods.

## Renderer assertions

Verified locally:
- `META.nihss.derivation` has every required field per `lib/derivation.js validate()` and exactly 13 components.
- Components sum equals `nihss().total` at three boundary points (worked example 5 moderate, zero, max 42).

## Defects opened
None.
