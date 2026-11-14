# spec-v1720 — The BESS defect, looked for everywhere

> Status: **SHIPPED (2026-11-14)**: fixes to `rivermead-mobility-index` and `ihs4`, and a new finder.
> The catalog stays 2,387.

spec-v1718 found `bess-balance-error` scoring 11 errors on a stance as none, through a helper that is
copied, under one name or another, into some twenty-five libraries:

```js
if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
```

## Why the existing finder missed it

`scripts/probe-impossible-reads-as-absent.mjs` exists for exactly this shape, and missed it twice over:

| Blind spot | Why |
|---|---|
| Required fields | Its oracle compares an impossible value with *omitting* the field, and skips a field whose omission is refused. Every BESS stance is required. |
| The page's path | It asks through the agent layer, which enforces the adapter's min and max first. The page does not: a number input's `max` marks a typed 11 invalid and passes it on. |

## The new finder

`scripts/probe-impossible-as-zero.mjs` calls the library the way the page does (`compute(toArgs(...))`,
with the adapter's validator skipped). For each numeric field it asks whether 999999 gives **exactly** the
answer 0 gives, while 0 and the worked example give different answers. Its negative test: on the pre-fix
BESS library it reports all six stances; on the fixed one, none.

`test/integration/impossible-as-zero-probe.spec.js` then drives every row on the page, because the library
cannot tell a free input from a select its adapter calls a number. It is a finder, so CI never runs it.

## What it found

205 fields across 81 calculators on the library path. On the page, 185 never reach the library with the
value (the view refuses first) and 20 do.

| Tool | Typed | Read | Now |
|---|---|---|---|
| `rivermead-mobility-index` | 16 items (the index has 15) | **RMI 0 of 15**, the least mobile possible | refused; a blank and a fraction are refused too |
| `ihs4` | 501 nodules, abscesses or tunnels | that count as none, so severe could read mild | refused above 500, on the page and for agents |

The other 18 read like 0 because the instrument bands them with 0, and that is correct:

- ICHD-3's duration windows (cluster headache over 180 minutes, migraine over 72 hours);
- du Bois's band for an FVC decline under 5%;
- FGSI's symmetric extremes;
- Phoenix's GCS cut at 10;
- SNAPPE-II's ratio bands.

TI-RADS above 20 cm says "Enter the nodule maximum diameter", so it discloses.

## What it does not reach

Only fields whose worked example is nonzero and where 0 changes the answer are asked: 1,663 of them. A
field whose example is 0 or blank gives no signal here.
