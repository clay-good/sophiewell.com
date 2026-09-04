# spec-v1041 — Five more, and a gate that caught me

Continues the ledger drain of `docs/spec-v1037.md`. Five tiles, 39 → 34.

| Tile | Cleared | Answered |
| --- | --- | --- |
| `big` | base deficit | BIG 2.5: **<16, below the Borgman 2011 high-mortality threshold** |
| `lis-murray` | CXR quadrants | Murray LIS 0: **no lung injury** |
| `cci-platelet` | pre-transfusion count | CCI 24000: **adequate increment for this transfusion** |
| `abcd2` | age | ABCD2 6/7 with the age band scored as absent |
| `digoxin` | creatinine clearance | the **reduced-clearance** maintenance dose |

Three of the five are worth a sentence each.

`cci-platelet` computes post minus pre. With the pre-transfusion count blank and read as 0, the
whole post-transfusion count became the increment, so the tile said the platelets had worked — which
is the reading that ends a refractoriness work-up.

`digoxin` bands its maintenance dose on renal function, and a blank clearance read as 0 mL/min is
anuric. The tile answered with the renal dose. That is not the safe default for a clearance nobody
measured; it is a different wrong dose.

`lis-murray` had the identical `Number(null)` trap spec-v1040 fixed in `hacor` — in a guard written
for exactly this purpose, three lines above where it failed:

> refuse from an empty or impossible instrument rather than substitute a magic P/F of 300 …

It refused nothing, because `Number(null)` is 0.

## The gate that caught me

`test/mcp/blank-is-absent.test.js` — which has been in the repo since spec-v930 — failed on my own
new code:

> these tiles read an empty string as a value, so an empty form answers from nothing: **big**

The refusal I added for a blank base deficit computes what the INR and GCS alone come to, so it can
still say "already ≥16" when they do. I wrote that floor with a bare `Number(gcs)`, so a blank GCS
contributed the full 15 points — a fresh instance of the trap, in the fix for the trap, caught
before it left the machine.

Two things follow. The gate is worth its keep: it compares **blank against absent** on every tile,
which is a property no single-tile test states. And the trap is not something you fix once — it is
the default behavior of the language, and every new guard has to be written against it.
