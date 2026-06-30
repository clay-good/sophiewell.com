# scope-advanced-quantitation.md — the Advanced Bedside Quantitation program ledger (spec-v185)

> Companion to [scope-post-parity.md](scope-post-parity.md) and
> [scope-subspecialty-depth.md](scope-subspecialty-depth.md). Those ledgers record
> the catalog's growth through MDCalc parity, Post-Parity Coverage, and the
> Subspecialty Depth program. This ledger records the growth under the
> **Advanced Bedside Quantitation** program ([spec-v185](spec-v185.md) §1.1) — the
> deliberate closing of the last *advanced-quantitation* gaps (model-based
> pharmacokinetics, oxygenation / gas-exchange physiology, and the
> time-anchored emergency instruments) after the catalog reached broad parity.

The single source of truth for the count is `UTILITIES.length` in `app.js`; the
catalog-truth gate ([spec-v46](spec-v46.md)) fails CI on any drift between it and
the user-facing surfaces. The running close-count below is enforced against that
live value, never copied as a literal.

## Program roadmap (proposed)

The [spec-v185](spec-v185.md) umbrella reserves the band v185–v187 for three
feature specs (nominal +15):

- **[spec-v185](spec-v185.md)** — Advanced therapeutic drug monitoring & PK dosing
  suite (+5): `vancomycin-auc`, `aminoglycoside-pk`, `phenytoin-correction`,
  `carboplatin-calvert`, `rosendaal-ttr`. All Class A, deterministic first-order
  kinetics / point methods.
- **[spec-v186](spec-v186.md)** — Critical-care oxygenation, gas exchange & ARDS
  severity (+5): `aa-gradient`, `berlin-ards`, `oxygenation-index`,
  `oxygen-delivery`, `fick-cardiac-output`. All Class A physiologic formulas /
  consensus severity strata.
- **[spec-v187](spec-v187.md)** — Emergency toxicology, electrolyte & acute
  decision instruments (+5): `rumack-matthew`, `kings-college-criteria`, `ttkg`,
  `centor-mcisaac`, `free-water-deficit`. All Class A nomogram lines / criteria
  sets / formulas.

## Running ledger

<!-- catalog-truth:historical -->
- **Program baseline:** the live catalog stood at the Subspecialty Depth +
  Cross-Discipline + LTC-GA close (see [scope-post-parity.md](scope-post-parity.md)
  and [scope-subspecialty-depth.md](scope-subspecialty-depth.md)) when this
  program was proposed.
- **spec-v185 — PROPOSED.** Therapeutic drug monitoring & PK dosing suite, +5.
  Each tile ships only after its own ≥ 2-source re-verification
  ([spec-v97](spec-v97.md)); any constant that cannot be cross-verified is parked
  with a recorded rationale rather than approximated.
- **spec-v186 — PROPOSED.** Critical-care oxygenation / gas exchange / ARDS
  severity, +5.
- **spec-v187 — PROPOSED.** Emergency toxicology / electrolyte / acute decision
  instruments, +5. Closes the program.

Each feature spec records its delta here against the live `UTILITIES.length` at
implementation, never as a copied literal, and notes any per-tile deferral with
its [spec-v97](spec-v97.md) sourcing rationale (the Post-Parity precedent:
PRECISE-DAPT was deferred, not approximated).
