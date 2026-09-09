# spec-v1159 — the sibling score had the same defect, and the fix had left the detail behind

Found by running `scoring-select-probe.spec.js`, which had not been run since the
last session fixed `elapss`. It reports selects that cannot say *"not answered"*
and also change the answer when dropped: **9 across 8 tiles**, and two of them are
`phases` — the score sitting directly beside `elapss` in the same library.

## `phases` is `elapss` again

[spec-v1141](spec-v1141.md) fixed ELAPSS: the location and the population both fell
back to their zero-point level, and the tile's own refusal message already listed
them. PHASES has the identical shape, in the same file:

```js
const popKey  = PHASES_POP[input.population] != null ? input.population : 'na';
const siteKey = PHASES_SITE[input.site]      != null ? input.site       : 'ica';
```

Both fall back to **zero points** — a North American cohort, an ICA aneurysm. And
the refusal message above them:

> Enter the patient age (years) and the aneurysm size (mm), **then choose the
> population and site** and mark the hypertension and earlier-SAH items, to compute
> the PHASES score.

Rule 23, for the fifth time in this programme, and the second on this pair of
tiles.

Population is worth 0 to 5 and site 0 to 4 — **nine points of twenty-two**, on a
scale whose 5-year rupture risk runs 0.4% to 17.8%:

```
age 72, 12 mm, hypertension, earlier SAH, nothing else stated
  PHASES 9/22: 5-year cumulative rupture risk ~4.3%.

the same patient, if Finnish with an ACA/Pcom/posterior aneurysm
  PHASES 18/22: ~17.8%.
```

Fixed the way spec-v1141 fixed its sibling — the percentage **is** the verdict here,
so the range is disclosed rather than withheld, and where both ends land in one band
the tile answers plainly (rule 25). Both selects also get a *"Not stated"* option,
which is what makes the disclosure reachable in the browser at all.

## And the fix next door had stopped at the headline

`elapss`'s band has said *"ELAPSS 14 to 26 of 40"* since spec-v1141. The rows
underneath it still said:

```
ELAPSS: 14/40
Growth 3/5-yr: ~11.7% / ~19.3%
```

The **floor stated as the total**, contradicting the line directly above it. That is
rule 14 — *fix the headline, not only the detail* — running the other way, and it
survived a wave written specifically about this tile. Both tiles' rows carry the
range now.

One nuance the first attempt got wrong: the **score** spans a range whenever a
weighted item is unstated, but the **risk** only spans when the ends fall in
different bands. Showing *"~42.7% to ~42.7%"* for a total already at the ceiling is
a range that is not one, so the risk row collapses when the endpoints agree.

## The other seven rows

`salicylate-toxicity` (a unit), `predicted-spirometry` (an ethnicity default in the
GLI-2012 equations), `boston-caa`, `hiv-pep-occupational`, `vod-sos`, `impede-vte`
and `startback`. The last five were read in
[spec-v1141](spec-v1141.md)'s table and each says what was not marked;
`predicted-spirometry` is the one worth reading next.
