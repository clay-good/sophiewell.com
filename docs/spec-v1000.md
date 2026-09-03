# spec-v1000 — A calculator credited an author with no such paper

## The finding

`nmr` — the neutrophil-to-monocyte ratio — carried this citation:

> Absolute neutrophil count / absolute monocyte count. Prognostic value reviewed across oncology
> and cardiovascular cohorts (**e.g. Chen L, et al.** and subsequent validations of the
> neutrophil-to-monocyte ratio).

**PubMed carries no paper by that author on that ratio.** `Chen L[au] AND "neutrophil to monocyte
ratio"` returns zero. The ratio itself has 84 indexed studies, none of them the named one. So the
citation credited work a reader could not find, on the surface this project treats as its highest
obligation: *"If a calculator disagrees with the source it cites, that is the highest-priority
report the project takes."*

It came in through the shape of the sentence. **"e.g." introduces an attribution the citation does
not commit to** — a gesture at a literature rather than a source — and nothing was going to
notice, because the tile's link is one of the twelve PubMed *searches* (spec-v943) and that search
returns plenty of results for the ratio in general.

## Two things were wrong, and both are the same mistake

The tile also declared an `interpretation` block:

```
sourceQuoted: true,
sourceCitation: 'Neutrophil-to-monocyte ratio.',
bands: [{ range: 'value', text: 'NMR = ANC / AMC. Higher values are less favorable. No universal cutoff — context-dependent.' }],
```

`sourceQuoted: true` is a contract, enforced on all 1,530 interpretation blocks by
`test/unit/meta-interpretation.test.js`: the band text is **the source's own words**. Here there
was no source, `sourceCitation` was not a citation, and the band asserted both a prognostic
direction and a cutoff policy that nothing published backed. This is spec-v978's rule exactly —
what the source did not print belongs in the tool's note.

So: the citation now says plainly that the ratio has no single derivation paper and that the
cohorts set their own cutoffs; the interpretation block is gone; and the note the tile already
rendered carries the direction and the no-universal-cutoff caveat, which is where
project-authored prose belongs. Nothing a reader can see was lost — the note gained the caveat the
band used to hold.

## Rule 8

`check-citations.mjs` gains a rule against the shape, not the instance: a citation may not
introduce an author with **"e.g.", "such as" or "including"**. Name the paper, or say plainly that
there is no single source.

Negative-tested in `test/unit/check-citations.test.js` on both sides — all three hedges fail, and
three citations that must NOT fire are pinned: a properly named paper, an "e.g." introducing a
formula rather than an author, and an "e.g." introducing a threshold.

A sweep of the whole catalog for the same shape found two other candidates, both fine on
inspection: `spherical-equivalent` cites Corboy's *The Retinoscopy Book* plus a StatPearls id that
resolves, and `feua` credits Decaux G, who has eighteen indexed papers on urate in hyponatremia.
`nmr` was the only one that named nobody findable.

## Proof

`check-citations` clean; 13,066 unit tests including the six new ones; the built
`/tools/nmr/` page no longer contains the string "Chen L"; both 320px sweeps pass over the longer
note.
