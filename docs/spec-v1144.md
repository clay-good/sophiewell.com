# spec-v1144 — a probe that only cleared the form

`js-error-probe.spec.js` asks whether any calculator prints a JavaScript runtime
error where its answer belongs. `safe()` renders `err.message` as the reading, so
a renderer that touches a property the library withheld shows the reader a
TypeError instead of a number.

It has been run and read many times. It clears every input first.

[spec-v1143](spec-v1143.md) found `drg-payment` throwing `null is not iterable`
out of `derivation()` on **every case that is not a post-acute transfer** — which
is the case its own worked example shows. Its derivation table had therefore
never rendered, and the engine's own message stood in its place, on the tile as
a reader first meets it.

The probe could not have found that. Clearing the form takes you to the refusal,
and the defect was in the ordinary reading.

## The second pass

The tile exactly as it opens: worked example applied, nothing touched. Same
pattern, same shards, same "is not defined" carve-out (rope-score's legitimate
refusal says *"The score is not defined without it"*).

**Negative-tested before being trusted**, as this repo has learned to — and the
measurement is the whole argument. With the `derivation()` fix reverted:

| Pass | Found |
| --- | --- |
| as it opens | `drg-payment` **and** `drug-wastage` |
| cleared form | nothing |

The second tile was inferred from reading the four call sites; the probe
confirmed it. A finder whose silence has never been checked is not evidence.

**Run across all 1,706 tiles as they open: zero.** The one defect it was written
for is fixed, and nothing else in the catalog shows an engine message where the
answer goes.

## The shape worth remembering

A probe is a question plus a starting state, and the starting state is half the
reach. This programme has now hit that twice in three waves:

| Probe | Started from | Missed |
| --- | --- | --- |
| `probe-omitted-field-decides` | a boolean flag or a band string | 155 tiles that carry neither ([spec-v1142](spec-v1142.md)) |
| `js-error-probe` | the cleared form | every defect in the reading a tile opens on |

Neither was a wrong question. Both were the right question asked from one place.
