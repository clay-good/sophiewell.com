# Tasks — Unit and facility operations arithmetic

> Docs-only proposal. Confirm all twelve ids absent (they were on October 19, 2026); re-read
> the Five-Star guide's current edition before transcribing Table A2 and Table 3 (spec-v97).

## 1. Read the gated sources
- [ ] 1.1 Five-Star Technical Users' Guide, current edition: the full staffing exclusion list,
      Table 3, Table A2; note the edition date (tools 2 to 4).
- [ ] 1.2 CMS cost report Worksheet S-3 Part II instructions: the FTE hours basis (tool 6).
- [ ] 1.3 CMS IPPS Table 5 for the current fiscal year: fetch, hash, manifest (tool 10), or
      ship with pasted weights only.
- [ ] 1.4 Hospital OQR Specifications Manual, current version: OP-18 and OP-22 (tool 11).

## 2. Lib
- [ ] 2.1 `lib/unit-ops-vNNNN.js`: `hppd`, `pbjHoursPerResidentDay`, `pbjCaseMixAdjusted`,
      `staffingStar`, `turnoverRate`, `fteFromHours`, `bedOccupancy`, `overtimeAgencyShare`,
      `flexibleBudgetVariance`, `caseMixIndex`, `edThroughput`, `staffingGrid`. Pure; the
      star cut points live in a data module with the edition string.
- [ ] 2.2 Unit tests: every Table A2 boundary (each Min and Max row) maps to its points; the
      rescaling example (one turnover measure missing); each Table 3 star boundary (154, 155,
      204, 205, 254, 255, 319, 320); the one-star exceptions; the case-mix formula with the
      guide's own variable names; occupancy with a mid-period bed change; ALOS excluding
      newborns; turnover above 100% flagged; refusals on zero denominators.

## 3. Views, META, agents
- [ ] 3.1 Group H renderers; tool 4's inputs carry the units CMS prints (three decimals, %);
      tool 12 prints a grid.
- [ ] 3.2 META: worked examples built from the guide's own cut points (a facility just over a
      boundary); citations name the guide edition and the data dictionary.
- [ ] 3.3 The Five-Star guide URL as a watched source: content hash in the refresh manifest;
      tool 4 fails closed on change.
- [ ] 3.4 MCP adapters; synonyms: "HPPD", "hours per patient day", "nursing hours", "hours per
      resident day", "PBJ", "staffing star", "five star staffing", "turnover rate", "vacancy
      rate", "FTE", "occupancy rate", "average length of stay", "ALOS", "average daily census",
      "case mix index", "CMI", "left without being seen", "budget variance", "staffing grid".

## 4. Ship
- [ ] 4.1 Count surfaces; `node scripts/build-search-corpus.mjs`; `npm run release:check`;
      CHANGELOG; `docs/spec-vNNNN.md` build record with the guide edition transcribed.
