# spec-v686.md — UCSF criteria (HCC liver-transplant eligibility)

> Status: **SHIPPED (2026-08-10).** Builds the `ucsf-hcc` tile. Catalog **1516 → 1517**, group G.

## Why

The catalog ships the Milan criteria and Up-to-Seven for hepatocellular carcinoma transplant selection but not
the UCSF criteria — the widely-used **modestly expanded** alternative that admits somewhat larger tumor burden
without worsening survival. It completes the core HCC transplant-criteria set.

## What it does

A decision-logic classifier. A patient is **within UCSF** (by tumor burden) if **either**:

- a solitary tumor **≤ 6.5 cm**, or
- **≤ 3 nodules** with the largest **≤ 4.5 cm** and total tumor diameter **≤ 8 cm**;

**and** there is no gross (macro)vascular invasion and no extrahepatic spread (either veto makes the patient
ineligible regardless of size).

| | Single tumor | Multiple nodules |
| --- | --- | --- |
| Milan | ≤ 5 cm | ≤ 3, each ≤ 3 cm |
| **UCSF** | ≤ 6.5 cm | ≤ 3, largest ≤ 4.5 cm, total ≤ 8 cm |

## Posture (spec-v97)

Classifies radiologic tumor burden against the criteria to support candidacy discussion; the vascular-invasion
and extrahepatic-spread vetoes are enforced. Final listing decisions rest with the transplant team and its
regional policy.

## Files

- `lib/ucsf-hcc-v686.js` — `ucsfHcc()`, `UCSF_NOTE`.
- `views/group-v686.js` (RV686) — three number inputs (nodules, largest, total) + two exclusion checkboxes;
  a11y-checked, no innerHTML, no network.
- `mcp/adapters/ucsf-hcc-v686.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation bands, specialties, related.
- `test/unit/ucsf-hcc.test.js` — 7 tests (single-tumor within, 6.5/6.6 boundary, multi-tumor limits, > 3
  nodules outside, vascular/extrahepatic vetoes, worked within example, total-< -largest validation).
- `docs/spec-v686.md` (this file).

## Sourcing (spec-v97)

Yao FY, Ferrell L, Bass NM, et al. Liver transplantation for hepatocellular carcinoma: expansion of the tumor
size limits does not adversely impact survival. *Hepatology.* 2001;33(6):1394-1403 (PMID 11391528). A
source-verification subagent confirmed all three size cutoffs (6.5 / 4.5 / 8 cm), the 3-nodule maximum, the
no-vascular-invasion / no-extrahepatic-spread requirement, and the relationship to Milan, against the primary
full text and peer-reviewed reviews.
