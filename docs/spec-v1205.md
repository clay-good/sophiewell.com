# spec-v1205 — an envelope is a claim about a quantity in a unit

Three more of `scripts/probe-unguarded-sibling.mjs`'s rows, all in modules whose
other exports have had the envelope guard since
[spec-v1181](spec-v1181.md).

## The one that mattered: `sic-score`

The Sepsis-Induced Coagulopathy score reads a platelet count in **×10⁹/L**. A US
laboratory prints the same count as **20,000/µL**.

Entered that way, a severe thrombocytopenia of 20 read as a normal count:

| entered | platelet item | SIC total | verdict |
|---|---|---|---|
| `20` (×10⁹/L) | **2** | 5/6 | **SIC criteria MET** |
| `20000` (the same patient, US units) | **0** | 3/6 | criteria not met |

The coagulopathy the score exists to catch was scored away, and the error is in
the **reassuring** direction — the one that matters. Same units confusion
[spec-v1180](spec-v1180.md) fixed for `sokal-cml`, in a module where
`lactateClearance` has had the guard for four waves.

The INR is guarded in the same loop; `lib/bounds.js` holds it at 0.5 to 20.

## The one that required an explicit conversion: `cpis-vap`

The probe printed `temp` **and** `wbc`. At that wave, only the temperature was
guarded.

CPIS scores its leukocyte count **per mm³** — the band is `4000` to `11000` —
while `BOUNDS.wbc` holds 0 to 200, which is the same quantity in ×10⁹/L.
Applying that envelope without conversion would have refused **every legitimate
value on the tile**. [Spec-v1255](spec-v1255.md) now converts the same count
ceiling explicitly: `200 ×10⁹/L` equals `200,000/mm³`. Legitimate leukopenia and
leukocytosis still score, while values outside the converted domain are refused.

> An envelope is a claim about a quantity **in a unit**, and this table's entries
> are not unit-agnostic.

That is the trap in this whole programme: a shared envelope is reusable only
after its unit has been reconciled with the input. A real leukocytosis of 25,000
and a real leukopenia of 800 both still score, and the tests say so.

## `euroscore-ii`

The age term is linear in `max(1, age - 59)`, so an implausible age drives the
logit until the prediction saturates:

```
age 1000000  ->  EuroSCORE II predicted in-hospital mortality at least 100.00%
```

`abi`, in the same module, has been guarded since
[spec-v1181](spec-v1181.md). 130 years is `lib/bounds.js`'s figure and still
answers.

## Proof

`probe-unguarded-sibling` reads **7 modules, 12 functions → 7 modules, 9
functions**. Lint, 13,503 unit tests, 448 MCP tests and five browser sweeps pass,
including `example-correctness` across all four shards — every worked example in
the catalog still computes its documented output.
