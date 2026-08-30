// spec-v905: the criteria for resolution of diabetic ketoacidosis.
//
// Source:
//   Kitabchi AE, Umpierrez GE, Miles JM, Fisher JN. Hyperglycemic crises in adult patients with
//   diabetes. Diabetes Care. 2009;32(7):1335-1343.
//
//   DKA is resolved when the glucose is below 200 mg/dL AND at least two of:
//     serum bicarbonate at or above 15 mEq/L,
//     venous pH above 7.30,
//     anion gap at or below 12 mEq/L.
//
// RESOLUTION IS NOT THE GLUCOSE, AND THAT IS WHY THIS TILE EXISTS. A normal glucose is one of
// four conditions, not the answer. Stopping the insulin infusion when the glucose falls is the
// commonest way rebound ketoacidosis happens, because the infusion is what is closing the gap and
// the glucose falls first.
//
// TWO OF THE THREE, NOT ALL THREE. A patient whose anion gap and bicarbonate have both come back
// still meets the definition while the venous pH lags -- which it does, because resuscitation
// fluid leaves a hyperchloremic acidosis behind. Note the converse: a CLOSED GAP ON ITS OWN is
// one of three and does NOT meet it.
//
// THE ANION GAP IS THE VARIABLE THAT TRACKS THE KETOSIS, not the urine or serum ketones. The
// nitroprusside reaction does not detect beta-hydroxybutyrate, which is the dominant ketone
// early, so measured ketones can appear to RISE as the patient improves and beta-hydroxybutyrate
// converts to acetoacetate.
//
// THE INFUSION IS NOT STOPPED AT RESOLUTION EITHER. Subcutaneous insulin is given and overlapped
// with the infusion, conventionally by one to two hours, before the infusion comes down.
//
// Pure: no DOM, no clock, no network.

export const DKA_NOTE = 'Diabetic ketoacidosis is resolved when the glucose is below 200 mg/dL together with at least two of a serum bicarbonate at or above 15 mEq/L, a venous pH above 7.30, and an anion gap at or below 12 mEq/L (Kitabchi and colleagues, Diabetes Care, 2009). Four things about the definition are worth stating plainly. Resolution is not the glucose: a normal glucose is one of four conditions and not the answer, and stopping the insulin infusion when the glucose falls is the commonest way rebound ketoacidosis happens, because the infusion is what is closing the gap and the glucose falls first. It is two of the three and not all three, so a patient whose anion gap and bicarbonate have both come back still meets the definition while the venous pH lags, which it does because resuscitation fluid leaves a hyperchloremic acidosis behind; the converse holds too, and a closed anion gap on its own is one of three and does not meet it. The anion gap is the variable that tracks the ketosis rather than the measured ketones, since the nitroprusside reaction does not detect beta-hydroxybutyrate, which is the dominant ketone early, so measured ketones can appear to rise as a patient improves. And the infusion is not stopped at resolution either: subcutaneous insulin is given and overlapped with the infusion, conventionally by one to two hours, before the infusion comes down. It compares values already measured against a published definition. It does not manage an infusion, and it does not decide when to transition.';

export const GLUCOSE_MAX = 200;
export const BICARB_MIN = 15;
export const PH_MIN = 7.30;
export const ANION_GAP_MAX = 12;
export const SECONDARY_NEEDED = 2;
export const OVERLAP_HOURS = '1 to 2';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const round1 = (n) => Math.round(n * 10) / 10;

export function dkaResolution(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const glucose = num(o.glucoseMgDl);
  const bicarb = num(o.bicarbonate);
  const ph = num(o.venousPh);
  const gap = num(o.anionGap);

  for (const [label, v, lo, hi] of [
    ['glucose in mg/dL', glucose, 0, 2000],
    ['serum bicarbonate in mEq/L', bicarb, 0, 60],
    ['venous pH', ph, 6.5, 8],
    ['anion gap in mEq/L', gap, 0, 60],
  ]) {
    if (v !== null && (v < lo || v > hi)) {
      return { valid: false, message: `Enter the ${label} between ${lo} and ${hi}.` };
    }
  }

  const glucoseMet = glucose !== null && glucose < GLUCOSE_MAX;
  const secondary = [
    { key: 'bicarbonate', met: bicarb !== null && bicarb >= BICARB_MIN, entered: bicarb !== null, text: `a bicarbonate of ${bicarb} mEq/L, at or above ${BICARB_MIN}` },
    { key: 'ph', met: ph !== null && ph > PH_MIN, entered: ph !== null, text: `a venous pH of ${ph}, above ${PH_MIN}` },
    { key: 'anionGap', met: gap !== null && gap <= ANION_GAP_MAX, entered: gap !== null, text: `an anion gap of ${gap} mEq/L, at or below ${ANION_GAP_MAX}` },
  ];
  const metCount = secondary.filter((s) => s.met).length;
  const enteredCount = secondary.filter((s) => s.entered).length;

  const resolved = glucoseMet && metCount >= SECONDARY_NEEDED;

  const action = glucose === null
    ? `Enter the glucose. Resolution needs it below ${GLUCOSE_MAX} mg/dL together with ${SECONDARY_NEEDED} of the other three.`
    : resolved
      ? `Resolved: a glucose of ${glucose} mg/dL below ${GLUCOSE_MAX}, with ${metCount} of the three met.`
      : !glucoseMet
        ? `Not resolved: the glucose of ${glucose} mg/dL is not below ${GLUCOSE_MAX}, and ${metCount} of the other three ${metCount === 1 ? 'is' : 'are'} met.`
        : `Not resolved: the glucose of ${glucose} mg/dL is below ${GLUCOSE_MAX}, but only ${metCount} of the three ${metCount === 1 ? 'is' : 'are'} met and ${SECONDARY_NEEDED} are needed.`;

  // The reason the tile exists, on every result.
  const notGlucoseNote = 'Resolution is not the glucose. A normal glucose is one of four conditions, and stopping the infusion when it falls is the commonest way rebound ketoacidosis happens: the infusion is what closes the gap, and the glucose falls first.';

  const twoOfThreeNote = `It is ${SECONDARY_NEEDED} of the three, not all three: a patient whose gap and bicarbonate have come back still qualifies while the venous pH lags, which it does because resuscitation fluid leaves a hyperchloremic acidosis behind. The converse holds too, and a closed gap on its own is one of three.`;

  const ketoneNote = 'The anion gap is what tracks the ketosis, not measured ketones. The nitroprusside reaction does not detect beta-hydroxybutyrate, the dominant ketone early, so measured ketones can appear to rise as a patient improves.';

  const overlapNote = resolved
    ? `Resolution is not the moment the infusion stops. Subcutaneous insulin is given and overlapped with the infusion, conventionally by ${OVERLAP_HOURS} hours, before the infusion comes down.`
    : null;

  const missingNote = enteredCount < 3
    ? `${3 - enteredCount} of the three secondary values ${3 - enteredCount === 1 ? 'is' : 'are'} not entered. A value that is missing is not a value that is met, and the anion gap in particular is the one to have.`
    : null;

  const metNote = metCount
    ? `Met: ${secondary.filter((s) => s.met).map((s) => s.text).join('; ')}.`
    : 'None of the three secondary criteria is met by what was entered.';

  const scopeNote = 'This compares values already measured against a published definition. It does not manage an infusion, and it does not decide when to transition.';

  return {
    valid: true,
    glucoseMgDl: glucose,
    bicarbonate: bicarb,
    venousPh: ph,
    anionGap: gap,
    glucoseMet,
    metCount,
    enteredCount,
    resolved,
    action,
    metNote,
    missingNote,
    notGlucoseNote,
    twoOfThreeNote,
    ketoneNote,
    overlapNote,
    scopeNote,
    abnormal: !resolved,
    bandLabel: glucose === null ? 'Glucose not entered' : resolved ? 'Resolved' : 'Not resolved',
    band: action,
    detail: `Resolution is a glucose below ${GLUCOSE_MAX} mg/dL together with at least ${SECONDARY_NEEDED} of: a bicarbonate at or above ${BICARB_MIN} mEq/L, a venous pH above ${PH_MIN}, and an anion gap at or below ${ANION_GAP_MAX} mEq/L. The anion gap is what tracks the ketosis, and subcutaneous insulin is overlapped with the infusion before it comes down.`,
    note: DKA_NOTE,
  };
}
