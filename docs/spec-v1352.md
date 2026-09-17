# spec-v1352 — a sign-in wall is not an authority

Blue KC's twenty rules cited `providers.bluekc.com/login` for a year, and every
check passed. The link check fetched it and got HTTP 200. The staleness check
read its date and called it current. The citation check confirmed it was
registered in the ledger. What none of them could see is that a reader who
clicks it is asked to sign in, and that no maintainer could ever re-verify the
twenty claims made in its name.

`scripts/check-pa-rule-citations.mjs` now also refuses to let the ledger
register a URL whose path is a sign-in wall: a segment of `login`, `signin`,
`sign-in`, `logon`, `sso`, `auth`, or `authenticate`.

Matching is on **path segments, not substrings**, which is the whole design.
`/prior-authorization` and `/Authorizations` both contain "auth" and are exactly
the public pages this program repoints rules at; a substring match would reject
every one of them. Five tests assert the wall shapes are caught, four assert
those real pages are not, one covers a wall registered under `alsoCited`, and
one asserts the live ledger is clean.

The rule is recorded in `docs/pa-maintenance.md` beside the registration rule it
extends, so the next person adding an authority reads it before choosing a URL.

Verification covers 14,408 repository unit tests, all passing, with lint clean
across all 19 gates.
