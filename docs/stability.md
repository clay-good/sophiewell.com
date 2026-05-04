# Stability Commitments

These are not aspirational. They are the things sophiewell.com will
not do, ever. Every commitment below is enforced by code, by CI, or by
the absence of any mechanism in the project that would allow doing the
opposite.

## No A/B testing

Every user sees the same version of every utility. Behavior changes
ship as plain releases that affect everyone simultaneously. There is
no traffic splitter, no experimentation framework, no remote config.

## No user-visible feature flags

If a feature is on the site, it is for everyone. If it is not ready
for everyone, it is not on the site. Internal build-time toggles are
acceptable; runtime user-visible flags are not.

## No tracking

The site does not load any analytics script, tracking pixel, heatmap
recorder, session replay tool, error reporting service, or third-party
telemetry. The CSP `connect-src 'self'` directive enforces this in
the browser.

## No email capture

The site does not have a newsletter, a "get updates" form, or an
account system. The site never asks for an email address.

## No notifications

The site never requests notification permission, and it does not use
push, web push, or any other notification surface.

## No persistent client storage

No `localStorage`, no `sessionStorage`, no `IndexedDB`, no cookies.
The service worker cache stores only the application's own static
files, never user input. Pinned-tile state and calculator inputs (when
encoded) live only in the URL hash, which never leaves the browser.

## 90-day deprecation notice

If a utility has to be removed, the utility view shows a clear notice
for at least 90 days explaining what changed and why, and points to
the closest replacement. Only after the 90-day notice period does the
route stop responding.

## Semantic versioning and a public changelog

Every release is tagged in git with a semantic version. Every release
has a changelog entry describing user-visible changes. The changelog
is linked from the footer and viewable in-site at
[#changelog](#changelog).

## Formula version transparency

When a clinical formula changes (because the published formula
itself changes), the inline citation reflects the new version, the
"Test with example" expected output is updated, and the change is
called out in the changelog.

## Why this matters

A clinician who used a calculator on Monday and got a different
result on Tuesday because they were placed in a treatment group
would correctly stop trusting the site. The site cannot afford to
introduce that doubt. Stability over novelty is a precondition for
being useful at the bedside.
