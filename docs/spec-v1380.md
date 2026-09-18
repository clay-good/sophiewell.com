# spec-v1380 — finish Medi-Cal

This closes the Medi-Cal overlay with all twenty rules corrected. The Part 1 TAR
Overview settles seven of these ten directly; three stay packet-declared.

**Sourced to the TAR Overview**

- `R-PA-MCAL-014` follows Medi-Cal's deferral rule. A deferred TAR must get the
  requested information within 30 days or it is denied with a Notice of Action to
  the recipient, and the response needs the right cover sheet — a TAR 3
  Attachment Form for an eTAR, the Adjudication Response for a paper TAR.
- `R-PA-MCAL-015` applies the TAR's own requirements to equipment and home
  health: the signed prescription or order, and the type, number, and frequency
  of services.
- `R-PA-MCAL-016` follows Medi-Cal's dedicated psychiatric form: an inpatient
  mental health stay is requested on the 18-3 Request for Mental Health Stay in
  Hospital.
- `R-PA-MCAL-018` replaces an investigational guess with Medi-Cal's published
  route: a non-benefit code may be paid under an approved TAR when medical
  necessity is established, submitted as an eTAR flagged for non-benefit review.
- `R-PA-MCAL-019` asks a fair hearing, TAR appeal, or resubmission which decision
  it answers — the Notice of Action the recipient received, the Adjudication
  Response, or, for a TAR denied for lack of information, a statement that the
  new TAR includes it and is not a duplicate. The existing fair-hearing test still
  expects an advisory when no decision is cited, and two new tests cover the
  cited cases.
- `R-PA-MCAL-020` follows the managed care rule: a fee-for-service TAR for a
  managed care enrollee is denied without a denial from the plan.
- `R-PA-MCAL-013` asks a drug TAR for the diagnoses every TAR must include.

**Packet-declared**

`R-PA-MCAL-011` (step therapy), `012` (genetic testing), and `017` (transplant)
run only when the packet establishes the workflow. The test that asserted a
transplant-center routing requirement is replaced by one asserting Medi-Cal
imposes none. The self-satisfying-trigger probe added in spec-v1379 covers these
three and finds no overlap.

Ten focused tests cover the deferral cover sheet, the DME order, the 18-3, the
non-benefit route, each fair-hearing and resubmission path, and the managed care
plan denial.

The source ledger contains 91 registered authorities: 47 fresh and 44 warning
by age, with no failures, source orphans, or coverage gaps. Rule citations
reference 240 distinct URLs, all among the 302 registered and none behind a
sign-in wall. Of 876 PA rules, 823 are source-anchored. The 1,722-tile catalog
is unchanged.

Verification covers 1,346 PA-engine tests, 14,665 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
