// spec-v4 §5 utility 112: COBRA timeline.
//
// Pure date math over a qualifying event. The renderer in views/group-c.js
// renders the absolute milestones; this module produces them.

export const COBRA_MAX_MONTHS = {
  // 29 USC 1162: standard maximum is 18 months.
  'job-loss-voluntary':       18,
  'job-loss-involuntary':     18,
  'reduction-in-hours':       18,
  // 29 months: disability extension during the first 60 days of COBRA.
  'disability-extension':     29,
  // 36 months: divorce, death, Medicare entitlement of covered employee,
  // loss of dependent-child status.
  'divorce':                  36,
  'death-of-employee':        36,
  'medicare-entitlement':     36,
  'loss-of-dependent-status': 36,
};

function parseISO(d) {
  if (d instanceof Date) return new Date(d.getTime());
  if (typeof d !== 'string') throw new TypeError('date must be ISO string or Date');
  // YYYY-MM-DD; treat as a wall-clock date (no timezone arithmetic).
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) throw new RangeError('date must be YYYY-MM-DD');
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function toISO(d) {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}

export function addDays(date, days) {
  const d = parseISO(date);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function addMonths(date, months) {
  const d = parseISO(date);
  // Standard "same day next month, capped to last day of target month".
  const targetMonth = d.getMonth() + months;
  const targetYear = d.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const day = Math.min(d.getDate(), lastDay);
  return toISO(new Date(targetYear, normalizedMonth, day));
}

export function cobraTimeline({ qualifyingEventDate, qualifyingEventType }) {
  if (!Object.hasOwn(COBRA_MAX_MONTHS, qualifyingEventType)) {
    throw new RangeError(`unknown qualifying event type: ${qualifyingEventType}`);
  }
  const qe = parseISO(qualifyingEventDate); // throws if malformed
  const months = COBRA_MAX_MONTHS[qualifyingEventType];
  const electionDeadline = addDays(qualifyingEventDate, 60);
  const firstPaymentDeadline = addDays(electionDeadline, 45);
  const coverageEndIfElected = addMonths(qualifyingEventDate, months);
  return {
    qualifyingEventDate: toISO(qe),
    qualifyingEventType,
    maxMonths: months,
    electionDeadline,           // 60 days after QE notice
    firstPaymentDeadline,       // 45 days after election
    coverageEndIfElected,       // QE + maxMonths
  };
}
