// spec-v854: reading a standardized 4-hour gastric emptying scintigraphy study.
//
// Source:
//   Abell TL, Camilleri M, Donohoe K, et al. Consensus recommendations for gastric emptying
//   scintigraphy: a joint report of the American Neurogastroenterology and Motility Society
//   and the Society of Nuclear Medicine. J Nucl Med Technol. 2008;36(1):44-54.
//
//   retention > 60 percent at 2 hours    delayed
//   retention > 10 percent at 4 hours    delayed
//   retention < 30 percent at 1 hour     rapid emptying
//   retention 30 to 90 percent at 1 hour normal at that point
//
//   Grade, from the 4-hour value:
//     <= 10 percent   normal
//     11-20           grade 1, mild
//     21-35           grade 2, moderate
//     36-50           grade 3, severe
//     > 50            grade 4, very severe
//
// A 2-HOUR STUDY IS NOT THIS TEST, AND THAT IS THE POINT OF THIS TILE. The grade is defined on
// the 4-hour value and on nothing else. A normal 2-hour retention does not exclude delayed
// emptying, and a study stopped at 2 hours cannot be graded at all.
//
// A HYPERGLYCEMIC STUDY MEASURED THE GLUCOSE. Blood glucose above 250 to 275 mg/dL delays
// emptying on its own, and the protocol asks for it below 200.
//
// A STUDY ON PROKINETICS OR OPIATES MEASURED THE DRUG. Both classes have to be off two days.
//
// RAPID EMPTYING IS A FINDING ON THIS STUDY, not the absence of one.
//
// Pure: no DOM, no clock, no network.

export const GES_NOTE = 'The standardized gastric emptying study (Abell TL, Camilleri M, Donohoe K, et al, Journal of Nuclear Medicine Technology 2008;36(1):44-54) images a low-fat egg-white meal at 1, 2 and 4 hours. Emptying is delayed if more than 60 percent of the meal is still there at 2 hours or more than 10 percent at 4 hours, and it is rapid if less than 30 percent is left at 1 hour, where 30 to 90 percent is the normal range. The grade comes from the 4-hour value and from nothing else: 11 to 20 percent is mild, 21 to 35 percent moderate, 36 to 50 percent severe and more than 50 percent very severe. That is why a study stopped at 2 hours is not this test. A normal 2-hour value does not rule delayed emptying out, and a study without a 4-hour image cannot be graded at all. Two conditions have to hold for the numbers to describe the stomach. Blood glucose above 250 to 275 mg/dL delays emptying by itself, and the protocol asks for it below 200, so a study run above that line is measuring the glucose. Drugs that speed emptying up and drugs that slow it down both have to be stopped two days beforehand, or the study is measuring the drug. Rapid emptying is a positive finding on the same report rather than the absence of the one being looked for. It reads a published protocol against values already measured. It does not by itself diagnose the disease, which needs symptoms as well, and it does not select treatment.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

function gradeFourHour(r) {
  if (r <= 10) return { grade: 0, label: 'normal' };
  if (r <= 20) return { grade: 1, label: 'grade 1, mild delay' };
  if (r <= 35) return { grade: 2, label: 'grade 2, moderate delay' };
  if (r <= 50) return { grade: 3, label: 'grade 3, severe delay' };
  return { grade: 4, label: 'grade 4, very severe delay' };
}

export function gastricEmptyingScintigraphy(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const h1 = num(o.retention1h);
  const h2 = num(o.retention2h);
  const h4 = num(o.retention4h);
  const glucose = num(o.glucose);
  const drugsHeld = truthy(o.drugsHeld);

  for (const [name, v] of [['1-hour', h1], ['2-hour', h2], ['4-hour', h4]]) {
    if (v !== null && (v < 0 || v > 100)) {
      return { valid: false, message: `The ${name} retention has to be a percentage between 0 and 100.` };
    }
  }
  if (glucose !== null && (glucose < 20 || glucose > 1500)) {
    return { valid: false, message: 'The blood glucose is outside a plausible range of 20 to 1500 mg/dL.' };
  }
  if (h1 === null && h2 === null && h4 === null) {
    return { valid: false, message: 'Enter the percentage of the meal still in the stomach at 1, 2 or 4 hours. The grade comes from the 4-hour value.' };
  }

  const graded = h4 !== null ? gradeFourHour(h4) : null;
  const delayedAt4 = h4 !== null && h4 > 10;
  const delayedAt2 = h2 !== null && h2 > 60;
  const rapid = h1 !== null && h1 < 30;
  const delayed = delayedAt4 || delayedAt2;

  let state;
  if (graded && graded.grade > 0) {
    state = `delayed emptying, ${graded.label}`;
  } else if (graded) {
    state = rapid ? 'rapid emptying, with a normal 4-hour value' : 'emptying within normal limits at 4 hours';
  } else if (delayedAt2) {
    state = 'delayed at 2 hours, ungraded';
  } else if (rapid) {
    state = 'rapid emptying, ungraded';
  } else {
    state = 'ungraded';
  }

  // The error this tile exists to prevent: reading a 2-hour study as the test.
  let incompleteNote = null;
  if (h4 === null) {
    incompleteNote = h2 !== null && h2 <= 60
      ? `A 2-hour retention of ${h2} percent is within normal limits at that point, and it does NOT exclude delayed emptying. The grade is defined on the 4-hour value and on nothing else, and this study has no 4-hour image, so it cannot be graded.`
      : 'The grade is defined on the 4-hour value and on nothing else. Without a 4-hour image this study cannot be graded.';
  }

  const fourHourNote = graded && graded.grade > 0
    ? `The 4-hour retention of ${h4} percent is what carries the grade: above 10 percent is delayed, 11 to 20 is mild, 21 to 35 moderate, 36 to 50 severe and above 50 very severe.`
    : null;

  const disagreeNote = h2 !== null && h4 !== null && h2 <= 60 && delayedAt4
    ? `The two time points disagree, and the 4-hour one decides. Retention was normal at 2 hours at ${h2} percent and delayed at 4 hours at ${h4} percent. Stopping this study at 2 hours would have called it normal.`
    : null;

  // The study conditions. A result obtained outside them describes something else.
  const glucoseNote = glucose !== null && glucose > 250
    ? `A blood glucose of ${glucose} mg/dL at the time of the study is above the 250 to 275 mg/dL line at which glucose delays emptying on its own; the protocol asks for it below 200. ${delayed ? 'This delay may be the glucose rather than the stomach.' : 'A normal result under those conditions is the more surprising one, and the study is still best repeated in range.'}`
    : null;

  const drugNote = !drugsHeld
    ? 'It is not recorded that the drugs which speed emptying up or slow it down were stopped for two days beforehand. If they were not, the study measured the drug.'
    : null;

  const rapidNote = rapid
    ? `Only ${h1} percent of the meal was left at 1 hour, below the normal range of 30 to 90 percent. That is rapid emptying, which is a finding on this study rather than the absence of the one being looked for.`
    : null;

  const scopeNote = 'This reads a published protocol against values already measured. It does not by itself diagnose the disease, which needs symptoms as well, and it does not select treatment.';

  return {
    valid: true,
    retention1h: h1,
    retention2h: h2,
    retention4h: h4,
    grade: graded ? graded.grade : null,
    gradeLabel: graded ? graded.label : null,
    delayed,
    delayedAt2,
    delayedAt4,
    rapid,
    gradeable: h4 !== null,
    state,
    incompleteNote,
    fourHourNote,
    disagreeNote,
    glucoseNote,
    drugNote,
    rapidNote,
    scopeNote,
    abnormal: delayed || rapid,
    bandLabel: graded ? graded.label : state,
    band: `Gastric emptying study — ${state}.`,
    detail: 'Emptying is delayed above 60 percent retention at 2 hours or above 10 percent at 4 hours, and rapid below 30 percent at 1 hour against a normal 1-hour range of 30 to 90 percent. The grade comes from the 4-hour value alone: 11 to 20 percent mild, 21 to 35 moderate, 36 to 50 severe, above 50 very severe.',
    note: GES_NOTE,
  };
}
