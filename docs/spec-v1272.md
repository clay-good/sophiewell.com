# spec-v1272 — separate hereditary-cancer guidance from molecular testing

The genetic-testing overlay previously treated every five-digit CPT beginning
with `81` as a hereditary test. It then required family history, genetic
counseling, panel rationale, and genetic-specific consent even when the packet
described a somatic tumor assay or an unlisted molecular procedure. The trigger
also extended past the documented `81512` endpoint.

The overlay now recognizes only `81105`-`81479` and `81500`-`81512`. Its rules
then distinguish general molecular-test completeness from inherited-cancer
care:

- `R-PA-GEN-001` accepts a personal cancer diagnosis or history as an
  alternative to family-risk evidence. It runs only when the packet identifies
  hereditary-cancer context and reports an informational reminder.
- `R-PA-GEN-002` treats pretest counseling or education as NCI-recommended care
  for inherited-cancer testing, not a universal payer requirement or a service
  restricted to one professional credential.
- `R-PA-GEN-003` runs only for an explicitly named hereditary-cancer panel. A
  single-gene test or a molecular test with no inherited-cancer context does not
  inherit a panel-rationale requirement.
- `R-PA-GEN-004` is a source-free informational completeness check for an
  explicit molecular-test purpose. An unrelated diagnosis elsewhere in the
  packet no longer satisfies it.
- `R-PA-GEN-005` no longer invents a universal consent form. Instead, it flags
  only a detected claim that GINA protects all insurance, life insurance, or
  long-term-care insurance; NHGRI states that those latter protections do not
  apply.

The former mixed NCCN, ACMG, and NSGC source is replaced by separate current
NCI inherited-cancer testing and NHGRI GINA entries. Boundary tests cover the
exact CPT endpoint, somatic/unclassified requests, personal versus family risk,
panel gating, explicit clinical purpose, and accurate versus overstated GINA
language. The generated browser ledger, PA audit snapshots, and SBOM are
refreshed together. The source ledger contains 88 registered authorities: 21
fresh and 70 warning by age, with no failures, source orphans, or coverage gaps.
The 1,722-tile catalog and 876-rule PA surface are unchanged.
