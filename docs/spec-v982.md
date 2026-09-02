# spec-v982 — The contribution guide described a process abandoned 860 calculators ago

## The defect

The repository is public, so `CONTRIBUTING.md` is what a stranger reads before their first pull
request. Step 6 of *"How to add a new tile"* told them:

> Add an audit log at `docs/audits/v11/<tile-id>.md`.

`docs/audits/` was last written on **2026-07-02**. **399 of 1,704 calculators have a file there**;
the other 1,374 do not, and nothing checks. A contributor following the guide would do work no one
expects.

Worse than the wrong step is the missing one. The guide never mentions the **MCP adapter** — and
`check-mcp-catalog` **fails CI** on a clinical calculator that is neither exposed to agents nor
waived. It also pointed at `lib/scoring-v4.js` for the scoring function, where a new calculator now
gets its own module, and said nothing about `data/synonyms.json` or which artifacts are generated.

So the document that exists to get a contribution merged omitted the step that would stop it.

## The rewrite

*"How to add a calculator"* is now the **file set of a real one** — the mTICI reperfusion grade,
spec-v960 — rather than a description of how it ought to work. Every path in it was touched by that
change: ten hand-edited files, three regeneration commands, and the note that the SBOM, sitemap,
corpus and field index are generated (with the warning that `npm run data:refresh` re-stamps dozens
of unrelated manifests and buries the change).

It also carries the surprise that only shows up after the PR is opened: **adding a calculator
reorders every ranking derived from the whole catalog**, because they weight how rare a word is
across it — so a related-tools list nobody touched can change order (spec-v977).

And `docs/audits/` is named explicitly as **not a step**.

## The gate

A second section, *"The gates, and what each is for"*, gives one line per check.

CI is the first conversation this repository has with a contributor, and it is one-sided: a check
fails, prints its own name, and stops. **Two of the fifteen gates were explained nowhere** — not in
CONTRIBUTING, not in `docs/` — so a stranger refused by `check-tile-copy` had no way to learn what
it wanted.

`scripts/check-gates-documented.mjs` reads the `lint` chain out of `package.json` and requires every
script in it to be named in `CONTRIBUTING.md` or `docs/`. It cannot check that an explanation is
*good* — nothing can — only that **a gate is never anonymous**. It found itself on the first run,
which is the right first result.

## Proof

| Check | Result |
| --- | --- |
| lint-chain gates explained nowhere | 2 → **0** (16 gates, all in the CONTRIBUTING table) |
| removing one table row | fails, naming the gate |
| putting the audit-log step back | fails `test/unit/gates-documented.test.js` |
| `npm run lint` / `test` / `test:mcp` | clean |

## Files

New: `scripts/check-gates-documented.mjs`, `test/unit/gates-documented.test.js`, this file.
Changed: `CONTRIBUTING.md`, `package.json` (lint chain).
