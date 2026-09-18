# spec-v1402 — correct all twenty Georgia Medicaid checks

Georgia was the last state Medicaid overlay still on the template. Its
Part I and Part II manuals are served only through a GAMMIS portal postback,
and the quarterly static links rotate and 404. Georgia's fee-for-service
review vendor, Alliant Health Solutions, publishes its DCH training **"The
Basics of Medicaid Precertification"** on GAMMIS at a stable link. It dates
from August 2018, so every Georgia rule except `002` is informational, and
each citation says the current Part II manuals govern.

| Rule | Now (Alliant precertification training for DCH) |
|---|---|
| `001` | The medical-necessity basis (severity of illness, intensity of service, setting). |
| `002` | **Flag:** a prior authorization request carries supporting medical information, since incomplete cases are denied. |
| `003` | A radiology or DME request sent by phone, fax, or mail; these go through the web portal only. |
| `004` | Verify the code against Physician Services Appendices E, L, and O; Medicare A and B primary, uncomplicated deliveries, newborns, and CMO members are outside fee-for-service precertification. |
| `005` | A hospital-based request names the admitting or requesting physician, who is responsible for authorization. |
| `006`, `008` | Emergency care may come first, with the request within 30 days of the admit or procedure date. |
| `007` | Imaging has a clinical indication; studies during an inpatient stay are exempt. |
| `009` | Inpatient recertification on days 87–90 carries current clinical status. |
| `014` | Retroactive eligibility requests are due within 6 months. |
| `015` | A DME start date is no more than 90 days from submission. |
| `017` | Transplants and out-of-state cases are prior approvals. This replaces the transplant-center check, which has no Georgia source. |
| `018` | A facility transfer says why the accepting facility is needed. |
| `019` | A reconsideration names the tracking number or denial letter; only one is routinely processed. |
| `020` | A change to an approved case is requested within 30 days. |
| `010`–`013`, `016` | Run only on a declared NDC, step-therapy, genetic-testing, drug, or behavioral-health workflow. |

Two pinned template tests are replaced, and fourteen tests cover the new rules.
The training is registered in the source ledger. With this spec, all fourteen
state Medicaid overlays follow their own state's source.

The ledger holds 91 authorities: 54 fresh and 37 warning by age, with no
failures, orphans, or coverage gaps. Rule citations reference 241 distinct
URLs, all among the 310 registered. The 1,722-tile catalog is unchanged.
Verification: 1,458 PA-engine tests, 14,777 repository unit tests, 459 MCP
tests, lint, and the production build all pass.
