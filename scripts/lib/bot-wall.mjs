// Hosts that refuse the CI runner with a 404 instead of a 403.
//
// A 403 is already read as a bot wall rather than a dead page, because calling
// a page dead that any reader can open trains the maintainer to ignore the
// report (spec-v980). fda.gov does the same refusing, with the wrong status
// code, and that cost three monthly runs:
//
//   2026-10-01 (issue #19)  three fda.gov pages reported dead; every later
//                           fetch answered 200. A second look was added.
//   2026-11-01 (issue #39)  the same pages reported dead again, in both the
//                           ledger check and the living-doc check.
//   2026-11-01 (a dispatch of the same workflow, on the branch that fixed the
//                           one genuinely dead link) still 404, after second
//                           looks 15, 30 and 45 seconds apart. So it is not a
//                           rate limit that waiting clears.
//
// Every fda.gov URL either check fetches -- all three of them -- comes back 404
// from the runner and 200 with its own title and content from anywhere else, on
// the same day. What differs is who is asking, which is the definition of a bot
// wall and not a fact about the page.
//
// The cost of being wrong here is a retired fda.gov page reported as BLOCKED
// rather than DEAD. It is still printed in the monthly report, in the same
// bucket as the twelve other bot-walled links, so a maintainer can still see it
// -- it just no longer files an issue. That is the same trade already accepted
// for asahq.org, medicaid.gov and cdc.gov.
//
// Keep this list to hosts with that evidence behind them: a URL verified live
// from outside CI while CI calls it dead, more than once.
const HOSTS = ['fda.gov'];

// isBotWall404(url) -> bool. True when a 4xx from this host says nothing about
// whether the page is there.
export function isBotWall404(url) {
  let host;
  try { host = new URL(url).hostname.toLowerCase(); } catch { return false; }
  return HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}
