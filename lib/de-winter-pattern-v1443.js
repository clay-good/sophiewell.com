// spec-v1443: de Winter pattern -- a STEMI equivalent of proximal LAD occlusion without ST elevation.
//
// Sources, read 2026-09-24:
//   de Winter RJ, Verouden NJ, Wellens HJ, Wilde AA. A new ECG sign of proximal LAD occlusion.
//     N Engl J Med 2008;359(19):2071-2073 (PubMed 18987380) -- the description.
//   The features, as stated consistently in open reports: upsloping ST depression greater than 1 mm
//     (1-3 mm) at the J point in the precordial leads, tall symmetrical T waves, no contiguous ST
//     elevation, often slight (0.5-1 mm) ST elevation in aVR (Cureus 2026, PMC13222104; JACC Case
//     Rep 2026, PMC13198112; Brazilian chest pain guideline 2025, PMC12981354). "classification as
//     a STEMI equivalent by both the 2022 ACC Expert Consensus Decision Pathway and the 2025 ACC/AHA
//     Acute Coronary Syndrome Guideline"; seen in about 2% of proximal LAD occlusions; "typically
//     evolving to overt ST-segment elevation within a median of 114 minutes" (PMC13222104).
//
// Every finding is required: a blank "contiguous ST elevation" read as "no" would call the pattern.
// Pure: no DOM, no clock, no network.

export const DEWINTER_YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

const FIELDS = [
  ['stDepression', 'upsloping ST depression of more than 1 mm at the J point in the precordial leads'],
  ['tallT', 'tall, symmetrical precordial T waves'],
  ['stElevation', 'contiguous precordial ST elevation'],
  ['avr', 'ST elevation in aVR'],
];

export function deWinterPattern(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = {};
  const missing = [];
  for (const [key, label] of FIELDS) {
    if (o[key] !== 'yes' && o[key] !== 'no') missing.push(label); else f[key] = o[key] === 'yes';
  }
  if (missing.length) {
    return { valid: false, message: `Answer every finding: ${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} still needed. A blank cannot count as absent.` };
  }
  const notes = [];
  let band;
  let present = false;
  if (f.stElevation) {
    band = 'Contiguous precordial ST elevation is present: read the tracing against STEMI criteria. The de Winter pattern is defined by its absence.';
  } else if (f.stDepression && f.tallT) {
    present = true;
    band = `de Winter pattern present${f.avr ? ', with ST elevation in aVR' : ''}: a STEMI equivalent of proximal LAD occlusion under the 2022 ACC decision pathway and the 2025 ACC/AHA guideline.`;
    notes.push('The pattern is often transient and typically evolves to overt ST elevation (median 114 minutes in one report); it is missed by automated interpretation because it does not meet traditional STEMI criteria.');
    if (!f.avr) notes.push('ST elevation in aVR is common with the pattern but not required.');
  } else {
    const absent = [];
    if (!f.stDepression) absent.push('upsloping J-point ST depression of more than 1 mm');
    if (!f.tallT) absent.push('tall, symmetrical T waves');
    band = `de Winter pattern not present: ${absent.join(' and ')} ${absent.length === 1 ? 'is' : 'are'} missing.`;
    notes.push('Not seeing the pattern does not rule out an acute coronary occlusion.');
  }
  return {
    valid: true,
    abnormal: present || f.stElevation,
    present,
    band,
    bandLabel: present ? 'de Winter pattern' : f.stElevation ? 'ST elevation: STEMI criteria' : 'Not present',
    notes,
    note: 'de Winter RJ et al, N Engl J Med 2008; features as stated in open case reports (2025-2026). A pattern-recognition aid for a tracing already in hand.',
  };
}
