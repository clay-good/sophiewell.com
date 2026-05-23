# spec-v46.md — Catalog-truth invariants: anti-drift guards for user-facing surfaces

> Status: proposed (2026-05-22). v46 is an infrastructure spec.
> It adds **zero tiles** and amends no clinical rule. Its scope is
> to close a class of bug discovered on 2026-05-22: the home page
> `<title>` still read "Free Healthcare Toolbox - 223 Tools" while
> the catalog had been at 254 for two spec waves. The OG and
> Twitter cards, the meta description, the home-lede paragraph, and
> the no-JS fallback inside `#browse-tile-count` were all stale by
> 24 to 31 tiles. The defect was fixed by hand under
> commit `046d08d`. v46 makes that class of defect impossible to
> ship.
>
> Catalog effect at v46 close: **254 tiles unchanged.**
>
> Every prior spec (v4 through v45) remains in force.

## 1. Why v46 exists

Sophie's defining promise is *trust*. The clinical citations are
re-verified per [spec-v11](spec-v11.md) §3. The boundary worked
examples are pinned per [spec-v11](spec-v11.md) §3.2. The data
manifests are integrity-hashed per [spec-v12](spec-v12.md). The
catalog is regenerated per [spec-v29](spec-v29.md). And then, on
2026-05-22, a maintainer looked at the home page and the title bar
said the wrong number of tiles. Not by one — by 31.

The clinical rigor is the same surface as the marketing
copy. A patient or clinician who notices "223 Tools" in the title
bar while seeing 254 in the body has zero way to know which other
number to trust. The class of bug is small in any one instance and
large in aggregate because it erodes the only thing Sophie is
selling: *the numbers are right*.

v46 closes the class by making **`UTILITIES.length` the single
canonical source of truth for the catalog count** and by adding
automated guards that fail CI on any drift.

## 2. Non-goals

- **No new tiles.** Not one. v46 is purely a CI / source-of-truth
  pass.
- **No new dependencies.** The v10 §2.2 dependency budget is
  unspent and remains so.
- **No removal or rename of any existing tile.**
- **No retroactive edit of historical spec-vN docs.** A historical
  spec recording "v29 close is 230 tiles" is a snapshot of the
  catalog at that wave and must not be rewritten. The grep rule
  defined in §4 explicitly carves out `docs/spec-v[0-9]+.md` and
  `docs/audits/**` so historical narrative survives untouched.

## 3. The canonical truth source

**`UTILITIES.length`** is the single source of truth for the
catalog count. Defined in [app.js](../app.js); imported from
`lib/meta.js`'s `META` and the per-group registries assembled at
boot. Every other human-readable surface that names a count must
either:

1. Be populated at runtime from `UTILITIES.length` (the JS path
   already used by `#browse-tile-count`), or
2. Be checked at build time against `UTILITIES.length` and fail
   the build on mismatch (the new path), or
3. Be marked as a historical snapshot inside an HTML comment
   `<!-- catalog-truth:historical -->` or, in Markdown, inside a
   `> Status:` callout pinned to a specific spec wave.

The set of "in-scope" surfaces — surfaces that *must* match
`UTILITIES.length` — is enumerated in §4. The grep guard in §5
fails CI on any other appearance of a 3-digit literal that
*looks* like a tile count without one of the three escapes
above.

## 4. The in-scope surfaces

Each of the following must equal `UTILITIES.length`. Wave 46-1
ships a build-time check that asserts each one.

| # | Surface | File | Anchor |
|---|---|---|---|
| 1 | `<title>` | `index.html` | the literal in `<title>` |
| 2 | meta description | `index.html` | `<meta name="description">` |
| 3 | OG title | `index.html` | `<meta property="og:title">` |
| 4 | OG description | `index.html` | `<meta property="og:description">` |
| 5 | OG image alt | `index.html` | `<meta property="og:image:alt">` |
| 6 | Twitter title | `index.html` | `<meta property="twitter:title">` |
| 7 | Twitter description | `index.html` | `<meta property="twitter:description">` |
| 8 | Twitter image alt | `index.html` | `<meta property="twitter:image:alt">` |
| 9 | home `<h1>` lede | `index.html` | the lede `<p>` text |
| 10 | `#browse-tile-count` no-JS fallback | `index.html` | the literal inside the span |
| 11 | JSON-LD description | `index.html` | `"description":` in the JSON-LD block |
| 12 | README first-section blurb | `README.md` | the "X deterministic tiles" sentence |
| 13 | package.json description | `package.json` | the `"description"` field |
| 14 | `docs/scope-mdcalc-parity.md` close-line | `docs/scope-mdcalc-parity.md` | the most-recent vN close-count line is asserted |
| 15 | sitemap URL count sanity | `sitemap.xml` | the line count delta after the rebuild matches |

When a new in-scope surface is added in a future spec, this table
is extended.

## 5. The build-time check

Wave 46-1 ships `scripts/check-catalog-truth.mjs`. It:

1. Imports `UTILITIES` from `app.js` (Node ESM path; the file is
   already pure ES modules per [spec-v8](spec-v8.md)).
2. Reads each in-scope surface listed in §4 and extracts the count
   appearing there via a per-surface regex pinned to the exact
   anchor.
3. Compares each extracted count to `UTILITIES.length`.
4. Exits 1 with a per-surface diff if any disagreement is found.
5. Exits 0 with a one-line `check-catalog-truth: clean (N tiles
   across M surfaces)` message on success.

Wired into `npm run lint` (which already runs `eslint .` followed
by `node scripts/grep-check.mjs`); the catalog-truth check becomes
the third gate. Failure is a CI failure.

## 6. The grep guard

Wave 46-1 extends `scripts/grep-check.mjs` with a new rule:
**catalog-count drift detection**. The rule is:

> In any file path matching `index.html`, `README.md`,
> `CHANGELOG.md` (above the most recent `[Unreleased]` header),
> `package.json`, `site.webmanifest`, and `docs/*.md` (excluding
> `docs/spec-v[0-9]+.md`, `docs/audits/**`, and any line inside a
> `> Status:` block), a 3-digit decimal literal in the range
> `[100, 999]` adjacent to one of the words `tile`, `tiles`,
> `tool`, `tools`, `calculator`, `calculators`, `utilit`,
> `deterministic` is treated as a *putative tile count* and must
> equal `UTILITIES.length`.

False positives are escaped by wrapping the number in
`<!-- catalog-truth:historical -->NUM<!-- /catalog-truth -->`
(HTML) or by tagging the Markdown line with the
`<!-- catalog-truth:historical -->` comment immediately above.

## 7. Files touched (Wave 46-1)

```
docs/spec-v46.md                          (this file)
scripts/check-catalog-truth.mjs           (new)
scripts/grep-check.mjs                    (+1 rule)
package.json                              (+1 lint step)
CHANGELOG.md                              (Unreleased: v46 entry)
docs/scope-mdcalc-parity.md               (catalog ledger note: v46 = 254 unchanged)
README.md                                 (one-line note: catalog truth check)
```

Optional wave 46-2 (after 46-1 lands clean): backfill the
`<!-- catalog-truth:historical -->` escapes anywhere a legitimate
historical count appears in `docs/`. This is mechanical and can be
a single PR.

## 8. Acceptance criteria

v46 is fully shipped when:

- This file exists.
- `scripts/check-catalog-truth.mjs` exists and exits 0 on the
  current `main`.
- `scripts/grep-check.mjs` carries the catalog-count drift rule
  and exits 0.
- `npm run lint` runs both checks and is green.
- `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v46 with an explicit
  "catalog count 254, unchanged" note.
- A deliberate edit that drifts any in-scope surface by ±1 fails
  CI locally. (Tested by the maintainer; not part of the
  committed test suite.)

## 9. Out of scope for v46

- Auto-fixing drift. The check fails CI and tells the maintainer
  exactly which surface drifted; the maintainer fixes it by hand.
  An auto-fixer would mask the spec wave that *introduced* the
  drift.
- Counts other than the catalog total. Per-group counts, per-hub
  counts, and per-specialty counts are downstream of
  `UTILITIES.filter(...)` and are already computed at runtime;
  they cannot drift without breaking tests.
- A "last-updated" or "build date" invariant. The SBOM already
  carries the build timestamp; the catalog truth is about *count*,
  not *time*.
- A network-fetch check. That is the scope of [spec-v50](spec-v50.md).
