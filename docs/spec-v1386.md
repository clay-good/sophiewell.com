# spec-v1386 — correct all twenty New York Medicaid checks

New York's rules cited only the eMedNY home page and carried the template's
checks. The eMedNY **Information for All Providers — General Policy** manual
(Version 2022-2) sets the prior approval rules for every New York Medicaid
fee-for-service provider. Every rule now follows it, or runs only on a
workflow the packet declares.

| Rule | Now (eMedNY General Policy) |
|---|---|
| `001`, `003`, `004` | Info: the medical-necessity basis; the channel is in each provider manual's billing guidelines; verifying whether a service needs approval is the provider's job, and Medicare-approved services for Medicare-primary beneficiaries need none. |
| `002` | Flag: a prior approval request carries a plan of care or clinical documentation, since prior approval evaluates the plan of care. |
| `005` | Info: once approval is claimed, the prior approval number the claim must carry. |
| `008` | Emergencies are exempt from prior approval, so an emergency packet is never flagged for an urgency statement. |
| `009` | Info: an extension or change to an approved course goes on a new request with a modified treatment plan. |
| `014` | Flag: a request submitted after the service must document an emergency, since otherwise no payment is made. |
| `015` | Flag: personal care services and non-emergency transportation always need prior authorization from the local department of social services. |
| `017` | Info: an out-of-state referral needs prior approval for long term care and for inpatient or clinic services not available in New York. It replaces the transplant-center check, which has no New York source. |
| `006`, `007`, `010`–`013`, `016`, `018`–`020` | Run only on a declared inpatient, imaging, NDC, step-therapy, genetic-testing, drug, behavioral-health, transplant, appeal, or out-of-network workflow. |

Two pinned template tests are replaced: a plain transplant flagged, and `001`
flagging a missing criteria citation. Twelve tests cover the fire and pass
paths and the transplant false positive. The manual is registered in the
source ledger.

The ledger holds 91 authorities: 52 fresh and 39 warning by age, with no
failures, orphans, or coverage gaps. Rule citations reference 240 distinct
URLs, all among the 307 registered. The 1,722-tile catalog is unchanged.
Verification: 1,432 PA-engine tests, 14,751 repository unit tests, 459 MCP
tests, lint, and the production build all pass.
