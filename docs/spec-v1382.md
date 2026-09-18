# spec-v1382 — finish Texas Medicaid

Texas rules 011–020 still carried the template's transplant-center, urgency,
and network checks. Each now follows the Texas Medicaid Provider Procedures
Manual, Volume 1, Section 5 (February 2026), or runs only on a workflow the
packet itself declares.

| Rule | Was | Now (TMHP source) |
|---|---|---|
| `014` | generic retro check | Retroactive windows: 95 days from the add date for the retroactive period, 3 business days after service otherwise, and 14 calendar days after an outpatient CT, MR, PET, or cardiac nuclear study. A late radiology request is not processed. |
| `015` | generic | Home health, DME, and supply requests and extensions cannot be started by telephone; use the portal, fax, or mail (info). |
| `017` | flagged any transplant with no "designated center" | Only an **out-of-state** transplant request, which needs a transplant evaluation performed by a Texas facility. An in-state transplant passes. |
| `018` | generic | An unlisted procedure code needs a comparable code and documentation that the procedure is not investigational or experimental. An incomplete request is returned, not denied (info). |
| `019` | generic | Reconsideration means resubmitting with new information; an Administrative Appeal to HHSC must include the denial letter (info). |
| `020` | out-of-network | Out-of-state services need prior authorization. A border-state provider within 50 miles counts as in-state, and out-of-network wording alone does not trigger the rule. |
| `011`, `012`, `013`, `016` | template triggers | Run only when the packet declares a step-therapy, genetic-testing, drug, or behavioral-health authorization workflow. Each has a source-free completeness citation, and its trigger and support phrases do not overlap. |

The pinned test that flagged a plain kidney transplant is gone. Sixteen tests
take its place and cover each rule's fire and pass paths, the in-state
transplant, the border-state provider, and the out-of-network false positive.
Texas is now fully corrected.

The ledger holds 91 authorities: 48 fresh and 43 warning by age, with no
failures, orphans, or coverage gaps. Rule citations reference 240 distinct
URLs, all registered. The 1,722-tile catalog is unchanged. Verification: 1,370
PA-engine tests, 14,689 repository unit tests, 459 MCP tests, lint, and the
production build all pass.
