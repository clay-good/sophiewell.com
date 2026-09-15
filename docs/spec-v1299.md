# spec-v1299 — scope Highmark specialty checks

Highmark rules 011–015 treated conditional workflows as universal packet
requirements. Any J-code could inherit step-therapy and diagnosis checks, any
`81xxx` code could require a molecular-lab schema, and every DME or home-health
request could be flagged for a signed order that the cited source did not state.

The five rules now use current, request-specific evidence:

- `R-PA-HIGHMARK-011` is informational and runs only when the packet explicitly
  says step therapy applies or requests an exception. Generic specialty drugs
  and J-codes pass.
- `R-PA-HIGHMARK-012` is informational, triggers only on explicit genetic or
  molecular testing, and independently checks the test and indication. Its copy
  also reflects the October 1, 2026 transition from eviCore to HealthHelp.
- `R-PA-HIGHMARK-013` applies the diagnosis check only to an explicit oncology
  authorization workflow. Generic specialty drugs, injectables, and infusions
  pass, while the copy reflects current Evolent routing for some members.
- `R-PA-HIGHMARK-014` remains a source-free informational retro-review
  completeness advisory without inventing one universal justification schema.
- `R-PA-HIGHMARK-015` replaces an unsupported universal signed-order check with
  Highmark's published home-health requirements: both an OASIS file and CMS-485
  form. Generic DME requests pass.

Regression tests cover generic-category boundaries, incomplete explicit
workflows, and complete packets for all five rules. Four official Highmark
resources are added to the source ledger, and all generated PA reports are
refreshed.

The source ledger contains 91 registered authorities: 28 fresh and 63 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 137 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
