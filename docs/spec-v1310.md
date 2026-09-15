# spec-v1310 — narrow Blue Shield California service checks

Blue Shield of California rules 006–010 inferred specialized requirements from
broad inpatient, imaging, urgent, surgery, and J-code text. They now match the
current product-, setting-, and service-specific provider materials.

- Continued-stay documentation is checked only for an explicit concurrent
  review, not every inpatient request.
- Advanced imaging requires an identified non-emergency outpatient setting;
  an MRI mention or `7xxxx` code alone is insufficient.
- Urgent handling requires an explicit urgent or expedited authorization, not
  generic STAT wording.
- Site-of-care review requires explicit applicability and no longer assumes
  every surgical CPT belongs in an ASC-versus-hospital program.
- NDC is checked only when the authorization workflow explicitly requests it;
  a J-code does not create a universal packet requirement.

Regression tests cover every broad-trigger boundary and incomplete explicit
workflow. The source ledger adds current Blue Shield authorization contacts,
facility guidance, and benefit-specific forms, and generated PA reports are
refreshed.

The source ledger contains 91 registered authorities: 31 fresh and 60 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 180 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
