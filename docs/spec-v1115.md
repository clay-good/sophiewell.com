# spec-v1115 — the seven that turned an alarm into a reassurance

[spec-v1114](spec-v1114.md) left `probe-omitted-item.mjs` at 134 fields across 70
calculators, of which 58 tiles had never been read. Reading fifty-eight tiles is
not a wave. Sorting them is.

## The question that sorted them

The probe asks whether an omitted field moved the answer. That is too broad — a
mean legitimately moves, a detail line legitimately changes. The question that
matters is narrower:

> Does omitting this field turn an **unreassuring** answer into a **reassuring**
> one?

Run over every tile and every droppable field, that is **seven fields across six
calculators**, and every one of them is a defect:

| Tile | Omit | And it says |
|---|---|---|
| `ipss-r-mds` | the cytogenetic risk group | *IPSS-R 3: **Low** risk; median overall survival 5.3 years* |
| `lab-score` | the CRP **or** the procalcitonin | *Lab-score 2 of 9 — **low risk** of serious bacterial infection* |
| `pulp` | the ASA class | *PULP 6 of 18 — **low risk** (< 25% 30-day mortality)* |
| `mulbsta` | the smoking history | *MuLBSTA 9 of 20 — **low risk** (90-day mortality ~5%)* |
| `sixcit` | counting backward, or address recall | *6CIT 6 of 28 — **normal range*** |

`lab-score` is the one to look at twice. CRP and procalcitonin are the two
biomarkers the score exists to weigh, and `|| LABSCORE_CRP.lt40` read an
undrawn one as a reassuring one — under a detail line saying **"all biomarkers in
the low band"** about labs nobody had taken, in a febrile child.

`ipss-r-mds` is [spec-v1101](spec-v1101.md)'s shape with the evidence written on
the tile itself. Its guard refuses without the blasts, haemoglobin, platelets or
ANC, and its refusal message reads:

> **Enter the cytogenetic risk group**, marrow blast %, hemoglobin, platelets and ANC.

It asked for the cytogenetic group and did not require it — and `pick` returns 0
for a group it does not hold, which is `very-good`: the best cytogenetics there
is, and the widest-range term in the model (0 to 4 of about ten). Requiring it is
what the message had been promising, and it refuses nothing a reader can reach.

## Which control decides

In each of the five, the items that are **checkboxes** were already right: an
unticked box is a real "no" (rule 4). What fell through was in every case the
one **graded select** beside them — an ASA class, a smoking history, a
biomarker band, a cytogenetic group, a cognitive task. The same split
[spec-v1112](spec-v1112.md) got wrong on `mdq` and had to open the renderer to
settle.

**A tile with both kinds of control has two rules running in it at once**, and
the boolean half being correct is not evidence about the graded half.

## What holds

Each score is a non-negative sum, so the alarming band rules in from a subset and
is untouched (rule 13) — `PULP >= 8`, `MuLBSTA >= 12`, `Lab-score >= 3`, the 6CIT
referral bands. Only the reassuring reading waits, and it names what it is
waiting for.

`6CIT` is the neat case of rule 13: **points are earned only for errors**, so a
task nobody administered can only raise the score. The referral bands are
therefore safe from a subset and "normal range" is the only reading that has to
wait.

## Nine tests, and five that were asserting the fallback

*"no errors → 0 of 28, normal"* administered nothing and read three graded tasks
as tasks the patient had passed. *"7 is still normal"* did the same with two.
Each now administers the whole test — the seventh wave in a row where the
existing suite was pinning the defect in place rather than the behaviour.
