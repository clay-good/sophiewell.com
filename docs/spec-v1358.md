# spec-v1358 — finish Louisiana Blue: exception workflows

This closes the Louisiana Blue overlay, and with it the fifth payer in the
program. Rules 016–020 follow Section 4 of the Professional Provider Office
Manual, and the two tests that pin the Blue Distinction and out-of-network false
positives — the same pair in every Blue plan so far — are replaced again.

- `R-PA-BCBSLA-016` names the route that exists: behavioral health services are
  authorized through the Lucet WebPass Portal, with intensive outpatient and
  partial hospitalization programs on the authorization list. The manual names
  no single instrument, so the check asks for clinical support for the requested
  level of care rather than a particular criteria set.
- `R-PA-BCBSLA-017` drops the Blue Distinction routing requirement — the manual
  never mentions Blue Distinction. What it does require is authorization for
  transplant evaluations, listings, and the transplant itself, called or faxed to
  the Authorizations Department, transplants being one of the few exceptions to
  the Authorizations application mandate.
- `R-PA-BCBSLA-018` keeps its teeth and gains the published procedure. Louisiana
  Blue directs a provider asking about investigational status to submit a written
  request stating the nature of the inquiry **and** pertinent peer-reviewed
  scientific evidence-based outcomes. The demand for evidence was right here all
  along; what was wrong was inferring the classification from off-label or
  clinical-trial context, which no longer triggers the rule.
- `R-PA-BCBSLA-019` runs on an explicit authorization appeal and asks which
  determination it contests — the denial letter carries the appeal rights and
  the procedure.
- `R-PA-BCBSLA-020` follows how Louisiana Blue actually treats network status:
  as a variable in each service's authorization requirement, not as one
  exception workflow. Hospice is denied without authorization at out-of-network
  facilities, while a short maternity admission to one needs no authorization at
  all when the member has out-of-network benefits. Out-of-network status alone
  no longer triggers the rule.

Ten focused tests cover false-positive regressions, incomplete explicit
workflows, and complete packets. Two tests that asserted the corrected false
positives are replaced.

The source ledger contains 91 registered authorities: 39 fresh and 52 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 289 registered URLs, none behind a sign-in wall. Of 876 PA
rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,144 PA-engine tests, 14,463 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
