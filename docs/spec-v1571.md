# spec-v1571 — Glenoid track (on-track / off-track)

ISIS scores instability risk from history and plain films; the glenoid track (Di Giacomo, Itoi and Burkhart 2014) measures bipolar bone loss: whether the Hill-Sachs lesion stays on the glenoid through the arc of motion.

## Inputs

Four required measurements in mm: glenoid width D, anterior glenoid defect d (0 if none), Hill-Sachs width, bone bridge to the rotator cuff footprint.

## What it does

Track = 0.83D - d; Hill-Sachs interval = width + bridge; distance to dislocation = track - interval. Off-track below 0 mm, near-track 0 to 10 mm, on-track above 10 mm, with the glenoid bone loss as a percentage. At exactly 0 mm the sources disagree (off-track at 0 or less vs only when the interval exceeds the track) and the answer says both.

## Sources

Di Giacomo G, Itoi E, Burkhart SS. Arthroscopy 2014;30(1):90-98. Formulas as stated in Int Orthop 2026 (PMC13525068) and JSES Int 2026 (PMC13156740); the near-track band in JSES Rev Rep Tech 2026 (PMC13054037); the strict reading in Diagnostics 2026 (PMC13464990).

## Tests

`test/unit/glenoid-track.test.js`: the worked example, the categories and their edges, and refusals.
