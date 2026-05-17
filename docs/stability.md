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
files, never user input. Calculator inputs (when encoded) and the
audience-chip / disclosure-state filters live only in the URL hash,
which never leaves the browser. The Pin/Unpin home section was
removed in spec-v8 §3.2; the URL hash no longer carries a `p=`
segment.

## Client-side processing of clinical and billing data

Every calculation, lookup, and decode runs in the browser. Inputs the
user types into a tile — clinical values, billing codes, pasted
artifact text — never cross the network. The CSP `connect-src 'self'`
directive enforces this; the absence of any backend or edge function
that sees user input enforces it architecturally. There is no
server-side processing surface on sophiewell.com that *could* see
clinical data, by construction.

## Bounded runtime-dependency budget

sophiewell.com ships zero runtime dependencies today. The project
commits to a maximum of **two pinned, exact-version runtime
dependencies** going forward, each justified against a clinical use
case that cannot be hand-rolled at small cost (see
[spec-v10 §2.2](spec-v10.md)). Every runtime dependency must appear
in [sbom.json](../sbom.json) with a content hash, must be reviewed
against [docs/threat-model.md](threat-model.md) before merge, must
ship under an MIT-compatible license, and must not introduce a new
CSP `connect-src` entry. devDependencies (eslint, playwright) are
not budgeted; they do not run in the user's browser.

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
pre-filled example values and their expected output (reachable via
the "Reset to example" link) are updated, and the change is called
out in the changelog.

## Why this matters

A clinician who used a calculator on Monday and got a different
result on Tuesday because they were placed in a treatment group
would correctly stop trusting the site. The site cannot afford to
introduce that doubt. Stability over novelty is a precondition for
being useful at the bedside.
