# Tasks — Transplant allocation scores and ischemia clocks

> **Partly built October 19, 2026** ([docs/spec-v1661.md](../../../docs/spec-v1661.md)): tools 3 and 4. Unticked items
> were not done; the build record says why.
>
> Originally a docs-only proposal. Tools 1 and 2 are build-gated on reading the OPTN guides; nothing in
> `design.md` states a coefficient. Confirm the four ids absent (they were on October 19, 2026).

## 1. Obtain and read the sources
- [ ] 1.1 Download the KDPI guide (October 2024 or newer) by hand; record the edition date;
      transcribe every coefficient, reference point, the scaling factor and the mapping table
      into a data file with its SHA-256.
- [ ] 1.2 The same for the EPTS guide (April 2025 or newer).
- [ ] 1.3 OPTN policy 8: the KDPI and EPTS bands used in allocation.
- [ ] 1.4 (not read: optn.transplant.hrsa.gov refused the request; tool 3 names intervals by the reader's events) OPTN data definitions for cold and warm ischemia time.

## 2. Lib
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
