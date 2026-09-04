# spec-v1035 — All-zero examples, wave 4

Fourth and near-final wave of `docs/spec-v1031.md`. Sixteen tiles:

| Tile | Opened saying |
| --- | --- |
| `crb65` | outpatient management likely appropriate |
| `ats-idsa-cap` | Not severe |
| `lips` | below the ALI/ARDS high-risk cutoff |
| `rockall` | low risk; mortality 0.1–0.4% |
| `ottawa-ankle` | No imaging indicated |
| `ottawa-heart-failure` | lowest measured risk |
| `stop-bang`, `berlin-osa` | LOW risk for obstructive sleep apnea |
| `lemon` | no predictors of difficult intubation |
| `westley`, `pram-asthma`, `pass-asthma` | mild croup / mild asthma |
| `acog-severe-pre` | 0 of 6 severe features present |
| `talcott-febrile-neutropenia` | group IV — low risk |
| `vis` | low vasoactive load |
| `hospital-score` | low readmission risk |

`lemon` is worth naming: a tile that opens on *"no predictors of difficult intubation"* is telling
an airway operator the thing they least want to be told falsely. `vis` and `hospital-score` needed
real numbers rather than ticks — a patient on epinephrine 0.05 and norepinephrine 0.1 with
milrinone (VIS 20), and a patient with two admissions in the past year.

## What is deliberately left

Three febrile-infant rules — `rochester`, `philadelphia`, `boston-febrile` — still ship all-zero
examples, and they stay. Their criteria are *reassuring* findings, so zero of them met reads "NOT
low risk", which is the alarming direction. Giving those tiles a filled example would put a rule-out
on the opening screen, which is the defect this program exists to remove.

That closes the sweep: no tile in the catalog now opens on a reassuring band it computed from a
worked example of nothing.
