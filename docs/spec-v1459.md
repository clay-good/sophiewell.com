# spec-v1459 — acromegaly: a blank assay is not the conventional assay

Found while checking view templates after [spec-v1458](spec-v1458.md): the acromegaly tool's
"Nadir threshold" row interpolated a value that could only be non-null because of a default. The
default was the defect.

## What was wrong

A blank assay became `'conventional'`, the more lenient growth-hormone cutoff (1 microgram per
liter against 0.4 for an ultrasensitive assay). For a nadir between the two, that decided the
answer: an IGF-1 1.1 times the upper limit with a nadir of 0.6 read **"Discordant, further
evaluation needed"** instead of **"Consistent with acromegaly"**, and the note added "A
conventional assay is recorded", about an assay nobody had entered. A printed default presented as
an observation.

## The fix

With no assay entered, the reading is computed under both cutoffs. Where they agree (for example a
confirmatory IGF-1, or a nadir outside the 0.4-1 window) the answer stands, the note says "No assay
was entered; the reading here is the same under either cutoff", and the threshold is reported as
not entered. Where they differ, the tool asks: "Choose the assay: a nadir of 0.6 micrograms per
liter falls between the two cutoffs ... and here the assay decides the reading." The page's
"Nadir threshold" row reads "depends on the assay (not entered)" instead of a number.

The worked example (a confirmatory IGF-1 with no nadir) is unchanged.

## Tests

`test/unit/acromegaly-biochem.test.js`: the blank assay asked for when it decides the reading,
answered without claiming an assay when both cutoffs agree, and not needed for a nadir outside the
window.
