# spec-v1359 — correct HMSA clinical-review checks

HMSA rules 006–010 carried the template. Its precertification page is public but
renders only in a browser, so the usual fetch-and-grep returned nothing; reading
it properly turned up two corrections that reverse what the rules assumed.

- `R-PA-HMSA-006` **runs on the concurrent review, not the admission.** HMSA
  publishes the same requirement across its commercial, QUEST Integration, and
  Medicare Advantage plans: acute hospitalization is *"Not required for
  admission. Concurrent reviews are required once a patient has been admitted."*
  An admission needs no precertification at all, so admission context no longer
  triggers anything.
- `R-PA-HMSA-007` keeps its teeth. Radiology: Advanced Imaging Studies is on
  HMSA's precertification list, decided on evidence-based medical
  appropriateness criteria reviewed annually by its Utilization Management
  Committee. The check now triggers on a named modality rather than any 7xxxx
  code, and claims no delegated vendor, because the page names none.
- `R-PA-HMSA-008` is informational and source-free. The page publishes no
  expedited standard or timeframe.
- `R-PA-HMSA-009` **inverts.** HMSA publishes a place-of-treatment exception,
  not a steering rule: *"When a physician feels a procedure should be performed
  in a treatment setting other than where HMSA normally deems appropriate,
  precertification approval must be given by HMSA."* The obligation attaches to
  choosing a non-standard setting — whichever setting that is — so the check now
  asks whether precertification was sought for the exception, and a hospital
  outpatient department is no longer suspect by itself.
- `R-PA-HMSA-010` checks an NDC the packet already carries. The page requires
  none.

Ten focused tests cover the admission-versus-concurrent split, the inverted
place-of-treatment rule in both directions, false-positive regressions, and
complete packets.

The source ledger contains 91 registered authorities: 40 fresh and 51 warning
by age, with no failures, source orphans, or coverage gaps. Registering the
precertification article beside the HMSA provider manual moved that source to
fresh. Its citations resolve across 290 registered URLs, none behind a sign-in
wall. Of 876 PA rules, 823 are source-anchored. The 1,722-tile catalog is
unchanged.

Verification covers 1,154 PA-engine tests, 14,473 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
