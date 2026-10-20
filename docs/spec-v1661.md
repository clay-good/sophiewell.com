# spec-v1661 — Transplant size match and event intervals

> Status: **SHIPPED (2026-10-19)**: two tools. KDPI and EPTS are specified and gated (below).

The part of the [transplant-allocation-scores](../openspec/changes/transplant-allocation-scores/proposal.md) change
proposed in [spec-v1654](spec-v1654.md) that needs no OPTN coefficient.

## What shipped

| Tool | What it answers |
|---|---|
| `ischemia-time-clock` | The elapsed time between consecutive recorded events (cross-clamp, removal from ice, reperfusion, or whatever the reader labels), from the first to each, and when an hour limit from the first event runs out |
| `donor-recipient-size-match` | Donor-to-recipient weight, height and BSA ratios, each difference as a percentage; BSA by the Mosteller function the catalog already uses |

## What changed from the proposal

- **No interval is called "the" cold ischemia time.** The OPTN data definitions were not read (the OPTN site refused
  the request), so the design's fallback ships: each interval is named by the two events the reader labeled.
- **The BSA ratio is taken from unrounded values.** Dividing two BSAs already rounded to 0.01 m² gave 1.18 where the
  exact ratio is 1.19.
- **The search phrases avoid bare "donor" and "recipient"**, which belong to the blood compatibility tool.

## Specified, not built

### 1. `kdri-kdpi` — Kidney Donor Risk Index and Profile Index (OPTN)

**Build gate.** The OPTN *Guide to Calculating and Interpreting the KDPI* returned 403 to every fetcher on October 19,
2026, and the browser offered a file download. A human download of the guide unblocks it, as for spec-v1636; no
coefficient is stated anywhere in this repository until then.

### 2. `epts-score` — Estimated Post-Transplant Survival Score (OPTN)

**Build gate.** The same, for the EPTS guide.

## Proof

- `test/unit/transplant-v1661.test.js`: intervals across midnight, the limit falling before the last event, an
  out-of-order event and an impossible date refused; ratios in kg/cm and lb/in, and the unit selects required.
