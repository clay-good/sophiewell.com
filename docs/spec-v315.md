# spec-v315.md — 2015 revised Jones criteria (acute rheumatic fever) tile

> Status: **SHIPPED (2026-07-15).** Builds the `jones-criteria` tile — the 2015 AHA revised Jones
> criteria for diagnosing acute rheumatic fever (ARF), a major standard diagnostic set with no prior
> tile (the "Jones" corpus hits were the unrelated Ireton-Jones energy equation and a COPD test).
> Catalog **1166 → 1167**, group G.

## Why

ARF/Jones is a widely-referenced, high-stakes diagnostic criteria set — the peer of the existing
`duke-endocarditis` tile — and the catalog had no version. `acute rheumatic fever` / `jones criteria`
routed only to unrelated tiles.

## What it does

The clinician selects the population risk tier and episode type, marks whether there is evidence of
preceding group A strep, and checks the manifestations present; the tile reports whether the 2015 Jones
criteria are **met**, met-but-**needs strep evidence**, or **not met**.

- `lib/jones-v315.js` — pure inputs → classification. Initial ARF: 2 major, or 1 major + 2 minor.
  Recurrent ARF also allows 3 minor. The major/minor definitions are **risk-stratified** (low-risk vs
  moderate/high-risk); a prolonged PR counts only without carditis; **isolated Sydenham chorea is
  sufficient on its own** without strep evidence.
- `views/group-v315.js` (RV315) — two selects (risk tier, episode) + the strep-evidence and
  manifestation checkboxes, real `<label for>`.
- `lib/meta.js` — AHA citation + accessed date + bands; a **citation-staleness ledger row** (the
  citation matches the AHA issuer pattern).
- 9 worked-example unit tests + fuzz registration; synonym entry (v36 → v37); corpus → 1167.

**HIGH-STAKES:** it reports the classification result (criteria met / not met), never a diagnosis or
an order ([spec-v11](spec-v11.md) §5.3); the diagnosis and the exclusion of mimics stay with the clinician.

## Sourcing (spec-v97)

Transcribed verbatim from the 2015 revision, cross-verified against a second source:

- **Citation:** Gewitz MH, Baltimore RS, Tani LY, et al. Revision of the Jones Criteria for the
  diagnosis of acute rheumatic fever in the era of Doppler echocardiography: a scientific statement from
  the American Heart Association (AHA). *Circulation.* 2015;131(20):1806-1818. Cross-checked against
  Burke & Chang, Update on the diagnosis of acute rheumatic fever: 2015 Jones criteria (PMC4829161).
- **Major (low-risk):** carditis (clinical/subclinical), polyarthritis, chorea, erythema marginatum,
  subcutaneous nodules. **Minor (low-risk):** polyarthralgia, fever ≥38.5 °C, ESR ≥60 mm/h and/or CRP
  ≥3 mg/dL, prolonged PR (if no carditis).
- **Major (moderate/high-risk):** carditis, monoarthritis OR polyarthritis OR polyarthralgia, chorea,
  erythema marginatum, subcutaneous nodules. **Minor (moderate/high-risk):** monoarthralgia, fever ≥38
  °C, ESR ≥30 mm/h and/or CRP ≥3 mg/dL, prolonged PR (if no carditis).
- **Diagnosis:** requires evidence of preceding group A strep (except isolated chorea). Initial ARF: 2
  major, or 1 major + 2 minor. Recurrent ARF: 2 major, or 1 major + 2 minor, or 3 minor.
- The citation matches the AHA issuer pattern, so a **citation-staleness ledger row** was added
  (Class B, on-publication cadence; the 2015 revision is the latest).

## Verification

Lint (all catalog-truth surfaces at 1167; citation gate + ledger row green), unit suite (+9 + fuzz),
build — all green. Verified in a real browser: the example (carditis + polyarthritis + strep evidence)
renders "Meets the 2015 Jones criteria."

## Out of scope

The tile counts the manifestations the clinician has determined; it does not diagnose carditis on echo,
grade arthritis, or exclude mimics. Isolated indolent carditis (a recognized standalone presentation)
is noted but not special-cased beyond the carditis major. The MCP adapter + golden-probe promotion
follow in a separate wave.
