# spec-v1416 — hepatic venous pressure gradient (HVPG)

From the classification-gap queue: `baveno-vii` rules clinically significant portal hypertension
(CSPH) in or out **without** a catheter, and the catalog had nothing for the measurement that rule
stands in for. `hvpg` computes it and reads it against the same consensus.

## Source

de Franchis R et al, *Baveno VII — Renewing consensus in portal hypertension*, J Hepatol
2022;76:959-974, read 2026-09-24 from PMC11090185. Every threshold is a numbered statement:

| statement | used for |
|---|---|
| 1.7 | the gradient is wedged minus **free** hepatic vein pressure, not minus right atrial |
| 1.8 | free pressure more than 2 mmHg above the IVC: rule out hepatic vein outflow obstruction |
| 1.9 | above 5 mmHg: sinusoidal portal hypertension |
| 1.10 | 10 mmHg or more: CSPH (stated for viral- and alcohol-related cirrhosis) |
| 1.11 | primary biliary cholangitis: HVPG may underestimate |
| 1.12 | MASH/NASH: signs of portal hypertension can appear below 10 |
| 1.13 | signs below 10: porto-sinusoidal vascular disorder must be ruled out |
| 1.19 | 16 or more: higher short-term mortality after non-hepatic abdominal surgery |
| 6.27 | above 20 at the time of hemorrhage: one criterion for pre-emptive TIPS |

## Behavior

Wedged and free pressures are required; IVC pressure, cause, bleeding, and clinical signs are
optional and each only adds the statement it governs. The edges follow the statements' own
comparisons: exactly 5 is **not** above 5, exactly 10 **is** CSPH, and exactly 20 during bleeding
does **not** meet the ">20" TIPS criterion. With no cause entered, a CSPH reading says the 10 mmHg
definition is stated for viral- and alcohol-related cirrhosis. A wedged pressure below the free
pressure is refused as a tracing error rather than reported as a negative gradient. The technique
statements (balloon catheter, 1-minute stable tracing in triplicate, no deep sedation) are in the
note, because a gradient is only as good as the tracing.

## Tests

`test/unit/hvpg.test.js`: the three levels and their exact edges, the 16 and 20 statements (20
only while bleeding, and only above 20), the PSVD note, the cause caveats, the IVC check, and the
refusals.
