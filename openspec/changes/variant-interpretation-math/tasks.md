# Tasks — Variant interpretation arithmetic and private VCF reading

> Docs-only proposal, hardened November 7, 2026. No tool is build-gated. Confirm the four ids are still absent
> (`acmg-variant-classify`, `max-credible-allele-frequency`, `vcf-variant-lookup`, `vcf-qc-summary`; they were on
> November 7, 2026), then re-read the sources in `design.md` and diff.

## 1. Re-read at build
- [x] 1.1 (read for the design the same day; spec-v1697) Richards Table 5 and the strength-change sentence; ClinGen SVI pages for any newer default-strength change.
- [x] 1.2 (calculator `server.R` re-read at build, spec-v1697; matches) Whiffin equation images 1-4 and the authors' calculator source (compare with commit 3ef11c37).
- [ ] 1.3 SAMv1 §4.1 (BGZF) and VCFv4.5 §1.

## 2. Shared reading code (lands first; it fixes a live defect)
- [x] 2.1 (built November 7, 2026, ahead of the tools, because it fixes a live defect) `lib/bgzf.js`: split at the `BC` subfield, decode each block with `DecompressionStream`, report a missing
      EOF marker, refuse unsplittable multi-member gzip. Pure; runs in the worker and in Node.
- [x] 2.2 (built; `gunzipBlob` now delegates to `gunzipDetail`, which reads BGZF block by block and any other gzip
      as before) `lib/intake.js` uses it in place of `gunzipBlob` for `.gz` members; `gunzipBlob` stays for single-member
      callers or is retired if none remain.
- [ ] 2.3 `lib/file-kinds.js`: a `vcf` kind on a first line `##fileformat=VCFv`, routed to tools 3 and 4.
- [ ] 2.4 (Node tests in `test/unit/bgzf.test.js` built, including the intake regression with a `.vcf.gz`; checked by
      hand in Chrome 152 against the real modules; not yet in the Playwright suite) Tests: multi-block BGZF with and without the EOF marker, single-member gzip, a two-member gzip without
      `BC`, and a regression test that the intake inventory now recognizes a `.vcf.gz`; run the same tests under
      Node and in the Playwright browser suite.

## 3. Lib
- [x] 3.1 (built as `lib/acmg-variant-classify-v1697.js`) `lib/acmg-vNNNN.js`: the 2015 rule engine at applied strengths naming the rule that fired, points and
      bands, posterior, the SVI notation.
- [x] 3.2 (built as `lib/max-credible-allele-frequency-v1697.js`) `lib/variant-freq-vNNNN.js`: both maxAF forms and the Poisson quantile (sum terms until the CDF reaches
      0.95; λ up to the largest realistic AN × AF without overflow, tested at λ 300).
- [ ] 3.3 `lib/vcf-read-vNNNN.js`: streaming line reader, header checks, FORMAT-keyed sample parsing, zygosity,
      allele balance, Ti/Tv, sorted-file early stop, progress and cancel.
- [ ] 3.4 (tools 1 and 2 done: `test/unit/variant-interpretation-v1697.test.js`) Unit tests: every vector in `design.md` **Tests**; every Table 5 rule on a minimal code set; point bands
      at −7, −6, −1, 0, 5, 6, 9, 10; the VCFv4.5 §1.1 example as a fixture.

## 4. Views, META, agents
- [ ] 4.1 Group E renderers beside the genetic counseling tools; tools 3 and 4 use the file-reader archetype
      (`docs/design.md` §3 B) with a progress line and a cancel button.
- [ ] 4.2 (tools 1 and 2 done in spec-v1697) META: citations with PMC ids and the two GitHub sources with their commits; examples reproduce the spec
      scenarios.
- [ ] 4.3 (tools 1 and 2 adapters and synonyms done in spec-v1697) MCP: adapters for tools 1 and 2; tools 3 and 4 added to `ANALYZABLE` in `mcp/file-tools.js`. Synonyms:
      "ACMG", "AMP", "variant classification", "pathogenic", "likely pathogenic", "VUS", "benign", "Bayesian
      points", "allele frequency", "too common", "gnomAD filter", "FAF", "VCF", "genotype", "zygosity", "allele
      balance", "Ti/Tv".
- [ ] 4.4 Measure tools 3 and 4 on a real public whole-genome VCF; record throughput in the build record.

## 5. Ship
- [ ] 5.1 Count surfaces; `node scripts/build-search-corpus.mjs`; `node scripts/build-unbuilt-index.mjs`;
      `npm run release:check`; CHANGELOG; `docs/spec-vNNNN.md` build record.
