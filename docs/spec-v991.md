# spec-v991 — The SBOM's own verification instruction could never succeed

## The finding

`sbom.md` ends with: *"Re-run `npm run sbom` after a clean checkout and compare hashes."* That is
the whole point of shipping a bill of materials — anyone can regenerate it and check that the
files it attests are the files in the repository.

It could not be done. `build-sbom.mjs` stamped `new Date().toISOString()` into
`metadata.timestamp` on every run, so two runs a second apart produced two different documents.
Comparing hashes always failed, and the reader had no way to tell a real difference from the
clock.

The knock-on effect is that `npm run build`, which runs `build-sbom`, always left `sbom.json` and
`sbom.md` modified — the last remaining reason the documented build dirtied the working tree
after spec-v990 took the favicon generator out of it.

**Everything else in the document is already content-derived.** `buildId` is a SHA-256 over every
runtime, edge-runtime and source file hash. Measured: two consecutive builds produce SBOMs that
are byte-identical once the timestamp is blanked.

## The fix

The timestamp now means *when this bill of materials last changed*. `build-sbom` reads the
existing `sbom.json`, compares everything but the timestamp, and carries the previous stamp
forward when nothing else moved. A real content change still stamps the moment it was generated.

`npm run build` is now idempotent over every path it writes back into the repo, and CI checks it:
the icon-scoped `git diff --exit-code` added at spec-v990 is widened to `index.html`,
`sitemap.xml`, `report-catalog.js`, `sbom.json`, `sbom.md`, `data/search-corpus/` and
`data/fields/` alongside the five icons. The dataset manifests are deliberately excluded — CI's
own `Build seed data` step re-stamps their `fetchDate`, which is that step's job (spec-v987).

## The stale SBOM this exposed

Regenerating the SBOM after spec-v990 changed four rows. The icons that spec re-committed were
still recorded at their old sizes and hashes — `favicon.ico` at 7,411 bytes against the real
3,682. The bill of materials had been describing files the repository no longer contained. It is
correct now, and the CI check above is what keeps it that way.

## Proof

`node scripts/build-sbom.mjs` twice in a row now leaves `sbom.json` and `sbom.md` byte-identical,
and `npm run build` twice in a row leaves the working tree clean.
