# spec-v1292 — complete the Humana rule audit

Humana rules 016–020 inferred universal requirements from broad clinical or
administrative terms. Any behavioral-health request could inherit named
level-of-care criteria, every transplant could require network routing and an
evaluation, generic off-label or trial language could demand evidence, and any
out-of-network request could require a network-gap justification.

The final five Humana rules now follow explicit workflow evidence:

- `R-PA-HUMANA-016` is an informational assessment check limited to inpatient,
  residential, partial-hospitalization, intensive-outpatient, detoxification,
  and withdrawal-management requests. Routine outpatient behavioral care does
  not trigger it, and the rule no longer claims one universal named criterion.
- `R-PA-HUMANA-017` asks for the selected facility only when the packet itself
  says Humana's transplant network or a designated facility is required.
  Generic transplant requests and evaluations do not inherit that routing.
- `R-PA-HUMANA-018` asks for a coverage-policy reference only when the packet
  explicitly says Humana classified the service as experimental,
  investigational, or unproven. Off-label use and clinical-trial language alone
  do not establish that classification.
- `R-PA-HUMANA-019` remains a source-free informational advisory and checks
  only that an explicit appeal identifies the original determination. It no
  longer claims a universal additional-clinical-information schema.
- `R-PA-HUMANA-020` runs only for an explicit network-gap, continuity-of-care,
  or transition-of-care exception. Generic out-of-network status passes.

Regression tests cover the broad false-positive cases and the incomplete and
complete explicit workflows. All generated PA reports are refreshed.

The source ledger contains 91 registered authorities: 26 fresh and 65 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 122 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
