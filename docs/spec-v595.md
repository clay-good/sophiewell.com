# spec-v595 — ACEF and ACEF II (cardiac surgery mortality risk)

## What this gives you

Both ACEF versions from the same inputs, with the one property that makes this score behave unlike every
other risk score made explicit: it is a **ratio**.

## Why it exists

The catalog carried perioperative cardiac risk instruments and had neither ACEF version. Every slug spelling
(`acef`, `acef-ii`, `acef-score`, `age-creatinine-ejection-fraction`) and every filename search returned 0.

## The formulas

| | Formula |
|---|---|
| **ACEF** | age ÷ EF **+ 1** if creatinine > 2.0 mg/dL |
| **ACEF II** | age ÷ EF **+ 2** if creatinine > 2.0 **+ 3** if emergency **+ 0.2 ×** (36 − hematocrit) when below 36 |

## The four things worth knowing

- **It is a ratio, not a sum of points.** No maximum, no ceiling, no bands. The tile reports no maximum.
- **Ejection fraction is a denominator, so the score is nonlinear in it.** Halving EF **doubles** the score:
  at 70, EF 30 → 2.33 and EF 60 → 1.17.
- **The creatinine weight doubles between versions** (1 → 2), so a value cannot be carried between them. And
  renderings of the original differ at **exactly 2.0** ("or more" vs "above"); ACEF II is consistently
  "above", so that operator is applied to both and the boundary case is flagged.
- **The hematocrit term is continuous and one-sided.** 0.2 per point below 36, nothing above. Not a threshold
  flag — a hematocrit of 26 adds 2.0, as much as the creatinine term.

**The original has no emergency term** and was derived in elective surgery; ACEF II adds emergency as its
largest single add-on (3). An emergency case sets `acefOutsideDerivation`.

## Scope (spec-v11 §5.3)

Group-level **preoperative mortality** estimates. They do not decide whether to operate, do not choose
between surgery, PCI and medical therapy, and do not select an operation. **A high score is not a reason to
decline surgery** — for many of these patients the untreated course is worse, and these scores say nothing
about it. They do not estimate stroke, renal failure or length of stay.

## Sources

- Ranucci M, Castelvecchio S, Menicanti L, et al. *Circulation.* 2009;119(24):3053-3061.
- Ranucci M, Pistuddi V, Scolletta S, et al. The ACEF II Risk Score. *Eur J Cardiothorac Surg.*
  2018;53(5):1064-1071.

## Files

`lib/acef-v595.js`, `views/group-v595.js`, `mcp/adapters/acef-v595.js` (wave 420),
`test/unit/acef.test.js`. Catalog 1444 → 1445; MCP 1381 → 1382.
