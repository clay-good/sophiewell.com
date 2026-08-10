# spec-v679.md — GerdQ (Gastroesophageal Reflux Disease Questionnaire)

> Status: **SHIPPED (2026-08-09).** Builds the `gerdq` tile. Catalog **1509 → 1510**, group G.

## Why

The catalog covered laryngopharyngeal-reflux instruments (Reflux Symptom Index, Reflux
Finding Score) but not **GerdQ**, the standard primary-care screen for typical GERD. GerdQ
is the validated bedside tool that turns a week of symptom frequencies into a diagnostic
likelihood and a treatment-impact score.

## What it does

Six items, each recorded as how many of the past 7 days the symptom occurred (0 days = band
0, 1 day = 1, 2–3 days = 2, 4–7 days = 3):

| Item | Predictor | Points |
| --- | --- | --- |
| Heartburn | positive | band (0–3) |
| Regurgitation | positive | band (0–3) |
| Epigastric pain | **negative** | reverse (3–0) |
| Nausea | **negative** | reverse (3–0) |
| Reflux-related sleep disturbance | positive (impact) | band (0–3) |
| Extra OTC reflux medication | positive (impact) | band (0–3) |

Total **0–18**. **≥ 8 = high likelihood of GERD.** Approximate probability of GERD by band
(Jones 2009): 0–2 ~0%, 3–7 ~50%, 8–10 ~79%, 11–18 ~89%. An **impact subscore** (sleep +
medication, 0–6) gauges effect on daily life and supports escalating therapy.

## Posture (spec-v97)

A primary-care screen for typical reflux symptoms, not a substitute for endoscopy or pH
testing; alarm features still warrant investigation. It supports rather than replaces
clinical judgment. Neutral field labels are used — the copyrighted questionnaire wording is
not reproduced, only the published scoring method.

## Files

- `lib/gerdq-v679.js` — `gerdq()`, `GERDQ_NOTE`.
- `views/group-v679.js` (RV679) — six frequency selects; a11y-checked, no innerHTML, no network.
- `mcp/adapters/gerdq-v679.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, scoring/likelihood/impact bands, related.
- `test/unit/gerdq.test.js` — 7 tests (true min 0, true max 18, reverse-scoring, cutoff 8
  worked example, 7-not-flagged, likelihood bands, validation).
- `docs/spec-v679.md` (this file).

## Sourcing (spec-v97)

Jones R, Junghard O, Dent J, et al. Development of the GerdQ, a tool for the diagnosis and
management of gastro-oesophageal reflux disease in primary care. *Aliment Pharmacol Ther.*
2009;30(10):1030-1038 (PMID 19737151). The frequency bands and the reverse-scoring of the two
negative predictors (epigastric pain, nausea) were confirmed across multiple reproductions;
one secondary source (FPNotebook) omits the reverse-scoring, but the primary paper and the
majority of validation reproductions apply it, and it is intrinsic to GerdQ's design. The
likelihood bands (0-2 ~0%, 3-7 ~50%, 8-10 ~79%, 11-18 ~89%) are from the Jones 2009 derivation.
