# spec-v1822 — The envelope the library enforced and the catalog did not publish

> Status: **SHIPPED (2026-11-26)**: **81** more number fields publish the `lib/bounds.js` envelope their
> library already enforces, taking envelope declarations from 610 to 691; and the fourth question about a
> declaration gets its finder. 38 adapters, no library file. No published number changed; the catalog stays
> 2,390.

## Four questions, three finders

[spec-v1810](spec-v1810.md) found the divergence from one side: a range **declared** on the agent surface
and not enforced in the library, so the page answered what an agent was refused. Three finders ask three of
the four questions an envelope declaration raises:

| Finder | Question |
|---|---|
| `probe-borrowed-envelope` | does a declaration name a quantity the field is **not**? ([spec-v1796](spec-v1796.md)) |
| `probe-envelope-unenforced` | does the library answer **past** an envelope the field keeps? ([spec-v1794](spec-v1794.md)) |
| `probe-declared-cap-configs` | is a declared bound honest in **every configuration**? ([spec-v1780](spec-v1780.md)) |

The fourth was missing: a field whose library **refuses** outside the envelope while the agent surface
publishes **no range at all**. An agent then learns the range by being refused, which is the divergence
[spec-v1743](spec-v1743.md) exists to stop, and the catalog disagrees with itself about one quantity —
42 tiles named the systolic-pressure envelope and five did not; 21 named the heart-rate one and two did
not.

81 fields now name theirs. The test was the library's own behavior, not a grep: each field whose **words
and unit** name an envelope (`scripts/lib/quantity-name.mjs`, so a urine albumin is not a serum one) was
driven an order of magnitude past the ceiling and a span below the floor, in **every configuration** its
other selects reach.

## The gates caught the codemod four times

This is worth recording plainly, because it is the fourth wave this session where a codemod applied one
assumption to a hundred call sites and the gates were the only reader who checked all hundred:

1. **`declared-cap-honest`** rejected seven declarations where the library's own range is **narrower** than
   the catalog's envelope — `deurenberg-body-fat` enforces a BMI of 5 to 100, not the envelope's 5 to 200.
   Those took the library's literal range instead ([spec-v1781](spec-v1781.md): a stated range is a
   validated population).
2. **`probe-declared-cap-configs`** rejected 24 more that held in the worked example's configuration and
   not in all of them — `vasopressor` answers a weight of 525 kg for some drugs. Exactly spec-v1780's
   lesson, arriving again.
3. **The parser** rejected one: the regex that found a field object stopped at the first `}`, which in
   `pollock-flickinger` was inside a template expression in the label.
4. **`no-dupe-keys`** rejected three, and one of those three was the useful failure: a **dom is not unique
   across adapters**, so the search placed `bc-age`'s envelope on a `kind: 'bool'` field in another file —
   "Age 50 or older", a tick box, with a measurement envelope on it.

## What is left, and why it is not zero

27 fields, and the reason is a real tension between two of the repo's own rules.
`declared-cap-honest` requires a declared edge to be an edge the library **answers at**. An envelope can be
enforced while its edge is **unanswerable**: driving `penn-state-ree` past the temperature envelope is
refused in the envelope's own words — *"Input above the plausible range for core temperature (13 to 47 C);
verify the units"* — and yet **at** 13 C the Penn State equation works out to −2227 kcal, outside the range
the tool reports. The envelope is enforced; declaring it would promise an edge the tool cannot compute.

What those 27 want is the narrower range each tool can actually answer across, which is a reading per tool
rather than a wave. So `probe-undeclared-envelope` ships as a **report, not a gate**, and says this in its
header — the gates that decide whether a declaration may be taken are the two that caught the codemod.
