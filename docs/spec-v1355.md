# spec-v1355 — finish Blue Cross MN: exception workflows

This closes the Blue Cross MN overlay. Rules 016–020 are corrected against the
Provider Policy and Procedure Manual, and two more tests that had pinned false
positives are replaced.

- `R-PA-BCBSMN-016` names the criteria Blue Cross MN reviewers actually use —
  its own behavioral health policies, MCG, ASAM Clinical Guidelines, MHCP
  guidelines, and subscriber contract language, with the set determined by the
  subscriber's plan — and reviews are done by licensed behavioral health
  clinicians. Generic mental-health context no longer triggers it.
- `R-PA-BCBSMN-017` drops the Blue Distinction routing requirement. Blue Cross
  MN describes Blue Distinction Centers as a national centers-of-excellence
  designation that helps subscribers make informed decisions, and tells them to
  call to find out what is covered. Transplant requests do need authorization,
  so the check asks for the evaluation or the policy criteria instead.
- `R-PA-BCBSMN-018` is the best-sourced rule in the overlay and keeps its teeth.
  Blue Cross MN publishes a three-part evidence test — regulatory approval where
  required, consensus in peer-reviewed literature and clinical-trial or
  technology-assessment reports, and specialty consensus — plus a contract
  definition turning on FDA approval for the relevant indication and proof of
  effect on health outcomes outside the research setting. The check now names
  that test, and no longer infers the classification from off-label or
  clinical-trial context.
- `R-PA-BCBSMN-019` runs on an explicit appeal or reconsideration of a
  previously adjudicated decision and asks which determination it contests.
- `R-PA-BCBSMN-020` follows the published boundary: out-of-network exceptions
  are considered in rare instances, a nonparticipating referral may need an
  out-of-network notification, and the subscriber must get advance written
  notice. Some subscribers hold open-access benefits and Minnesota Health Care
  Programs subscribers have direct network access, so out-of-network status
  alone no longer triggers the rule.

Thirteen focused tests cover false-positive regressions, incomplete explicit
workflows, and complete packets. Two tests that asserted the corrected false
positives are replaced.

The source ledger contains 91 registered authorities: 38 fresh and 53 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 288 registered URLs, none behind a sign-in wall. Of 876 PA
rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,120 PA-engine tests, 14,439 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
