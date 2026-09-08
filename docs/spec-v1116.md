# spec-v1116 — a default parameter that chose the equation

[spec-v1115](spec-v1115.md) sorted the finder's remainder by *"does omitting this
field turn an unreassuring answer into a reassuring one?"* This wave asks the
other question the finder's output supports:

> Does omitting this field move a **number the answer quotes**, while the verdict
> stays the same and nothing says so?

Forty-four fields across twenty-one tiles. Most are monotone scores whose band
happens not to change — the shape [spec-v1114](spec-v1114.md) worked. **One row
was something else entirely**, and it is what this wave is about:

```
ckd-epi-cystatin | cc-sex
  was  eGFRcys 40.6 mL/min/1.73m²; eGFRcr-cys 47.4 (combined)
  now  eGFRcys 43.6 mL/min/1.73m²; eGFRcr-cys 56.5 (combined)
```

## `sex = 'male'`, four times

A **default parameter** fires whenever the argument is absent, erasing the
difference between *nobody said* and *male* — [spec-v1102](spec-v1102.md)'s
`kings-college` finding, here on a demographic rather than a clinical grade. And
unlike every other tile in this programme, these do not choose a **band**. They
choose an **equation**:

| Tile | An unstated sex | Which means |
|---|---|---|
| `ckd-epi-cystatin` | the male CKD-EPI equation | combined eGFR **50.5** where a woman's is **42.4** — either side of the 45 dividing CKD stage 3a from 3b, and of several drug-dosing thresholds |
| `gap-ipf` | the +1 Gender point | a woman at 65 with an FVC of 60% goes from **stage I, 16.3%** three-year mortality to **stage II, 42.1%** — an alarm from nothing (rule 6) |
| `lvh-criteria` | the male Cornell cut-off | **28 mm** instead of 20 — a Cornell sum of 24 mm is LVH in a woman and the tile said *"No LVH voltage criterion met"* |
| `predicted-spirometry` | the male GLI-2012 set | a different predicted FEV1 and FVC, and percent-predicted is what stages COPD |

Three of the four **already asked for the sex in their own guard message** and
did not require it — the same half-guard [spec-v1115](spec-v1115.md) found on
`ipss-r-mds`, three more times.

`lvh-criteria` is the one where the default had been noticed. Its own comment read:

> Cornell branches on sex without a silent default **beyond the labeled male
> default**

which is the defect, described accurately, and reasoned past.

## Three refuse; one answers with the half it has

`lvh-criteria` does not refuse, because **Sokolow-Lyon has no sex term.** It is
reported exactly as before, and only the Cornell half waits — and even there the
*sum* is arithmetic and still printed, because only the comparison needs the sex:

> No LVH voltage criterion met by the entered amplitudes. The Cornell sum is
> 24 mm, but its threshold is sex-specific (> 28 mm in men, > 20 mm in women),
> so the sex is needed before it can be read.

That is [spec-v1045](spec-v1045.md)'s "answer with the halves you have", and it
is the right shape wherever one input governs part of a tile rather than all of it.

## The over-reach, caught by an existing test

The first draft also required the **ethnicity** in `predicted-spirometry`, on the
grounds that `ethnicity = 'caucasian'` is the same kind of default. It is not.
GLI-2012 publishes an *other/mixed* set for exactly this case, the tile falls back
to it deliberately, and it **says so** — `ethnicityFallback: true`, and a note the
renderer prints:

> Ethnicity group not in the GLI-2012 sets; the other/mixed coefficient set was used.

A test named *"unknown ethnicity group falls back to other/mixed, surfaced"*
failed, which is a test doing its job. The requirement was reverted and the
reasoning written into the code so the next pass does not make the same move.

**A default is not a defect. A SILENT default is.** Every fix in this programme
is really about the second word.
