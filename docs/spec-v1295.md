# spec-v1295 — scope HCSC specialty checks

HCSC rules 011–015 treated several conditional workflows as universal packet
requirements. Any J-code could inherit step-therapy and diagnosis checks, any
`81xxx` code could require a genetic-testing schema, and every DME or
home-health request could be flagged for a signed order.

The five rules now follow narrower evidence:

- `R-PA-HCSC-011` is informational and runs only when the packet explicitly
  says step therapy applies. A generic specialty drug or J-code passes.
- `R-PA-HCSC-012` is informational and runs only for explicit genetic or
  molecular testing. It independently checks the specific test and clinical
  indication instead of accepting either field as proof of both.
- `R-PA-HCSC-013` applies the diagnosis check only to an explicit oncology-drug
  review. Generic specialty drugs, injectables, and infusions pass.
- `R-PA-HCSC-014` remains an informational retro-review completeness advisory,
  without attributing a universal retrospective-review schema to BCBSIL.
- `R-PA-HCSC-015` asks for a signed order only when request-specific
  instructions explicitly require a written order or plan of care. Generic DME
  and home-health requests pass.

Regression tests cover the generic-category boundaries, incomplete explicit
workflows, and complete packets for all five rules. All generated PA reports
are refreshed.

The source ledger contains 91 registered authorities: 27 fresh and 64 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 123 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
