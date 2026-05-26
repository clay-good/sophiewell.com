# v48 derivation provenance — ABCD2 (`abcd2`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4d
- Citation re-verified against: Johnston SC, Rothwell PM, Nguyen-Huynh MN, Giles MF, Elkins JS, Bernstein AL, Sidney S. *Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack.* Lancet. 2007;369(9558):283-292.

## Components — verbatim source mapping

Five features summed to a 0-7 score per Johnston 2007 §Methods (refining the original ABCD score of Rothwell 2005).

| Letter | Feature | Points |
|---|---|---|
| A | Age ≥ 60 years | +1 |
| B | SBP ≥ 140 mmHg OR DBP ≥ 90 mmHg at first evaluation | +1 |
| C | Clinical: unilateral weakness | +2 |
| C | Clinical: speech disturbance without weakness | +1 |
| C | Clinical: other | 0 |
| D | Duration ≥ 60 min | +2 |
| D | Duration 10-59 min | +1 |
| D | Duration < 10 min | 0 |
| D | Diabetes mellitus | +1 |

The B (blood pressure) component uses the second-argument-to-callback pattern (introduced in wave 48-1c) so the SBP-keyed component can also read `inputs.dbp` to apply the OR rule.

## Bands — source mapping (Johnston 2007 Table 3)

| Range | 2-day stroke risk | Source label |
|---|---|---|
| 0-3 | ~1.0% | low risk |
| 4-5 | ~4.1% | moderate risk |
| 6-7 | ~8.1% | high risk |

## Population

Johnston 2007: pooled derivation/validation across four TIA cohorts totaling 4809 patients — California ED cohort, Oxfordshire OXVASC cohort, plus two prospective TIA validation cohorts. Outcome: stroke within 2, 7, and 90 days of TIA.

## Validity

Adult patients presenting with TIA, scored at first medical evaluation. ABCD2 has been criticized in subsequent validation work for modest discrimination compared with imaging-augmented strategies (e.g., adding DWI MRI), and current AHA/ASA guidance favors urgent specialist evaluation regardless of ABCD2. The score is NOT intended to triage AWAY from workup; the low band still carries clinically meaningful stroke risk and warrants timely TIA evaluation per AHA/ASA. Not validated in pediatric stroke.

## Source quote

"We refer to the new score as the ABCD2 score because it consists of the four features of the original ABCD score plus diabetes mellitus, and use of the score for risk stratification..." — Johnston 2007 §Methods.

## Renderer assertions

Verified locally:
- `META.abcd2.derivation` has every required field per `lib/derivation.js validate()` and exactly 5 components.
- Components sum equals `abcd2().total` at four boundary points (0, 4, 7, and a DBP-only-meets-threshold case verifying the OR rule on the B component).

## Defects opened
None.
