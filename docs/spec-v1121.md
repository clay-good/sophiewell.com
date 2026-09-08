# spec-v1121 — the check rule 23 recommended, and what it found

[spec-v1120](spec-v1120.md) wrote down rule 23 — *when a guard's message lists
what it needs, the list is a claim* — after five tiles in six waves had refused
with a message naming an input the code beside it did not require. It called
reading the two against each other **"the cheapest audit in this programme"**.

An audit you perform by hand five times is a check you have not written. This is
the check.

`scripts/probe-message-promises.mjs` takes a tile's refusal message, finds the
fields whose adapter label it names, fills the tile from its worked example,
drops each named field in turn, and reports the ones that still answer.

## It found nothing, after two rounds of being wrong

| | rows |
|---|---|
| first run | **28** across 16 tiles |
| after excluding booleans | 23 |
| after excluding disjunctive messages and scaffolding words | **3** |
| after reading those three | **0** |

Each narrowing was a correction, not a filter added to reach a nicer number:

**Booleans.** The very first row was `asas-axspa`, whose message names *"chronic
back pain ≥ 3 months, age at onset < 45"* — two **checkboxes**. Rule 4 says an
unticked box is a real "no", so *"entry criterion not met"* is a legitimate
reading of two boxes left unticked. Every other probe in this programme excludes
booleans for exactly this reason ([spec-v1102](spec-v1102.md) says so in a
comment), and this one did not, on its first run, in the same repository.

**Disjunctions.** `rifle-aki` says *"Enter baseline and current creatinine,
**and/or** the urine-output category"*; `snappe-ii` says *"Enter **at least one**
SNAPPE-II measurement"* and then lists seven. **Naming a field inside a
disjunction is the opposite of promising to require it.** Reading those as broken
promises is how a finder starts costing more than it saves.

**Scaffolding words.** `calcium-phosphate-product|capo4-unit` matched on the
single word *"input"*, out of a message about a different field entirely
(`Missing required input "capo4-ca"`). A word that appears in the *frame* of a
refusal cannot identify the field it is about.

## The three survivors are correct

`mehran-cin` is the one worth quoting, because it is what every tile in this
programme should look like:

> Enter the rest of the Mehran score to band the risk. Missing: eGFR. **The
> unentered value can only add points, so a partial score cannot place this in
> the low-risk band.**

It refuses precisely where the missing value could change the band, and answers
where it cannot — a partial score already in the high-risk band is reported,
because nothing unentered can bring it down (rule 13). The probe's rows are that
second case.

`rome-ecopd` names its missing variables in the message and its answer says *"3
of the five variables are above cutoff"*.

## What this is worth

**Zero new defects across 1,385 tiles that refuse with a message.** That is the
result, and it is a real one: rule 23's five instances were found and fixed as
they arose, and there is no sixth waiting.

Recorded in *"Probes measured and rejected"* so it is not run again on a hunch —
but the script is kept, because the rule it enforces is about what an author
writes next, not about what is in the repository today.

The three narrowings are worth more than the zero. **A finder's first run is a
draft**, and each of these was found by reading a row rather than by trusting
the count — the same practice [spec-v1092](spec-v1092.md) arrived at when a
replacement probe inherited the blindness it was written to fix.
