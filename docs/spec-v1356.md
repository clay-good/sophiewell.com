# spec-v1356 — correct Louisiana Blue clinical-review checks

Louisiana Blue rules 006–010 carried the same template. Its Professional
Provider Office Manual is public, and Section 4 replaces the guesswork with the
plan's own process — including one correction that changes what a rule asks for.

- `R-PA-BCBSLA-006` runs on an explicit continued-stay or extension request and
  asks for the clinical documenting medical necessity for the extension, which
  is what a concurrent review nurse decides on within one business day.
  Admission prose no longer triggers it — and in-state acute facilities not
  reimbursed per diem are not required to perform concurrent review at all.
- `R-PA-BCBSLA-007` follows the Carelon high-tech imaging list as published: CT,
  MRI, MRA, nuclear cardiology, and PET. An arbitrary 7xxxx code no longer
  implies the program. A Gold Card provider is always approved but still submits
  the request, and an audited case is asked for exactly the medical-necessity
  documentation this check looks for.
- `R-PA-BCBSLA-008` **asks a different question now.** Louisiana Blue does not
  publish an urgency standard a packet must recite; it publishes a consequence:
  an urgent request is decided within 72 hours whether or not information has
  arrived, and *if the supporting clinical information is not submitted, the
  urgent request will be denied after 72 hours for lack of information.* So the
  check now looks for the clinical material, not for urgency wording. The test
  that passed a packet carrying only "would jeopardize the member's life or
  health" now expects a flag, because that packet is exactly the one Louisiana
  Blue denies.
- `R-PA-BCBSLA-009` runs only when the packet establishes a site-of-care
  requirement. The manual names settings only to say which procedures need
  authorization in them.
- `R-PA-BCBSLA-010` checks an NDC the packet already carries. Louisiana Blue
  treats the NDC as claim content, and routes targeted medical-benefit drug
  authorization through Express Scripts.

Seven focused tests cover false-positive regressions, the urgent-request
correction in both directions, and complete packets.

The source ledger contains 91 registered authorities: 39 fresh and 52 warning
by age, with no failures, source orphans, or coverage gaps. Registering the
Louisiana Blue manual section beside the provider landing page moved that source
to fresh. Its citations resolve across 289 registered URLs, none behind a
sign-in wall. Of 876 PA rules, 823 are source-anchored. The 1,722-tile catalog
is unchanged.

Verification covers 1,126 PA-engine tests, 14,445 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
