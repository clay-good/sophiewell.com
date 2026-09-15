# spec-v1311 — separate Blue Shield California specialty workflows

Blue Shield of California rules 011–015 inferred program requirements from
broad drug, genetic-test, retrospective, DME, and home-health wording. They now
follow the current product- and workflow-specific provider materials.

- Step therapy runs only when the packet explicitly says it applies.
- Genetic-testing detail checks require explicit authorization applicability;
  an `81xxx` code does not establish it.
- Oncology diagnosis checks require an identified Evolent or Blue Shield
  criterion rather than a J-code or oncology label.
- Retroactive requests receive a non-enforcing workflow reminder because
  handling varies by product, service, and delegation.
- DME and home health no longer share an invented universal signed-order rule;
  the rule points to plan responsibility and request-specific requirements.

Regression tests cover all five overbroad-trigger boundaries. The source
ledger adds the current Blue Shield medication-policy list, and all generated
PA reports are refreshed.

The source ledger contains 91 registered authorities: 31 fresh and 60 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 181 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
