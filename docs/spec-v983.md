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

**Superseded pull-request runs are cancelled. Runs on `main` are untouched.**

That asymmetry is the whole point, so it is worth being exact about what the `main` half does:
**nothing.** Keying a push's group on `github.sha` gives every commit its own group, so main runs
never collide — none is cancelled, and none is queued either. The saving is entirely on pull
requests, which is where the repetition actually is.

Grouping `main` by branch instead is the tempting version and is worse than it looks. The deployed
site tracks `main`, so every commit on it is a deploy candidate that has to be verified on its own —
and GitHub keeps only **one** pending run per group. A third push would silently cancel the second
commit's pending run, leaving a commit that was never tested in the history of a site people use at
a bedside. Saving runner minutes is not worth that.

## What this does not do

It does not shorten today's five concurrent `main` runs, and it was never going to. The honest
framing is that the waste this removes is a **contributor's**, not a maintainer's — which is the
right thing to fix in a repository that has just become public, and the wrong thing to claim credit
for on `main`.

## Not changed

`citation-cadence.yml` and `data-refresh.yml` are monthly schedules that cannot overlap themselves.
The rest of the workflow's hardening was already in place: pinned action SHAs, `permissions:
contents: read`, and `persist-credentials: false` on every checkout.

## Files

Changed: `.github/workflows/ci.yml`.
