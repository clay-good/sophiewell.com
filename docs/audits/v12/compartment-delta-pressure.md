# v12 audit - compartment-delta-pressure

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: McQueen MM, Court-Brown CM. Compartment monitoring in tibial fractures: the pressure threshold for decompression. J Bone Joint Surg Br. 1996;78(1):99-104 (cross-verified against the McQueen 1996 PubMed abstract and StatPearls Acute Compartment Syndrome).

`lib/ortho-v145.js compartmentDeltaPressure()` consumes the diastolic blood
pressure and the measured intracompartmental pressure (mmHg) and computes the
signed delta pressure and the < 30 mmHg fasciotomy flag. Class A.

## Source-governance notes
- Delta pressure = diastolic BP - measured compartment pressure. The published
  fasciotomy threshold is delta < 30 mmHg ("drops to under 30" in the primary
  paper); StatPearls paraphrases as <= 30, but the strict < 30 from McQueen 1996
  is used (the delta = exactly 30 boundary is NOT below threshold).
- The differential threshold is more reliable than an absolute-pressure threshold;
  in the original series it missed no acute compartment syndrome. Surfaced in the
  interpretation as one data point alongside the serial clinical exam.
- The subtraction is guarded: both inputs are finite-checked and range-checked
  (0-250 mmHg); a blank or non-finite input returns valid:false, never NaN.

## Boundary worked examples added
- delta 25 (< 30) -> below threshold, abnormal.
- delta exactly 30 -> NOT below threshold (strict < 30).
- delta 31 -> above threshold; negative delta (compartment > diastolic) -> below.
- blank / NaN inputs -> invalid (no NaN leak); out-of-range pressures -> invalid.

## Edge-input handling notes
- Two number inputs read via optNum(); the compute rejects non-finite and
  out-of-range values before the subtraction. delta passes through num() + r1().
  No non-finite path. Explicitly fuzzed via the spec-v59 harness for the
  subtraction-overflow / NaN path.

## A11y / keyboard notes
- Two labeled number inputs (inputmode numeric); output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none
