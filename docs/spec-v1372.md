# spec-v1372 — Washington Apple Health exception workflows

Washington rules 016–020 carried the template's transplant-routing,
investigational, appeal, and network-gap assumptions. HCA's Inpatient Hospital
Services Billing Guide replaces each with a rule it actually publishes. (Rules
011–015 need HCA's home-health and physician-services guides and follow in the
next slice.)

- `R-PA-MCWA-016` follows the psychiatric rule the guide states: a hospital
  transferring a client for inpatient psychiatric care must obtain prior approval
  of post-stabilization care and an authorization number from the mental health
  designee, and record the number. Generic mental-health context no longer
  triggers it.
- `R-PA-MCWA-017` replaces a "Medicaid-designated transplant-center routing"
  requirement — and the test that pinned it — with HCA's facility rule: an
  HCA-approved hospital with a Department of Health certificate of need for the
  transplant type and Medicare transplant certification. Stem cell, skin graft,
  and corneal transplants need neither approval, and **prior authorization is
  required for every out-of-state transplant**. Each case has a test.
- `R-PA-MCWA-018` turns an investigational guess into HCA's published route:
  noncovered services are reviewed under the exception-to-rule policy,
  WAC 182-501-0160, so a packet declaring one needs that request.
- `R-PA-MCWA-019` asks for what HCA says an appeal is: a detailed written
  description of the dispute, for a determination made prospectively,
  concurrently, or in the retrospective audit.
- `R-PA-MCWA-020` **is raised from informational to a flag**, because HCA states
  the requirement: elective, non-emergency out-of-state care needs PA, must be
  medically necessary and unavailable in Washington (WAC 182-501-0060), and needs
  a completed Out-of-State Medical Services Request form. Emergency care is paid
  without PA, and designated bordering-city and critical border hospitals count
  as in-state; both exemptions have tests. Out-of-network wording triggers
  nothing.

Eleven focused tests cover each exemption, the out-of-state transplant PA, the
raised severity, and complete packets. One test that pinned the corrected
transplant-routing assumption is replaced.

The source ledger contains 91 registered authorities: 44 fresh and 47 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 295 registered URLs, none behind a sign-in wall. Of 876 PA
rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,279 PA-engine tests, 14,598 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
