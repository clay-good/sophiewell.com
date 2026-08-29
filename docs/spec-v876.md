# spec-v876 — NHSN ventilator-associated event

## What this gives you

The surveillance tier — VAC, IVAC, or PVAP — computed from daily minimum settings, and the four
rules inside the algorithm that decide the answer without anyone noticing.

## §1 Three nested tiers

| | |
|---|---|
| **VAC** | After ≥2 calendar days of stable or decreasing daily minimums: a rise of **≥20 points** in daily minimum FiO₂ **or ≥3 cmH₂O** in daily minimum PEEP, sustained ≥2 calendar days |
| **IVAC** | VAC **plus** a temperature above 100.4 °F or below 96.8 °F, or a white count ≥12,000 or ≤4,000/mm³ — **and** a **new** antimicrobial started and continued ≥4 calendar days |
| **PVAP** | IVAC **plus** a qualifying microbiological criterion |

## §2 There is no chest radiograph in it

This is why the tile exists. NHSN replaced ventilator-associated pneumonia with this algorithm
for adult surveillance, and it uses no imaging and no clinical judgment at any step —
deliberately, because the old definition could not be applied consistently between reviewers. On
every result, because a reader arriving here looking for VAP needs to know immediately that this
is not that.

## §3 Every threshold is on the daily minimum

Not on any value recorded that day. A transient rise during a turn or a suction does not start an
event. On every result.

## §4 A PEEP below 5 is treated as 5

Without that floor a change from 0 to 3 would read as a qualifying rise, and it is not one. The
tile applies the floor, and when it changed anything it prints both the entered and the floored
values — otherwise the arithmetic looks wrong.

## §5 No stability period, no event

Without at least two calendar days of stable or decreasing daily minimums there is no baseline,
and therefore no event, however sick the patient becomes. Named first when the tile returns
nothing.

## §6 Two more read-backs

- The IVAC step needs a **new** antimicrobial. An antibiotic already running does not count.
- **PVAP is "possible" ventilator-associated pneumonia.** It is a surveillance tier, not a
  diagnosis of pneumonia; the word *possible* is doing work.

## §7 Sourcing (spec-v97 gate)

- CDC National Healthcare Safety Network. *Ventilator-Associated Event (VAE) Protocol.* NHSN
  Patient Safety Component Manual, Chapter 10.

CDC is a tracked issuer, so a `docs/citation-staleness.md` row is owed and added.

## §8 Posture

Decision support, not a verdict. It applies a published surveillance algorithm to values already
recorded. It does not diagnose pneumonia, and it does not decide whether to treat.

Catalog 1666 → 1667.
