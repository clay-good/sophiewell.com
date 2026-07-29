# spec-v590 — Original 1996 Five-Factor Score (systemic necrotizing vasculitis)

## What this gives you

The original Five-Factor Score, and an explicit account of how it differs from the 2011 revision that shares
its name — because the two scores are quoted interchangeably and are not interchangeable.

## Why it exists

A **predecessor gap**: `ffs-2011` has been in the catalog since spec-v148, and the score it revised was
absent. `grep -c "id: 'ffs-1996'" app.js` returned 0.

## The five factors (1 point each, 0–5)

| Factor | What became of it in 2011 |
|---|---|
| Proteinuria > 1 g/24 h | **Dropped** |
| Creatinine > 140 µmol/L (1.58 mg/dL) | Survived, threshold **moved** to ≥ 150 |
| GI involvement (hemorrhage, infarction, pancreatitis) | **The only factor unchanged** |
| Cardiomyopathy | Became cardiac insufficiency |
| CNS involvement | **Dropped** |

The revision also **added** age > 65 and a factor scoring the **absence** of ENT manifestations.

Bands: 0 / 1 / 2 or more.

## The three things worth knowing

- **Same name, same range, same bands — one shared factor.** An identical number from the two scores does
  not mean the same thing.
- **The renal threshold moved by 10 µmol/L, which is enough to cross.** A patient at 145 µmol/L scores the
  renal factor here and not on the revision. The tile detects that window.
- **The successor has a factor that scores for its absence; this one has nothing like it.** Every factor here
  counts something being *present*.

## Two deliberate refusals

- **`fiveYearMortalityPercent` is always null.** The percentages usually quoted alongside "the Five-Factor
  Score" belong to the 2011 cohort, and the 1996 figures could not be confirmed from two independent
  sources. Under spec-v97 none is reported rather than one borrowed.
- **Granulomatosis with polyangiitis is flagged as outside the derivation.** The 1996 cohort was 342 patients
  with polyarteritis nodosa and Churg-Strauss syndrome; GPA entered only with the revision's 1108.

## Scope (spec-v11 §5.3)

A group-level **prognostic** score. It does not diagnose vasculitis, does not classify which vasculitis, and
does not measure disease **activity** — a separate axis. It does not select immunosuppression, and a score of
0 is not a reason to withhold treatment.

## Sources

- Guillevin L, Lhote F, Gayraud M, et al. *Medicine (Baltimore).* 1996;75(1):17-28.
- Guillevin L, Pagnoux C, Séror R, et al. The Five-Factor Score revisited. *Medicine (Baltimore).*
  2011;90(1):19-27.

## Files

`lib/ffs-1996-v590.js`, `views/group-v590.js`, `mcp/adapters/ffs-1996-v590.js` (wave 415),
`test/unit/ffs-1996.test.js`. Catalog 1439 → 1440; MCP 1376 → 1377.
