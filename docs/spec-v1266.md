# spec-v1266 — align Medicaid EPSDT prior-authorization checks

The Medicaid pediatric rule previously treated any EPSDT, well-child, or
periodicity mention as evidence that a prior-authorization packet was complete.
Current CMS guidance says the opposite for screening services: states may not
subject EPSDT screening services to prior authorization. CMS permits utilization
controls for treatment only when the review evaluates the individual child's
needs case by case, follows the EPSDT "correct or ameliorate" standard, and does
not delay needed treatment.

`R-PA-MCD-002` now flags a screening service that was routed through prior
authorization. For pediatric treatment requests, it looks for an individualized
medical-necessity, case-by-case, or correct-or-ameliorate rationale instead of a
generic EPSDT label. Tests cover the screening flag, an incomplete treatment
packet, and a compliant treatment rationale.

The same source audit narrowed two overbroad claims. `R-PA-MCD-001` now describes
member-ID presence as an operational completeness heuristic because state and
plan terminology varies. `R-PA-MCD-006` now states that the federal NDC mandate
covers single-source and certain high-dollar-volume multiple-source
physician-administered drugs, while retaining and disclosing its conservative
all-J-code warning behavior. A stale NPI-role note and source-map comments are
also aligned with v1265's provider-role correction.

CMS State Health Official letter 24-005 and the current Medicaid
physician-administered-drug guidance were reread on 2026-09-14. The generated
browser ledger, PA audit snapshots, and SBOM are refreshed together. This
reduces source-age warnings from 76 to 75 without changing the 1,722-tile
catalog or the 876-rule PA surface.
