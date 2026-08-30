# spec-v896 — Lipid rescue for local anesthetic toxicity

## What this gives you

The 20% lipid emulsion volumes for this patient's weight, with the four things about the
checklist that a dose alone would not carry.

## §1 The doses

| Weight | Bolus | Then |
|---|---|---|
| **70 kg or above** | 100 mL over 2–3 min | 200–250 mL over 15–20 min |
| **Under 70 kg** | 1.5 mL/kg over 2–3 min | 0.25 mL/kg per minute |

Re-bolus once or twice and double the rate for persistent instability, within an upper limit of
about **12 mL/kg**. The tile computes that limit for the weight entered.

## §2 Lipid goes early, not at cardiac arrest

This is why the tile exists. The checklist starts lipid emulsion at the first sign of serious
toxicity; waiting for arrest is the delay it was written to prevent. On every result.

## §3 The epinephrine dose is reduced

**1 µg/kg or less** — roughly a tenth of the usual dose — because larger doses impair
resuscitation from this particular toxicity. The tile computes the microgram ceiling for the
weight, and states it whether or not arrest has been recorded, because it is the number a team
will otherwise reach for out of habit.

## §4 Propofol is not a substitute for lipid emulsion

Its lipid content is far too low to matter, and it is harmful in a cardiovascularly unstable
patient. **Vasopressin, calcium channel blockers, beta blockers and any further local anesthetic**
are avoided. On every result.

## §5 The first step is not on this page

Stop injecting; call for help; get the rescue kit. Airway management with 100% oxygen and
benzodiazepines for seizures come before any arithmetic here, and the tile says so rather than
presenting itself as the whole response. Monitoring continues at least 4–6 hours after a
cardiovascular event and at least 2 hours after an event confined to the nervous system.

## §6 Sourcing (spec-v97 gate)

- Neal JM, Neal EJ, Weinberg GL. *American Society of Regional Anesthesia and Pain Medicine local
  anesthetic systemic toxicity checklist: 2020 version.* Reg Anesth Pain Med. 2021;46(1):81-82.

ASRA is not in the tracked-issuer pattern, so no `docs/citation-staleness.md` row is owed.

## §7 Posture

Decision support, not a verdict. It computes volumes from a weight against a published checklist.
It does not prescribe, and it does not replace the checklist at the bedside or the help that
should already have been called.

Catalog 1685 → 1686.
