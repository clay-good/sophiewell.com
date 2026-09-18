# spec-v1383 — correct all twenty Florida Medicaid checks

Florida's twenty rules cited only the AHCA home page and carried the
template's checks: MCG criteria, site-of-care steering, transplant-center
routing, and network gaps. Florida publishes one authorization rule for
fee-for-service, the **Authorization Requirements Policy** incorporated by
Rule 59G-1.053, F.A.C. (June 2016). Every Florida rule now follows it, or runs
only on a workflow the packet declares.

| Rule | Now (Rule 59G-1.053) |
|---|---|
| `001` | Info: the medical-necessity basis stated. The QIO reviews against AHCA-approved criteria, which the packet is not required to cite. |
| `002` | Flag: an authorization request needs a summary of current health status with pertinent diagnoses. |
| `003`, `004` | Info: the channel (QIO web system or paper) is transport metadata; check the service-specific coverage policy and fee schedule. |
| `005` | Info: once approval is claimed, the ten-digit prior authorization number. |
| `007` | Flag: units of service and dates of service, both minimum request contents. |
| `008` | Emergencies are exempt from prior authorization, so an emergency packet is never flagged for an urgency statement. |
| `009` | Flag: the recipient's Florida Medicaid ID and the provider NPI. |
| `014` | Info: a retroactive request needs a documented emergency or retroactive eligibility. |
| `015` | Flag: a home health or DME request carries the physician's order or plan of care. |
| `017` | Flag: an **out-of-state** service needs prior authorization unless it is an emergency. It replaces the transplant-center check, which has no Florida source. |
| `018` | Flag: an EPSDT or over-limit request for a recipient under 21 describes how the service will correct or ameliorate the condition. |
| `019` | Info: reconsideration adds information, through the QIO within ten business days. |
| `020` | Info: a modification request carries an updated physician's order or plan of care. |
| `006`, `010`–`013`, `016` | Run only on a declared inpatient, NDC, step-therapy, genetic-testing, drug, or behavioral-health workflow. |

The two pinned template tests (a plain kidney transplant flagged, and `001`
flagging a missing MCG citation) are replaced. Twenty-two tests cover the fire
and pass paths, the emergency exemptions, and the out-of-network false
positive. The policy PDF is registered in the source ledger.

The ledger holds 91 authorities: 49 fresh and 42 warning by age, with no
failures, orphans, or coverage gaps. Rule citations reference 240 distinct
URLs, all among the 304 registered. The 1,722-tile catalog is unchanged.
Verification: 1,391 PA-engine tests, 14,710 repository unit tests, 459 MCP
tests, lint, and the production build all pass.
