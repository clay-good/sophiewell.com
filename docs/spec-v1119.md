# spec-v1119 — the first three off the new probe's list

[spec-v1118](spec-v1118.md) shipped `scoring-select-probe.spec.js` and its
narrowed list: **52 fields across 27 tiles** that are both unanswerable on either
surface and shown to change the answer. This is the first pass through it.

Fifteen of the twenty-seven already disclose — `modified-fisher` says *"no
subarachnoid blood entered"*, `boston-caa` says *"were marked"*, `vod-sos` says
*"from what is recorded"*, `hiv-pep-occupational` says *"is recorded"*. That is
what a prioritiser is for: the reading tells you which rows to open, and most of
them close again.

Three did not.

| Tile | With one select left alone | And it means |
|---|---|---|
| `ves-13` | *VES-13 total 2/10: **not vulnerable** (below the ≥ 3 threshold)* | a frailty screen ruling itself out with eight of its items unanswered |
| `cpis-vap` | *CPIS 6/12: 6 or below — **VAP less likely** by the CPIS threshold* | ventilator-associated pneumonia made less likely by a chest nobody looked at |
| `glim-malnutrition` | *Malnutrition **not diagnosed** by GLIM* | a diagnosis excluded rather than not yet made |

`cpis-vap` is another tile whose guard **asked and did not require**: its refusal
message reads *"Enter the temperature and the leukocyte count, **then select the
remaining CPIS components**"*, and the four remaining components fell through to
0 — no secretions, oxygenation not low, a clear radiograph, a negative culture.
That is the fourth tile in three waves whose own message named the gap it walked
past.

`ves-13` is the widest: eight of its thirteen inputs are selects, opening on
*Under 75 years*, *Excellent*, and six times *No difficulty*.

## `glim-malnutrition` needed a narrower rule, and a test said so

The first draft withheld the exclusion whenever either graded criterion was
unstated. An existing test — *"phenotypic without etiologic → not diagnosed"* —
failed, and it was right.

Both unstated criteria are **phenotypic**, and GLIM needs one phenotypic *and*
one etiologic. The etiologic side is two checkboxes, so an unticked one is a real
"no" (rule 4). With neither ticked, **no phenotypic criterion could complete the
pair**, and the exclusion is earned however the two selects would have read.

So the reading only waits where the etiologic side is already met and the
phenotypic side is empty:

| | |
|---|---|
| nothing entered | *not diagnosed* — earned, because the etiologic side is answered |
| reduced intake ticked, nothing phenotypic | *not yet assessable* — either unstated criterion would complete it |
| reduced intake ticked, both stated as none | *not diagnosed* — earned |

**"Does the missing value change this reading?" is a narrower question than "is
something missing?"**, and it is the one worth asking. Three of the last four
waves have widened a guard and then had to narrow it; this is the first time a
pre-existing test did the narrowing for me.

## Rule 13 as usual

Each score is a non-negative sum or an all-of conjunction, so the finding rules
in from a subset and only the reassuring reading waits: `VES-13 >= 3`,
`CPIS > 6`, and a GLIM diagnosis actually made are all unchanged.

The eight selects across the three tiles now open on *"Not answered"* or *"Not
stated"*, so the guards are reachable from the page — which is the whole point of
[spec-v1118](spec-v1118.md)'s rule 22.
