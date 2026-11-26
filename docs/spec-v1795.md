# spec-v1795 — The 198 nobody could see

> Status: **SHIPPED (2026-11-25)**: 207 more fields state the range their library enforces, and the finder
> that proposes them lost its last two blind spots. `probe-undeclared-cap` is at **1 row**, and that row is
> explained below rather than declared. No tool's arithmetic changed; the catalog stays 2,390.

[spec-v1794](spec-v1794.md) found that both declaration finders were blind to one of `inputFault`'s two
sentence shapes — the exclusive floor, *"must be greater than 0 and at most 3650"* — and that fixing it took
`probe-undeclared-cap` from 0 DECLARABLE rows to **198**. This is those 198.

| | spec-v1794 | now |
|---|---|---|
| Number fields declaring a bound | 2,272 of 5,189 | **2,479** |
| Declared edges | 4,105 | **4,509** |
| Configurations `probe-declared-cap-configs` drives | 19,563 | **21,069** |
| `probe-undeclared-cap` DECLARABLE | 198 | **1** |
| `probe-adapter-only-bounds` | 0 findings, 1 judged | unchanged |

195 of the 198 carried the identical sentence, so 179 were written by codemod and 28 by hand. The work was
in the three ways the codemod was wrong first, and the two ways the finder still was.

## Two readings of one cap, which must agree

The obvious way to get the number for a declaration is to read it out of the library's own refusal, which
states it: *"The ALT must be greater than 0 and at most 20000 IU/L."* That was wrong three times:

* **A sentence ends in a full stop.** `max: 1.5.` is a syntax error, and two files had one before eslint ran.
* **A sentence may ROUND its number.** `lipid-accumulation-product` says *"at most 395.1"* and
  `hscore-hlh` *"at most 395.2"*, where both are `BOUNDS.triglycerides` converted out of mg/dL. Declaring
  395.1 on a field whose library accepts 395.168 refuses a value the page answers.
* **A sentence may be TRUNCATED.** The finder cut its report column at 96 characters, and
  `baveno-vii`'s liver-stiffness refusal came out as *"at most 10"* where the library says **100**. The
  column is 200 now, but the real protection is the rule below.

So the sentence is trusted only where it **agrees with the edge the finder bisected** — two independent
readings of one cap, to within a millionth. That rule paid for itself immediately on three rows whose
sentence names a range the field never reaches: `rvsp-pasp`'s TR velocity says 400 and accepts 9.9,
`vo2max-exercise`'s treadmill time says 100 and accepts 35.3, because in both the sentence is about the
tool's **output**.

## Eleven fields that named a floor and hid a ceiling

The codemod skipped any field that already declared something. Eleven of those were a pattern worth its own
name: the field declares `bound: '<envelope>'`, which publishes the envelope's **floor**, while the library
keeps a **tighter ceiling of its own** that nothing states.

| Fields | Published floor | The library's own ceiling |
|---|---|---|
| `crusade`, `scai-shock`, `timi-risk-index`, `ocular-perfusion-pressure` systolic | 20 (`BOUNDS.sbp`) | **320** |
| `agile-3plus` ALT and AST, `king-score`, `mayo-psc-risk` AST | 1 | **20,000** |
| `toe-brachial-index` brachial | 20 | **400** |
| `effective-osmolality` sodium | 85 | **200** |
| `epvs` hematocrit | 3 | **100** |
| `grobman-vbac` weight | 0.2 | **400** |
| `arc-risk-scores` creatinine | 0.1 | **20** |

A half-declared field is the quieter half of [spec-v1794](spec-v1794.md)'s borrowed envelopes: there an
agent was refused a value the page takes, here it is told a value is fine and then refused anyway. Each now
carries the literal ceiling beside the named floor — `mcp/fields.js` fills from the envelope only what no
literal states, so the two compose.

Two fields are the mirror, and are the one case where the codemod's own declaration had to be **taken back
out**: it gave `findrisc`'s BMI and `ocular-perfusion-pressure`'s diastolic pressure a floor of `0`
exclusive, read from a sentence that mentions 0 — when the floor those libraries hold is **5**, from
`BOUNDS.bmi` and `BOUNDS.dbp`, through `boundsAdvisory`. A literal of 0 is true but loose, and it pre-empts
the envelope: the declarations name the envelope and keep only their own ceiling.

Three more could not be placed by `dom:` at all. `hf-gdmt-target-percent` builds its dose fields from a
drug table and the library caps each at **ten times that drug's own target**, so the ceiling is per drug and
is now read from the same table — one edit, the whole family, no literal.

## The finder's last two blind spots

**A cap can move a little.** The acceptance sweep [spec-v1793](spec-v1793.md) built asks whether anything
past the edge is ever accepted, at 5%, 50% and ten times out. Those steps jump clean over an edge that moves
only slightly: `rvsp-pasp` refuses a TR velocity above 9.8995 m/s because 4v² plus a right-atrial pressure
of 8 leaves the RVSP output range at 400 — and with the RAP select on 3 the same field reaches **9.96**. A
5% step lands at 10.39, refused either way, so the cap passed for the field's own and 9.8995 was offered for
a declaration that would have turned away 9.95. The sweep now starts from `e.refused`, the smallest value
the bisection **knows** is refused: no gap to jump, and no rounding in it.

**One row is left, and it should be.** `vo2max-exercise`'s treadmill time is capped at 35.3156 minutes,
because that is where the VO₂max it reports reaches the ceiling of its output range — under every method and
either sex, which is why the sweep is satisfied. It is a true statement and a useless declaration: the
number is derived, it belongs to the output rather than the input, and it would drift if the reported range
ever moved. It stays in the report, named, rather than frozen into a descriptor.
