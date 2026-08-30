# spec-v935 — A closed vocabulary that admits both halves of a synonym pair

## The finding

`META[id].specialties` drives the `list_calculators?specialty=` filter on the MCP surface and the
specialty filter in the app. `test/unit/specialty-coverage.test.js` holds it to a **closed
vocabulary** so a typo cannot drift in — and that vocabulary contained three synonym pairs, with
both halves allowed:

| Term | Tiles | Its synonym | Tiles |
| --- | --- | --- | --- |
| `palliative-care` | 21 | `palliative` | 5 |
| `pain-medicine` | 11 | `pain-management` | 5 |
| `pediatric-emergency` | 10 | `pediatric-emergency-medicine` | 1 |

A closed vocabulary exists to make a filter answer completely. Admitting both halves does the
opposite: `list_calculators?specialty=palliative-care` returned 21 tiles and **silently omitted
the 5** tagged `palliative`. Nothing was mistagged, and no gate could see it — both values were
legal.

## What changed

The rarer half of each pair was merged into the more-used and more standard name, and the three
retired terms were removed from `ALLOWED_SPECIALTIES` so they cannot come back.

| Filter | Before | After |
| --- | --- | --- |
| `palliative-care` | 21 | **26** |
| `pain-medicine` | 11 | **16** |
| `pediatric-emergency` | 10 | **11** |

Verified through `dispatch`, not just in the data: each merged term now returns its full count
and each retired term returns 0.

## Three pairs deliberately left alone

Being similar is not being synonymous, and merging these would lose a distinction:

- **`surgery` (78) / `surgery-general` (17)** — the first spans every surgical field, the second
  is the specialty.
- **`rehabilitation` (17) / `physical-medicine-rehabilitation` (35)** — the first includes
  cardiac rehab and therapy tiles that are not PM&R.
- **`periop` (2) / `nursing-periop` (7)** — the nursing tags are a parallel axis throughout this
  vocabulary, not duplicates of the clinical ones.

## Also checked, and not a defect

**52 tiles carry no specialty at all — and every one of them is `clinical: false`**: document
generators, converters, and billing tools, where no specialty applies. The coverage test already
requires a specialty on every *clinical* tile, and that holds.

## Files

`lib/meta.js` (11 tiles retagged), `test/unit/specialty-coverage.test.js`, this file. No catalog
change, no count change.
