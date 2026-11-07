# Tasks — Variant interpretation arithmetic and private VCF reading

> Before building, confirm the four ids are absent from the catalog (they were on November 7, 2026) and
> read the two gated items: Richards 2015 on changing a criterion's strength, and Whiffin 2017's full and
> recessive equations.
>
> Ids: `id: 'acmg-variant-classify'`, `id: 'max-credible-allele-frequency'`, `id: 'vcf-variant-lookup'`,
> `id: 'vcf-qc-summary'`.

## 1. Read the gated sources
- [ ] 1.1 Richards 2015, full text: the sentence on adjusting a criterion's strength by professional
      judgment (tool 1 strength picker). Without it, codes stay at default strength.
- [ ] 1.2 Whiffin 2017: transcribe the dominant equation with the maximum genetic contribution term and the
      recessive equation from the published article or the authors' online calculator, and re-derive the
      HCM example (4.0 × 10⁻⁵; ceiling 9 at AN 121,412) and the PCD example (ceiling 322) (tool 2).

## 2. Lib
- [ ] 2.1 `lib/acmg-vNNNN.js`: the 2015 rule engine naming the rule that fired, the 2020 points and bands,
      the 2018 posterior.
- [ ] 2.2 `lib/variant-freq-vNNNN.js`: maxAF and the Poisson quantile.
- [ ] 2.3 `lib/vcf-read-vNNNN.js`: streaming line reader with gzip, header checks, FORMAT-keyed sample
      parsing, zygosity, allele balance, Ti/Tv.
- [ ] 2.4 Unit tests: every scenario in the spec delta; every Table 5 rule fires on a minimal code set;
      point bands at −7, −6, −1, 0, 5, 6, 9, 10; the VCFv4.5 §1.1 example as a fixture; a multi-member
      BGZF fixture; an unsorted fixture.

## 3. Views, META, agents
- [ ] 3.1 Group E renderers beside the genetic counseling tools; tools 3 and 4 use the file-intake drop
      target.
- [ ] 3.2 META: citations with PMC ids; examples reproduce the spec scenarios.
- [ ] 3.3 MCP adapters; synonyms: "ACMG", "AMP", "variant classification", "pathogenic", "likely
      pathogenic", "VUS", "benign", "Bayesian points", "allele frequency", "too common", "gnomAD filter",
      "VCF", "genotype", "zygosity", "allele balance", "Ti/Tv".

## 4. Ship
- [ ] 4.1 Count surfaces; `node scripts/build-search-corpus.mjs`; `node scripts/build-unbuilt-index.mjs`;
      `npm run release:check`; CHANGELOG; `docs/spec-vNNNN.md` build record.
