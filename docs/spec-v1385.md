# spec-v1385 — correct all twenty New Jersey Medicaid checks

New Jersey's rules cited only the DMAHS home page, carried the template's
checks, and had no tests. New Jersey's fee-for-service authorization rules are
in the **Administration Manual, N.J.A.C. 10:49** (current through the June 16,
2025 New Jersey Register). Every rule now follows it, or runs only on a
workflow the packet declares.

| Rule | Now (N.J.A.C. 10:49) |
|---|---|
| `001`, `003`, `004` | Info: the medical-necessity basis; the channel (MACC or Central Office forms) is transport metadata; the Provider Services chapter says which services need authorization. |
| `002` | Flag: a cosmetic or reconstructive exception needs a written certification of medical necessity **and** a treatment plan (10:49-5.5). |
| `005` | Info: an approval is not a guarantee of eligibility, so eligibility should be verified for the date of service (10:49-6.1). |
| `008` | Flag: an emergency service needs the practitioner's statement of the emergency and why the service was immediately necessary. "To simply state that an emergency did exist is not sufficient" (10:49-6.1). |
| `009` | Info: an administrative-emergency request is due within five calendar days, and a verbal authorization is confirmed in writing. |
| `014` | Info: a retroactive request documents one of the four permitted circumstances. |
| `017` | Info: a service that needs prior authorization in New Jersey needs it out of state too (10:49-6.2). |
| `019` | Info: a provider hearing on a denial is requested in writing within 20 days of the notice (10:49-9.14, 10:49-10.3). |
| `006`, `007`, `010`–`013`, `015`, `016`, `018`, `020` | Run only on a declared inpatient, imaging, NDC, step-therapy, genetic-testing, drug, DME, behavioral-health, transplant, or out-of-network workflow. |

Sixteen new tests: the vacuous-pass guard on non-New Jersey packets, plus the
fire and pass paths above. The Administration Manual PDF is registered in the
source ledger. The manual moved on nj.gov from `/providers/rulefees/regs/` to
`/notices/documents/rules-and-regulations/`, and the old paths return 404.

The ledger holds 91 authorities: 51 fresh and 40 warning by age, with no
failures, orphans, or coverage gaps. Rule citations reference 240 distinct
URLs, all among the 306 registered. The 1,722-tile catalog is unchanged.
Verification: 1,422 PA-engine tests, 14,741 repository unit tests, 459 MCP
tests, lint, and the production build all pass.
