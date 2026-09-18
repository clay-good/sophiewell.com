# spec-v1378 — finish Illinois Medicaid

This closes the Illinois Medicaid overlay with all twenty rules corrected. HFS
Chapter 100 settles five of these ten directly, and one of them reverses what
the template assumed about who can appeal.

**Sourced to HFS Chapter 100**

- `R-PA-MCIL-019` — **a provider cannot appeal an Illinois prior approval
  denial.** HFS says the patient is advised of the right to appeal and to a fair
  hearing, and that "An appeal may not be made by the provider." The template
  helped a provider build an appeal Illinois fee-for-service does not accept. The
  check now tells a provider-filed appeal that it is not an available route, and
  passes one routed as the patient's fair hearing or through a managed care plan.
- `R-PA-MCIL-017` drops the transplant-routing requirement — and the test that
  pinned it — for the transplant rule HFS actually states: immigrants covered
  for emergency medical care only "are not eligible for transplantation
  services."
- `R-PA-MCIL-018` follows HFS's coverage list: experimental procedures are
  non-covered, while routine care in conjunction with certain investigational
  cancer treatments is covered.
- `R-PA-MCIL-014` follows HFS's retroactive coverage rule — backdated up to three
  months before the application month — and its instruction to verify
  eligibility before billing for that period.
- `R-PA-MCIL-015` asks an equipment, home-health, or therapy request for the
  prescribing practitioner and the duration of need, both on HFS's published
  list.

**Packet-declared**

`R-PA-MCIL-011` (step therapy), `012` (genetic testing), `013` (drug diagnosis),
`016` (behavioral health), and `020` (out-of-state) are left by Chapter 100 to
the service-specific Chapter 200 handbooks; they run only when the packet itself
establishes the workflow, and their citations say so.

Eight focused tests cover the provider-appeal bar, the emergency-only transplant
bar, the investigational cancer carve-out, and the replaced pinned test.

The source ledger contains 91 registered authorities: 46 fresh and 45 warning
by age, with no failures, source orphans, or coverage gaps. Rule citations
reference 240 distinct URLs, all among the 301 registered and none behind a
sign-in wall. Of 876 PA rules, 823 are source-anchored. The 1,722-tile catalog
is unchanged.

Verification covers 1,326 PA-engine tests, 14,645 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
