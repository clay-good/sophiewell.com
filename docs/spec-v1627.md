# spec-v1627 — Pharmacy practice: charter

**Status:** Proposed, October 10, 2026. Specs only; nothing here is built.
**Program ledger:** [scope-pharmacy-practice.md](scope-pharmacy-practice.md) (the gap-finder
result, the count, the research findings that changed the plan, and what was rejected).
**Specs:** spec-v1627 (this charter) through [spec-v1641](spec-v1641.md).

## What this does for the reader

A pharmacist's day is arithmetic over a source: a label's renal table, a CFR deadline, a
compounding formula, a kinetics equation, a guideline's genotype row. The work is done by hand,
from memory, or in a paid reference, and a slipped decimal or a stale label reaches a patient.

The catalog already serves the pharmacy that bills and dispenses
([spec-v1500](spec-v1500.md): access, affordability, 340B, pricing, refill and
controlled-substance clocks, adherence). It barely serves the pharmacist who **verifies,
compounds, monitors and counsels**. Before this program a name search of the live catalog found
one beyond-use-date tool, one renal dose-adjustment tool, about six kinetics tools and three
medication-safety tools, and nothing at all for alligation, isotonicity, parenteral nutrition
limits, label dose checks by drug, anticoagulant switching, DEA and supply-chain rules, Part D
pharmacy rules, nursing-facility pharmacy rules, nuclear pharmacy or pharmacogenomics.

This program closes that gap. Each tool takes the facts the pharmacist already has, does what
the source says for those facts, shows the working, names the source and its edition, and stops.

## What the program will not do

The admission test is unchanged from [spec-v1500](spec-v1500.md): six rules, restated below.
These kinds of work fail them and stay out.

| Out | Why |
|---|---|
| Recommending a drug, a dose or a change | The site computes; it does not prescribe. A tool reports the label's, rule's or paper's figure for the inputs. [spec-v1628](spec-v1628.md) §5 holds the wording rules. |
| Drug-interaction, allergy or duplicate-therapy screening | These are licensed databases that change weekly. A tool built on a snapshot is wrong within the month and looks complete. |
| Bayesian dosing with a proprietary prior | Not reproducible from a published source. A population equation ships only when every coefficient was read in the paper. |
| Tables copied from compendia (E-values, displacement factors, drops per mL, capsule volumes, neonatal doses) | Licensed, or with no primary source. The arithmetic ships; the constant is reader input. |
| Pediatric dose by rule of thumb (Young, Clark, Fried, a fraction of the adult dose) | Prescribing by a superseded heuristic, however it is labeled. |
| Instruments that need a license | Rejected by name in each wave. |
| Fifty-state tables, live status, annually shifting vaccine schedules, chart-reading | Standing rules ([spec-v1500](spec-v1500.md), spec-v5 §6). A state value is reader input. |

## Admission rule (every tool must pass all six)

1. **An input and a computed output.** A bare table, list or glossary is not a tool.
2. **A named primary source**, read: a statute, a CFR section, an FDA label, an agency document
   or data file, or the original paper. A secondary summary never supplies a number.
3. **Deterministic.** No model, no network, no server.
4. **Maintainable without a person.** A changing number comes from a fetched file, a watched
   dated constant, a watched label row, or the reader
   ([spec-v1501](spec-v1501.md) §2, [spec-v1628](spec-v1628.md) §1).
5. **Fails closed when stale.**
6. **Licensed to ship** ([spec-v1628](spec-v1628.md) §6).

Two rules this program adds, because its sources are labels and its readers include patients:

7. **A number is specified only if it was read.** Every dose, threshold, coefficient and deadline
   in these specs was read on a fetched page on October 10, 2026 and then re-read by a second,
   independent pass the same day. What neither pass could open is listed under "Verify at build"
   and is a **build gate**: the tool, or that row of it, is not built until someone reads the
   source. A spec never states an unread number as fact.
8. **A label is read from its holder.** [spec-v1628](spec-v1628.md) §1: the NDA or BLA holder's
   set id, an edition dated by version and published date, a weekly watch, and no answer once the
   section a tool reads has changed.

## The queue

| Spec | Wave | New | Of which build-gated |
|---|---|---|---|
| [v1628](spec-v1628.md) | Shared machinery: label-edition contract, datasets, constants, posture, licensing | 0 | |
| [v1629](spec-v1629.md) | Pharmaceutical calculations and nonsterile compounding | 25 | 1 |
| [v1630](spec-v1630.md) | Sterile compounding, IV admixture, parenteral nutrition, hazardous drugs, storage | 17 | |
| [v1631](spec-v1631.md) | Clinical pharmacokinetics and therapeutic drug monitoring | 20 | 1 |
| [v1632](spec-v1632.md) | Dose checks read from the FDA label | 18 | |
| [v1633](spec-v1633.md) | Conversions, switches, titrations and tapers | 23 | |
| [v1634](spec-v1634.md) | Medication review, medication safety and pharmacovigilance | 30 | 7 |
| [v1635](spec-v1635.md) | Oncology pharmacy, investigational drug service, nuclear pharmacy | 35 | 2 |
| [v1636](spec-v1636.md) | Hospital pharmacy: label antidote and emergency dosing, stewardship metrics, department measurement | 21 | |
| [v1637](spec-v1637.md) | Federal pharmacy law as arithmetic | 24 | 1 |
| [v1638](spec-v1638.md) | Part D, Medicaid, long-term care and pharmacy finance | 28 | |
| [v1639](spec-v1639.md) | The community pharmacy counter | 15 | 1 |
| [v1640](spec-v1640.md) | Pharmacogenomics | 9 |  |
| [v1641](spec-v1641.md) | Corrections to live tools found by this research | 0 | |
| | **Total** | **265** | **13** |

Each wave also lists **backfills**: live tools that should do more. Those that fix a wrong or
unsourced number in a live tool are indexed in [spec-v1641](spec-v1641.md).

## Build order

1. **[spec-v1641](spec-v1641.md) first.** It is small, it touches only live tools, and several of
   its items are doses a reader can act on today.
2. **[spec-v1628](spec-v1628.md)** §1 (the label watch) and §5 (the posture lint). Seven waves
   depend on them.
3. **Rules and dates with no dataset:** [v1637](spec-v1637.md), [v1638](spec-v1638.md), then the
   arithmetic waves [v1629](spec-v1629.md) and the equation half of [v1631](spec-v1631.md).
4. **Label-row waves**, in order of how often the question is asked: [v1632](spec-v1632.md),
   [v1633](spec-v1633.md), [v1639](spec-v1639.md), [v1636](spec-v1636.md), [v1630](spec-v1630.md),
   then the label half of [v1631](spec-v1631.md) and [v1635](spec-v1635.md).
5. **[v1640](spec-v1640.md)** once its dataset builder exists, and with it the three
   pharmacogenomic tools in [v1635](spec-v1635.md).
6. **[v1634](spec-v1634.md)** as its instrument sources are confirmed.

A build-gated tool waits for its source wherever its wave falls.

## Acceptance for the whole program

- Every shipped tool meets the eight rules, and its spec's "Build status" section says what was
  read at build, what changed from the plan, and what is still unread (the
  [spec-v1388](spec-v1388.md) convention).
- Every number is re-read in its source at build, not copied from the spec. Past programs found
  the spec right on a number and silent on a rule the same paragraph states.
- No tool answers from a superseded label section or an expired dataset. The negative tests in
  [spec-v1628](spec-v1628.md) §1 run for every label-row tool.
- The catalog count surfaces move with each wave (`node scripts/check-catalog-truth.mjs`), and
  every tool is exposed to agents in the same change ([spec-v627](spec-v627.md)).
- Every class tool is found by each of its drugs' generic and brand names.
- The owner decisions recorded in the ledger are settled before the tool they gate is built.
