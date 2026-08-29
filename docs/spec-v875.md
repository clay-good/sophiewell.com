# spec-v875 — NHSN CAUTI definition

## What this gives you

Whether an event is a CAUTI under the NHSN rules, and the one rule inside them that quietly
throws away symptoms.

## §1 Three criteria, all on the date of event

| | |
|---|---|
| **Device** | An indwelling urinary catheter in place **more than two consecutive calendar days** (day of insertion is day 1), and either still in place that day or removed the day before |
| **Symptom** | At least one of: fever above 100.4 °F, suprapubic tenderness, costovertebral angle pain or tenderness, urinary urgency, urinary frequency, dysuria |
| **Culture** | No more than two species, at least one of them a **bacterium at 100,000 CFU/mL or more** |

## §2 Urgency, frequency and dysuria are not counted while the catheter is in place

This is why the tile exists. A catheterized bladder cannot produce a meaningful complaint of
them, so NHSN accepts those three only once the catheter is out. The tile sets such symptoms
aside **and says it did**, with the reason — a symptom silently dropped looks like a bug.

## §3 Two culture exclusions that surprise people

- **More than two species excludes the event**, however the culture is treated clinically.
- **Yeast is not a bacterium.** Candiduria alone does not meet the definition at any colony
  count, and it is separately a poor reason to treat.

## §4 It is a surveillance definition

Not a clinical diagnosis, and not a decision about whether to treat asymptomatic bacteriuria.
Prints on every result.

## §5 When it is not met, the result says which criterion failed

In the definition's own terms — including which half of the device rule, and the case where the
day count was never entered at all.

## §6 Sourcing (spec-v97 gate)

- CDC National Healthcare Safety Network. *Urinary Tract Infection (Catheter-Associated Urinary
  Tract Infection and Non-Catheter-Associated Urinary Tract Infection) Event.* NHSN Patient
  Safety Component Manual, Chapter 7.

CDC is a tracked issuer, so a `docs/citation-staleness.md` row is owed and added.

## §7 Posture

Decision support, not a verdict. It applies a published surveillance definition to findings
already recorded. It does not diagnose an infection, and it does not decide whether to treat or
to remove a catheter.

Catalog 1665 → 1666.
