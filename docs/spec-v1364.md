# spec-v1364 — finish Michigan Medicaid: exception workflows

This closes the Michigan Medicaid overlay, the seventh payer in the program and
the first state Medicaid one. Four of the five rules gain requirements the
manual states outright, two of them with a named form.

- `R-PA-MCMI-016` routes behavioral health where Michigan routes it: every
  psychiatric admission, and every continued stay, must be authorized by the
  local Prepaid Inpatient Health Plan or Community Mental Health Services
  Program. Generic mental-health context no longer triggers it.
- `R-PA-MCMI-017` replaces the Blue Distinction routing requirement — meaningless
  for a Medicaid program — with what Michigan actually demands: *"The letter of
  authorization for the transplant from the Office of Medical Affairs (OMA) or
  MHP must be attached to all applicable transplant claims, otherwise payment is
  denied."*
- `R-PA-MCMI-018` **stops guessing at "investigational" and follows the rule
  Michigan added on 1 July 2026.** Prior-authorization requirements that apply
  outside a qualifying clinical trial apply to routine services inside one, and
  such a request must carry the National Clinical Trial (NCT) number and a
  completed, signed Attestation to the Appropriateness of the Qualified Clinical
  Trial form (BPHASA-2210). A complete submission is decided within 72 hours; an
  incomplete one is processed as a standard request, not denied. Off-label
  context no longer triggers anything.
- `R-PA-MCMI-019` asks which determination an appeal contests — Michigan issues a
  PACER number with each decision.
- `R-PA-MCMI-020` follows the out-of-state rule *with its published exception*:
  all non-emergency services from out-of-state and beyond-borderland providers
  need written prior authorization from MDHHS, **except genetic or molecular
  laboratory services**, which follow the clinical PA rules that would apply
  in-state. Emergencies are excepted too, and both exceptions have tests.

Eleven focused tests cover the two exceptions, the NCT and attestation pair,
false-positive regressions, and complete packets.

The source ledger contains 91 registered authorities: 41 fresh and 50 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 291 registered URLs, none behind a sign-in wall. Of 876 PA
rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,205 PA-engine tests, 14,524 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
