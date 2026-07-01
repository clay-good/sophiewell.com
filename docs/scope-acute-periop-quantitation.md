# scope-acute-periop-quantitation.md — the Acute, Perioperative & Diagnostic Quantitation program ledger (spec-v188)

> Companion to [scope-advanced-quantitation.md](scope-advanced-quantitation.md)
> (the [spec-v185](spec-v185.md) program). This ledger records the growth under
> the **Acute, Perioperative & Diagnostic Quantitation** program
> ([spec-v188](spec-v188.md) §1.1) — the next band of *advanced bedside*
> instruments after the earlier program: ICU sedation / delirium / resuscitation
> tools, perioperative dosing-safety math, diagnostic lab indices, and
> cardiac / echo hemodynamics with anticoagulation bleeding risk.

The single source of truth for the count is `UTILITIES.length` in `app.js`; the
catalog-truth gate ([spec-v46](spec-v46.md)) fails CI on any drift between it and
the user-facing surfaces. The running close-count below is enforced against that
live value, never copied as a literal.

## Program roadmap (proposed)

The [spec-v188](spec-v188.md) umbrella reserves the band v188–v191 for four
feature specs (nominal +18):

- **[spec-v188](spec-v188.md)** — ICU sedation, delirium & acute resuscitation
  (+5): `rass`, `cam-icu`, `parkland`, `effective-osmolality`,
  `maintenance-fluids`.
- **[spec-v189](spec-v189.md)** — Perioperative & procedural dosing safety (+4):
  `local-anesthetic-max`, `mabl`, `apfel-ponv`, `lean-body-weight`.
- **[spec-v190](spec-v190.md)** — Diagnostic lab indices (+5): `apri`,
  `ganzoni-iron-deficit`, `anc`, `light-criteria`, `matsuda-index`.
- **[spec-v191](spec-v191.md)** — Cardiac & echo hemodynamics + bleeding risk
  (+4): `gorlin`, `qp-qs`, `has-bled`, `lvot-stroke-volume`.

All tiles are Class A (fixed formulas / validated assessment scales / criteria
sets), each cited by journal + authors and re-verified against ≥ 2 independent
sources at implementation ([spec-v97](spec-v97.md)).

## Running ledger

<!-- catalog-truth:historical -->
- **Program baseline:** the live catalog stood at the close of the prior programs
  (see [scope-advanced-quantitation.md](scope-advanced-quantitation.md) and the
  earlier ledgers) when this program was proposed.
- **spec-v188 — PROPOSED.** ICU sedation, delirium & acute resuscitation, +5.
- **spec-v189 — PROPOSED.** Perioperative & procedural dosing safety, +4.
- **spec-v190 — PROPOSED.** Diagnostic lab indices, +5.
- **spec-v191 — PROPOSED.** Cardiac & echo hemodynamics + bleeding risk, +4.
  Closes the program.

Each feature spec records its delta here against the live `UTILITIES.length` at
implementation, never as a copied literal, and notes any per-tile deferral with
its [spec-v97](spec-v97.md) sourcing rationale.
