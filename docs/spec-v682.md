# spec-v682.md — Wang Bronchiolitis Respiratory Score

> Status: **SHIPPED (2026-08-09).** Builds the `wang-bronchiolitis` tile. Catalog **1512 → 1513**, group G.

## Why

The bronchiolitis-severity cluster had the RDAI/Tal-derived tile but not the **Wang score**,
the most widely cited bedside bronchiolitis severity instrument and the comparator most
validation studies use. Companion gap in a populated cluster.

## What it does

Four signs, each 0–3, summed to **0–12**:

| Sign | 0 | 1 | 2 | 3 |
| --- | --- | --- | --- | --- |
| Respiratory rate (breaths/min) | < 30 | 30–45 | 46–60 | > 60 |
| Wheezing | none | terminal expiratory / only w/ stethoscope | entire expiration / audible w/o stethoscope | insp + exp w/o stethoscope |
| Retraction | none | intercostal only | tracheosternal | severe w/ nasal flaring |
| General condition | normal | — | — | irritable, lethargic, or poor feeding |

The general-condition item takes **only 0 or 3** (no 1 or 2). Higher total = more severe.

## Posture (spec-v97) — disagreeing bands

Published severity cut-points **disagree** across sources (e.g. mild ≤ 3 / moderate 4–8 /
severe ≥ 9 vs mild < 5 / moderate 5–9 / severe ≥ 9). The tile therefore reports the
deterministic total and names the commonly cited cut-points as **advisory only**, without
asserting one band set — the same posture as `cheops`. It is a severity aid, not an
admission or discharge criterion.

## Files

- `lib/wang-bronchiolitis-v682.js` — `wangBronchiolitis()`, `WANG_NOTE`.
- `views/group-v682.js` (RV682) — one respiratory-rate number input + three clinical
  selects; a11y-checked, no innerHTML.
- `mcp/adapters/wang-bronchiolitis-v682.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items + advisory-band note, related (rdai-tal, westley).
- `test/unit/wang-bronchiolitis.test.js` — 7 tests (min 0, RR bands, general-condition 0/3
  only, worked example 8, max 12, advisory bands, validation).
- `docs/spec-v682.md` (this file).

## Sourcing (spec-v97)

Wang EE, Milner RA, Navas L, Maj H. Observer agreement for respiratory signs and oximetry in
infants hospitalized with lower respiratory infections. *Am Rev Respir Dis.* 1992;145(1):106-109
(PMID 1731571). The four items and the 0–3 (and 0-or-3) point structure summing to 0–12 were
confirmed across multiple reproductions; the severity **bands** are reported as advisory because
independent sources disagree on the cut-points (documented above).
