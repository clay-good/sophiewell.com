# spec-v1685 — MASLD assumed European ancestry for a blank age-adjusted cut

> Status: **SHIPPED (2026-10-24)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1684](spec-v1684.md).

The same blank-select-defaults-to-a-cutoff class as [spec-v1684](spec-v1684.md), found by a catalog-wide search
for a lib that resolves a blank enum to a specific non-absence value (`|| 'european'`). Of the six tiles with that
shape, five default to an absence value (`not-tested`, `unknown`, `none`) — the house convention for an optional
criterion — and only `masld-criteria` defaulted to a specific group.

| Tool | Input | Was | Now |
|---|---|---|---|
| `masld-criteria` | steatosis present, BMI 24, ancestry not chosen | the blank ancestry silently used the European BMI cut of 25, so a BMI of 24 — which meets the Asian cut of 23 — failed the adiposity criterion, under-calling MASLD for an Asian patient | the ancestry is asked for wherever it would change the verdict: a BMI in [23, 25), or a waist between the lowest and highest cut for the sex. The tool's own note already warned that "using one figure for everyone misses this group" |

The BMI cut (25, or 23 in Asian ancestry) and the waist cut are both ancestry-specific, so the group decides the
adiposity criterion. It is asked for **only** where it would flip that criterion — a BMI of 31 meets every cut and a
BMI of 20 meets none, so a blank there changes nothing and is left to resolve to the general cut without asking. The
browser select gained a "Choose the ancestry" first option.

## Proof

`test/unit/masld-criteria.test.js` (a new "a blank ancestry is asked for only where it flips the adiposity
criterion" test pins both the asked and the not-asked cases; the one assertion that had relied on the European
default now names the group). Verified live in the browser.
