# spec-v1279 — scope UnitedHealthcare specialty checks

UnitedHealthcare rules 011–015 previously inferred payer requirements from
broad words such as specialty drug, genetic testing, retrospective, and home
health. The generic citations did not support several resulting claims,
including a universal step-therapy duration, genetic-program coverage for every
`81xxx` code, emergency or eligibility as the only retrospective-review bases,
and a signed-and-dated order in every DME or home-health authorization packet.

The rules now match UnitedHealthcare's current materials:

- `R-PA-UHC-011` runs only when the packet explicitly establishes a
  step-therapy requirement. It accepts a prerequisite trial or an exception
  basis without inventing a universal trial duration.
- `R-PA-UHC-012` runs only when the packet establishes that the genetic test is
  in scope for the program. It checks the specific test, performing laboratory,
  and clinical indication, while treating the laboratory-assigned identifier
  as conditional.
- `R-PA-UHC-013` checks for an extracted ICD-10-CM code on specialty or
  injectable drug requests. That field is explicitly required by the 2026
  Administrative Guide; the linter does not claim the diagnosis satisfies a
  drug-specific coverage policy.
- `R-PA-UHC-014` is limited to urgent advanced-imaging and named cardiology
  retrospective authorization. It requires both explanations published in the
  guide: why the procedure was urgent and why authorization could not be
  requested during normal business hours.
- `R-PA-UHC-015` checks for a DME order, prescription, or ordering provider as
  an informational reminder. It no longer extends the DME definition to home
  health or claims the general guide requires every packet to contain a signed
  and dated attachment.

Regression tests cover explicit and inferred step therapy, genetic program
scope and request identity, actual versus prose-only diagnosis fields, general
versus urgent after-hours retrospective review, and DME ordering-provider
documentation. The source ledger now registers UnitedHealthcare's genetic and
molecular testing FAQ, and all 46 generated PA audit reports are updated.

The source ledger contains 91 registered authorities: 22 fresh and 69 warning
by age, with no failures, source orphans, or coverage gaps. Its citations now
resolve across 101 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
