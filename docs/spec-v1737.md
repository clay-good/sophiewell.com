# spec-v1737 — Two measurements out of their fixed order

> Status: **SHIPPED (2026-11-16)**: a shared `orderFault()` in `lib/num.js`, applied to 21 tools. The catalog stays 2,387.

spec-v1736 found pressures entered out of their definitional order. This asks the general question: which
tools take two measurements where one is part of, or bounded by, the other, and still answer when the part
exceeds the whole? A finder swapped each pair's worked-example values and kept the tools that answered.

| Rule | Tools that answered | What it looked like |
|---|---|---|
| diastolic <= systolic | `map`, `shock-index`, `abcd2`, `abcd3-i`, `charge-af`, `meows`, `metabolic-syndrome`, `pph-who-2025`, `labor-care-guide-alert`, `tpa-eligibility` | 80/120 gave a MAP of 106.7, above the "systolic" |
| HDL <= total cholesterol | `ascvd`, `prevent`, `score2`, `score2-op`, `mesa-chd`, `framingham-cvd`, `reynolds-risk`, `ldl-calc`, `castelli-index`, `non-hdl-remnant` | total 50 / HDL 213: Framingham 0.6%, ASCVD "Low (<5%)" |
| LDL <= total cholesterol | `castelli-index`, `non-hdl-remnant`, `simon-broome-fh` | LDL 8 over total 5 mmol/L counted toward FH |

Each now refuses with the pair and the reason, for example: "The HDL cholesterol (213) is above the total
cholesterol (50); HDL is part of the total cholesterol, so it cannot be higher." Equal values and a blank side
still pass through to the tool's own rules.

`non-hdl-remnant` keeps its existing "recheck" note for LDL + HDL above the total: with a direct LDL assay that
can happen by assay variance, so it is not refused.

`simon-broome-fh`'s worked example entered an LDL of "0", which the tool already read as not entered; it is now
left blank (same answer, honest on screen).

Rejected finder rows (not an order): `vanc-auc`'s draw times (it already refuses a peak level below the trough),
`dragon-stroke`'s onset-to-treatment minutes, `corrected-age` (weeks vs months), `pasi`'s body-region areas,
`pneumothorax-volume`'s interpleural distances.

Tests: `test/unit/order-fault-v1737.test.js` (the helper, and each tool through the agent surface with its
example's two values swapped).
