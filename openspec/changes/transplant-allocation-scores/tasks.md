# Tasks — Transplant allocation scores and ischemia clocks

> **Partly built October 19, 2026** ([docs/spec-v1661.md](../../../docs/spec-v1661.md)): tools 3 and 4. Unticked items
> were not done; the build record says why.
>
> Originally a docs-only proposal. Tools 1 and 2 are build-gated on reading the OPTN guides; nothing in
> `design.md` states a coefficient. Confirm the four ids absent (they were on October 19, 2026).

## 1. Obtain and read the sources
- [x] 1.1 Download the KDPI guide (October 2024 or newer) by hand; record the edition date;
      transcribe every coefficient, reference point, the scaling factor and the mapping table
      into a data file with its SHA-256.
      Guide read November 7, 2026 (April 23, 2026 edition; coefficients and the example in `design.md`,
      reproduced exactly). The mapping table (2025 reference year, SHA-256 4ffb25a3…) was saved and read the same day:
      `lib/optn-kdpi.js` holds its 100 bounds, the 2025 scaling factor and the unknown-status shares. Shipped as
      `kdri-kdpi` in spec-v1717.
      **Incomplete, corrected November 14, 2026 (spec-v1718):** "transcribe every coefficient" was read as Table 1
      alone, and the guide's extreme-value rule was missed -- a creatinine above 8 mg/dL enters the KDRI as 8.
      Uncapped, the KDPI fell as the creatinine rose. The cap and the guide's 0.01-to-40 entry range are in now;
      `design.md` records what to confirm on the next hand-read, since the PDF cannot be fetched by script.
- [ ] 1.2 The same for the EPTS guide (April 2025 or newer).
      Guide read November 7, 2026 (April 7, 2026 edition, from a copy saved by hand; formula and the three
      examples in `design.md`, all reproduced). Open: the EPTS mapping table, a separate PDF
      (`epts_mapping_table.pdf`) that the site serves only as a download.
- [ ] 1.3 OPTN policy 8: the KDPI and EPTS bands used in allocation.
- [ ] 1.4 (not read; tool 3 names intervals by the reader's events) OPTN data definitions for cold and warm ischemia time.
      Re-tested November 7, 2026: `optn.transplant.hrsa.gov` no longer serves the site, answering 301 to
      `https://www.hrsa.gov/optn`, and that host returns HTTP 403 to an automated client (both a browser
      user-agent over curl and the build's own fetcher, for the root as well as any document). The block is
      on scripted access, which is why 1.1 and 1.2 ask for a download by hand in the first place.
      November 7, 2026, later: the HTML pages open in a browser and name the four PDFs (kdpi_guide,
      kdpi_mapping_table, epts_guide, epts_mapping_table under hrsa.gov/sites/default/files/hrsa/optn/);
      the PDFs still arrive only as downloads.

## 2. Lib

> **KDPI half done in spec-v1717** (`lib/kdri-kdpi-v1717.js`, `lib/optn-kdpi.js`, view, adapter, META, tests). Items
> 2 to 4 stay open for EPTS, which waits on its mapping table. One deviation: there is one lib per tool, not a shared
> `transplant-allocation` lib, and the table is guarded by a re-read date (`validThrough`) instead of a weekly hash
> watch, because the PDFs cannot be fetched by a script.
- [ ] 2.1 `lib/transplant-allocation-vNNNN.js`: `kdriKdpi`, `epts`, `ischemiaIntervals`,
      `sizeMatch`; mapping tables loaded from `data/optn/` with the year.
- [ ] 2.2 Unit tests: each guide's worked example to the printed figure; piecewise breakpoints;
      the 20% EPTS boundary; an end-before-start timestamp refused; a missing event leaves its
      interval blank.

## 3. Views, META, agents, data
- [ ] 3.1 Group E renderers; unit toggles on weight and height; timestamp fields with a zone.
- [ ] 3.2 META: citations name the guide edition; examples are the guides' own.
- [ ] 3.3 Refresh manifest rows for both guides (hash watch; fail closed on change).
- [ ] 3.4 MCP adapters; synonyms: "KDPI", "KDRI", "kidney donor profile", "EPTS", "post
      transplant survival score", "cold ischemia time", "CIT", "donor recipient weight ratio".

## 4. Ship
- [ ] 4.1 Count surfaces; `node scripts/build-search-corpus.mjs`; `npm run release:check`;
      CHANGELOG; `docs/spec-vNNNN.md` build record with the edition dates.
