# spec-v958 — The VExUS grade, and a "build-blocked" call I got wrong

## The correction first

spec-v957 listed seven verified catalog gaps and said none was buildable, because each needs a
numeric table that lives in its paper's figures rather than its abstract. That was true of the
abstract and **false of the paper**. The VExUS derivation is open access: PMC7142196. I had
stopped at the abstract without checking.

Reading the full text gives the severity definitions verbatim, from the Fig. 1 caption:

| Territory | Mild | **Severe** |
| --- | --- | --- |
| Hepatic vein | systolic component lower than diastolic, still toward the liver | **systolic component reversed, toward the heart** |
| Portal vein | velocity varies 30 to under 50% | **variation of 50% or more** |
| Intrarenal vein | discontinuous, systolic and diastolic phases | **discontinuous, only a diastolic phase** |

and the paper's two worked patients pin the grades at both ends: Patient #1, "normal hepatic
triphasic pattern … non-pulsatile portal flow … continuous intra-renal venous flow and an IVC
diameter of > 2.1 cm", is **Grade 1**; Patient #2, with all three severely abnormal, is
**Grade 3**. The abstract supplies the rule between them — severe congestion is *severe flow
abnormalities in multiple Doppler patterns with a dilated IVC (≥ 2 cm)*.

Grade 2 was the only step not stated outright, so it was cross-verified against two further
open-access sources per the spec-v97 rule. PMC13413828: *"Grade 2 reflects moderate congestion,
characterized by a dilated IVC associated with significant abnormalities in at least one Doppler
territory."* PMC13463979 confirms the 0-at-risk-moderate-severe spectrum. Three documents agree.

## The tile

```
IVC under 2 cm                                    -> Grade 0
IVC at or above 2 cm, no severe waveform          -> Grade 1
IVC at or above 2 cm, one severe waveform         -> Grade 2
IVC at or above 2 cm, two or more severe          -> Grade 3
```

It is the **companion** of `ivc-fluid-responsiveness` — the same vein, the opposite question.

## The two things it exists to say

**Mild findings do not raise the grade.** This is the trap, and it is the paper's own finding:
prototypes B and D combined mild and severe abnormalities, prototype **C** counts severe
patterns only, and C is the one that performed. Three mild waveforms with a dilated IVC read
exactly the same as three normal ones — so the result names the mild findings and says in the
same breath that they did not move the number.

**A dilated IVC on its own is not congestion.** The derivation measured IVC dilatation alone at
**41% specificity** and concluded it "is not sufficient to detect clinically significant
congestion". Grade 1 is that sentence made into a band.

The result also carries what the score is not: derived in 145 adults after cardiac surgery to
predict AKI in the first 72 hours, not a volume-status meter; Grade 3 is specific rather than
sensitive, so a low grade is not evidence against congestion; and the paper's own confounders —
tricuspid regurgitation distorts hepatic vein flow, portal pulsatility and IVC dilatation both
occur in healthy athletes, and the intrarenal trace is the hardest to obtain.

## One source ambiguity, recorded

The derivation's methods text writes the severe portal threshold as **"PF > 50%"** and its
Fig. 1 caption as **"a variation of ≥ 50%"**. The tile uses the caption, which is the
definitional artifact, and says "50% or more" wherever it states the rule.

## Proof

| Check | Result |
| --- | --- |
| the paper's Patient #1 and Patient #2 | Grade 1 and Grade 3, as tests |
| three mild waveforms vs three normal, dilated IVC | both Grade 1, and the result says why |
| all three severe with IVC 1.5 cm | Grade 0, and it says the waveforms were not used |
| 2.00 cm vs 1.99 cm with one severe | Grade 2 vs Grade 0 |
| an unrecognised waveform value | read as normal, never as severe |
| `/#vexus` in the live app | all four cases correct; source link resolves to PMID 32270297 |
| `vexus.test.js` | 11 pass |
| `npm run lint` | clean — catalog 1,706 → **1,707**, README source-link count auto-checked at 1,602 |
| `npm run test:unit` / `test:mcp` | 12,965 / 421 |
| `mobile-no-hscroll` full catalog sweep | 18 pass |
| hub and topic rows ending in a cut mark | 774, **down** from 775 |
