# spec-v1405 — the height envelope, and a unit scale for the finder

[spec-v1404](spec-v1404.md) found the envelope finder had no row for weight. It had none for height
either, and height is harder to add: `lib/bounds.js` states it in metres (0.45 to 2.5 m) and every
height field in the catalog is in centimeters.

## The finder learned units

`scripts/probe-envelope-unbounded.mjs` map rows now take an optional scale from the envelope's unit to
the field's. Height carries 100, and every comparison goes through one `envelope(r)` helper. Its own
negative test (a worked example outside the assigned envelope is a mapping bug) did its job on the
first run: a bare "length" pulled in a left-atrial dimension, a pelvic-organ measurement, a fetal
femur, and a testis. The row now matches height, stature, and crown–heel only, and
`testicular-volume`, whose dimensions are labelled with the bare word "Height", is excluded by id.

## What it found

| tool | was | now |
|---|---|---|
| `predicted-spirometry` | GLI-2012 predictions from a 2,500 cm height | refuses with the height envelope |
| `bsa` | Du Bois and Mosteller from a 2,500 cm height | the declared ceiling on its `num()` read |
| `body-roundness-index`, `whtr`, `cmi` | refused the value but asked for it as if blank | `gradeFault()` names each field's own range first |

`test/unit/body-size-envelope.test.js` (renamed from the weight-only test) drives each worked example
to 2,500 cm through `compute_calculator`; it fails for all five with the library changes reverted.
The probe reads 0 in every section; its reach is 482 fields, 450 testable, none mis-mapped.
