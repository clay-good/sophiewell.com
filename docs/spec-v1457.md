# spec-v1457 — Peguero-Lo Presti added to the LVH voltage criteria

`lvh-criteria` read Sokolow-Lyon and Cornell voltage. Peguero-Lo Presti (2017) is the newer
voltage criterion, proposed because the older two are insensitive, and it was absent from the
catalog (`peguero` matched nothing).

## Source

Peguero JG, Lo Presti S, et al, *J Am Coll Cardiol* 2017;69:1694-1703 (abstract, PubMed 28359515):
the deepest S wave in any single lead (SD) plus the S wave in V4 (SV4); it outperformed Cornell
voltage in sensitivity (62% vs 35%) with specificity of 90% or more for all criteria. The abstract
names the measurement but not the cutoffs; they are stated identically in eight open papers read
2026-09-25 (for example *Clin Cardiol* 2023, PMC10765998; *Rev Cardiovasc Med* 2022,
PMC11262329; *Sci Rep* 2023, PMC9924839): **>= 2.3 mV in women, >= 2.8 mV in men**, which this tool
applies as 23 and 28 mm at the standard 10 mm/mV its other two criteria already assume.

## Behavior

Two new optional inputs, the deepest S in any lead and the S in V4. The Peguero sum is read only
when both leads and the sex are entered; one lead alone adds "Enter ... as well to read
Peguero-Lo Presti", and a sum without a sex names both thresholds. A positive Peguero joins the
"Voltage criteria for LVH positive" line; the worked example and the Sokolow and Cornell behavior
are unchanged.

## A defect fixed on the way

With no sex entered, the note read "Cornell voltage: SV3 + RaVL > null mm (men)" and the page's row
label read "Cornell voltage (> null mm)". Both now name the two sex-specific thresholds instead.

## Tests

`test/unit/lvh-criteria.test.js` gains three: the inclusive sex-specific thresholds, waiting for
both leads and the sex, and a note that never says "null".
