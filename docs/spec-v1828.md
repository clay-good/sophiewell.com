# spec-v1828 — Refresh the archive, not the whole index

> Status: **SHIPPED (2026-11-26)**: the e2e lanes refresh **only** the Ubuntu archive, so a third-party apt
> repository answering 403 can no longer take the step down. 1 workflow file. No library or catalog change.

## My own fix, failing the way the thing it fixed failed

[spec-v1815](spec-v1815.md) added `sudo apt-get update` before `playwright install --with-deps`, because
the installer pins the package versions in the **runner image's** apt index and the Ubuntu archive keeps
only the current point release — so a new `libasound2t64` made the pinned one a 404 and failed every push on
a mirror change rather than a code change.

The nightly run of 2026-11-26 then failed like this:

> E: Failed to fetch `https://packages.microsoft.com/ubuntu/24.04/prod/dists/noble/InRelease` 403 Forbidden

A plain `apt-get update` refreshes **every** list the runner image carries, Microsoft's included, and one
unreachable repository fails the whole command. None of Playwright's dependencies come from there. So the
line added to stop a push failing on someone else's mirror started failing pushes on someone else's mirror.

The fix is to refresh the one list that matters:

```
sudo apt-get update \
  -o Dir::Etc::sourcelist=/etc/apt/sources.list \
  -o Dir::Etc::sourceparts=- \
  -o APT::Get::List-Cleanup=0
```

`sourceparts=-` drops `/etc/apt/sources.list.d`, where the third-party repositories live, and
`List-Cleanup=0` keeps the lists that are not being refreshed. It still fails if the **Ubuntu archive
itself** is unreachable, which is honest — that is a real reason not to install.

## Why not `|| true`

Because that hides the failure this step exists to catch. If the archive is down, the pinned package
version is the one in the stale index and `--with-deps` will 404 on it a moment later with a worse message.
Narrowing what is refreshed keeps the failure where it belongs and removes the one that does not.

Worth noting which run caught it: the **scheduled** cross-browser lane, not the push. The push run on the
same commit was green, and both appear under the same workflow name — so `gh run list` shows two entries for
one SHA, and reading only the first would have missed it.
