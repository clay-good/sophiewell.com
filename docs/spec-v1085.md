# spec-v1085 — the GCS pair, and the decision that is not theirs to make

[spec-v1079](spec-v1079.md) left `peds-gcs` and `hunt-hess-wfns` off the queue on
the grounds that an untouched Glasgow Coma Scale reading 15 might be convention
rather than defect, and that deciding is a judgment about the most familiar
instrument in medicine.

Looking properly, the survey had mixed two questions together.

## What the flagship already does

The adult `gcs` tile renders the same three sliders, defaulting to the same
maxima. The probe did not flag it, and the reason is the whole finding: the probe
reads a tile **as rendered**, and `gcs` opens on its worked example of eye 3,
verbal 4, motor 5 — **GCS 12, "Moderate"**. A realistic patient.

The other two opened on the maximum:

| Tile | Opened on |
|---|---|
| `peds-gcs` | Pediatric GCS **15 of 15**, mild — a fully conscious child |
| `hunt-hess-wfns` | **Hunt-Hess 1 / WFNS 1** — the mildest subarachnoid haemorrhage the instrument can describe |

So what separated them from the flagship was never the control. It was the
worked example, which is the [spec-v1080](spec-v1080.md) defect and needs no
judgment at all: a severity-grading tile should not open on the reading that says
there is no severity.

`peds-gcs` now uses the same 3/4/5 as the adult tile — a drowsy, confused child
who localises. `hunt-hess-wfns` uses grade 3 with a GCS of 14, which also shows
the Hunt-Hess and WFNS scales **diverging** (3 and 2), something a grade-1
example cannot demonstrate.

## The control question, stated once

Whether a GCS component should be able to say "not assessed" is still open, and
this page is deliberately not answering it. What has changed is that it is now
**one decision about three tiles**, not a loose end on two.

The argument each way, so the next person does not have to reconstruct it:

- **For.** It is the same defect as every other tile in this programme. Rule 8
  ([spec-v1047](spec-v1047.md)) says a control that cannot express "not answered"
  will be read as an answer, and GCS drives intubation, trauma triage and the
  WFNS grade. A patient nobody examined reading 15 is exactly what
  [spec-v1078](spec-v1078.md) fixed on the NIH Stroke Scale.
- **Against.** GCS is read as a number rather than as a questionnaire, and the
  three components are always scored together at the bedside in a way that makes
  a partial GCS an unusual artefact. The instrument also has an established
  convention for an unscorable component — "E1c" for an eye swollen shut, "VT"
  for intubated — which a blank field does not express either, so a naive
  refusal might be the wrong shape of fix.

That second point is the one that makes this worth a deliberate decision: the
right answer may be **neither** a slider nor a blank-able number, but a control
that can say *untestable* as the instrument itself does.

## What holds it

`check-catalog-truth` pins both documented strings, and the change is examples
only — no library or control change, so nothing new enters the whole-catalog
sweeps.
