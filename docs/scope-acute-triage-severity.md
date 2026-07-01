# scope-acute-triage-severity.md — the Acute Triage & Specialty Severity program ledger (spec-v192)

> Companion to [scope-advanced-quantitation.md](scope-advanced-quantitation.md)
> (spec-v185) and [scope-acute-periop-quantitation.md](scope-acute-periop-quantitation.md)
> (spec-v188). This ledger records the growth under the **Acute Triage & Specialty
> Severity** program ([spec-v192](spec-v192.md) §1.1) — the next band of advanced
> bedside instruments: neurocritical coma / hemorrhage / head-injury decision
> rules, infectious-disease and community-acquired-pneumonia severity, neonatal
> and pediatric acute assessment, and cardiology / hepatology / electrolyte
> bedside indices.

The single source of truth for the count is `UTILITIES.length` in `app.js`; the
catalog-truth gate ([spec-v46](spec-v46.md)) fails CI on any drift between it and
the user-facing surfaces. The running close-count below is enforced against that
live value, never copied as a literal.

## Program roadmap (proposed)

The [spec-v192](spec-v192.md) umbrella reserves the band v192–v195 for four
feature specs (nominal +16):

- **[spec-v192](spec-v192.md)** — Neurocritical care, coma & trauma triage (+5):
  `ich-volume`, `ich-score`, `four-score`, `canadian-ct-head`, `rts`.
- **[spec-v193](spec-v193.md)** — Infectious disease & community-acquired-pneumonia
  severity (+3): `duke-criteria`, `psi-port`, `smart-cop`.
- **[spec-v194](spec-v194.md)** — Neonatal & pediatric acute assessment (+4):
  `westley-croup`, `finnegan-nas`, `silverman-andersen`, `pews`.
- **[spec-v195](spec-v195.md)** — Cardiology, hepatology & electrolyte bedside
  indices (+4): `heart-score`, `vte-bleed`, `saag`, `corrected-sodium`.

All tiles are Class A (fixed formulas / validated scores / criteria sets), each
cited by journal + authors and re-verified against ≥ 2 independent sources at
implementation ([spec-v97](spec-v97.md)).

## Running ledger

<!-- catalog-truth:historical -->
- **Program baseline:** the live catalog stood at the close of the prior programs
  (see the companion ledgers) when this program was proposed.
- **spec-v192 — PROPOSED.** Neurocritical care, coma & trauma triage, +5.
- **spec-v193 — PROPOSED.** ID & community-acquired-pneumonia severity, +3.
- **spec-v194 — PROPOSED.** Neonatal & pediatric acute assessment, +4.
- **spec-v195 — PROPOSED.** Cardiology, hepatology & electrolyte bedside indices,
  +4. Closes the program.

Each feature spec records its delta here against the live `UTILITIES.length` at
implementation, never as a copied literal, and notes any per-tile deferral with
its [spec-v97](spec-v97.md) sourcing rationale.
