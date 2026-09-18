# spec-v1387 — correct all twenty Pennsylvania Medical Assistance checks

Pennsylvania's rules cited only the DHS home page, carried the template's
checks, and had no tests. Pennsylvania's fee-for-service prior authorization
rules are in **55 Pa. Code**: Chapter 1101, section 1101.67 (prior
authorization), and Chapter 1150, sections 1150.58–1150.60 (the fee schedule
PA indicator, place of service review, and second opinions). Every rule now
follows them, or runs only on a workflow the packet declares.

| Rule | Now (55 Pa. Code) |
|---|---|
| `001`, `003`, `004` | Info: the medical-necessity basis; the channel is in the provider handbook; the fee schedule's PA indicator marks which services need authorization (1150.58). |
| `002` | Flag: a service needing prior authorization must be prescribed or ordered by a licensed practitioner (1101.67(a)). |
| `005` | Info: a Department request for more information is answered, because information that arrives after the deadline leads to denial. A request not decided in 21 days is approved automatically. |
| `006` | Info: an elective admission, ambulatory surgical center, or short procedure unit needs a place of service review. Emergency, urgent, maternity, newborn, Medicare Part A, managed care, and psychiatric or rehabilitation unit admissions are exempt (1150.59). |
| `008` | Info: an emergency designation documents the immediate need (42 CFR 440.170(e)(1)); an admission found elective is paid at 50%. |
| `009` | Info: a certified admission happens before the certification expires (60 days). |
| `014` | Info: a request after the service documents an emergency or later eligibility. |
| `017` | Info: place of service review applies to out-of-state admissions too. |
| `019` | Info: a reevaluation of a place-of-service decision is requested within 10 calendar days. |
| `020` | Info: a procedure on the mandatory second opinion list shows the second opinion or an exemption (1150.60). |
| `007`, `010`–`013`, `015`, `016`, `018` | Run only on a declared imaging, NDC, step-therapy, genetic-testing, drug, DME, behavioral-health, or transplant workflow. |

The place of service review and second opinion rules date from 1989 and the
provider handbook governs current procedure, so those checks are informational.
Fourteen new tests cover the vacuous-pass guard, fire and pass paths, and the
exemptions. Both chapters are registered in the source ledger.

The ledger holds 91 authorities: 53 fresh and 38 warning by age, with no
failures, orphans, or coverage gaps. Rule citations reference 241 distinct
URLs, all among the 309 registered. The 1,722-tile catalog is unchanged.
Verification: 1,446 PA-engine tests, 14,765 repository unit tests, 459 MCP
tests, lint, and the production build all pass.

With this spec every state Medicaid overlay except Georgia follows its
payer's own source. Georgia's manuals download only through its portal.
