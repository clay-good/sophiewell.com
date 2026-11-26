# spec-v1818 — Three copies of `bool` that read 1 as no

> Status: **SHIPPED (2026-11-26)**: `bool` is one behavior in all 36 modules that declare it and is now in
> the lint chain's watched set, so it cannot drift again; two modules stop calling a round to two decimals
> `r1`; and the finder behind both is gated at zero behind six read groups — the 33rd. 38 library files.
> No published number changed, and the catalog stays 2,390.

## The helper that answered the same question three ways

`scripts/probe-helper-behaviour-drift.mjs` drives **every copy of every repeated helper name** over a
battery of 27 values — the plausible readings, the boundaries, and the things that are not readings at all.
`bool` was declared in 36 library modules in three versions:

| Copies | Body |
|---|---|
| 26 | `v === true \|\| v === 1 \|\| v === '1' \|\| v === 'true' \|\| v === 'on'` |
| 5 | `v === true \|\| v === 1 \|\| v === '1' \|\| v === 'true' \|\| v === 'yes'` |
| 3 | `v === true \|\| v === '1' \|\| v === 'true' \|\| v === 'yes'` |

Every copy asks one question — *is this criterion ticked?* — and three of them read the **number 1** as
**no**: `critcare-severity-v200` (APACHE II and its neighbours), `hepatology-gibleed-v201` (the
Glasgow-Blatchford score) and `myeloid-prognosis-v199` (MIPSS70). Eight read `'on'` as no, which is what an
HTML checkbox submits when it carries no `value` attribute.

**Neither is reachable today, and that is the whole reason to fix it now.** The views read `.checked`, a
real boolean; the agent surface coerces a `bool` field through `makeToArgs`, whose `toBool` turns a JSON
`1` into `true` before the library sees it. So this is a latent divergence of exactly the shape
[the duplicated-rule rule](spec-v1211.md) is about: one rule written 36 times, already disagreeing, waiting
for a surface that passes the raw value. All 36 now read the **union** — `true`, `1`, `'1'`, `'true'`,
`'on'`, `'yes'` — which can only widen what counts as a yes, never narrow it, so no criterion that was
ticked becomes unticked. `bool` joins `check-helper-drift`'s `WATCHED` set, where a second behavior fails
the lint chain.

## And one name that lied about its own precision

28 copies of `r1` round to **one** decimal. Two modules — `imci-prereferral-injectables` and
`leprosy-reaction-prednisolone` — called a round to **two** decimals `r1`. The behavior is right for what
they print (a volume of 0.19 mL, a dose of 0.75 mg/kg); the name was the only one in the catalog that lied
about its precision, so an edit that copied a neighbour's `r1` into either file would have silently changed
a printed volume. Both are `r2` now, which is what every other module calls a round to two decimals.

## The five groups that are not drift

The probe's other disagreements are **two different functions wearing one short name**, and they are judged
with the reason rather than normalized:

- **`pct/1`** is three jobs — a formatter (`"7.2%"`), a converter (×100), and a reader that bounds a
  percentage at 100.
- **`r1/1`** and **`r2/1`** each come in a number-returning and a string-returning shape, and a value and a
  formatted value are different jobs.
- **`fin/1`** accepts a real number only in 31 copies and a numeric string in 5. Both are right where they
  are used, and neither surface sends a string.
- **`clamp/3`** is applied to a number already read, so the three copies that return `null` for `null`
  differ only for a caller that does not exist.

The distinction that decides the list is worth stating: `check-helper-drift` watches the helpers whose
disagreement is a **correctness** question, and `bool` qualified because every copy answers the same
question. `pct` does not.
