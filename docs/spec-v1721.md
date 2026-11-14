# spec-v1721 — A superseded FDA label must not throw away the week's data refresh

> Status: **SHIPPED (2026-11-14)**. Workflow only; no tool changes.

The weekly `data-refresh` run of 2026-11-08 failed, and nothing was published: no pull request, no
rewrite of the "Data freshness" issue, and no update for any of the fifteen fetched datasets. The
issue stood stating the state of 2026-11-01 for a fortnight. The run of 2026-10-11 was lost the same
way.

## What happened

The label watch (spec-v1628 section 1, route D) does its job. DailyMed changed a section of the
Xenazine label that `pgx-label-dose-limit` reads, so `watch-dailymed.mjs --write` marked the row
superseded and `build-label-editions.mjs` wrote that state into `lib/`. The tile then answers with a
withholding notice and no figure, which is the fail-closed rule working exactly as written.

`check-mcp-catalog` asserts that every tool's worked example still produces the numbers it promises.
A withheld tile cannot, so the gate failed:

```
check-mcp-catalog: violations.
  pgx-label-dose-limit: example expected numbers not in result: 62.5, 50
```

That gate runs inside `npm run lint`, in the `refresh` job, in the step **before** the one that
packages the patch. So the job died at the gate, `Package reviewed changes` never ran, the artifact
was never uploaded, and `publish` and `freshness` were skipped for want of it.

The sting is that `publish` already had a branch written for this exact case:

```bash
if grep -q -E '^- .*(Re-read these rows in|Re-read the label for)' ...; then decision=review; fi
```

A superseded label was always meant to open a pull request labeled `data-review` and wait for a
person. That branch could never be reached.

## What changed

| | Was | Now |
|---|---|---|
| Freshness report, packaging, upload | after the test suite | before it |
| Test suite | aborts the job | `continue-on-error`; a new `suite-result` job carries the red X |
| `publish`, `freshness` | `needs: refresh` | also `if: always() && needs.refresh.outputs.packaged == 'true'` |
| Merge decision | read the summary only | also refuses to merge when `needs.refresh.outputs.suite != 'success'` |

## What this keeps

Every signal. The suite still runs on the refreshed bytes, the run still goes red when it fails, and
nothing auto-merges that the suite did not pass -- the merge decision now reads that result itself,
rather than inferring it from the job having survived. Packaging before the suite also means a test
that writes to the tree can no longer leak into the patch.

## What this gives up

The `refresh` job is red in any week a watched label changes, which is a normal event rather than a
breakage. The pull request and the freshness issue both say why, in the first line of their body, so
the red X is explained where it is read.

## Notes

- Today four labels are superseded at once -- Eliquis (apixaban) v39, Monoferric v15, Piperacillin
  and Tazobactam (Civica) v8 and Xenazine v22 -- across seven tools. Three tiles fail the example
  round-trip, and 21 of the 18,962 unit tests fail with them -- every one of them a test that reads
  the live label table. Clearing that is a person re-reading each label, which is what the
  `data-review` label is for.
- `steps.<id>.outcome` is the result before `continue-on-error` is applied, which is why the suite's
  true result still reaches `publish` as a job output.
- The red X is a separate `suite-result` job rather than a failing last step of `refresh`, so that
  `refresh` concludes successfully. Had it failed, publish and freshness would have depended on
  GitHub handing a failed job's outputs to its dependents -- and if it does not, they skip, and the
  week is lost in exactly the silent way this change exists to end.
