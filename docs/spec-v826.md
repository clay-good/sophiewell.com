# spec-v826 — Pulmonary Hypertension Haemodynamics (2022)

## What this gives you

Enter the right heart catheterisation numbers; get the 2022 ESC/ERS haemodynamic
classification — and the pulmonary vascular resistance computed for you.

## §1 The definitions

| | mPAP | PAWP | PVR |
|---|---|---|---|
| **PH** | >20 mmHg | — | — |
| Pre-capillary | >20 | ≤15 | **>2 WU** |
| Isolated post-capillary | >20 | >15 | ≤2 WU |
| Combined pre- and post-capillary | >20 | >15 | **>2 WU** |
| Unclassified | >20 | ≤15 | ≤2 WU |

PVR in Wood units = (mPAP − PAWP) ÷ cardiac output in L/min. The tile computes it; an
entered value wins, since a measured one may come from a different cardiac-output method
than the one to hand.

## §2 Both thresholds moved in 2022, and both moved down

- mPAP for any PH: **≥25 mmHg → >20 mmHg**
- The PVR cut separating a significant pre-capillary component from none: **>3 WU → >2 WU**,
  and PVR became a *mandatory* criterion for pre-capillary PH rather than a supporting number.

A tool still on the 2015 thresholds does **two distinct wrong things**, and both under-call:

1. It reports a patient with an mPAP of 22 mmHg as normal, where the current guideline
   reports pulmonary hypertension.
2. In a patient with a raised wedge pressure and a PVR of 2.5 WU it reports *isolated
   post-capillary* PH where the current guideline reports a *combined* picture — a different
   disease process and a different treatment conversation.

So the tile raises each of those by name **only where the two definitions actually disagree**
— between 20 and 25 mmHg, and between 2 and 3 Wood units. Above 25 mmHg and above 3 WU the
definitions agree and the tile stays quiet. Tested in both directions.

## §3 One boundary worth stating

mPAP >20 is **strictly** greater. Exactly 20 mmHg is not pulmonary hypertension, and the tile
says so at that value rather than letting a reader round through it. Likewise PVR >2 is
strict: exactly 2.0 WU with a normal wedge is *unclassified*, not pre-capillary.

## §4 Sourcing (spec-v97 gate)

- Humbert M, Kovacs G, Hoeper MM, et al. 2022 ESC/ERS Guidelines for the diagnosis and
  treatment of pulmonary hypertension. *Eur Heart J.* 2022;43(38):3618-3731 / *Eur Respir J.*
  2023;61(1):2200879.
- All four haemodynamic categories and both changed thresholds were corroborated across two
  independent sources before encoding.

ESC is a tracked issuer, so `docs/citation-staleness.md` carries a row for this tile.

## §5 Posture

Decision support, not a verdict. It classifies numbers from a right heart catheterisation
already performed. It does not start pulmonary vasodilators, and it does not decide who
should be catheterised.

Catalog 1617 → 1618.
