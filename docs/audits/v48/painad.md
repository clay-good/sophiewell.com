# v48 derivation provenance — PAINAD (`painad`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4b
- Citation re-verified against: Warden V, Hurley AC, Volicer L. *Development and psychometric evaluation of the Pain Assessment in Advanced Dementia (PAINAD) scale.* J Am Med Dir Assoc. 2003;4(1):9-15.

## Components — verbatim source mapping

Five nurse-observed behaviors per Warden 2003 Table 1. Each scored 0-2; range 0-10. Mirrors the FLACC structure (the companion Sophie tile for pediatric pain).

| Component | Source levels |
|---|---|
| Breathing (independent of vocalization) | 0 normal / 1 occasional labored breathing or short period of hyperventilation / 2 noisy labored breathing, long period of hyperventilation, Cheyne-Stokes respirations |
| Negative vocalization | 0 none / 1 occasional moan or groan, low-level speech with a negative or disapproving quality / 2 repeated troubled calling out, loud moaning or groaning, crying |
| Facial expression | 0 smiling or inexpressive / 1 sad, frightened, frowning / 2 facial grimacing |
| Body language | 0 relaxed / 1 tense, distressed pacing, fidgeting / 2 rigid, fists clenched, knees pulled up, pulling or pushing away, striking out |
| Consolability | 0 no need to console / 1 distracted or reassured by voice or touch / 2 unable to console, distract, or reassure |

Each `points` callback clamps to [0, 2].

## Bands — source mapping

| Range | Source label |
|---|---|
| 0 | no pain |
| 1-3 | mild pain / discomfort |
| 4-6 | moderate pain |
| 7-10 | severe pain |

## Population

Warden 2003: derivation in 19 male veterans with advanced dementia on a long-term-care ward. Reference standards: Discomfort Scale (DS-DAT), patient self-report when possible, and nurse Numeric Rating Scale assessments.

## Validity

Adults with advanced dementia (or severe cognitive impairment) who cannot self-report pain. PAINAD uses the same 0/1-3/4-6/7-10 band structure as FLACC (a separate Sophie tile for pediatric pain). For verbal cognitively intact older adults, the numeric rating scale is the preferred tool. NOT designed for acute-pain assessment in unimpaired patients.

## Source quote

"The PAINAD scale is a simple, valid, and reliable instrument for measurement of pain in noncommunicative patients with advanced dementia." — Warden 2003 §Conclusion.

## Renderer assertions

Verified locally:
- `META.painad.derivation` has every required field per `lib/derivation.js validate()` and exactly 5 components.
- Components sum equals `painad().score` at three boundary points (zero, moderate 5, max 10).

## Defects opened
None.
