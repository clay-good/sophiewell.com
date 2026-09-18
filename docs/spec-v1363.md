# spec-v1363 — correct Michigan Medicaid specialty-workflow checks

Michigan Medicaid rules 011–015 inferred step therapy, delegated lab review,
drug-diagnosis, retrospective eligibility, and signed-order requirements from
broad codes. The Provider Manual replaces three of them with requirements that
are more specific than the template ever was — including one grounded in state
statute.

- `R-PA-MCMI-011` runs only when the packet establishes step therapy applies.
  The manual mentions step therapy only under a HIDE SNP's own utilization
  management, not as a fee-for-service Medicaid rule.
- `R-PA-MCMI-012` follows Michigan's genetic testing policy, which is the most
  demanding in the program so far. Genetic and molecular lab services are
  subject to clinical prior authorization through a dedicated Genetic and
  Molecular Laboratory Test Authorization Request; testing is allowed once per
  disease per lifetime for diagnostic purposes. And for **predictive** testing,
  Public Act 368 of 1978, Section 333.17020 requires informed consent with any
  statutory counseling, documented and available on request. The check asks for
  consent only on a predictive request — a diagnostic one is not flagged for
  lacking it — and a test asserts that distinction in both directions.
- `R-PA-MCMI-013` asks for the supporting diagnosis only when the packet names a
  drug authorization workflow.
- `R-PA-MCMI-014` replaces an invented eligibility claim with Michigan's real
  retrospective path: after discharge a provider may request retrospective
  review of unauthorized inpatient days, in writing within 30 calendar days,
  and *"A copy of the medical record must accompany the retrospective review
  request."* Review covers only the days not authorized during telephone review,
  and MDHHS answers within 14 business days.
- `R-PA-MCMI-015` asks for the ordering document on an explicit DME or
  home-health request. Michigan's rule is a seven-year retention duty for the
  order, prescription, or referral, not a signature requirement on the packet.

Nine focused tests cover the predictive-versus-diagnostic consent distinction,
the retrospective medical-record requirement, false-positive regressions, and
complete packets.

The source ledger contains 91 registered authorities: 41 fresh and 50 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 291 registered URLs, none behind a sign-in wall. Of 876 PA
rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,194 PA-engine tests, 14,513 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
