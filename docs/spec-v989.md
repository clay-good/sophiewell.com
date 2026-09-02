# spec-v989 — The pin that was written as a floor and behaved as a ceiling

## The finding

Pushing to a now-public `main` prints eleven open Dependabot advisories — nine high. All eleven
are transitive dependencies of the dev toolchain and the MCP SDK; none reaches the shipped static
site, which bundles no npm code. That is why they were survivable. It is not why they were still
open.

`fix(deps): clear all open Dependabot alerts in both lockfiles` (70815c50, 2026-07-25) says it
resolved twelve alerts by "pinning patched floors in the existing overrides block of each
manifest, so a future install cannot silently regress." The intent is right. The mechanism was
not: it wrote **exact** versions.

An exact override is not a floor. It is a floor *and a ceiling*. When `fast-uri` 3.1.6 shipped
the fix for four new advisories, `"fast-uri": "3.1.5"` in both manifests actively held the tree
on the vulnerable version — and it did so under a comment claiming to prevent exactly that.
**Eight of the eleven open alerts were caused by the change that was supposed to close them.**

| Package | Was | Vulnerable range | Now resolves |
| --- | --- | --- | --- |
| `fast-uri` | pinned `3.1.5` | `>=3.1.3 <3.1.6` | 3.1.7 |
| `qs` | not overridden | `>=6.14.2 <=6.15.3` | 6.16.0 |
| `browserslist` | not overridden | `<=4.28.6` | 4.28.8 |

## The fix

Every security override is now a **caret** range: a floor at the patched version, bounded by the
major it already sits on.

- `fast-uri` `^3.1.6`, `qs` `^6.16.0`, `browserslist` `^4.28.7` — the three with open advisories.
- `hono`, `brace-expansion`, `ip-address` and `nanoid` carried the same exact-pin trap without an
  advisory yet. They are caret ranges too. **This upgrades nothing today**: re-resolving both
  lockfiles with the four changed produced a zero-line diff in resolved versions. It only means
  the next patch on those lines is not blocked the way `fast-uri` was.

A first attempt used `>=3.1.6`, which is unbounded and pulled `fast-uri` across a major to 4.1.4
— the opposite failure. A floor has to say which major it is a floor *in*.

`npm ci` still installs the exact versions in the lockfiles, so build determinism is unchanged.

## Proof

`npm audit` reports 0 vulnerabilities in the root tree and in `mcp/`. Full lint chain, 13,028 unit
tests, 421 MCP tests, `check-mcp-catalog` and `audit-pa` all pass on the re-resolved tree.

## Left open

`npm run build` regenerates `favicon-16x16.png`, `favicon-32x32.png` and `favicon.ico` to bytes
that differ from the committed ones, so a contributor who runs the documented build gets a dirty
working tree in files they never touched. Not caused by this change and not fixed here.
