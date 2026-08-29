# spec-v874 — NHSN CLABSI definition

## What this gives you

Whether an event is a CLABSI under the NHSN rules, and the reminder that a CLABSI is an
attribution, not a diagnosis.

## §1 Two parts, and it needs both

**Laboratory part**

| | |
|---|---|
| **LCBI 1** | A recognized pathogen from **one or more** blood cultures. No sign or symptom required |
| **LCBI 2** | A common commensal from **two or more** blood cultures drawn on separate occasions, on the same or consecutive days, **with** at least one accepted sign or symptom |

Neither may be related to an infection at another site.

**Device part** — the central line was in place for **more than two consecutive calendar days**
(counting the day of insertion as day 1), **and** was in place on the day of the event or the day
before.

Accepted signs, older than one year: fever above 100.4 °F, chills, hypotension. One year old or
younger: fever, hypothermia below 96.8 °F, apnea, bradycardia.

## §2 It is a surveillance definition, not a clinical diagnosis

This is why the tile exists. "Central line-associated" is an attribution rule about timing, not a
statement that the line caused the infection. A patient can have a real line infection that is not
a CLABSI, and a CLABSI whose source was somewhere else. Prints on every result.

## §3 One culture or two, depending on the organism

One is enough for a recognized pathogen, and no sign or symptom is needed with it. A **single**
common-commensal culture is a contaminant under this definition however the patient looks. The
tile says which rule it applied and why.

## §4 The sign list is only for the commensal route, and it changes with age

Both are stated back on the commensal result, because reaching for the adult list in a neonate is
the easy error.

## §5 Two ways to fall out of "CLABSI" that are not the same thing

- **LCBI met, device rule not met** — a real bloodstream infection that is simply not counted as
  central line-associated. The tile names which half of the device rule failed.
- **Related to an infection at another site** — a secondary bloodstream infection, attributed to
  that site, and not an LCBI at all.

## §6 Sourcing (spec-v97 gate)

- CDC National Healthcare Safety Network. *Bloodstream Infection Event (Central Line-Associated
  Bloodstream Infection and Non-central Line Associated Bloodstream Infection).* NHSN Patient
  Safety Component Manual, Chapter 4.

CDC is a tracked issuer, so a `docs/citation-staleness.md` row is owed and added.

## §7 Posture

Decision support, not a verdict. It applies a published surveillance definition to findings
already recorded. It does not diagnose an infection, and it does not decide whether to treat or
to remove a line.

Catalog 1664 → 1665.
