# Tasks — Drug-interaction kinetics and polypharmacy exposure math

> Before building, confirm the nine ids are absent from the catalog (they were on November 7, 2026) and
> re-read ICH M12 §2.1.2, §7.5.1, Table 3 and Table 6 and the FDA table page, diffing against `design.md`;
> tool 5 stays build-gated on reading Ohno 2007.
>
> Ids: `id: 'ddi-basic-screen'`, `id: 'ddi-static-aucr'`, `id: 'ddi-strength-classify'`,
> `id: 'cyp-list-check'`, `id: 'ddi-cr-ir-predict'`, `id: 'enzyme-recovery-time'`,
> `id: 'dose-history-level'`, `id: 'two-compartment-params'`, `id: 'emax-hill-effect'`.

## 1. Read the gated sources
- [ ] 1.1 Ohno, Hisaka and Suzuki, *Clin Pharmacokinet* 2007;46:681: the CR-IR equations for inhibition
      and induction and the stated validity range (tool 5). Check PMC and open reprints first; a reprint
      the build can verify is allowed (owner's rule of October 17, 2026).
- [ ] 1.2 FDA Table 3 (transporter legend), if transporter pairs are to be added to tool 4 later.
- [ ] 1.3 Hill 1910, if reachable; otherwise tool 9 says "not opened" beside the citation.

## 2. Lib
- [ ] 2.1 `lib/ddi-vNNNN.js`: basic-method ratios, the M12 AUCR equation with the three runs, the Table 2
      classifier, CR-IR (gated), enzyme recovery; Table 6 as a dated constant with a staleness-ledger row.
- [ ] 2.2 `lib/pk-multidose-vNNNN.js`: superposition (bolus, infusion, Bateman with the ka = ke limit),
      two-compartment macro-to-micro conversion, sigmoid Emax and its inverse.
- [ ] 2.3 Unit tests: every scenario in the spec delta; each cutoff at its boundary (0.02, 10, 1.25,
      0.80/1.25, 1.25-fold, 2-fold, 5-fold, 20%, 50%, 80%); fu,p floor; the masking case where combined
      AUCR sits in 0.80 to 1.25 while inhibition alone does not.

## 3. Data
- [ ] 3.1 Refresh manifest row for the FDA table page: fetch, parse Table 1 and Table 2, pin hash and
      "current as of" date, 14-day expiry, fail closed; row-count drop over 10% fails the parse.
- [ ] 3.2 Name normalization for tool 4: lower case, strip salt words, map combination rows ("lopinavir
      and ritonavir") to each component, and report the combination row as written.

## 4. Views, META, agents
- [ ] 4.1 Renderers: tools 1-6 group Q beside `cyp2d6-phenoconversion`; tools 7-9 group F beside
      `pk-steady-state-predict`. Tool 4 and tool 7 use the file-intake drop target for a list.
- [ ] 4.2 META: citations name the M12 section and table and the FDA page's "current as of" date;
      examples reproduce the spec scenarios byte for byte.
- [ ] 4.3 Backfills: related links from `pk-suite`, `pk-steady-state-predict`, `cyp2d6-phenoconversion`,
      `dips-interaction`; the AUCR-to-dose prefill into `pk-suite`.
- [ ] 4.4 MCP adapters for all nine; tool 4 takes `{ medications: string[] }`. Synonyms: "drug
      interaction", "DDI", "CYP3A4 inhibitor", "strong inhibitor", "AUC ratio", "AUCR", "static model",
      "Ki", "kinact", "time-dependent inhibition", "induction", "missed dose", "late dose",
      "two-compartment", "Emax", "Hill equation", "polypharmacy".

## 5. Ship
- [ ] 5.1 Count surfaces; `node scripts/build-search-corpus.mjs`; `node scripts/build-unbuilt-index.mjs`;
      `npm run release:check`; CHANGELOG; `docs/spec-vNNNN.md` build record.
