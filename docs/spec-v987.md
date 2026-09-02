# spec-v987 — The weekly data refresh shipped the catalog inside a data PR

## What was found

`data: weekly refresh` **#13** has been open since 2026-08-30. Its diff is **59 `fetchDate` stamps
and two `gzipBytes` numbers**. Not one byte of dataset content changed — the pipeline re-fetched
every source, found them all identical, and stamped the date.

Which is exactly right, and the PR should merge: `fetchDate` is **reader-facing**. It renders on
the page as *"Source: \<label\>, fetched \<date\>"*. A dataset re-verified this week and unchanged
should say so, and suppressing that PR as noise would make the page understate how current the
check is. (That was the first conclusion here, and it was wrong.)

The problem is the other two lines. They are the search corpus's byte counts, they were four days
old, and today's catalog work moved them — so the PR can no longer merge without failing the
corpus determinism test.

## Why they were in there at all

The workflow rebuilds the corpus, under this comment:

> The search corpus is derived from `data/`, so a refresh can change its bytes.

**It is not, and it cannot.** `scripts/build-search-corpus.mjs` reads `app.js`, `lib/meta.js`,
`mcp/catalog.js` and `data/tool-copy/` — all catalog, none of them fetched weekly. Verified by
editing a dataset value, rebuilding, and comparing: `corpus.json` comes back byte-identical.

What the rebuild actually picks up is **catalog drift that landed on `main` since the corpus was
last committed**. Shipping that inside a *data* pull request is what makes the PR perishable: it is
born carrying a snapshot of an unrelated thing, and goes stale the moment anyone touches a tile.
On a repository that ships tile changes most days, that is a PR with a short shelf life for a reason
that has nothing to do with data.

## The change

The rebuild stays — the job's own `npm run lint` and determinism test need it on the branch. It is
now excluded from what the PR carries, at both points where the file set is chosen:

```
git diff --binary -- data scripts/expected-hashes.json ':!data/search-corpus'
```

and `:!data/search-corpus/**` in the action's `add-paths`. The corpus belongs to whoever changed the
catalog; a data refresh must not carry it. The pathspec was verified against a working tree holding
both a dataset edit and a corpus change: the dataset file is in the diff, the corpus is not.

## PR #13 itself

Left alone. It is a legitimate refresh whose corpus lines are now stale, so it cannot merge as-is;
the next weekly run supersedes it, and closing someone's pull request is their call, not this
change's.

## Files

Changed: `.github/workflows/data-refresh.yml`. New: this file.
