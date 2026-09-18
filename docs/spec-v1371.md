# spec-v1371 — Washington Apple Health, and a term of art the template collided with

Washington rules 006–010 carried the template. The HCA Inpatient Hospital
Services Billing Guide replaces two of them, and one of those corrections is the
sharpest in the program so far: the template's expedited rule meant something
else entirely in Washington.

## "Expedited prior authorization" is not an urgent review here

Every other payer uses *expedited* to mean faster review of an urgent request,
and `R-PA-MCWA-008` checked an expedited packet for a statement of clinical
urgency. In Washington, **expedited prior authorization (EPA) is a term of art**:
HCA says it "is designed to eliminate the need for written authorization." HCA
publishes authorization criteria identified by specific codes, and a provider
creates an EPA number from those codes and enters it in the claim's
authorization-number field. Authorization numbers are nine digits, and the
guide's own EPA examples begin 870, such as #870001375.

So the old rule flagged every legitimate Washington EPA packet for lacking an
urgency statement it was never supposed to contain, while missing the one thing
such a packet does need. The check now asks for the EPA number, and a test
asserts that a packet carrying the number and no urgency wording passes.

## The other rules

- `R-PA-MCWA-006` follows how HCA takes an authorization request: a written or
  fax request must open with the General Information for Authorization form
  HCA 13-835 and carry evidence-based decision making, utilization review, and
  medical justification. A ProviderOne direct-data-entry request does not need
  the form, and a test asserts it is not asked for.
- `R-PA-MCWA-007`, `009`, and `010` run only on packet-declared imaging,
  site-of-care, or NDC requirements. The guide publishes none of those programs.

Eight focused tests cover the payer wiring, the EPA correction in both
directions, the 13-835 form and its ProviderOne exemption, and false-positive
regressions.

The source ledger contains 91 registered authorities: 44 fresh and 47 warning
by age, with no failures, source orphans, or coverage gaps. Registering the HCA
Inpatient Hospital Services Billing Guide moved that source to fresh. Its
citations resolve across 295 registered URLs, none behind a sign-in wall. Of 876
PA rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,269 PA-engine tests, 14,588 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
