# v48 derivation provenance — COWS (`cows`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-2b
- Citation re-verified against: Wesson DR, Ling W. *The Clinical Opiate Withdrawal Scale (COWS).* J Psychoactive Drugs. 2003;35(2):253-259.

## Components — verbatim source mapping

Eleven items from the COWS 1-page clinician-administered form (Wesson & Ling 2003 Appendix). Each item has its own anchor levels; not all are 0-N integer.

| Item | Source levels (Wesson & Ling 2003) |
|---|---|
| Resting pulse | 0 (≤80) / 1 (81-100) / 2 (101-120) / 4 (>120) |
| Sweating | 0 (none) / 1 (chills, subjective) / 2 (flushed; sweating not detected) / 3 (beads of sweat on brow) / 4 (sweat streaming) |
| Restlessness | 0 / 1 (difficulty sitting still but able) / 3 (frequent shifting) / 5 (unable to sit still) |
| Pupil size | 0 (pinned or normal) / 1 (possibly larger) / 2 (moderately dilated) / 5 (so dilated that only the rim of the iris is visible) |
| Bone / joint aches | 0 / 1 / 2 / 4 |
| Runny nose / tearing | 0-4 |
| GI upset | 0 / 1 (stomach cramps) / 2 (nausea or loose stool) / 3 (vomiting or diarrhea) / 5 (multiple episodes of diarrhea or vomiting) |
| Tremor | 0-4 |
| Yawning | 0-4 |
| Anxiety / irritability | 0 / 1 / 2 / 4 |
| Gooseflesh skin | 0 / 3 / 5 |

The Sophie tile and the derivation block accept the pre-rated 0-N integer per item; the rater chooses ONLY from the source-defined anchor levels (values BETWEEN anchors are not part of the published score).

## Bands — verbatim source mapping

From the COWS scoring key (Wesson & Ling 2003 Appendix):

| Range | Sophie label |
|---|---|
| 0-4 | no active withdrawal |
| 5-12 | mild withdrawal |
| 13-24 | moderate withdrawal |
| 25-36 | moderately severe withdrawal |
| ≥ 37 | severe withdrawal |

## Population

The COWS is a clinician-derived synthesis of prior opioid-withdrawal instruments (Himmelsbach, OOWS, SOWS) refined for outpatient buprenorphine induction. Validated subsequently in numerous buprenorphine-induction studies; most current addiction-medicine protocols use COWS ≥ 8 (mild withdrawal) or ≥ 12 (moderate) as the buprenorphine-start threshold to minimize precipitated withdrawal.

## Validity

Adult patients with confirmed or suspected opioid withdrawal. The COWS is the standard instrument for guiding buprenorphine induction timing. Some items (anxiety, GI upset, restlessness) rely on patient report or active observation; the score can be artificially elevated by other intoxication or by acute medical conditions that mimic withdrawal symptoms (e.g., gastroenteritis, anxiety disorders). Validity is reduced in nonverbal or sedated patients.

## Source quote

"The Clinical Opiate Withdrawal Scale (COWS) is an 11-item scale designed to be administered by a clinician. This tool can be used in both inpatient and outpatient settings to reproducibly rate common signs and symptoms of opiate withdrawal and monitor these symptoms over time." — Wesson & Ling 2003 §Abstract.

## Renderer assertions

Verified locally:
- `META.cows.derivation` has every required field per `lib/derivation.js validate()` and exactly 11 components.
- Components sum equals `cows()` total at two boundary points (worked example 15, zero).

## Defects opened
None.
