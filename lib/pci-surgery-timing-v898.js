// spec-v898: timing of elective noncardiac surgery after coronary stenting.
//
// Source:
//   Fleisher LA, Fleischmann KE, Auerbach AD, et al. 2014 ACC/AHA Guideline on Perioperative
//   Cardiovascular Evaluation and Management of Patients Undergoing Noncardiac Surgery.
//   Circulation. 2014;130(24):e278-e333.
//   Levine GN, Bates ER, Bittl JA, et al. 2016 ACC/AHA Guideline Focused Update on Duration of
//   Dual Antiplatelet Therapy in Patients With Coronary Artery Disease.
//   Circulation. 2016;134(10):e123-e155.
//
//   Balloon angioplasty, no stent   delay elective noncardiac surgery at least 14 days.
//   Bare-metal stent                delay at least 30 days.
//   Drug-eluting stent              delay at least 6 months (optimally); after 3 months surgery
//                                   may be considered if further delay risks more than the stent
//                                   thrombosis risk.
//
// THE STENT TYPE AND THE ELAPSED TIME TOGETHER DECIDE THIS, AND THAT IS WHY THIS TILE EXISTS. The
// intervals differ by a factor of twelve between a bare-metal and a drug-eluting stent, and the
// three-to-six month window for a drug-eluting stent is a judgment, not a green light.
//
// THE INTERVAL IS ABOUT WHEN TO OPERATE, NOT WHETHER TO STOP THE ANTIPLATELET. Where the surgery
// permits it, aspirin is continued through the perioperative period, and stopping both agents
// early is the exposure the interval exists to avoid.
//
// URGENT AND EMERGENCY SURGERY IS NOT DELAYED BY THIS. The intervals govern elective procedures;
// a time-sensitive operation is a different decision made with cardiology.
//
// Pure: no DOM, no clock, no network.

export const PCI_NOTE = 'The ACC and AHA guidelines set how long elective noncardiac surgery is delayed after coronary intervention: at least fourteen days after balloon angioplasty with no stent, at least thirty days after a bare-metal stent, and optimally at least six months after a drug-eluting stent, with surgery after three months considered when the risk of further delay outweighs the risk of stent thrombosis. Three things about this are worth stating plainly. The stent type and the elapsed time together decide it, and the intervals differ by a factor of twelve between a bare-metal and a drug-eluting stent, so the three-to-six month window for a drug-eluting stent is a judgment rather than a green light. The interval is about when to operate rather than whether to stop the antiplatelet: where the surgery permits it aspirin is continued through the perioperative period, and stopping both agents early is the exposure the interval exists to avoid. And urgent or emergency surgery is not delayed by any of this, since the intervals govern elective procedures and a time-sensitive operation is a different decision made with cardiology. It compares an elapsed interval against published minimums. It does not schedule an operation, and it does not decide antiplatelet therapy.';

export const PROCEDURES = [
  { value: 'des', minDays: 180, considerDays: 90, text: 'Drug-eluting stent' },
  { value: 'bms', minDays: 30, considerDays: null, text: 'Bare-metal stent' },
  { value: 'balloon', minDays: 14, considerDays: null, text: 'Balloon angioplasty, no stent' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const oneOf = (list, v, fallback) => (list.some((i) => i.value === v) ? v : fallback);

export function pciSurgeryTiming(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const which = oneOf(PROCEDURES, o.procedure, 'des');
  const days = num(o.daysSince);
  const urgent = on(o.urgentOrEmergency);

  if (days !== null && (days < 0 || days > 3650)) {
    return { valid: false, message: 'Enter the days since the coronary intervention, between 0 and 3650.' };
  }

  const row = PROCEDURES.find((p) => p.value === which);
  const met = days !== null && days >= row.minDays;
  const inConsiderWindow = !met && row.considerDays !== null && days !== null && days >= row.considerDays;
  const shortBy = days === null ? null : Math.max(0, row.minDays - days);

  const status = urgent
    ? 'urgent'
    : days === null
      ? 'no-interval'
      : met
        ? 'past-minimum'
        : inConsiderWindow
          ? 'consider-window'
          : 'before-minimum';

  const action = {
    urgent: `Urgent or emergency surgery is not delayed by these intervals. They govern elective procedures; a time-sensitive operation after ${row.text.toLowerCase()} is a different decision, made with cardiology.`,
    'no-interval': `${row.text} calls for a delay of at least ${row.minDays} days before elective noncardiac surgery${row.considerDays ? `, with surgery after ${row.considerDays} days considered when further delay carries more risk than the stent does` : ''}. Enter the days elapsed to compare.`,
    'past-minimum': `${days} days after ${row.text.toLowerCase()}, at or beyond the ${row.minDays}-day minimum for elective noncardiac surgery.`,
    'consider-window': `${days} days after ${row.text.toLowerCase()}: past ${row.considerDays} days but short of the ${row.minDays}-day optimum by ${shortBy}. This is the window in which surgery may be considered when the risk of further delay outweighs the risk of stent thrombosis. It is a judgment, not a green light.`,
    'before-minimum': `${days} days after ${row.text.toLowerCase()}, short of the ${row.minDays}-day minimum by ${shortBy}.`,
  }[status];

  // The reason the tile exists, on every result.
  const typeMattersNote = `The stent type changes this by a factor of twelve: ${PROCEDURES.find((p) => p.value === 'bms').minDays} days after a bare-metal stent against ${PROCEDURES.find((p) => p.value === 'des').minDays} after a drug-eluting one. Which was placed is the first thing to establish, and it is not always in the note that mentions the stent.`;

  const antiplateletNote = 'The interval is about when to operate, not whether to stop the antiplatelet. Where the surgery permits it, aspirin is continued through the perioperative period, and stopping both agents early is the exposure the interval exists to avoid.';

  const urgencyNote = urgent
    ? null
    : 'These intervals govern elective surgery. Urgent and emergency operations are not delayed by them.';

  const judgmentNote = status === 'consider-window'
    ? 'The three-to-six month window is a shared decision with cardiology and surgery, weighed case by case. Nothing in the number alone settles it.'
    : null;

  const scopeNote = 'This compares an elapsed interval against published minimums. It does not schedule an operation, and it does not decide antiplatelet therapy.';

  return {
    valid: true,
    procedure: which,
    minDays: row.minDays,
    considerDays: row.considerDays,
    daysSince: days,
    met,
    shortBy,
    status,
    action,
    typeMattersNote,
    antiplateletNote,
    urgencyNote,
    judgmentNote,
    scopeNote,
    abnormal: status === 'before-minimum' || status === 'consider-window',
    bandLabel: {
      urgent: 'Not governed by these intervals',
      'no-interval': `${row.minDays}-day minimum`,
      'past-minimum': 'Past the minimum',
      'consider-window': 'In the consider window',
      'before-minimum': `Short by ${shortBy} days`,
    }[status],
    band: action,
    detail: 'Balloon angioplasty without a stent: delay elective noncardiac surgery at least 14 days. Bare-metal stent: at least 30 days. Drug-eluting stent: optimally at least 6 months, with surgery after 3 months considered when the risk of further delay outweighs the risk of stent thrombosis. Urgent and emergency surgery is not delayed by these.',
    note: PCI_NOTE,
  };
}
