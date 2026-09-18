# spec-v1375 — correct the intake rules for eight payers

spec-v1374 recorded that the program's queue had missed rules 001–005: the scan
that built it looked only for the 006–010 boilerplate. This slice corrects the
intake rules for the eight payers whose primary source this program has already
read — Blue Cross MN, Louisiana Blue, HMSA, and the Michigan, Indiana, Arizona,
Washington, and Ohio Medicaid overlays — so each of them now has all twenty
rules corrected. The nine remaining Medicaid overlays get theirs with their own
source reading.

Every one of the forty rules carried the same template. The corrections match
the ones Arkansas Blue Cross (v1345) and Blue KC (v1351) received, and each
citation now names only what that payer's own source says.

| Rule | Template claim | Corrected |
|---|---|---|
| 001 | Flag: the packet must cite the payer's Medical Policy and **MCG** | Informational mapping aid. The criteria come from the payer, which each source says it applies or provides; none requires the packet to recite them, and "MCG" was asserted for payers that never name it |
| 002 | Flag any packet without a clinical document | Flag only once the packet identifies itself as an authorization request |
| 003 | The packet should name its channel — including "by phone using the number on the member ID card", a claim none of these sources makes | Transport metadata, never required. The citation names each payer's real channel: Availity Essentials, iLinkBlue, ProviderOne and form HCA 13-835, Ohio's electronic-only rule |
| 004 | Mangled prose ("ships no bundled list") and a paragraph of internal wave vocabulary | A plain, non-enforcing reminder to verify against the current list |
| 005 | Flag an authorization-required service with no reference number | Advise only after the packet says a submission is complete; an initial request cannot carry the number it will produce |

Sixteen existing tests asserted the old behavior — `001` flagging, `002` firing
on payer context alone — and are updated, with three new explicit-request tests.
One table-driven test then checks all eight payers at once: `005` must not fire
on an initial request and **must** fire on a completed submission with no
reference, which also proves each rewritten payer guard actually runs. A third
asserts no corrected `003` still mentions the member ID card or a cover sheet.

The source ledger contains 91 registered authorities: 45 fresh and 46 warning
by age, with no failures, source orphans, or coverage gaps. Rule citations now
reference 239 distinct URLs, all among the 298 registered in the ledger and none
behind a sign-in wall. Of 876 PA rules, 823 are source-anchored. The 1,722-tile
catalog is unchanged.

Verification covers 1,301 PA-engine tests, 14,620 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
