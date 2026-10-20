# Tasks — Public health epidemiology and biostatistics measures

> **Built October 19, 2026** ([docs/spec-v1659.md](../../../docs/spec-v1659.md)). Unticked items were not done;
> the build record says why.
>
> Originally a docs-only proposal. Confirm id absence for all eleven ids before building (all absent on
> October 19, 2026), and re-read every worked example on the CDC pages (spec-v97).

## 1. Read the gated sources (each a checkbox; no lib for a gated tool until it is ticked)
- [x] 1.1 (§4 is natality; age adjustment is in §3, described as a weighted average, with Table 3.6) CDC *Principles of Epidemiology* Lesson 3 §4: direct standardization procedure and
      example (tool 8).
- [ ] 1.2 (not read; tool 4 ships the exposed-group proportion only) Levin 1953 or an open secondary source stating Levin's formula (tool 4, population
      fraction).
- [ ] 1.3 (not read; tool 6 stays gated) Fine 1993 or Fine, Eames and Heymann 2011: threshold and imperfect-vaccine coverage
      (tool 6).
- [ ] 1.4 (not read; the SMR ships without an interval) Exact Poisson limits for observed ÷ expected (Breslow and Day 1987 or Ulm 1990)
      (tool 7 interval; shared with `nhsn-sir`).
- [ ] 1.5 (not read; tool 9 stays gated) WHO GHE methods paper, current edition: YLL, YLD, no age weighting or discounting
      (tool 9).
- [ ] 1.6 (not read; tools 10 and 11 stay gated) Lwanga and Lemeshow 1991: the formulas and one worked example each (tools 10, 11).
- [x] 1.7 (the 2000 standard read from SEER's table, script-transcribed, page hash recorded; NCHS returned 403) NCHS 2000 US standard population: fetch to disk, hash, manifest row (tool 8).

## 2. Lib
- [x] 2.1 (one lib per tool; `observedOverExpected` not shared with `nhsn-sir`, which stays as it is) `lib/epi-measures-vNNNN.js`: pure functions for tools 1 to 9; `lib/sample-size-vNNNN.js`
      for 10 and 11. `observedOverExpected` is one function used by `smr` and `nhsn-sir`.
- [x] 2.2 Unit tests from the CDC examples listed in `design.md` (person-time rate 2.5 per
      1,000; crude 832.1 per 100,000; case fatality 0.5%; death-to-case 7.82; YPLL 117,033 and
      0.5 per 1,000; attributable proportion 87.7%; VE 72%), plus refusals: cases above
      population, blank person-time, a straddling age group, no unvaccinated cases, R0 ≤ 1.

## 3. Views, META, agents
- [x] 3.1 (labels stay fixed; the result names the measure's numerator and denominator instead) Group E renderers; the measure picker in tool 2 changes the field labels to the
      measure's own numerator and denominator names.
- [x] 3.2 META examples from the CDC pages; citations name the lesson and section; the infant
      mortality misprint noted on the tool 2 page.
- [x] 3.3 MCP adapters; `values:` lists for the measure and multiplier pickers match the
      on-screen options (the registry-vs-select audit rule).
- [x] 3.4 (a shorter list: phrases that took older tools' words, such as "age" and "years", were dropped) Synonyms: "attack rate", "incidence rate", "prevalence", "case fatality rate",
      "infant mortality", "YPLL", "vaccine effectiveness", "herd immunity", "SMR", "age-adjusted
      rate", "DALY", "sample size".

## 4. Ship
- [x] 4.1 Count surfaces; `node scripts/build-search-corpus.mjs`; `npm run release:check`;
      CHANGELOG; `docs/spec-vNNNN.md` build record naming what each gate's reading changed.
