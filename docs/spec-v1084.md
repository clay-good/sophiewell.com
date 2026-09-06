# spec-v1084 — the swallow screen that stops on purpose

The last tile [spec-v1079](spec-v1079.md) deferred, and the one it was right to
defer. Untouched, it said:

> GUSS 20 of 20 (slight / no dysphagia). **Normal diet, normal liquids; no
> further investigation** per Trapl 2007.

Seventeen sliders, each parked at its best value, clearing a stroke patient to
eat before anyone had given them a spoonful of water. The stakes here are
aspiration pneumonia, which is why this was worth doing carefully rather than
quickly.

## Why the earlier fixes' shape would have been wrong

Every previous tile in this programme could be made to refuse until it was
complete. GUSS **stops by design**: the semisolid trial happens only if the
indirect swallow scores 5, liquid only if semisolid does, solid only if liquid
does. A patient who fails the indirect swallow is a finished assessment with a
total of 3 and a clear instruction — NPO, urgent SLP referral.

So "refuse anything partial" would have refused **most real screens**, which is
a worse failure than the one being fixed.

## Three states, not two

Each consistency is one of:

| | | |
|---|---|---|
| **scored** | the trial was done | counts toward the total |
| **gated** | the stage before it scored below 5 | the protocol correctly stopped; the assessment is complete |
| **outstanding** | the gate opened and nobody recorded the trial | the protocol was *interrupted*; there is no GUSS yet |

A total is only a GUSS when nothing is outstanding. Measured on the page:

```
nothing rated        GUSS not scored: rate vigilance, voluntary cough / throat
                     clearing, ... The indirect swallow comes first and gates the rest.

indirect swallow 3   GUSS 3 of 20 (severe dysphagia). NPO; consider NG/PEG ...
                     Not performed (gated per Trapl 2007): semisolid, liquid, solid.

indirect swallow 5,  GUSS not scored: the semisolid trial is outstanding. The stage
semisolid unrecorded before it scored 5 of 5, so the protocol continues ...
                     Not reached yet: liquid, solid.

full sweep           GUSS 20 of 20. Normal diet, normal liquids.
```

The second row is the one that makes this different from every other tile in the
programme: an incomplete-looking form that is a **complete, correct, actionable
assessment**.

## Two smaller things the design forced

**A gated trial reports `null`, not `0`.** It used to report 0, and on this scale
0 means the patient failed the trial outright — a total failure on a trial nobody
performed. The pre-existing unit test asserted the old value; it now asserts
`null`, with the reason written in.

**"Gated" and "pending" are different.** When a stage is *outstanding*, the ones
after it are not gated — the protocol has not made a decision about them yet, and
saying "not performed per Trapl 2007" would credit the instrument with a
judgment it never made. They are reported as "Not reached yet".

## The agent surface

Stage 1's five items gate everything and stay `required`. The twelve trial fields
are **conditionally** required, which `validateInputs` cannot express, so they
are optional and the library enforces the condition with `outstanding`. That also
lets a legitimately gated screen round-trip: the worked example now stops at the
liquid trial and the agent surface accepts it.

## The worked example

Was a full pass — 20 of 20, "Normal diet, normal liquids". It now passes the
indirect swallow and semisolid, then swallows liquids with a delay, stopping
before solids: **GUSS 14, "Semisolid diet only, NPO liquids"**. It opens on a real
decision and demonstrates the gating the instrument is built around.

## The lesson

> **Before deciding what a blank means, find out whether the instrument is
> allowed to stop.** A staged protocol has a third state that a flat score does
> not: not attempted, on purpose, with the assessment complete. Treating that as
> a gap would have made the tile refuse the majority of correctly conducted
> screens.
