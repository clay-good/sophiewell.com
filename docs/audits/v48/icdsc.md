# v48 derivation provenance — ICDSC (`icdsc`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-2b
- Citation re-verified against: Bergeron N, Dubois MJ, Dumont M, Dial S, Skrobik Y. *Intensive Care Delirium Screening Checklist: evaluation of a new screening tool.* Intensive Care Med. 2001;27(5):859-864.

## Components — verbatim source mapping

Eight binary items from Bergeron 2001 Table 1. Each item scored over the preceding 8 or 24 hours of observations (institutional convention).

| Item | Source phrasing (Bergeron 2001) | Points |
|---|---|---|
| Altered level of consciousness | "Altered level of consciousness (response to stimulation)" | 1 |
| Inattention | "Inattention" | 1 |
| Disorientation | "Disorientation" | 1 |
| Hallucination, delusion, or psychosis | "Hallucination/delusion/psychosis" | 1 |
| Psychomotor agitation or retardation | "Psychomotor agitation or retardation" | 1 |
| Inappropriate speech or mood | "Inappropriate speech or mood" | 1 |
| Sleep / wake cycle disturbance | "Sleep/wakefulness cycle disturbance" | 1 |
| Symptom fluctuation | "Symptom fluctuation" | 1 |

## Bands — verbatim source mapping

| Score | Source label (Bergeron 2001) |
|---|---|
| 0-3 | below the delirium cutoff |
| ≥ 4 | delirium |

## Population

93 medical-surgical ICU patients at three Canadian hospitals (Bergeron 2001 §Methods). Reference standard: DSM-IV delirium assessment by a consultation psychiatrist.

## Validity

Adult ICU patients. ICDSC is a **screen** — a positive screen (≥4) should prompt confirmation against DSM criteria or by trained psychiatry / geriatrics. Each item is scored on observations over the preceding 8 or 24 hours (institutional convention); a single point-in-time assessment is not the intended use. NOT validated in non-ICU populations (use CAM or 4AT) or in pediatric ICU.

## Source quote

"The ICDSC takes only a few minutes to perform. Its operational definitions are based on DSM criteria... The ICDSC is a useful screening tool to detect delirium in the ICU." — Bergeron 2001 §Conclusion.

## Renderer assertions

Verified locally:
- `META.icdsc.derivation` has every required field per `lib/derivation.js validate()` and exactly 8 components.
- Components sum equals `icdsc().score` at two boundary points (worked example 4 at the delirium cutoff, max 8).

## Defects opened
None.
