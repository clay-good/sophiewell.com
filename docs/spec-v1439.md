# spec-v1439 — uterine activity: tachysystole and Montevideo units

Found by the gap finder: `tachysystole`, `montevideo` and `mvu` matched nothing. The catalog reads
the fetal heart rate half of the tracing (`nichd-fhr`) and had nothing for the contraction half.

## Sources, read 2026-09-24

- Frey HA et al, *J Matern Fetal Neonatal Med* 2014;27:1422 (open access, PMC4059778), restating
  ACOG: "Tachysystole, defined as more than five contractions in a 10-minute period, averaged over a
  30-minute window, is described as abnormal", and ACOG's caveat that "contraction frequency alone
  is a partial assessment of uterine activity". In 2,355 deliveries tachysystole was more common
  before an adverse neonatal outcome (21% vs 15%), but a model built on it predicted poorly
  (AUC 0.61).
- Spong CY et al, *Obstet Gynecol* 2012;120:1181-1193 (open access, PMC3548444): first-stage arrest
  requires "adequate contractions (eg >200 Montevideo units)".
- Montevideo units need an intrauterine pressure catheter; an external monitor cannot measure
  amplitude or tone (PMC13125349), and each contraction's active pressure is its peak minus the
  basal tone (PMC12999783).

## Behavior

- **Frequency, required:** the contractions counted in each of three 10-minute windows. The average
  is compared with 5: exactly 5 is not tachysystole, and one busy window does not make it.
- **Montevideo units, optional and all-or-nothing:** contractions in one 10-minute window, their
  average peak and the baseline tone. MVU = count x (average peak - tone), the same sum as adding
  each contraction's pressure above tone, compared with 200. A partial set is refused; a blank set
  is named ("No intrauterine pressure values were entered").
- Every answer repeats that frequency is a partial assessment to be read with the fetal heart rate
  tracing. The 0-20 count and 0-200 mmHg limits are transcription checks, not clinical thresholds.

## Tests

`test/unit/uterine-activity.test.js`: the >5 edge, averaging, MVU at and above 200, the
all-or-nothing rule, the caveat, and refusals.
