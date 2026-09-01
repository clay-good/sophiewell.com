# spec-v948 — Retiring the four duplicates the finder had been blind to

## What this executes

spec-v947 fixed the duplicate finder's parenthetical blind spot and confirmed four pairs by
reading both adapters. This retires the thinner half of each.

| Retired | Survivor | Why the survivor |
| --- | --- | --- |
| `cincinnati` | `cpss` | it carries the interpretation bands; the other had none |
| `abc-mtp` | `abc-transfusion-score` | its bands carry the derivation sensitivity and specificity |
| `ips-hodgkin` | `hodgkin-ips` | its bands give freedom-from-progression per band |
| `sort` | `sort-mortality` | its name says what the number is |

Catalog **1,710 → 1,706**.

## The thing that had to move rather than be deleted

`abc-mtp` carried the **derivation** — the "show your work" panel that prints each criterion
with the reader's own input beside it — and `abc-transfusion-score` had none. Deleting the
tile would have silently dropped that panel from the surviving one.

It was transplanted, and **not copied**. The block's `components[].inputKey` and its `units`
keys name the *arguments of the scoring function*, and the two tiles call different functions:
`abcTransfusion()` takes `penetrating / sbp90 / hr120 / positiveFast` where the retired
`abcMtp()` took `penetratingMechanism / sbpLe90 / hrGe120`. A copied block would have summed
to **zero on every input** and printed a panel that said nothing while looking right.

Both halves were caught by tests rather than by reading: the component-sum test on the
inputKeys, and `derivation schema: units key set covers every component input` on the units
map — which failed after the first half was already fixed. Exactly the spec-v914 lesson,
twice.

## Every surface a retired id reaches

- `data/id-aliases.json` — four new aliases, sunset 2027-09-01, so an agent holding a retired
  id self-heals with a deprecation notice (`describe_calculator('cincinnati')` returns `cpss`
  with `deprecatedId` and `deprecationSunset`).
- `app.js` `RETIRED_TILE_ALIASES` — the browser router, so a reader following an old permalink
  lands on the survivor rather than the home page. This is the spec-v915 half; the two maps are
  held in step by `check-mcp-catalog.mjs`.
- `lib/meta.js` — four META entries removed, and every `related` list and graph row that named
  a retired id **repointed at its survivor** rather than dropped, so the neighbours keep their
  link. 15 lists rewritten; 0 related entries now point at a missing tile.
- `data/synonyms.json` — the one plain-language entry keyed to a retired id moved to its
  survivor, so the phrase that used to reach the tile still reaches the instrument.
- `views/`, `mcp/adapters/`, `mcp/catalog.js`, `docs/mcp-coverage.md`, and the count surfaces
  in `index.html` (×9), `README.md`, `package.json` and `docs/scope-mdcalc-parity.md`.

## Proof

| Check | Result |
| --- | --- |
| `/#cincinnati`, `/#abc-mtp`, `/#ips-hodgkin`, `/#sort` in the live app | each redirects to its survivor, correct `<h1>` and `<title>` |
| `describe_calculator` on all four retired ids | resolves to the survivor with `deprecatedId` |
| `abc-transfusion-score` component sum vs `abcTransfusion()` | agrees at 0, 2 and 4 |
| related lists pointing at a missing tile | **0** |
| `npm run lint` | clean — 1,706 tiles across 13 surfaces, ledger exact |
| `npm run test:unit` / `test:mcp` | 12,931 pass / 421 pass |
| `npm run build` | clean, 1,706 tool pages |
