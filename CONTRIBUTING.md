# Contributing to Sophie Well

Sophie Well is public infrastructure for bedside math. Every change
should reinforce that posture. This document captures the process by
which Sophie evolves.

## What kind of changes Sophie accepts

Sophie accepts contributions that:

1. **Add a deterministic tile** that consumes at least one user input
   and produces a computed output, citing a peer-reviewed primary
   source. See [docs/spec-v29.md](docs/spec-v29.md) for the scope
   test and [docs/spec-v11.md](docs/spec-v11.md) for the citation /
   audit-log requirement.
2. **Improve an existing tile** by tightening a citation, widening
   accepted unit inputs (see [docs/spec-v47.md](docs/spec-v47.md)),
   adding a derivation block (see [docs/spec-v48.md](docs/spec-v48.md)),
   or fixing a boundary worked example.
3. **Improve the developer surface**: tests, CI checks, build steps,
   documentation, audits.
4. **Improve accessibility**: AAA contrast, keyboard navigation,
   screen-reader labels, focus management.

Sophie rejects contributions that:

- Add a third-party network call, third-party script, login,
  account, paywall, telemetry, analytics, error reporting, cookie,
  or AI / LLM integration. These are explicitly forbidden by the
  commitments in [docs/spec-v50.md](docs/spec-v50.md) and the
  automated checks under `scripts/check-commitments.mjs` and
  `scripts/grep-check.mjs`.
- Add a tile whose math is not deterministic or whose citation is
  not a peer-reviewed primary source.
- Add a tile that recommends a treatment, an order, or a disposition.
  Sophie computes; it does not prescribe.

## How to add a calculator

This list is the file set of a real one — the mTICI reperfusion grade, `spec-v960` —
rather than a description of how it ought to work. Every path here was touched
by that change.

**Write these by hand:**

1. **A one-page spec** at `docs/spec-vN.md`. Cite the primary source, and say
   which worked examples will pin the boundaries. If two sources disagree on a
   number, that is a reason to **skip** the calculator, not to pick a side
   (`docs/spec-v97.md`).
2. **The scoring function**, in its own module: `lib/<name>-vN.js`. Pure — no
   DOM, no clock, no network. Older tiles share `lib/scoring-v4.js` and
   `lib/clinical-v4.js`; new ones do not join them.
3. **Unit tests** at `test/unit/<name>.test.js`: the boundary set from your
   spec, plus rejection of invalid input.
4. **The META entry** in `lib/meta.js` — citation, `citationUrl`, specialties,
   the prefilled worked example, and the source's interpretation bands. A band
   claims to be the **source's own words** (`sourceQuoted`), so anything the
   source did not print belongs in the tool's note instead.
5. **The renderer** in `views/group-vN.js`, using the standard input helpers.
   No `innerHTML`; `grep-check` forbids it.
6. **`app.js`** — the row in `UTILITIES`, *and* the renderer import and its
   spread into `RENDERERS`. Forgetting the second is a tile that routes to a
   blank page.
7. **The MCP adapter** at `mcp/adapters/<name>-vN.js`, its registration in
   `mcp/catalog.js`, and its row in `docs/mcp-coverage.md`. This is not
   optional: `check-mcp-catalog` fails a clinical tile that is neither exposed
   to agents nor waived in `docs/mcp-waivers.md`.
8. **Plain-language phrases** in `data/synonyms.json`, so someone who does not
   know the instrument's name can still reach it. One shape only —
   `{ phrases: [...], tile: "<id>", audience: "..." }` inside `entries`.
9. **The count surfaces**: `README.md`, `package.json`'s `description`,
   `docs/scope-mdcalc-parity.md`, and `index.html`. `check-catalog-truth` fails
   CI on any that drift, and names the one that did.
10. **A CHANGELOG entry** under `## [Unreleased]`.

**Then regenerate — do not hand-edit these:**

```bash
node scripts/build-search-corpus.mjs
node scripts/build-field-index.mjs
node scripts/build-report-catalog.mjs
```

`data/search-corpus/`, `data/fields/`, `report-catalog.js`, `sitemap.xml` and
the SBOM are all generated. Avoid `npm run data:refresh` unless you changed a
dataset: it re-stamps dozens of unrelated `data/**` manifests and buries your
change.

**One thing that will surprise you.** Adding a calculator reorders every ranking
derived from the whole catalog, because they weight how rare a word is across
it. A "related tools" list you never touched can change order, so
`test/mcp/mcp-not-exposed.test.js` and friends may need updating — assert the
**set**, never the order (`docs/spec-v977.md`).

**Not a step:** `docs/audits/` is a historical record from earlier waves. Its
last entry is from July 2026 and roughly 860 calculators ago. Do not add to it.

**Also not a step:** the five icon files at the repo root — `logo.png`,
`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`.
They are committed artifacts, and `npm run build` copies them rather than
regenerating them. Change `logo.png` and run `npm run favicons` to rebuild the
set deliberately; CI fails if a build rewrites any of them
(`docs/spec-v990.md`).

## The gates, and what each is for

`npm run release:check` runs CI's lint and unit chain plus the MCP tool tests.
When one fails it names itself; this is where to look it up.

| Check | Refuses |
| --- | --- |
| `grep-check.mjs` | `innerHTML`, cookies, network calls, third-party scripts, and a calculator count that drifted in any doc |
| `check-us-english.mjs` | British spellings in anything a reader sees |
| `check-lede-copy.mjs` | an opening line that does not read as a sentence |
| `check-output-safety.mjs` | a result that can print `NaN`, `Infinity`, or an order |
| `check-tile-copy.mjs` | in-house words on screen — a raw tile id, "tile", "catalog" |
| `check-citations.mjs` | an undated guideline citation, or one missing from the staleness ledger |
| `check-source-urls.mjs` | a dataset manifest whose `sourceUrl` is prose rather than a URL, because the app renders it as a link |
| `check-catalog-truth.mjs` | a count, group label or worked example that drifted between surfaces |
| `check-issue-templates.mjs` | an issue form that contradicts CONTRIBUTING or SECURITY |
| `check-test-tile-ids.mjs` | a test naming a tile id that no longer exists |
| `check-commitments.mjs` | a change that breaks one of the eight public commitments |
| `check-mcp-catalog.mjs` | a calculator agents cannot reach, and no waiver for it |
| `check-pa-staleness.mjs` | a prior-auth source unverified past its window |
| `check-pa-rule-citations.mjs` | a rule citing a URL the staleness ledger does not carry |
| `audit-pa.mjs` | a change to prior-auth output that the golden reports did not expect |
| `check-gates-documented.mjs` | a gate joining this chain without a row in this table |
| `build-report-catalog.mjs --check` | the report Worker's id/name map out of date with the catalog |

Two gates do not run in that chain because they need a browser. The end-to-end
suite carries `no-answer-from-nothing-sweep.spec.js`, which clears every field of
every calculator and fails on any tile that still produces a reading. A tile that
legitimately answers an empty form -- a checklist where nobody ticking anything
really is a score of 0 -- belongs in `test/integration/empty-form-ledger.js`,
with a sentence in the pull request saying which it is: a criterion the clinician
answered "no" to, or a measurement nobody took (`docs/spec-v1019.md`).

It also carries `clock-dependent.spec.js`, which renders every calculator twice a
year apart on a fake clock and fails on any whose answer changed while its inputs
did not. A tool that measures elapsed time -- a filing deadline, a device-day
count -- belongs in `test/integration/clock-dependent-ledger.js` with the reason
(`docs/spec-v1024.md`).

Two more checks are **network** and therefore not in that chain, because a
publisher's outage must not fail a build for a reason unrelated to the change.
They run on the monthly cadence workflow and can be run by hand:

```bash
node scripts/check-citation-links.mjs
```

`check-citation-links` asks whether every source link a calculator offers still
resolves; `check-citation-agreement` asks the harder question of whether it opens
the paper the citation names; `check-pa-source-urls` does the same for the
prior-auth ledger; and `check-doc-links` does it for the documents in this
repository. All four are warn-only, and since spec-v1004 the monthly job files an
issue when any of them finds a dead link, because the previous arrangement
reported into a log nobody opened while twelve authorities sat dead for months.

Before opening a PR, run `npm run release:check` locally.

**It is not the whole of CI.** CI runs three jobs — `unit`, `mcp` and `e2e` —
and `release:check` covers the first two. It **does not run the end-to-end
suite**, which needs Playwright browsers and about an hour, so a green
`release:check` is not a green CI. `test/unit/release-check-covers-ci.test.js`
holds the two reproducible jobs in step with the local chain: a new CI step in
`unit` or `mcp` either joins `release:check` or is listed there as deliberately
CI-only, with a reason.

For the e2e half, the section below is the cheap substitute for the failure mode
that has actually broken this project's CI.

### If you touched tile text, a label, or CSS, run `npm run test:mobile`

`release:check` does not lay a page out, so it cannot see a line that is
too wide. Any string a tile supplies — a band label, a factor name, a
citation label — becomes real pixels, and one that cannot wrap pushes the
page sideways at 320px. This has broken CI twice: once on a
slash-joined token in a factor string (spec-v677), once on a citation
label that CSS forbade from wrapping (spec-v969). Both times lint, unit,
mcp and build were all green and the failure arrived an hour later.

```bash
npm run test:mobile
```

That builds `dist/` and runs the two chromium 320px sweeps — the
pre-rendered `/tools/<id>/` pages and every in-app tile route — in about
two minutes, against the same assertion CI uses. Prefer spaces and
commas to slash-joined or underscore-joined tokens, and keep any string
that renders as its own line short.

## How to add or change a commitment

A commitment is a guarantee Sophie makes to its users about its own
posture. They are listed in [docs/spec-v50.md](docs/spec-v50.md) §3
and on the public [/commitments/](https://sophiewell.com/commitments/)
page.

Adding a commitment:

1. Append a new §3.N section to spec-v50 with the public text and
   the enforcement paragraph.
2. Land the corresponding automated check in `scripts/`. The check
   must be wired into either `npm run lint` or `npm run test` and
   must fail CI on the violation it describes.
3. Append the commitment to the COMMITMENTS array in
   `scripts/build-commitments-page.mjs`.
4. The CHANGELOG entry must describe both the new commitment and
   the check that enforces it.

Changing an existing commitment requires amending spec-v50 by name
in the same PR that changes the check. Removing or weakening a
commitment is a fork-level decision and should be discussed in an
issue before any code is written.

## How to file a defect against a commitment

If you have found a way to violate one of Sophie's commitments
without tripping CI - for example, a localStorage write the
allowlist misses, an analytics vendor not in the deny list, or a
network call the CSP does not block - file an issue at
[github.com/clay-good/sophiewell.com/issues](https://github.com/clay-good/sophiewell.com/issues)
with the title prefix `commitment-bypass:`. Include the smallest
example that demonstrates the bypass and the commitment number
(see spec-v50 §3.N) that is being violated. These issues are
treated as security-class defects.

## License

Sophie Well is MIT-licensed. By contributing you agree that your
contribution is also MIT-licensed. Sophie does not require a CLA.
The MIT license is itself a commitment (spec-v50 §3.8); changing
it requires amending spec-v50.

## Maintainership

Sophie aims for a bus factor &ge; 3: at least three people with
merge rights to the canonical repository. This is a goal, not
currently enforced. If you would like to take on a maintainer role,
open an issue describing the surface (clinical citations, build
infrastructure, accessibility, etc.) you would like to own.
