# Tasks — Public health epidemiology and biostatistics measures

> **Built October 19, 2026** ([docs/spec-v1659.md](../../../docs/spec-v1659.md)); tool 9 followed on
> November 7, 2026 ([docs/spec-v1690.md](../../../docs/spec-v1690.md)); tools 10 and 11, proportions only, on
> November 21, 2026 ([docs/spec-v1769.md](../../../docs/spec-v1769.md)). Unticked items were not done;
> the build record says why.
>
> Originally a docs-only proposal. Confirm id absence for all eleven ids before building (all absent on
> October 19, 2026), and re-read every worked example on the CDC pages (spec-v97).

## 1. Read the gated sources (each a checkbox; no lib for a gated tool until it is ticked)
- [x] 1.1 (§4 is natality; age adjustment is in §3, described as a weighted average, with Table 3.6) CDC *Principles of Epidemiology* Lesson 3 §4: direct standardization procedure and
      example (tool 8).
- [x] 1.2 (read October 20, 2026 in two open restatements, PMC10445975 Eq. 3 and PMC10904572 Eq. 2; shipped in spec-v1663 as an
      optional field) Levin 1953 or an open secondary source stating Levin's formula (tool 4, population
      fraction).
- [x] 1.3 (NOT read, and tool 6 SHIPPED anyway in spec-v1772 on November 23, 2026, from two open sources that state the
      same mathematics -- the way task 1.2 sourced Levin's formula. Randolph and Barreiro, Immunity 2020;52(5):737-743
      (PMC7236739): "the herd immunity threshold is defined by 1 - 1/R0 (e.g., if R0 = 4, the corresponding herd immunity
      threshold is 0.75)". Martcheva, An Introduction to Mathematical Epidemiology (Springer 2015), chapter 9, open in
      PMC: the same threshold as the critical vaccination proportion, the imperfect-vaccine coverage (1/efficacy)(1 - 1/R0),
      the condition that efficacy must exceed the threshold, and Table 9.3 for eight diseases, which is the test. The two
      agree. Fine 1993 and Fine, Eames and Heymann 2011 are still behind their publisher, re-checked November 23, 2026:
      no PMC copy for either, HTTP 403 from OUP) Fine 1993 or Fine, Eames and Heymann 2011: threshold and imperfect-vaccine coverage
      (tool 6).
- [x] 1.4 (read October 20, 2026 in NCI SEER*Stat help, after Sahai and Khurshid; shipped in spec-v1663. `nhsn-sir` keeps
      NHSN's own mid-P interval on its report) Exact Poisson limits for observed ÷ expected (Breslow and Day 1987 or Ulm 1990)
      (tool 7 interval; shared with `nhsn-sir`).
- [x] 1.5 (read November 7, 2026 and tool 9 SHIPPED in spec-v1690: the current edition is the Global Health
      Estimates Technical Paper GHE/2026.3, September 2026, freely downloadable from cdn.who.int. Section 2 for
      DALY = YLL + YLD and both formulas, section 2.1 for the simplified prevalence-based YLD and "No
      discounting for time or unequal age weights", section 2.2 and Table 2.1 for the standard loss function.
      Table 2.1's 75-79 cell is mistyped "17,19" in the source and is recorded as 17.19) WHO GHE methods paper, current edition: YLL, YLD, no age weighting or discounting
      (tool 9).
- [x] 1.6 (read November 21, 2026 in WHO IRIS, handle 10665/40062: Tables 1, 2, 4 and 5 and Examples 1 to 12; tools 10
      and 11 SHIPPED in spec-v1769 for proportions only. The manual covers proportions only ("Continuous response
      variables are not considered in this manual"), and gives no finite-population correction, non-response
      allowance or unequal allocation, so the means branches and those adjustments stay unbuilt) Lwanga and Lemeshow 1991: the formulas and one worked example each (tools 10, 11).
- [x] 1.7 (the 2000 standard read from SEER's table, script-transcribed, page hash recorded; NCHS returned 403) NCHS 2000 US standard population: fetch to disk, hash, manifest row (tool 8).

## 2. Lib
- [x] 2.1 (one lib per tool; `observedOverExpected` not shared with `nhsn-sir`, which stays as it is; tools 10 and 11
      built November 21, 2026 as `lib/sample-size-v1769.js`, proportion branches only, with
      `views/group-v1769.js`, `mcp/adapters/sample-size-v1769.js` and `test/unit/sample-size-v1769.test.js`
      from the manual's Examples 1 to 4 and 9 to 12) `lib/epi-measures-vNNNN.js`: pure functions for tools 1 to 9; `lib/sample-size-vNNNN.js`
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
