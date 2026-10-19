# spec-v1647: A result's risk figure must be the one its own table gives

> Status: **SHIPPED (2026-10-19).**

Found by comparing, for every tile with both, the interpretation table and the derivation bands on the same
page, and every percentage the derivation quotes against the table.

| Tile | Was | Now | Source of the figures |
|---|---|---|---|
| `timi` | Score 2 printed "Low risk (~5% 14-day risk)"; the tile's table gives 8.3% at 2. | Each score prints its own figure: 4.7 / 4.7 / 8.3 / 13.2 / 19.9 / 26.2 / 40.9 / 40.9%, with the low/intermediate/high group kept. `risk14d` is returned. | Antman 2000 Table 3, already the tile's table. |
| `apache2` | Five merged bands: a total of 23 printed "~25%", while the table said 40-55% for 20-29. | The eight bands of the Knaus table: 0-4 4%, 5-9 8%, 10-14 15%, 15-19 25%, 20-24 40%, 25-29 55%, 30-34 75%, 35+ 85%. Result, derivation and table now carry the same rows. | Knaus 1985 as reprinted in PMC10600666 and PMC11193976 (both open). |
| `meld-childpugh` | Derivation labels said "~2-4%", "~6-12%", "~20-30%", ">50%". | The table's own figures: 1.9%, 6%, 19.6%, and 52.6% / 71.3% for 30-39 / 40+. Four bands kept, as the result has. | Kamath 2001, already the tile's table. |
| `alvarado-pas` | The table began at 1; a score of 0 had no row. | The table begins at 0, as the result's bands do. | |

Looked at and left: `canadian-syncope` and `ariscat` quote finer figures that sit inside their table's
bands; `centor` quotes Centor 1981's probabilities beside McIsaac's management bands, two instruments on
one tile rather than one table disagreeing.

## Proof

- `test/unit/scoring-v4.test.js`: every TIMI score prints the percentage its interpretation row gives.
- `test/unit/apache2.test.js`: the worked example (23) reads "20-24: about 40%"; totals across the age and
  chronic-health steps each print the figure of their table row.
