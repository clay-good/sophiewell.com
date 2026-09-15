# spec-v1307 — separate BCBS Michigan specialty workflows

BCBS Michigan rules 011–015 inferred program requirements from broad drug,
genetic-test, retrospective, DME, and home-health wording. They now follow the
current product- and workflow-specific provider materials.

- Step therapy runs only when the packet explicitly says it applies.
- JVHL genetic-testing checks require explicit BCN outpatient applicability.
- Medical-drug diagnosis checks require an identified product-specific
  criterion rather than a J-code or oncology label.
- Retroactive requests receive a non-enforcing workflow reminder because
  acceptance and timing vary by program.
- DME and home health no longer share an invented universal signed-order rule;
  the rule points to the applicable Northwood, pharmacy, Tango, or coverage
  requirements.

Regression tests cover all five overbroad-trigger boundaries. The source
ledger adds the current BCBSM pharmacy, laboratory, medical-drug, DME, and
home-health pages, and all generated PA reports are refreshed.

The source ledger contains 91 registered authorities: 30 fresh and 61 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 167 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
