# spec-v1384 — correct all twenty North Carolina Medicaid checks

North Carolina's rules cited only the NCDHHS provider home page and carried
the template's checks. NC Medicaid publishes its fee-for-service rules on
**Prior Approval and Due Process** (last modified February 18, 2026). Every
rule now follows that page, or runs only on a workflow the packet declares.

| Rule | Now (NC Medicaid prior approval page) |
|---|---|
| `001` | Info: the packet documents that the beneficiary meets the clinical coverage criteria, which the provider is responsible for. |
| `002` | Flag: a prior approval request carries medical-necessity documentation, which is what prior approval exists to verify. |
| `003`, `004` | Info: NCTracks portal or paper is transport metadata; check the service against its clinical coverage policy. |
| `005` | Info: moving an approved service to another provider needs a new approval, because a claim billed by a different provider is denied. |
| `008` | Never flags an urgent packet. NC publishes timeframes (24 hours for drugs, 15 business days otherwise), not expedited criteria. |
| `009` | Info: a reauthorization shows when the current period ends. NC wants the request before then, and 10 calendar days before for uninterrupted services. |
| `014` | Info: retroactive prior approval documents a retroactive eligibility date. |
| `015` | Info: a Medicaid for Pregnant Women request says how the condition may complicate the pregnancy. |
| `018` | Info: an experimental or investigational question comes with evidence of accepted practice. |
| `020` | Info: an EPSDT request says how the service will correct or ameliorate the condition. |
| `006`, `007`, `010`–`013`, `016`, `017`, `019` | Run only on a declared inpatient, imaging, NDC, step-therapy, genetic-testing, drug, behavioral-health, transplant, or appeal workflow. |

Two pinned template tests are replaced: a plain transplant flagged, and `001`
flagging a missing MCG citation. Seventeen tests cover the new rules' fire and
pass paths and the false positives. The page is registered in the source
ledger.

The ledger holds 91 authorities: 50 fresh and 41 warning by age, with no
failures, orphans, or coverage gaps. Rule citations reference 240 distinct
URLs, all among the 305 registered. The 1,722-tile catalog is unchanged.
Verification: 1,406 PA-engine tests, 14,725 repository unit tests, 459 MCP
tests, lint, and the production build all pass.
