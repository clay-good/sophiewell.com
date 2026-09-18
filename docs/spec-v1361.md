# spec-v1361 — finish HMSA: exception workflows

This closes the HMSA overlay, the sixth payer in the program. Rules 016–020
follow HMSA's published precertification page and Provider Manual for Prior
Authorization, and the Blue Distinction and out-of-network test pair is replaced
for the sixth time.

- `R-PA-HMSA-016` follows the published table. Precertification is required for
  a residential treatment program, and for partial hospitalization and intensive
  outpatient only from non-participating providers; an acute hospitalization
  needs none, so it no longer triggers the rule. Medical necessity is determined
  on criteria from Magellan Healthcare, doing business as Magellan Hawaiʻi, with
  MCG guidelines and Medicare coverage determinations where applicable.
- `R-PA-HMSA-017` drops the Blue Distinction routing requirement — HMSA's
  material never mentions it. What HMSA does require is precertification for
  transplant evaluations, with a separate medical policy per transplant type.
- `R-PA-HMSA-018` **states the requirement the way HMSA does: as a
  precertification trigger, not an evidence burden.** "Surgeries, therapies or
  procedures employing new technology or representing a new application of
  existing technology" require precertification. Off-label, compassionate-use,
  and clinical-trial context no longer imply the classification.
- `R-PA-HMSA-019` asks for two of the items HMSA lists as necessary for a
  request to be recognized as an appeal at all: the date of the denial, and a
  description of why the decision was in error.
- `R-PA-HMSA-020` follows administrative review. A referral to a nonparticipating
  provider is a pre-service request filed by the PCP or health center provider,
  and for an HMO commercial member those services are not eligible for coverage
  unless HMSA authorized them before they were rendered. Urgent and emergent
  services are excepted, and the check honors that.

Twelve focused tests cover the acute-admission exemption, the urgent and
emergent exception, false-positive regressions, and complete packets. Two tests
that asserted the corrected false positives are replaced.

The source ledger contains 91 registered authorities: 40 fresh and 51 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 290 registered URLs, none behind a sign-in wall. Of 876 PA
rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,174 PA-engine tests, 14,493 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
