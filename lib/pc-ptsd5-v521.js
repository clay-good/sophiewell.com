// spec-v521: the Primary Care PTSD Screen for DSM-5 (PC-PTSD-5). Zero-hit before this tile: "pc-ptsd",
// "primary care ptsd", "ptsd screen", and "prins" across corpus.json, app.js, and lib/meta.js, with no
// test/unit file.
//
// NOT A DUPLICATE OF THE EXISTING pcl-5 TILE -- a different AXIS of the same condition. The PCL-5 is a
// 20-item SEVERITY measure, scored 0-80, used to quantify and follow symptoms in someone already identified.
// The PC-PTSD-5 is a five-item yes/no SCREEN, scored 0-5, used in a primary-care visit to decide whether to
// ask further. Reaching for the 20-item severity measure as a screen, or reading a five-item screen as a
// severity score, are both real errors, so each tile names the other and says which question it answers.
//
// THE TRAUMA-EXPOSURE GATE IS PART OF THE INSTRUMENT, NOT A PREAMBLE. The screen opens by asking whether the
// person has ever experienced a traumatic event. If the answer is no, the source is explicit: the PC-PTSD-5
// is COMPLETE WITH A SCORE OF 0, and the five symptom items are never asked -- they all refer to "the
// event(s)" and are unanswerable without one. This tile models that gate rather than dropping it: answering
// "no" returns a finished, valid, negative result of 0 out of 5, and the five items are not required.
// Calculators that drop the gate invite a clinician to score five questions that presuppose a trauma the
// patient has not reported.
//
// TWO PUBLISHED CUT POINTS, AND THE TILE REFUSES TO SILENTLY PICK ONE. The source recommends 3 as OPTIMALLY
// SENSITIVE for probable PTSD and 4 as OPTIMALLY EFFICIENT. They answer different questions -- "do not miss
// people" versus "balance missing people against over-referring" -- and the right one depends on what
// happens next in a given setting. The result therefore reports the total against BOTH, labeled, instead of
// emitting a bare positive/negative against an unstated threshold.
//
// HIGH-STAKES: this is a screen, not a diagnosis. A positive screen does not establish PTSD and a negative
// screen does not exclude it; either way the next step is a clinical assessment, not a conclusion
// (spec-v11 section 5.3). It does not measure severity, does not track response to treatment, and is not an
// indication to start or change any medication or therapy. It also does not assess suicide risk, which is a
// separate question that a positive screen should prompt rather than answer. The clinical assessment stays
// with the clinician.
//
// ITEMS, GATE, AND CUT POINTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Prins A, Bovin MJ, Smolenski DJ, et al. The Primary Care PTSD Screen for DSM-5 (PC-PTSD-5):
//     Development and Evaluation Within a Veteran Primary Care Sample. J Gen Intern Med. 2016;31(10):
//     1206-1211.
//   - Trauma-assessment references reproducing the same five items, the same trauma-exposure gate with its
//     explicit "complete with a score of 0" instruction, and both the optimally-sensitive cut of 3 and the
//     optimally-efficient cut of 4.

export const PC_PTSD5_ITEMS = [
  { key: 'q1', text: 'Had nightmares about the event(s) or thought about the event(s) when you did not want to?' },
  { key: 'q2', text: 'Tried hard not to think about the event(s) or went out of your way to avoid situations that reminded you of the event(s)?' },
  { key: 'q3', text: 'Been constantly on guard, watchful, or easily startled?' },
  { key: 'q4', text: 'Felt numb or detached from people, activities, or your surroundings?' },
  { key: 'q5', text: 'Felt guilty or unable to stop blaming yourself or others for the event(s) or any problems the event(s) may have caused?' },
];

const MAX_TOTAL = 5;
const SENSITIVE_CUT = 3;
const EFFICIENT_CUT = 4;

const NOTE = 'The Primary Care PTSD Screen for DSM-5 (Prins and colleagues 2016) asks first whether the person has ever experienced a traumatic event. If they have not, the screen is complete with a score of 0 and the five symptom items are not asked, because every one of them refers to the event. If they have, five yes-or-no questions about the past month each score 1, for a total of 0 to 5. The source recommends two cut points for different purposes: 3 or more is optimally sensitive for probable PTSD, and 4 or more is optimally efficient. They answer different questions, so this tile reports the total against both rather than picking one silently. This is a screen, not a diagnosis. A positive screen does not establish PTSD and a negative screen does not exclude it; either way the next step is a clinical assessment. It does not measure severity and does not track response to treatment, which is what the longer PCL-5 is for, and it does not assess suicide risk, which a positive screen should prompt rather than answer.';

function readYesNo(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return 1;
  if (v === false || v === 0) return 0;
  const s = String(v).trim().toLowerCase();
  if (s === 'yes' || s === 'y' || s === '1' || s === 'true') return 1;
  if (s === 'no' || s === 'n' || s === '0' || s === 'false') return 0;
  return NaN;
}

function result(total, gated) {
  const meetsSensitive = total >= SENSITIVE_CUT;
  const meetsEfficient = total >= EFFICIENT_CUT;

  let reading;
  if (gated) {
    reading = 'No traumatic event reported, so the screen is complete with a score of 0 and the five symptom items are not asked.';
  } else if (meetsEfficient) {
    reading = 'At or above both published cut points: 3 or more (optimally sensitive) and 4 or more (optimally efficient).';
  } else if (meetsSensitive) {
    reading = 'At or above the optimally sensitive cut of 3, but below the optimally efficient cut of 4. The two cut points disagree here, and which one applies depends on the setting.';
  } else {
    reading = 'Below both published cut points, the optimally sensitive 3 and the optimally efficient 4.';
  }

  return {
    valid: true,
    total,
    gated,
    meetsSensitive,
    meetsEfficient,
    bandLabel: `PC-PTSD-5 ${total} of ${MAX_TOTAL}`,
    band: `${total} of ${MAX_TOTAL}. ${reading} A screen is not a diagnosis; the next step is a clinical assessment either way.`,
    note: NOTE,
  };
}

// input:
//   trauma: yes/no -- has the person ever experienced a traumatic event. Required.
//   q1 .. q5: yes/no. Required ONLY when trauma is yes; ignored when trauma is no.
export function pcPtsd5(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const trauma = readYesNo(o.trauma);
  if (trauma === null) {
    return { valid: false, message: 'Answer the trauma-exposure question first. If no traumatic event is reported, the screen is complete with a score of 0.' };
  }
  if (Number.isNaN(trauma)) {
    return { valid: false, message: 'The trauma-exposure answer must be yes or no.' };
  }

  if (trauma === 0) return result(0, true);

  const answers = PC_PTSD5_ITEMS.map((item) => readYesNo(o[item.key]));
  if (answers.some((n) => n === null)) {
    return { valid: false, message: 'Answer all five symptom items yes or no.' };
  }
  if (answers.some((n) => Number.isNaN(n))) {
    return { valid: false, message: 'Each symptom item must be yes or no.' };
  }

  return result(answers.reduce((a, b) => a + b, 0), false);
}
