# spec-v1130 — the probe was matching its subjects' own footnotes

The programme's own instruction, after any wave that changes a control:

> the last step of any wave that changes a control is the probe, not the suite

This session changed a great many controls, so both control probes were re-run.
`prefilled-default-probe` is unchanged at six rows, all billing settings.
`slider-default-probe` reported **five tiles**, and three of them were the probe
being wrong.

## `mild`, inside a band table

```
flacc   "FLACC 6: moderate pain per Merkel 1997 (0 relaxed; 1-3 mild discomfort;
         4-6 moderate; 7-10 severe)."
painad  "PAINAD 6: moderate pain per Warden 2003 (0 no pain; 1-3 mild; …)"
nips    "NIPS 6 of 7: severe pain per Lawrence 1993 (0-2 no/mild; …)"
```

Each **reads as alarming** — moderate pain, moderate pain, severe pain — and each
was reported as reading *reassuring on an untouched form*, because the probe's
keyword list holds `mild` and every one of these tiles prints its band table
after the verdict.

The probe's own header rules them out in as many words:

> a tile that says nothing, asks, or **opens on an abnormal reading** is not

So it flagged three tiles its own specification excludes.

## This rule was already written down, in this file

[spec-v1075](spec-v1075.md): **a vocabulary match over a tile's whole output is a
match against its boilerplate.** It is in this programme's open-items list, it
was found when the asking vocabulary matched a tile's static footnote, and this
probe had the same defect the whole time.

Matching the **verdict** — the first sentence, with parenthetical band tables
dropped — takes the report from five rows to one.

## The one that is left

`hunt-hess-wfns`, on `mild focal deficit`, which is part of the Hunt-Hess grade
III description rather than a reassuring verdict. It is a keyword heuristic and
the probe asserts nothing precisely because, as its header says, *deciding which
readings are reassuring needs a person*. One row for a person to read is the
intended output.

Behind it sits the open decision [spec-v1085](spec-v1085.md) recorded and did not
settle: **whether a GCS component should be able to say "not assessed"**. That is
a design question about an instrument, not a defect, and it is the owner's to
answer. It is left where it was, and now it is the only thing the probe prints.

## What a false clean and a false flag cost differently

[spec-v984](spec-v984.md) established that a gate reporting clean while its defect
is present is worse than no gate. This is the other error, and it is not
symmetrical: a false flag costs reading time, and — the real risk — invites a
"fix" to a tile that was right. Three pain scales that correctly report moderate
and severe pain were three rows away from being changed.

**The way both errors get found is the same: read a row rather than trust the
count.**
