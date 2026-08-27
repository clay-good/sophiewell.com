# spec-v815 — ICHD-3 Criteria (Migraine, with and without aura)

## What this gives you

Enter the attack history once and get both ICHD-3 migraine verdicts: 1.1 Migraine without
aura and 1.2 Migraine with aura.

`midas`, `pound-migraine` and `id-migraine` have long covered *screening* and *disability*.
None of them applies the diagnostic criteria. This is the same axis gap `gold-coast-als`
filled for ALS.

## §1 The two sets

**1.1 Migraine without aura** — ≥5 attacks; lasting 4–72 h untreated; ≥2 of four (unilateral,
pulsating, moderate/severe, aggravated by routine activity); ≥1 of (nausea and/or vomiting;
photophobia **and** phonophobia); no better ICHD-3 explanation.

**1.2 Migraine with aura** — ≥2 attacks; ≥1 fully reversible aura symptom (visual, sensory,
speech/language, motor, brainstem, retinal); ≥3 of six aura characteristics; no better
ICHD-3 explanation.

## §2 Why both are always computed

Neither set contains the other. A patient can meet 1.2 without meeting 1.1 — different
attack count, no headache-character requirement at all. Answering only the set the reader
happened to ask about would be a half answer, so the tile evaluates both on every run and
names whichever are met, including both.

## §3 The two traps

**Photophobia and phonophobia count only together.** Criterion D of 1.1 offers *nausea
and/or vomiting* **or** *photophobia AND phonophobia*. The first option is an or; the second
is an and. It is widely carried as "photophobia or phonophobia", which grants criterion D to
patients who do not have it. The tile takes the two as separate inputs — the only shape that
can express the rule — and when exactly one is recorded it says why that is not enough.

**The attack thresholds differ: 5 for 1.1, 2 for 1.2.** Carrying 5 across to the aura set
denies the diagnosis to patients who meet it. When the count lands between the two, the tile
says so explicitly rather than reporting a bare "not met" for 1.1 and leaving the reader to
wonder why 1.2 passed.

Both have unit tests, as do the inclusive 4- and 72-hour bounds and the 2-of-4 / 3-of-6
counting rules.

## §4 Sourcing (spec-v97 gate)

- Headache Classification Committee of the International Headache Society (IHS). *The
  International Classification of Headache Disorders, 3rd edition.* Cephalalgia.
  2018;38(1):1-211 — sections 1.1 and 1.2, taken verbatim from the Society's own free full
  text at ichd-3.org.

The IHS is the sole authority that defines these criteria; there is no independent second
definition to reconcile, only reproductions of this one. The criteria were read directly
from the publisher rather than from a secondary summary.

## §5 Posture

Decision support, not a verdict. It applies published criteria to a history already taken.
It does not prescribe an abortive or a preventive.

Catalog 1606 → 1607.
