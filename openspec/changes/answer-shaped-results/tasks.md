# Tasks — answer-shaped results

## 1. Answer card

- [ ] 1.1 Add the confidence gate (threshold + margin over runner-up, Design D1) reading the
      ranked resolver API from `plain-language-search`; constants exported via `_testing`.
- [ ] 1.2 Render the card as option 0 in `bindHeroSearch`'s `render()`: name, one-liner
      (corpus `whatThisIs` → adapter summary → none, Design D2), "matched: …" breadcrumb.
- [ ] 1.3 Style the card in `styles.css`; two-line cap with ellipsis; 320px no-overflow.

## 2. Related-tools chips

- [ ] 2.1 Render up to 3 chips from `META.related` (authored order) inside the card row;
      pointer routing per chip (Design D3).
- [ ] 2.2 Expose chips to AT as in-option links; confirm the card remains a single listbox
      option for keyboard flow.

## 3. Inline compute

- [x] 3.1 Create pure `lib/query-compute.js`: template shape (trigger tokens, field patterns
      with unit requirements, compute import), plus the starter allow-list (Design D4). Starter
      allow-list = BMI, BSA, MAP, each reusing its own `lib/clinical.js` compute so the inline
      value matches the tile. `_testing` exposes the parsers + TEMPLATES.
- [x] 3.2 Implement number+unit parsing incl. feet-inches (`5'10`, `5 ft 10 in`, smart
      apostrophe), explicit-unit weights (lb/kg), heights (in/cm/m), and BP pairs (`120/80`);
      any missing/ambiguous field returns null (never guesses). 8 unit tests (task 5.1).
- [ ] 3.3 Render the inline result row (value + canonical unit + tool name) as option 0 above
      the card/list when a template fires (Design D5).
- [ ] 3.4 Route Enter/click on the inline row to the tile with `q=` prefill via the existing
      hash-state serialization; partial parses prefill without an inline value (Design D6).

## 4. Zero-result recovery

- [ ] 4.1 On empty results: one-edit "Did you mean" option when the rewrite changes the query;
      browse-group links; "No tools match." only as the final line (Design D7).

## 5. Tests & guards

- [ ] 5.1 Unit (`lib/query-compute.js`): each template — happy parse computes the documented
      value; missing unit → null; unit variants (lb/kg, °F/°C, cm/in, feet-inches) convert
      correctly; trigger tokens without numbers → null.
- [ ] 5.2 Unit: gate behavior — high-margin top hit renders card; near-tie renders plain list.
- [ ] 5.3 e2e: "bmi 180 lb 5'10" shows an inline BMI row; Enter opens the BMI tile with the
      same inputs and the same value rendered by the tile itself (prefill round-trip).
- [ ] 5.4 e2e: answer card shows breadcrumb for a synonym query ("kidney function"); related
      chips route; zero-result query shows recovery options.
- [ ] 5.5 e2e: combobox a11y sweep — roles, `aria-activedescendant`, keyboard wrap, Escape —
      unchanged with card/inline rows present; mobile 320px no-overflow sweep passes.

## 6. Ship

- [ ] 6.1 `npm run lint`, `npm test`, `npm run build` green (em-dash guard applies to app.js /
      styles.css strings).
- [ ] 6.2 Author the `docs/spec-v*.md` record; fold requirements in; CHANGELOG entry.
- [ ] 6.3 Catalog count unchanged; no new routes; no MCP/dist-data impact beyond app shell.
