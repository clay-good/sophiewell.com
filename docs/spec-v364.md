# spec-v364.md — Clinical Activity Score (thyroid eye disease) tile

> Status: **SHIPPED (2026-07-16).** Builds the `cas-ted` tile — the Clinical Activity Score (CAS) for
> thyroid eye disease / Graves orbitopathy (7-item initial assessment). Catalog **1215 → 1216**, group G.

## Why

The catalog carries other ophthalmology grades (ICDR, KWB, Shaffer, ACR TI-RADS) but no thyroid-eye
activity score. The CAS is the standard measure of thyroid-eye-disease *activity* and a predictor of
response to anti-inflammatory treatment. `clinical activity score` / `cas thyroid eye` / `graves
orbitopathy activity` routed to nothing.

## What it does

The clinician checks each inflammatory item present in the study eye; the tile sums the score (0–7) and
flags active disease (CAS ≥ 3). This is a boolean-checklist score.

- `lib/cas-ted-v364.js` — sums seven 1-point items: spontaneous orbital pain, gaze-evoked orbital pain,
  eyelid swelling, eyelid erythema, conjunctival redness, chemosis, caruncle/plica inflammation. **CAS ≥
  3** (of 7) = active — flagged. Always returns a valid result (0 checked → CAS 0, inactive).
- `views/group-v364.js` (RV364) — seven checkboxes (dom `cas-*`), real `<label for>`.
- `lib/meta.js` — Mourits 1989 (Br J Ophthalmol) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v85 → v86); corpus → 1216.

**HIGH-STAKES:** it reports the CAS the clinician has assembled from the exam, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The CAS ≥ 3 threshold is the
classically taught cutoff for *considering* treatment, not an order; the management decision stays with
the treating clinician (surfaced in the tile note). The 10-item follow-up version (adds change-over-time
items) is out of scope.

## Sourcing (spec-v97)

- **Citation:** Mourits MP, Koornneef L, Wiersinga WM, et al. Clinical criteria for the assessment of
  disease activity in Graves ophthalmopathy: a novel approach. *Br J Ophthalmol.* 1989;73(8):639-644.
- Cross-verified against EUGOGO and thyroid-eye-disease references reproducing the same seven
  initial-assessment items and the CAS ≥ 3 (of 7) active threshold.

## Verification

Lint (all catalog-truth surfaces at 1216), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: checking three items (pain / gaze pain / eyelid swelling) renders the flagged "CAS 3 of 7 —
active" result, unchecking to two flips to "inactive by CAS", and the tile does not scroll horizontally
at 320px.

## Out of scope

The tile sums the items the clinician checks; it does not examine the patient, apply the 10-item
follow-up version, or recommend treatment. The MCP adapter + golden-probe promotion follow in a separate
wave.
