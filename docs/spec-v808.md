# spec-v808.md — HRS-AKI criteria (2024 ADQI / ICA)

> Status: **SHIPPED (2026-08-27).** Builds the `hrs-aki` tile. Catalog **1599 → 1600**,
> group G. (The 1600th tile.)

## Why

The catalog covered decompensated liver disease well — `clif-c-aclf`, `clif-c-ad`,
`nacseld-aclf`, `kings-college`, `meld3`, `west-haven-he`, `baveno-vii` — and had nothing for
**hepatorenal syndrome**, the kidney failure that decides much of what happens to those
patients.

## What it does

**All four required:**

1. Cirrhosis with ascites
2. AKI: creatinine up ≥ 0.3 mg/dL in 48 h, **or** ≥ 50% from a baseline in the prior 7 days,
   **and/or** urine output ≤ 0.5 mL/kg/h for ≥ 6 h
3. **No improvement within 24 hours** of adequate volume resuscitation, where clinically
   indicated
4. No strong evidence for an alternative explanation as the **primary** cause

**Worked example:** all four present → **criteria met**.

## The point of the tile: this is not the 2015 rule

Two things changed in 2024, and both run **against** what most people expect:

- **The 48-hour albumin challenge at 1 g/kg/day is no longer a prerequisite.** The consensus
  recommends *against* requiring it, asking instead for no improvement at 24 hours after
  adequate volume resuscitation.
- **Proteinuria > 500 mg/day, microhematuria > 50 RBC/hpf and abnormal renal ultrasound no
  longer exclude the diagnosis.** HRS-AKI may coexist with tubular injury, proteinuria and
  pre-existing chronic kidney disease. All three exclusions are replaced by the single
  alternative-explanation criterion.

So the tile still **asks** about those three findings — and puts them under a heading that
says plainly they no longer exclude anything. When any is present alongside all four criteria,
it returns *met* and says so explicitly. Tests pin that all three together still leave the
diagnosis met, and that each alone is recorded without excluding.

**A tool still applying the 2015 exclusions will call HRS-AKI absent in patients who have
it.** That is the failure this tile exists to prevent, and it is stated on the page.

## Posture (spec-v97)

Applies criteria to findings already gathered. It does not start terlipressin, albumin or
dialysis.

## Files

- `lib/hrs-aki-v808.js` — `hrsAki()`, `HRS_AKI_NOTE`.
- `views/group-v808.js` (RV808) — four required criteria under one heading, the three former exclusions under a second that names the change; a11y-checked.
- `mcp/adapters/hrs-aki-v808.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, the four criteria, both 2024 changes, related (clif-c-aclf, kings-college, meld3).
- `test/unit/hrs-aki.test.js` — 6 tests (nothing selected, all four, each one genuinely required, all three former exclusions non-excluding, each alone, no stale note when none present).
- `docs/spec-v808.md` (this file).

## Sourcing (spec-v97)

Nadim MK, Kellum JA, Forni L, et al. *J Hepatol.* 2024;81(1):163-183 (PMID 38527522). Both
sources state all four criteria in the same words, and both state the two replacements
explicitly — one quoting the consensus recommending "against systematic administration of
albumin for 48 h as a requisite", the other listing the 2015 exclusions and saying they "are
replaced by the absence of strong evidence for an alternative explanation as the primary cause
of AKI". Shipping the 2015 version here would have been shipping something superseded, which
is exactly what the citation-staleness discipline exists to catch.
