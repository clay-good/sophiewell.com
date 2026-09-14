# spec-v1257 — next-step messages ask for the next step

`scripts/probe-static-exemption.mjs` finds readings that appear to acknowledge a
missing input only because unchanged explanatory prose happens to contain a
shared asking or disclosure phrase. Two rows remained.

The spinal epidural abscess guideline correctly stopped when a risk factor was
present without a sedimentation rate, but its dynamic result said only that the
rate was “the next step.” Unchanged text about fever contained “No fever was
entered,” so the diagnostic recognized the wrong sentence. The Lyme two-tier
algorithm likewise said a reactive first tier “calls for a second tier,” while
unchanged treatment-response prose happened to contain the word “measure.”

Both dynamic results now begin with the action they require: “Enter the
sedimentation rate” and “Enter the second-tier result.” This improves the reader
instruction and lets the shared `ASKING` vocabulary recognize the message that
actually owns the gap. The vocabulary itself is unchanged, avoiding broader
false exemptions.

A unit test runs the real probe and pins its queue at 0. Calculator and browser
tests pin both new messages. No decision rule, threshold, citation, or catalog
count changed.
