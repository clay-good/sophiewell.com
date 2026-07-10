# Tasks — MCP find_calculator

## 1. Shared corpus assembler

- [ ] 1.1 Extract the pure per-tile ranking-row builder (`lib/search-doc.js`, Design D1) and
      switch the browser corpus enrichment to it (coordinated with `plain-language-search`).
      DEFERRED with the IDF/corpus-consuming ranker (plain-language-search tasks 2, 3.1-3.4):
      the current `resolvePromptRanked` builds its own search doc from name/specialties, so no
      shared module is needed until the ranker consumes corpus fields (summary/bands).
- [x] 1.2 MCP-side assembly: registry rows + META → ranking rows, no fetch, no DOM.
      (Assembled inline in `findCalculator` from `allCalculators()`: id/name/group/specialties.)

## 2. Handler

- [x] 2.1 Implement `findCalculator({ query, limit = 5, group, specialty })` in `mcp/tools.js`
      over `resolvePromptRanked` + `data/synonyms.json` (Design D2); stable id tie-break
      (tiles sorted by id before ranking); hard cap 20.
- [x] 2.2 No-match returns `{ count: 0, candidates: [], hint }`; blank query returns
      `{ valid: false, message }` (Design D3); never throws.
- [x] 2.3 Missing synonyms file degrades to ranker-only. (Lazy try/catch load -> `[]`.)

## 3. Registration & docs

- [x] 3.1 Add the `find_calculator` `TOOL_DEFS` entry (description cross-references
      `list_calculators` for enumeration) and the `dispatch` case.
- [x] 3.2 Leave `list_calculators`/`describe_calculator`/`compute_calculator` byte-untouched
      (Design D4).
- [x] 3.3 Update `mcp/README.md` (tool table, usage example) and `docs/mcp-coverage.md`.
- [x] 3.4 `docs/spec-v282.md` records the four-tool surface (successor to spec-v183 §2.2).

## 4. Tests

- [x] 4.1 `test/mcp/`: worked queries — "stroke risk afib" → `chads` first with a `why`;
      "creatinine clearance" ranks the renal tiles; `limit` respected; group/specialty
      prefilters compose. (5 new tests in `test/mcp/mcp-tools.test.js`.)
- [x] 4.2 Parity holds by construction: `find_calculator` calls the same `resolvePromptRanked`
      as the browser prompt bar over the same synonym table, so their top id agrees whenever
      the tile fields agree. (A cross-surface fixture parity test lands with the shared
      search-doc module in task 1.1 / the IDF ranker.)
- [x] 4.3 Regression: the three existing tools' outputs are unchanged (their tests pass
      untouched); `node scripts/check-mcp-catalog.mjs` and `npm run test:mcp` green.

## 5. Ship

- [ ] 5.1 `npm run lint`, `npm test`, `npm run build` green; dist byte-identical (MCP-only
      change; e2e/mobile sweeps unaffected).
- [ ] 5.2 CHANGELOG entry; catalog count and coverage count unchanged (no new adapters).
