# spec-v671.md — ACR/EULAR Boolean-based remission (rheumatoid arthritis)

> Status: **SHIPPED (2026-08-08).** Builds the `acr-eular-boolean` tile. Catalog **1501 → 1502**, group G.

## Why

The catalog ships the RA disease-activity indices (`das28`, `cdai-ra`, `sdai-ra`, `rapid3`) but not the
ACR/EULAR **Boolean** remission definition — the strict four-criterion rule used as the stringent trial and
treat-to-target remission target. It is distinct from the index-based SDAI ≤ 3.3 definition and from the 2010
ACR/EULAR *classification* criteria (both already built).

## What it does

Remission requires **all four** criteria at one visit. The tile reports both published versions, which differ
only in the patient-global threshold:

| Criterion | 2011 (v1.0) | 2022 (Boolean 2.0) |
| --- | --- | --- |
| Tender joint count (28-joint) | ≤ 1 | ≤ 1 |
| Swollen joint count (28-joint) | ≤ 1 | ≤ 1 |
| C-reactive protein | ≤ 1 mg/dL | ≤ 1 mg/dL |
| Patient global assessment (0–10) | ≤ 1 | ≤ 2 |

Strict AND: failing any single criterion means not in Boolean remission.

## Posture (spec-v97)

Two named versions coexist, so the tile computes **both** rather than picking one; the 2022 revision loosened
only the patient-global item (to agree better with SDAI/CDAI remission). Unit traps are called out in the
result: **CRP is mg/dL** (1 mg/dL = 10 mg/L) and the **patient global is a 0–10 scale** (a 0–100 mm VAS would
use 10 and 20). The separate index-based SDAI definition is not computed here. It reports a definition, not a
treatment order.

## Files

- `lib/acr-eular-boolean-v671.js` — `acrEularBoolean()`, `BOOLEAN_NOTE`.
- `views/group-v671.js` (RV671) — four number inputs (TJC28, SJC28, CRP mg/dL, PtGA 0–10); a11y-checked, no
  innerHTML, no network.
- `mcp/adapters/acr-eular-boolean-v671.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialty, related.
- `test/unit/acr-eular-boolean.test.js` — 6 tests (both-versions remission, the PtGA-2 version split, PtGA>2
  fails both, single-criterion AND breaks, CRP unit boundary, input validation).
- `docs/spec-v671.md` (this file).

## Sourcing (spec-v97)

Felson DT, Smolen JS, Wells G, et al. ACR/EULAR provisional definition of remission in rheumatoid arthritis
for clinical trials. *Arthritis Rheum.* 2011;63(3):573-586. Studenic P, Aletaha D, de Wit M, et al. ACR/EULAR
remission criteria for rheumatoid arthritis: 2022 revision. *Ann Rheum Dis.* 2023;82(1):74-80 (PMID 36414361).
A source-verification subagent confirmed the four thresholds, the CRP unit (≤ 1 mg/dL = 10 mg/L), the
0–10 patient-global scale, and that the 2022 revision changed only the patient-global item (≤ 1 → ≤ 2).
