# Tasks — Infection prevention and healthcare epidemiology arithmetic

> Docs-only proposal. Before building, re-read every window and formula in `design.md` on its
> source page (spec-v97 discipline) and confirm id absence:
> `grep -c "id: 'nhsn-sir'" app.js` and the same for each id below must be 0.
> All eight were absent on October 19, 2026.

## 1. Read the gated sources
- [ ] 1.1 NHSN PSC Manual chapter 11 (AU Option): "antimicrobial day" and "days present"
      definitions and the validity rule; cite chapter and date in tool 4.
- [ ] 1.2 WHO Hand Hygiene Technical Reference Manual (2009): opportunity, action, compliance
      formula; cite the section in tool 5.
- [ ] 1.3 NHSN PSC Manual chapters 6 and 10: confirm the DUR and rate formulas for urinary
      catheter and ventilator days (tools 2 and 3).
- [ ] 1.4 The exact-Poisson interval for observed ÷ predicted: read it in a source before
      shipping an interval in tool 1; otherwise ship without it.
- [ ] 1.5 CDC personnel summary: the day-0 convention and the pertussis high-risk wording.

## 2. Lib computes (pure, no DOM, no clock except tools 7 and 8, which take dates as inputs)
- [ ] 2.1 `lib/ipc-metrics-vNNNN.js`: `sir`, `deviceUtilizationRatio`, `deviceInfectionRate`,
      `antimicrobialDaysRate`, `handHygieneCompliance`, `attackRateTable`, `hcpExposureWindow`,
      `hcpReturnDate`. Each returns `{ value, reading, note, refusal }` and refuses with the
      field name in the label's words.
- [ ] 2.2 Unit tests: the guide's SIR example (5 / 2.365 = 2.114); predicted 0.9 refused;
      CAD sign both ways; DUR with device days > patient days refused; the three CDC attack-rate
      examples (30.3%, 1.8%, 25.0%); each pathogen window at both ends with first ≠ last
      exposure; the VariZIG 28-day branch; pertussis "whichever comes first"; a blank anchor
      date names the field.

## 3. Views and META
- [ ] 3.1 Renderers in `views/group-vNNNN.js`; tool 6 reuses the file-intake drop target and
      the column-mapping step from the adherence file tools (spec-v1610 machinery); its fields
      are `data-private`.
- [ ] 3.2 META entries with worked examples drawn from the sources' own examples; citations name
      the document and its date; `ISSUER_PATTERN` rows for CDC pages.
- [ ] 3.3 Tools 7 and 8: the CDC page's last-updated field as a watched dated constant; the
      weekly refresh fails closed on change.

## 4. Catalog surfaces, search, agents
- [ ] 4.1 `UTILITIES` rows; count surfaces bumped; `node scripts/check-catalog-truth.mjs`.
- [ ] 4.2 `data/synonyms.json`: "SIR", "standardized infection ratio", "device days",
      "utilization ratio", "CLABSI rate", "days of therapy", "hand hygiene rate", "attack rate",
      "exposed to measles at work", "when can I come back to work after flu".
- [ ] 4.3 MCP adapters for all eight; `docs/mcp-coverage.md` rows; the file tool follows the
      spec-v1615 file-tool agent-parity shape.

## 5. Ship
- [ ] 5.1 `node scripts/build-search-corpus.mjs` before `npm run release:check` (META text
      change stales the corpus); lint, test, build green; CHANGELOG entry; a `docs/spec-vNNNN.md`
      recording what was read at build and what changed from this design.
