# v48 derivation provenance — 4Ts Score (`four-ts`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4d
- Citation re-verified against: Lo GK, Juhl D, Warkentin TE, Sigouin CS, Eichler P, Greinacher A. *Evaluation of pretest clinical score (4 T's) for the diagnosis of heparin-induced thrombocytopenia in two clinical settings.* J Thromb Haemost. 2006;4(4):759-765.

## Components — verbatim source mapping

Four domains each scored 0-2; total 0-8 per Lo 2006 Table 1.

| T | Domain | 2 points | 1 point | 0 points |
|---|---|---|---|---|
| 1 | Thrombocytopenia | > 50% fall AND nadir ≥ 20 | 30-50% fall OR nadir 10-19 | < 30% fall OR nadir < 10 |
| 2 | Timing of platelet fall | clear onset 5-10 d, OR ≤ 1 d (prior heparin within 30 d) | consistent with 5-10 d but unclear, OR > 10 d | < 4 d without recent heparin |
| 3 | Thrombosis / sequelae | new thrombosis, skin necrosis, acute systemic reaction after IV heparin bolus | progressive / recurrent thrombosis or erythematous skin lesion | none |
| 4 | oTher causes of thrombocytopenia | none apparent | possible | definite |

Each component uses a callback that mirrors the existing `fourTsClamp()` rounding/clamping in `lib/scoring-v4.js` (round, floor at 0, ceiling at 2).

## Bands — source mapping (Lo 2006 Table 2)

| Range | Source label |
|---|---|
| 0-3 | low pretest probability of HIT |
| 4-5 | intermediate pretest probability of HIT |
| 6-8 | high pretest probability of HIT |

## Population

Lo 2006: 100 patients from two clinical settings — academic hematology consult service in Hamilton, Ontario, and a cardiothoracic ICU in Greifswald, Germany. Reference standard: serotonin-release assay (SRA) for HIT antibodies. Subsequent meta-analyses confirm NPV ~97-99% at the low band.

## Validity

Adult patients with suspected heparin-induced thrombocytopenia. The 4Ts is a *pretest probability* score, not a diagnostic test — a low score has high NPV for HIT, but intermediate or high scores warrant laboratory confirmation (immunoassay and/or functional assay such as SRA). Inter-rater reliability is moderate; "other causes" domain is the most subjective. Not designed for pediatrics or pregnancy.

## Source quote

"A score of 0-3 indicated a low pretest probability for HIT, 4-5 indicated an intermediate pretest probability, and 6-8 indicated a high pretest probability." — Lo 2006 §Methods describing Table 2.

## Renderer assertions

Verified locally:
- `META['four-ts'].derivation` has every required field per `lib/derivation.js validate()` and exactly 4 components.
- Components sum equals `fourTs().score` at four boundary points (0, 4, 7, plus a parameterized loop over thrombocytopenia values verifying the 0-2 clamp).

## Defects opened
None.
