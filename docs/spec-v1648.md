# spec-v1648: A value on the cutoff, and tables with a gap or two answers

> Status: **SHIPPED (2026-10-19).**

Found by reading every interpretation table and derivation band list as integer intervals and looking for
a gap between rows or a value two rows both claim, then computing each tile at that exact value.

| Tile | Was | Now |
|---|---|---|
| `renal-failure-index` | Exactly 1 printed "favors prerenal azotemia (< 1)". | "at the cutoff (indeterminate) (cutoff 1)". |
| `shine-lal-index` | Exactly 1530 printed "iron-deficiency suggested (> 1530)". | "at the cutoff (indeterminate)". |
| `green-king-index` | Exactly 65 printed "iron-deficiency suggested (> 65)". | "at the cutoff (indeterminate)". |
| Those three and `england-fraser-index`, `sirdah-index`, `rdw-index`, `ehsani-index` (tables) | "< N" and "> N" rows only: the cutoff itself had no row. | A row for N: "At the cutoff: indeterminate.", which is what each result already said (or now says). |
| `aec` (table) | 1500 sat in both "500-1500" and "1500-5000". | "500-1499"; the result already put 1500 in moderate. |
| `simplified-aih` (table) | "≥ 6 probable" and "≥ 7 definite" both claimed 7. | "6" probable, "≥ 7" definite, as the result reads. |
| `cornell-csdd` (table) | "> 10 probable" and "> 18 definite" both claimed 19. | "11-18" probable, "> 18" definite. |

The other hits are values a score cannot take (Lansky moves in tens, the biophysical profile in twos, the
Sandvik index is a product with no 7, 10 or 11, NOSE in fives) or ordered first-match bands.

## Proof

- `test/unit/hemederm-v245.test.js`: Shine & Lal at 1530 and Green & King at 65 read indeterminate.
- `test/unit/renalpulm-v249.test.js`: the renal failure index at exactly 1 reads indeterminate.
