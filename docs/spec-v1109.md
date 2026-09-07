# spec-v1109 — the miss-value was the best finding there is

Draining the debt ledger [spec-v1108](spec-v1108.md) seeded. Three of its eleven
gone, and all three turned out to be the same defect as
[spec-v1107](spec-v1107.md)'s `euroscore2` — which is the useful part, because it
means the ledger is not eleven separate investigations.

## One line, three tiles

```js
function pickPoints(map, key, def = 0) {
  const v = map[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : def;
}
```

A lookup that falls back to `0` for a key its table does not hold. **`0` is the
most favourable level of every one of these tables**, so a factor nobody
determined was scored as the best finding the instrument can record — and each
tile then said so in its own detail line, about determinations nobody had made:

| Tile | Empty call | Its detail line |
|---|---|---|
| `ssign-score` | *SSIGN 0 of 17 — low risk; ~96.8% 5-year cancer-specific survival* | *"all factors at their lowest band (score 0)"* |
| `sepsis-obstetrics-score` | *SOS 0 of 28 — low risk of critical-care admission* | *"Deranged: all variables normal"* |
| `essdai` | *ESSDAI 0 — low systemic activity* | *"No active systemic domain (total 0)"* |

The middle one is a maternal sepsis score reporting eight normal vital signs. The
first is a renal-cell survival estimate quoting a figure — **~96.8%** — from six
unstaged pathology features.

`essdai` is the one where the choice was deliberate and written down:

```js
// an unselected / unknown / out-of-domain value contributes 0 (never NaN).
const levelName = ... ? raw : 'No';
```

`'No'` is not "not answered". It is the level meaning *this organ system was
examined and is quiet*. The comment is about avoiding a `NaN` — a real concern,
correctly handled — and the level it chose to avoid it with carried a clinical
claim nobody noticed it was making.

## The treatment, three times

Each is a sum of non-negative weights, so what has been determined is a
**floor**, and each takes the shape this programme settled on:

- The top band rules in and is left alone (rule 13). `SSIGN >= 6` high risk,
  `SOS >= 6` high risk, `ESSDAI >= 14` high activity all read exactly as before.
- Below it, the band, the stratum and — for `ssign` — the survival figure are
  withheld, and the reading names what is missing.
- The detail line stops asserting the determinations and lists them as not made.

And each exports its coefficient table so a test can hold the property the
disclosure depends on ([spec-v1107](spec-v1107.md), rule 19):

```js
assert.ok(points >= 0, `${factor}.${level} is ${points}: the floor claim no longer holds`);
```

## Seven existing tests were written against the fallback

The same shape found on `nichd-fhr` ([spec-v1102](spec-v1102.md)),
`masld-criteria` and `ces-d`. *"ssign: an intermediate-risk case (score 3-5)"*
staged two factors and let four fall through; *"sos: all variables normal is a
zero low-risk score"* passed **nothing at all** and read eight blanks as eight
normal observations, under a name that claims they were measured.

Each now passes a complete determination with the factors under test overridden,
through a small `staged()` / `sosNormal()` / `rated()` helper. That is the fifth
time in this programme a wave's fix has been blocked by tests asserting the
defect, and it is worth stating as a pattern rather than an anecdote: **a test
that supplies only the fields it is about will silently depend on whatever the
code does with the rest.** Where the rest are graded selects, what the code does
with them is the thing this whole programme is about.

## What is left

Eight lines in `test/mcp/enum-rated-items-ledger.js`. On this evidence most will
be the same lookup, and the ledger now says so — but they have still not been
read one at a time, and the fastest way to be wrong about the remainder is to
assume the pattern holds (`loe-silness-gingival-index` in
[spec-v1098](spec-v1098.md) looked exactly like the six tiles beside it and was a
*mean*).
