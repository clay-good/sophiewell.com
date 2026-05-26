# v48 derivation provenance — CPSS (`cpss`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-3b
- Citation re-verified against: Kothari RU, Pancioli A, Liu T, Brott T, Broderick J. *Cincinnati Prehospital Stroke Scale: reproducibility and validity.* Ann Emerg Med. 1999;33(4):373-378.

## Components — verbatim source mapping

Three binary items from Kothari 1999. The "score" is the count of abnormal items; positive screen if any is abnormal.

| Item | Source phrasing | Points |
|---|---|---|
| Facial droop | "Have the patient show teeth or smile: normal — both sides of face move equally; abnormal — one side of face does not move as well as the other" | 1 if abnormal |
| Arm drift | "Patient closes eyes and holds both arms straight out for 10 seconds: normal — both arms move the same or both arms do not move at all; abnormal — one arm does not move or one arm drifts down compared with the other" | 1 if abnormal |
| Abnormal speech | "Have the patient say 'You can't teach an old dog new tricks': normal — patient uses correct words with no slurring; abnormal — patient slurs words, uses the wrong words, or is unable to speak" | 1 if abnormal |

## Score interpretation

CPSS is **not a sum-based score** — it is a *count of abnormal items*, with a positive screen at any count ≥ 1. The Sophie scoring function returns `abnormalCount` (not `score`); the derivation block's components sum equals `abnormalCount`.

## Bands — source mapping

| Range | Source label |
|---|---|
| 0 of 3 abnormal | negative screen (stroke less likely on these 3 items; continue clinical judgment) |
| ≥ 1 of 3 abnormal | positive screen (activate stroke pathway) |

## Population

Kothari 1999: derivation in 171 prehospital and ED patients with suspected stroke. The CPSS is the most widely-used prehospital stroke screen in the US (the FAST mnemonic — Face / Arm / Speech / Time — is the public-education form).

## Validity

Adults with suspected stroke in the prehospital or ED setting. CPSS is highly sensitive (~88% for anterior-circulation stroke) but less specific — many positives are stroke mimics. ROSIER (a separate Sophie tile) adds explicit mimic-discrimination items. For LVO triage to a thrombectomy-capable center, LAMS or RACE (separate Sophie tiles) supersede CPSS.

## Source quote

"The CPSS is a useful prehospital stroke assessment tool. ... A single abnormal finding on the CPSS may identify patients with stroke." — Kothari 1999 §Conclusion.

## Renderer assertions

Verified locally:
- `META.cpss.derivation` has every required field per `lib/derivation.js validate()` and exactly 3 components.
- Components sum equals `cpss().abnormalCount` at two boundary points (0 negative, 3 of 3).

## Defects opened
None.
