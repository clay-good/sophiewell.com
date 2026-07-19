// spec-v452: the Brooker classification of heterotopic (ectopic) ossification about the hip, by the
// radiographic extent of ectopic bone — classes I / II / III / IV. It is the standard grading after hip
// arthroplasty and joins the orthopedic imaging tiles. "brooker" / "heterotopic ossification grade" routed to
// nothing.
//
// HIGH-STAKES: this reports the radiographic CLASS the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic team.
//
// CLASSES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Brooker AF, Bowerman JW, Robinson RA, Riley LH Jr. Ectopic ossification following total hip
//     replacement. Incidence and a method of classification. J Bone Joint Surg Am. 1973;55(8):1629-1632.
//   - Orthopedic / radiology references reproducing the same islands (I) / spurs-with->=1cm-gap (II) /
//     spurs-with-<1cm-gap (III) / ankylosis (IV) grouping.
//
// Classes (radiographic extent):
//   I   : islands of bone within the soft tissues about the hip.
//   II  : bone spurs from the pelvis or proximal femur, leaving at least 1 cm between opposing bone surfaces.
//   III : bone spurs from the pelvis or proximal femur, reducing the space between opposing surfaces to less
//         than 1 cm.
//   IV  : apparent bony ankylosis of the hip.

const CLASSES = {
  I: { cls: 'I', text: 'Brooker class I - islands of bone within the soft tissues about the hip.' },
  II: { cls: 'II', text: 'Brooker class II - bone spurs from the pelvis or proximal femur, leaving at least 1 cm between opposing bone surfaces.' },
  III: { cls: 'III', text: 'Brooker class III - bone spurs from the pelvis or proximal femur, reducing the space between opposing surfaces to less than 1 cm.' },
  IV: { cls: 'IV', text: 'Brooker class IV - apparent bony ankylosis of the hip.' },
};

const NOTE = 'The Brooker classification (Brooker 1973) grades heterotopic ossification about the hip by radiographic extent. I: islands of bone in soft tissue. II: spurs leaving at least 1 cm between opposing surfaces. III: spurs reducing the gap to less than 1 cm. IV: apparent bony ankylosis. This reports the class the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   cls: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4).
export function brooker(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.cls == null ? '' : o.cls).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const c = CLASSES[key];
  if (!c) {
    return { valid: false, message: 'Select the Brooker class (I, II, III, or IV).' };
  }
  return {
    valid: true,
    cls: c.cls,
    bandLabel: `Brooker class ${c.cls}`,
    band: c.text,
    note: NOTE,
  };
}
