# spec-v708.md — AAO-HNS Ménière hearing stage

> Status: **SHIPPED (2026-08-10).** Builds the `meniere-aao-hns` tile. Catalog **1538 → 1539**, group G.

## Why

The catalog had otologic/vestibular tools (DHI) but not the **AAO-HNS hearing stage** for
Ménière's disease — the standard audiometric staging used for outcome reporting. Whole-concept
gap.

## What it does

```
PTA = mean of pure-tone thresholds at 500, 1000, 2000, and 3000 Hz (dB HL)
      (worst audiogram in the 6 months before treatment)
```

| PTA | Stage |
| --- | --- |
| ≤ 25 dB | 1 |
| 26–40 dB | 2 |
| 41–70 dB | 3 |
| > 70 dB | 4 |

Stages 1–2 = early/potentially reversible; 3–4 = fixed/advanced. Applies to **definite**
Ménière's disease.

## Posture (spec-v97)

Classifies hearing for staging/outcome reporting in definite Ménière's disease only. It supports
rather than replaces the full audiologic and clinical evaluation.

## Files

- `lib/meniere-aao-hns-v708.js` — `meniereAaoHns()`, `MENIERE_NOTE`.
- `views/group-v708.js` (RV708) — four pure-tone threshold number inputs; a11y-checked.
- `mcp/adapters/meniere-aao-hns-v708.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, PTA + stage bands, related (dhi, snot22).
- `test/unit/meniere-aao-hns.test.js` — 5 tests (worked example PTA 35/stage 2, mean, stage
  bands, stage-3 flag, validation).
- `docs/spec-v708.md` (this file).

## Sourcing (spec-v97)

Committee on Hearing and Equilibrium guidelines for the diagnosis and evaluation of therapy in
Ménière's disease. *Otolaryngol Head Neck Surg.* 1995;113(3):181-185 (PMID 7675476). The
four-frequency PTA (500/1000/2000/3000 Hz) and the 25 / 40 / 70 dB stage cut-points were
confirmed against the AAO-HNS guideline and an audiology reference, which agree.
