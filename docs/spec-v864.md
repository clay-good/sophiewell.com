# spec-v864 — Methemoglobin Level Interpretation

## What this gives you

The band a measured level falls in, and — on every result — the two routine tests that read
reassuringly while it climbs.

## §1 The bands

| Methemoglobin | |
|---|---|
| Under 3% | Within the range seen normally |
| 3 to 15% | Often little more than discoloration |
| 15 to 20% | Cyanosis; blood is chocolate-brown and does not redden in air |
| 20 to 50% | Headache, fatigue, dizziness, breathlessness |
| 50 to 70% | Seizures, arrhythmia, coma, metabolic acidosis |
| Over 70% | Often fatal |

Methylene blue is given **for symptoms at any level**, or at **30% and above** without them.
Removing the oxidizing agent comes first at every level.

## §2 The pulse oximeter does not measure this

This is why the tile exists, and it prints on every result. A pulse oximeter reads two
wavelengths; methemoglobin absorbs at both, so the reading drifts toward about 85% and stops
there however high the level climbs. It does not correct on oxygen.

## §3 The blood gas is worse

The arterial oxygen tension measures oxygen **dissolved in plasma**, not what the hemoglobin can
carry, so it is normal — and a saturation calculated from it is normal too. Only co-oximetry
measures methemoglobin.

Both readings are accepted as inputs and neither changes the band. They are there so the tile
can say what they do not mean, and so it can compute the gap between what the oximeter shows and
the fraction of hemoglobin actually able to carry oxygen. The gap runs in the reassuring
direction and widens with severity, because the oximeter stops near 85% while the true fraction
keeps falling — 3 points at 18%, 25 at 40%, 45 at 60%. That gap is the finding.

## §4 Two things about the antidote

**G6PD deficiency.** Methylene blue works through NADPH from the pentose phosphate pathway, so
it does not reduce the methemoglobin and it can cause hemolysis. The tile raises this whenever
G6PD deficiency is entered, and raises it as an unknown whenever treatment is indicated and the
status was not entered.

**It is a monoamine oxidase inhibitor**, and has precipitated serotonin toxicity. Raised only
when treatment is actually in play.

## §5 Sourcing (spec-v97 gate)

- Wright RO, Lewander WJ, Woolf AD. *Methemoglobinemia: etiology, pharmacology, and clinical
  management.* Ann Emerg Med. 1999;34(5):646-656.
- Skold A, Cosco DL, Klein R. *Methemoglobinemia: pathogenesis, diagnosis, and management.*
  South Med J. 2011;104(11):757-761.

No tracked guideline issuer, so no `docs/citation-staleness.md` row is owed.

## §6 Posture

Decision support, not a verdict. It reads a measured level against published bands. It does not
prescribe methylene blue, set a dose, or replace the regional poison center.

Catalog 1655 → 1656.
