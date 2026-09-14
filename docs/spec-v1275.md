# spec-v1275 — bound Aetna specialty checks to current policy scope

Aetna overlay rules 011 through 015 previously generalized limited policy
language. Every commercial J-code inherited a Medicare Part B step-therapy
check, a generic supervised-program label satisfied the bariatric intervention
criterion, and counseling requirements for whole exome and whole genome
sequencing were applied to every genetic test. The site-of-service rule also
treated any surgical CPT at an inpatient or hospital outpatient site as part of
Aetna's named outpatient program. The retrospective reminder cited a page that
does not publish the claimed eligibility rule.

The five rules now follow the current Aetna materials:

- `R-PA-AETNA-011` runs only when an Aetna Medicare Advantage packet explicitly
  identifies a Part B step-therapy requirement. It accepts a preferred-drug
  trial, a clinical reason the preferred drug is inappropriate, or use of the
  requested drug within the past 365 days. A commercial J-code alone does not
  trigger the rule.
- `R-PA-AETNA-012` validates a numeric BMI against CPB 0157's current adult
  thresholds, including the lower threshold only with a listed severe
  comorbidity and the adjusted thresholds for Asian ancestry. It also requires
  documentation of at least 12 intervention sessions with nutrition, physical
  activity, and behavioral-modification components. The policy does not
  require physician supervision.
- `R-PA-AETNA-013` applies the CPB 0140 genetics evaluation and independent
  pre- and post-test counseling criteria only to whole exome or whole genome
  sequencing. Targeted and hereditary-cancer panels no longer inherit WES/WGS
  requirements.
- `R-PA-AETNA-014` remains an informational packet-completeness reminder for an
  unexplained retrospective label, but is now explicitly source-free.
- `R-PA-AETNA-015` runs only for procedures Aetna names in its outpatient
  site-of-service program when the request identifies a hospital outpatient
  setting. It does not apply to arbitrary surgical codes or inpatient care.

Regression tests cover commercial versus Aetna Medicare drug requests,
incomplete versus complete bariatric intervention records, targeted genetic
testing versus WES, the source-free retrospective reminder, and inpatient or
unlisted surgery versus a named hospital-outpatient procedure. The Aetna
fixture description and all generated PA audit reports are updated.

The source ledger contains 91 registered authorities: 22 fresh and 69 warning
by age, with no failures, source orphans, or coverage gaps. Of 876 PA rules, 824
are source-anchored; the decrease reflects the honestly source-free
retrospective reminder. The 1,722-tile catalog is unchanged.
