# spec-v990 — The icons the site served were never the icons in the repo

## The finding

`npm run build` — the command README and CONTRIBUTING tell a contributor to run — ran
`scripts/build-favicons.mjs` as its first step, and that script writes **into the repo root**,
not into `dist/`. So the documented build left five tracked binary files modified, in files the
contributor never touched.

Worse than the churn is what the churn meant. Every one of the four derived icons in the repo
differed from the one the build produced and deployed:

| File | Committed | Built and deployed |
| --- | --- | --- |
| `favicon-16x16.png` | `d8ab9268c1d9…` | `048382388a01…` |
| `favicon-32x32.png` | `a2f623e5e342…` | `fbcbde6664e8…` |
| `favicon.ico` | `407fde0ca278…` | `8dd13c4dd66d…` |
| `apple-touch-icon.png` | `29cdc69c3bbe…` | `d0e9b629aa93…` |
| `logo.png` (master, copied verbatim) | same | same |

Only the master matched, because the master is the one file the script copies rather than
re-encodes.

**Why the bytes moved.** The script picks an image backend at run time: `sharp` if it can import
it, otherwise the macOS `sips` binary. `sharp` is not a declared dependency of this project. It
arrives as a transitive dependency of `miniflare`, inside `wrangler` — so the encoder that
rendered the site's icons was whichever version the Cloudflare CLI happened to vendor that week,
and on a Linux machine without it the icons came out of a completely different resizer. A
dependency bump nobody connected to the logo could silently change the favicon.

## The fix

The icons are committed artifacts, and the build copies them.

1. `build-favicons.mjs` is out of the `npm run build` chain in `scripts/build.mjs`. It is
   `npm run favicons` now — run it deliberately when `logo.png` changes.
2. The copy step that used to say "copy favicon assets **if present**" now throws when one is
   missing. That guard could never fire while the files were generated three lines earlier; now
   that they are checked in, a missing icon means the site deploys without one and should stop
   the build.
3. The repo's icons were regenerated once, deliberately, so what is committed is byte-identical
   to what production has been serving. Nothing a user sees changes: same 16/32/180 px renders of
   the same master, same RGB PNG format as the files they replace, only a different encoder's
   bytes.
4. CI runs `git diff --exit-code` over the five files after the build. If anything ever puts a
   generator back into the build path, that step fails instead of the icons quietly drifting
   again.

## Proof

Two consecutive `npm run build` runs now leave all five hashes identical, and each file in
`dist/` is byte-identical to its committed source. Deleting `favicon.ico` and building fails with
the named remedy rather than shipping a site with no icon.

## Left open

`npm run build` still rewrites `sbom.json` and `sbom.md` on every run, because the SBOM stamps a
generation timestamp and a build id derived from it. The content is otherwise unchanged. Fixing
it means deciding where `build-sbom` belongs — `release:check` already runs `npm run sbom`
*before* `npm run build`, so simply removing it from the build chain changes the order in which
the bill of materials sees the generated data shards. Left for its own change; the CI check added
here is deliberately scoped to the icons rather than to the whole tree for the same reason.
