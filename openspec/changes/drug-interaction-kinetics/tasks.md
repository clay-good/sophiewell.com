# Tasks — Drug-interaction kinetics and polypharmacy exposure math

> Docs-only proposal, hardened November 7, 2026. No tool is build-gated. Confirm the nine ids are still absent
> (`ddi-basic-screen`, `ddi-static-aucr`, `ddi-strength-classify`, `cyp-list-check`, `ddi-cr-ir-predict`,
> `enzyme-recovery-time`, `dose-history-level`, `two-compartment-params`, `emax-hill-effect`; they were on
> November 7, 2026), then re-read ICH M12 and the FDA page and diff against `design.md`.

## 0. Prerequisite
- [ ] 0.1 Plot component: add it to `docs/design.md` §4 (inline SVG, tokens only, `role="img"` with a text
      alternative, values repeated in a `.lookup-table` inside `<details>`), with its accessibility gate in
      §7. Tools 6-9 ship with value tables if this has not landed; no answer waits on it.

## 1. Re-read at build
- [x] 1.1 (re-read November 7, 2026 for spec-v1700: sections 2.1.2.1-2, 7.5.1, Tables 3 and 6 match design.md; SHA-256 ff0624ed... recorded) ICH M12 §2.1.2, §7.5.1, Table 3, Table 6; record the PDF hash in `scripts/data/page-hashes.json`.
- [x] 1.2 (re-read November 7, 2026 for spec-v1699: 108,266 bytes, current as of 05/29/2026, Table 2 definitions unchanged; Table 1 is read again when tool 4's builder lands) The FDA table page: Table 1 columns, row count, the legend tables, the "current as of" date.
- [x] 1.3 (spec-v1700: the abstracts' equations and validation sentence as design.md records them; full texts still not open) The Ohno 2007 and 2008 abstracts and Tod 2013 and 2014 equations (tool 5); if the full Ohno texts
      have become open, read their stated validity conditions and add them to the page.

## 2. Data
- [x] 2.1 (built, spec-v1701; 245 rows merge to 244 drugs; 21 footnotes and the not-comprehensive sentence kept) `scripts/data/builders/fda-ddi-examples.mjs` on the `cpic.mjs` pattern: select Table 1 by its first
      header, strip `&nbsp;` and `<sup>` markers into a separate field, split multi-enzyme cells, merge
      duplicate drug rows, index combination rows under each component; `sourceEdition` from "Content current
      as of", 14-day `expiresOn` renewed on every successful fetch, `recordBounds` from the first build with a
      10% drop failing the build.
- [x] 2.2 (`test/unit/data-builder-fda-ddi-examples.test.js` on `test/fixtures/data-sources/fda-ddi-examples/page-2026-05-29.html`, the page as read with its scripts removed, spec-v1701) Fixture tests for the builder from a saved copy of the page: the 245 rows, aprepitant merged,
      ciprofloxacin's in-cell marker, the ritonavir marker list, the paritaprevir combination, an empty cell,
      a page with Table 1 moved to second position, a page with 20% of rows removed.
- [x] 2.3 (`lib/ich-m12.js`, route B, under the weekly page watch; spec-v1700) Route B: M12 Table 6 as a dated constant with a staleness-ledger row.

## 3. Lib
- [x] 3.1 (built one lib per tool: `lib/ddi-basic-screen-v1700.js`, `lib/ddi-static-aucr-v1700.js`, `lib/ddi-cr-ir-predict-v1700.js`, `lib/enzyme-recovery-time-v1700.js`, with `lib/ddi-strength-classify-v1699.js`) `lib/ddi-vNNNN.js`: basic-method ratios, the M12 AUCR with the three runs and the concentration
      estimates, the Table 2 classifier, CR-IR and its back-calculations, enzyme recovery.
- [x] 3.2 (built as three libs, one per tool: `lib/dose-history-level-v1699.js`, `lib/two-compartment-params-v1699.js`, `lib/emax-hill-effect-v1699.js`) `lib/pk-multidose-vNNNN.js`: superposition (bolus, infusion, Bateman with the limit form),
      two-compartment conversion, sigmoid Emax and its inverse.
- [x] 3.3 (spec-v1699, v1700, v1701 test files) Unit tests: every vector in `design.md` **Tests** and every scenario in the spec delta, each cutoff
      on both sides of its boundary.

## 4. Views, META, agents
- [x] 4.1 (spec-v1699 to v1701; tool 4 takes the drug-list file kind) Renderers: tools 1-6 in group Q beside `cyp2d6-phenoconversion`; tools 7-9 in group F beside
      `pk-steady-state-predict`. Tool 4 accepts the `drug-list` file kind (add it to that kind's `tools`).
- [x] 4.2 (spec-v1699 to v1701) META: citations name the M12 section and table, the FDA page's "current as of" date, the Ohno
      abstracts and the Tod papers; examples reproduce the spec scenarios byte for byte.
- [ ] 4.3 Backfills: related links from `pk-suite`, `pk-steady-state-predict`, `cyp2d6-phenoconversion`,
      `dips-interaction`; the AUCR-to-dose prefill into `pk-suite` (linear drugs only, said on the page).
- [x] 4.4 (all nine, spec-v1699 to v1701) MCP adapters for all nine with the existing field kinds; lists as one string, one item per line.
      Synonyms: "drug interaction", "DDI", "CYP3A4 inhibitor", "strong inhibitor", "AUC ratio", "AUCR",
      "static model", "Ki", "kinact", "time-dependent inhibition", "induction", "contribution ratio",
      "inhibition ratio", "missed dose", "late dose", "two-compartment", "Emax", "Hill equation",
      "polypharmacy".

## 5. Ship
- [ ] 5.1 Count surfaces; `node scripts/build-search-corpus.mjs`; `node scripts/build-unbuilt-index.mjs`;
      `npm run release:check`; CHANGELOG; `docs/spec-vNNNN.md` build record.
