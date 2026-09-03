# spec-v1005 — A security commit deleted a CI job and nothing said so

## The finding

`docs/performance.md` opened by describing the Lighthouse accessibility, best-practices and SEO
category floors as hard CI gates, and said in as many words that **the build fails** if any drops
below 95.

`.lighthouserc.json` is present, well-formed, current, and asserts exactly that. Nothing runs it.
It appears in no npm script, no workflow, and `@lhci/cli` is not a dependency — its only mentions
anywhere in the repository are in documentation.

The history is specific. `.github/workflows/ci.yml` carried a `lighthouse` job invoking
`npx --yes @lhci/cli@0.13.x autorun` from the initial build until commit `120bacd7` —
*"fix(security): harden problem report pipeline"*, 2026-08-23 — which deleted the whole job among
thirty-one other removed lines and said nothing about it in the message. The document kept the
claim for the eleven days since.

This is the third instance of one shape today: **a document naming an automated check that is not
there.** spec-v995 found two licensing tests deleted a year ago and still cited by path;
spec-v997 found CONTRIBUTING calling `release:check` "the same gate that runs in CI" while it
skipped a whole job.

## What this does not do

**It does not put the job back.** The removal happened inside a security commit, and the job as
written uploaded a report of the site to `temporary-public-storage` — a third-party bucket — and
carried an `LHCI_GITHUB_APP_TOKEN` secret. Restoring that silently would reverse a decision
somebody may have made deliberately, on a repository that is now public. That is a call for the
maintainer, and it is now a one-line call: the config is intact and `npm run perf` runs it.

## What it does

- **The document says what is true.** Lighthouse does not run in CI. Accessibility *is* enforced,
  by two checks that do run — `scripts/a11y-check.mjs` in the `unit` job, and the
  every-control-has-an-accessible-name sweep in `test/integration/all-tools.spec.js` in the `e2e`
  job — and the doc now names both and what each catches. Best-practices and SEO scores are gated
  by nothing at present, which it also says.
- **`npm run perf`** builds and runs the config, so the assertions are reachable by hand.
- **The dormant config no longer publishes.** `upload.target` moves from
  `temporary-public-storage` to the filesystem. A dormant config is still a config, and for a
  project whose first commitment is that nothing leaves the reader's device, publishing a report of
  the site on every run should be chosen, not inherited as a default.
- **`test/unit/performance-claims.test.js`** binds the document to the workflows in *both*
  directions: wire Lighthouse back in and the doc must stop saying it does not run; leave it out
  and the doc may not promise a gate. It also pins the upload target, that every `npm run` command
  the doc names exists, and that the sampled routes are live tile ids — a previous drift had it
  measuring `#icd10`, removed at spec-v29, and `#mpfs`, which is a dataset and not a tile.

## Proof

Each of the four assertions was negative-tested against the real tree: adding an `lhci` mention to
a workflow fails the first, restoring `temporary-public-storage` fails the second, and appending
`#icd10` to the sampled routes fails the fourth. The third caught this very document on its first
run, because the prose quoted the old claim verbatim; the sentence was reworded rather than the
check weakened.

Full lint chain and 13,088 unit tests pass.
