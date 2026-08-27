# spec-v831 — Quintero Staging (Twin-Twin Transfusion)

## What this gives you

Enter the chorionicity, the two amniotic fluid pockets and the staging findings; get the
Quintero stage — or, where it does not apply, which condition this actually is.

## §1 The five stages

Entry: a **monochorionic diamniotic** pregnancy with the oligohydramnios-polyhydramnios
sequence — donor maximum vertical pocket **<2 cm** *and* recipient **>8 cm**.

| Stage | |
|---|---|
| **I** | The fluid sequence; donor bladder **visible**; Dopplers normal |
| **II** | Donor bladder **not visible** over 60 minutes of observation; Dopplers still normal |
| **III** | Critically abnormal Dopplers in either twin — absent or reversed umbilical artery end-diastolic flow, a reversed ductus venosus a-wave, or pulsatile umbilical venous flow |
| **IV** | Hydrops |
| **V** | Demise of one or both twins |

Most advanced finding wins.

## §2 The entry condition is the fluid sequence, not a size difference

The two pockets are **numbers**, not one "sequence present" checkbox. That is deliberate:
the sequence has two separate thresholds and one without the other is a **different
diagnosis**. A single tick would let a reader assert the very thing the tile exists to check.

**Discordant growth without the fluid sequence is selective fetal growth restriction** — a
different condition with different management. A tool that staged on growth discordance would
name the wrong disease, so when neither half is present the tile says which condition it is
looking at instead, and when only one half is present it says both are needed.

Chorionicity is treated as a precondition rather than a detail: with the fluid sequence
present but chorionicity unconfirmed, the tile declines to stage and says why.

## §3 The stages are not a ladder

Quintero staging orders **findings**, not the course of the disease. It does not progress
obligately from I to V, a pregnancy can present at stage IV, and a higher number is not a
guarantee of faster deterioration.

The tile carries that on every staged result — and only on staged results — because a
five-point scale invites being read as a severity trajectory it was never meant to describe.

## §4 Sourcing (spec-v97 gate)

- Quintero RA, Morales WJ, Allen MH, Bornick PW, Johnson PK, Kruger M. Staging of twin-twin
  transfusion syndrome. *J Perinatol.* 1999;19(8 Pt 1):550-555.
- The stage definitions, both fluid thresholds and the three critical Doppler abnormalities
  were corroborated independently before encoding.

## §5 Posture

Decision support, not a verdict. It describes findings already made on ultrasound. It does
not decide about laser therapy, amnioreduction or delivery.

Catalog 1622 → 1623.
