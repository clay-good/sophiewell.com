# Design — Restrictive transfusion threshold decision aid

## Source

AABB 2023 red blood cell transfusion guideline (Carson JL et al., *JAMA* 2023;330(19):1892).
**Every number below is a build-time transcription target, not a source** — re-verify against
the publication before shipping (spec-v97 discipline; the spec-v281 build corrected several
sketch values that were wrong).

## Threshold table (verify at build)

| Population | Restrictive Hgb threshold | Note |
|---|---|---|
| Hospitalized, hemodynamically stable adult (incl. critically ill) | **7 g/dL** | strong recommendation, moderate certainty |
| Orthopedic surgery | **8 g/dL** | |
| Cardiac surgery | **8 g/dL** | |
| Preexisting cardiovascular disease (non-cardiac hospitalized) | **8 g/dL** | |
| Stable critically ill child | **7 g/dL** | TAXI 2018 aligns; verify AABB scope |
| Acute coronary syndrome | **no numeric recommendation** | AABB found insufficient evidence — the tile must SAY SO, not emit a number |
| Hematologic/oncologic with thrombocytopenia | out of scope | not an Hgb-threshold decision |

## Compute contract

`M.transfusionThreshold({ hemoglobin, population, symptomatic })` returns:
- `threshold` (number | null — null for ACS / no-recommendation populations),
- `belowThreshold` (bool | null),
- `band` — the decision string ("Hgb 6.8 g/dL is below the 7 g/dL restrictive threshold for a
  stable hospitalized adult — transfusion indicated per AABB 2023" / "…at or above… —
  restrictive strategy, do not transfuse on the number alone"),
- `note` — the symptomatic-anemia and ACS carve-out language.

Symptomatic checkbox: when checked, the band appends that active symptoms (angina, heart
failure, hemodynamic instability) can justify transfusion above the numeric threshold — the
guideline's clinical-judgment override. It never *lowers* the reported threshold; it annotates.

## Decisions

**D1 — canonical unit g/dL, g/L toggle.** Matches the shipped `ALBUMIN_UNITS` precedent
(conventional first). Not g/L-pinned like HALP — g/dL is the unambiguous US bedside unit for
hemoglobin.

**D2 — ACS / no-recommendation is a first-class output, not an error.** The single most
important correctness point: for ACS the tile must render "AABB makes no restrictive-threshold
recommendation here; decide on symptoms and cardiology input," never a fabricated 8 or 10. The
MCP example must exercise a numeric-threshold population so the round-trip has a number to
assert; a second scenario-only path covers the null-threshold branch.

**D3 — decision aid, not an order.** Standard clinical-notice tile; the band is a
guideline-reported threshold comparison, phrased as information, never "transfuse this
patient." Reuses the existing `clinical-notice` chrome.

## Risks

- **Fabricating an ACS number** — the failure mode that would make the tile clinically wrong.
  Pinned by a unit test asserting `threshold === null` and the carve-out text for ACS.
- **Threshold drift** — AABB has revised these across editions; the citation must name the
  2023 guideline and carry the staleness ledger row (ISSUER_PATTERN = AABB).
