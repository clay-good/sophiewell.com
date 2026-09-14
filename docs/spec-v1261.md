# spec-v1261 — reverify CMS core code-set sources

Four core prior-authorization rule sources had crossed the ledger's 90-day
warning threshold. Each canonical CMS page was reread on 2026-09-14 before its
`lastVerified` date moved:

- HCPCS still defines Level II as one letter followed by four digits, is
  maintained by CMS, and carries an August 12, 2026 update.
- ICD-10 still publishes the current FY2026 files and the FY2027 files that take
  effect October 1, 2026.
- The professional-claims place-of-service table still includes telehealth
  codes 02 and 10 and the assigned codes bundled by `R-PA-013`.
- NCCI still publishes the current PTP and MUE files and describes the PTP edits
  as preventing improper payment from incorrect code combinations.

The canonical ledger, generated browser module, and PA audit snapshots are
refreshed together. This reduces source-age warnings from 84 to 80 without
changing a rule, code set, calculator, or catalog count.
