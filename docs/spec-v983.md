# spec-v983 — Four hours of CI to verify code that no longer exists

## The waste

The `e2e` job takes about **57 minutes** — it is the full Playwright matrix across chromium,
firefox and webkit over 1,704 calculators. `unit` and `mcp` finish in seven and four.

There was no `concurrency` group on the workflow. So every push starts a full run and none of them
ever stops. Today, four commits in ninety minutes left four e2e jobs running side by side, three of
them verifying code that had already been superseded — close to **four hours of runner time** spent
on states of the repository that no longer existed.

That cost was invisible while one person pushed to `main` in a private repo. It is a contributor's
problem now: pushing a fixup to your own pull request is the normal way to work, and each fixup
would leave the previous hour-long run grinding away behind it.

## The rule

```yaml
concurrency:
  group: ci-${{ github.workflow }}-${{ github.event.pull_request.number || github.sha }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```

**Superseded pull-request runs are cancelled. Runs on `main` are not.**

That asymmetry is the whole point and is worth stating plainly, because the tempting version —
grouping by branch and cancelling everything — would be wrong here. The deployed site tracks `main`,
so **every commit on `main` is a deploy candidate and has to be verified on its own**. Cancelling a
superseded `main` run would leave a commit that was never tested sitting in the history of a site
people use at a bedside. Keying the group on `github.sha` for pushes means each commit gets its own
group and simply queues.

## Not changed

`citation-cadence.yml` and `data-refresh.yml` are monthly schedules that cannot overlap themselves.
The rest of the workflow's hardening was already in place: pinned action SHAs, `permissions:
contents: read`, and `persist-credentials: false` on every checkout.

## Files

Changed: `.github/workflows/ci.yml`.
