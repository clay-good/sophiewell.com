# spec-v886 — Occupational noise exposure limits

## What this gives you

Both allowable exposure times for a measured level — NIOSH and OSHA — and no pick between them.

## §1 Two standards that do not agree

| | Limit | Exchange rate | Allowable time |
|---|---|---|---|
| **NIOSH** | 85 dBA / 8 h | 3 dB | 480 / 2^((L−85)/3) minutes |
| **OSHA** | 90 dBA / 8 h | 5 dB | 8 / 2^((L−90)/5) hours |

OSHA also sets an **action level** at an 8-hour average of 85 dBA, above which a hearing
conservation program is required.

## §2 The exchange rates differ, so the answers differ a lot

This is why the tile exists. At **100 dBA** the allowance is **15 minutes** under NIOSH and
**2 hours** under OSHA. The tile prints both and says neither is offered as the answer — the same
posture as spec-v881 and spec-v865. When a duration is entered and it clears OSHA but not NIOSH,
the result names that gap as the two standards disagreeing rather than a rounding difference.

## §3 The OSHA limit is a legal ceiling, not a safety threshold

The NIOSH figure is the health-based recommendation. A workplace that meets the law may be well
past what protects hearing. On every result.

## §4 A hearing protector's rating must be derated

OSHA's method for an A-weighted measurement is **(NRR − 7) / 2**, so a protector labeled 33 dB is
credited with **13 dB**, not 33. The tile applies it, prints both numbers, and says the label
figure is a laboratory number. The sentence prints even when no protector is entered, because
that is where the misreading starts.

## §5 The allowance is for the whole day

Noise dose is cumulative across every exposure in a shift, not a judgment about one reading. On
every result.

## §6 Sourcing (spec-v97 gate)

- NIOSH. *Criteria for a Recommended Standard: Occupational Noise Exposure, Revised Criteria
  1998.* DHHS (NIOSH) Publication No. 98-126.
- Occupational Safety and Health Administration. *Occupational noise exposure.* 29 CFR 1910.95.

The citation names NIOSH under the CDC issuer-acronym pattern, so a `docs/citation-staleness.md`
row is owed and added.

## §7 Posture

Decision support, not a verdict. It computes published limits from a measured level. It does not
certify compliance, and it does not select hearing protection.

Catalog 1676 → 1677.
