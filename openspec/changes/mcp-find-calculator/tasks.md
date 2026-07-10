# Tasks — MCP find_calculator

## 1. Shared corpus assembler

- [ ] 1.1 Extract the pure per-tile ranking-row builder (`lib/search-doc.js`, Design D1) and
      switch the browser corpus enrichment to it (coordinated with `plain-language-search`).
- [ ] 1.2 MCP-side assembly: registry rows + META → ranking rows, no fetch, no DOM.

## 2. Handler

- [ ] 2.1 Implement `findCalculator({ query, limit = 5, group, specialty })` in `mcp/tools.js`
      over `resolvePromptRanked` + `data/synonyms.json` (Design D2); stable id tie-break;
      hard cap 20.
- [ ] 2.2 No-match returns `{ count: 0, candidates: [], hint }`; blank query returns
      `{ valid: false, message }` (Design D3); never throws.
- [ ] 2.3 Missing synonyms file degrades to ranker-only.

## 3. Registration & docs

- [ ] 3.1 Add the `find_calculator` `TOOL_DEFS` entry (description cross-references
      `list_calculators` for enumeration) and the `dispatch` case.
- [ ] 3.2 Leave `list_calculators`/`describe_calculator`/`compute_calculator` byte-untouched
      (Design D4).
- [ ] 3.3 Update `mcp/README.md` (tool table, usage example) and `docs/mcp-coverage.md`.
- [ ] 3.4 Author the `docs/spec-v*.md` successor to spec-v183 §2.2 recording the four-tool
      surface (Design D5).

## 4. Tests

- [ ] 4.1 `test/mcp/`: worked queries — "stroke risk afib" → `chads` first with a `why`;
      "creatinine clearance" ranks the renal tiles; `limit` respected; group/specialty
      prefilters compose.
- [ ] 4.2 Parity test: for the fixture queries, `find_calculator`'s top id equals the browser
      resolver's top id over the same corpus fields (Design D1).
- [ ] 4.3 Regression: the three existing tools' outputs are unchanged on the current fixture
      set; `node scripts/check-mcp-catalog.mjs` and `npm run test:mcp` green.

## 5. Ship

- [ ] 5.1 `npm run lint`, `npm test`, `npm run build` green; dist byte-identical (MCP-only
      change; e2e/mobile sweeps unaffected).
- [ ] 5.2 CHANGELOG entry; catalog count and coverage count unchanged (no new adapters).
