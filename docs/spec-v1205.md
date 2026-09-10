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

## The one that had to be left alone: `cpis-vap`

The probe printed `temp` **and** `wbc`. Only the temperature is guarded.

CPIS scores its leukocyte count **per mm³** — the band is `4000` to `11000` —
while `BOUNDS.wbc` holds 0 to 200, which is the same quantity in ×10⁹/L.
Applying that envelope here would have refused **every legitimate value on the
tile**.

> An envelope is a claim about a quantity **in a unit**, and this table's entries
> are not unit-agnostic.

That is the trap in this whole programme, and it is easy to walk into precisely
because the finder is right that the field is unguarded. A real leukocytosis of
25,000 and a real leukopenia of 800 both still score, and the tests say so —
otherwise the next reader has only the absence of a guard to go on, and no record
of why.

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
