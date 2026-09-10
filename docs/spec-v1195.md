# spec-v1195 — a fifth hand on the same sentence

[spec-v1193](spec-v1193.md)'s finder started at seventeen rows and
[spec-v1194](spec-v1194.md) fixed the three tiles that were answering from a
blank. Six rows remain, and every one of them is a tile that **does** disclose —
in words the shared vocabulary has never been taught.

This wave closes the two that need nothing but the words, and says why the other
four have to wait.

## The participle family

`test/lib/asking-language.js` knew "not entered" (63 uses across 46 library
files) and "not assessed". It did not know that the house also writes the
observation was not **recorded**, not **graded**, not **rated** or not
**measured**.

That is the same drift as `can only add` ([spec-v1094](spec-v1094.md)),
`is needed` ([spec-v1097](spec-v1097.md)) and `not stated`
([spec-v1164](spec-v1164.md)): one rule, several hands, one phrasing known. It is
written here as one participle family rather than four phrases, because that is
what it is.

Measured before adding, as that file's rule 1 requires: across every tile and
every number or graded select, dropping one field moves **exactly one** row from
flagged to exempt — `aims-tardive`, which reads

> AIMS movement total 4/28 (**global severity not rated**)

and is disclosing, not answering anyway. It changes nothing in either empty-form
sweep, which read `ASKING` only.

## `reference-change-value`

The one tile left on the finder that genuinely did not disclose. With **one half
of the pair** entered and the other blank it fell into the same reading as a form
with neither in it — the threshold on its own:

> Reference change value 13.64% — A difference has to exceed 13.64% to be
> distinguishable from analytical and biological variation, at this probability.

Correct arithmetic, and no sign anywhere that the comparison the reader had
started was quietly dropped. The half that *is* entered is the evidence they
wanted one.

| | before | after |
|---|---|---|
| both results | change vs the threshold | unchanged |
| current result blank | Reference change value 13.64% | **…, no comparison made** — "the current result was not entered, and both are needed" |
| previous result blank | Reference change value 13.64% | **…, no comparison made** — "the previous result was not entered…" |
| neither entered | Reference change value 13.64% | unchanged |
| previous result zero | Reference change value 13.64% | "the previous result is zero, and a percentage change from zero is not defined" |

Rows one and four are the discipline. With nothing entered there is no comparison
to have dropped, so the threshold is reported plainly; the disclosure appears
only where something was actually lost. A previous result of zero is a different
impossibility and says which one it is.

## The four that wait, and the measurement that says why

`diabetes-diagnosis`, `lyme-two-tier` (twice), `clabsi-lcbi` and `cauti-nhsn` all
disclose in plain English:

> No first-tier result **is entered**. The algorithm starts with an enzyme
> immunoassay…
>
> No LCBI is met **by what was entered**.
>
> The definition is not met: no qualifying urine culture **is recorded**.

Two more house phrasings, and both are frequent enough to be worth the list:
`no <thing> is/was entered|recorded` has 13 uses and `what was entered` has 19.

They were measured, and the measurement is the reason they are **not** added
here. Across every tile and field they move three rows from flagged to exempt,
and two of the three are `sea-guideline`, exempted by

> **No fever was entered**

while the field the sweep dropped was the **ESR** and then the **white cell
count**. The tile is disclosing about a different gap entirely. Adding the phrase
on its own would buy two false exemptions to fix four true ones — the exact
failure this programme has been unpicking for four waves.

The movement rule the finder already uses is what tells those apart: "No fever
was entered" is in the reading whether or not the ESR is dropped, so it is static
prose about this row and the finder ignores it. Teaching the **gates** that rule,
and adding these two phrasings in the same change, is the next wave. It is a
change to shared gate infrastructure rather than to any tile, and it belongs on
its own.

## Proof

`probe-static-exemption` reads **17 → 6** rows and **12 → 4** calculators across
the three waves. Lint, 13,474 unit tests, 448 MCP tests, and the four browser
sweeps that consume this vocabulary — `one-blank-field`,
`required-field-agreement`, `scoring-select-probe` and
`no-answer-from-nothing-sweep` — all pass.
