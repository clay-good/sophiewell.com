# spec-v980 — A 200 is not proof the page is there

## What happened

While hunting replacements for the 13 links spec-v979 left dead, `curl -L` reported **200** for
`horizonblue.com/providers/policies-procedures/prior-authorization`. The browser showed
*"Sorry, we can't find that page. (404 Error)"*. Node's `fetch` — what the checker actually uses —
reported a clean **404**.

So the checker was right and the ad-hoc probe was wrong. But the near-miss names a failure mode the
checker really did have: **a site is free to serve its not-found page with a 200**, and a checker
whose only signal is the status code will call that page fine forever. Its one job is to say
whether the page is there.

## The fix

`check-pa-source-urls.mjs` now reads the body of an HTML 200 and looks for not-found wording in the
page's own `<title>` or first `<h1>`. Those two elements name what the page *is*, so the reading
stays narrow: a real policy page that discusses a 404 further down does not trip it. A PDF is never
read — it cannot soft-404 — and neither is the body of a real error status, which says nothing new.

**It finds none today.** All 84 ledger URLs are honest about themselves, which also means the 18
corrections in spec-v979 are real rather than 200-shaped. It is here because a link checker that
can be lied to about the one thing it checks is not a checker, and this runs monthly for as long as
the ledger exists.

`test/unit/pa-source-urls.test.js` pins all four verdicts, including the two that are easy to get
wrong: a 403 is a **bot wall**, not a dead page (calling those dead trains the maintainer to ignore
the report), and a soft-404 outranks the redirect reading — a moved page that is not there is dead.

## One more link

`ibx-precert` moved from a 404 to `ibx.com/resources/for-providers/policies-and-guidelines`,
confirmed in a real browser as Independence Blue Cross's provider "Policies and guidelines" page,
which is what that ledger row names. **13 dead → 12.**

## Where the verification stopped, and why

Candidate pages were found for most of the remaining twelve. They were **not applied**, because
none of them was the page the rules assume:

- `bcbsil.com/provider/standards/standard-requirements/mppc` resolves, and is *Medical Policy
  Pre-certification: **Out-of-area Members*** — far narrower than the HCSC row, which covers
  prior-authorization requirements across IL/TX/MT/NM/OK.
- `content.highmarkprc.com` resolves, and redirects to Highmark **Wholecare** — the Medicaid plan's
  resource centre, not the general provider one.

Pointing a biller's source link at a narrower or adjacent page is worse than a 404 the monthly job
flags: it reads as authoritative while being wrong, which is the ledger's own stated reason for
existing. So they stay dead and reported. Twelve rows need a person who knows which page each rule
was written against.

## Files

Changed: `scripts/check-pa-source-urls.mjs`, `pa-staleness-ledger.json` (one URL), its generated
`lib/pa/staleness-ledger.js`, the pa-lint golden reports (URLs only).
New: `test/unit/pa-source-urls.test.js`, this file.
