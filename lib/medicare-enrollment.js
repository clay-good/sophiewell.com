// spec-v4 §5 utility 113: Medicare enrollment period checker.
//
// Pure date math. Inputs: DOB and a first-eligibility scenario.
// Output: IEP, GEP, applicable SEPs, and the Part D LEP framing.

function parseISO(d) {
  if (d instanceof Date) return new Date(d.getTime());
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d));
  if (!m) throw new RangeError('date must be YYYY-MM-DD');
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function toISO(d) {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}

function firstOfMonth(year, monthZeroBased) {
  return new Date(year, monthZeroBased, 1);
}

function lastOfMonth(year, monthZeroBased) {
  return new Date(year, monthZeroBased + 1, 0);
}

// Initial Enrollment Period: 7 months around the 65th birthday month.
// Begins first day of the third month before the birthday month; ends last day
// of the third month after the birthday month.
export function initialEnrollmentPeriod(dob) {
  const d = parseISO(dob);
  const sixtyFifthYear = d.getFullYear() + 65;
  const month = d.getMonth();
  const start = firstOfMonth(sixtyFifthYear, month - 3);
  const end = lastOfMonth(sixtyFifthYear, month + 3);
  return { start: toISO(start), end: toISO(end), birthdayMonth: toISO(new Date(sixtyFifthYear, month, d.getDate())) };
}

// General Enrollment Period: January 1 - March 31 every year.
export function generalEnrollmentPeriod(year) {
  if (!Number.isInteger(year)) throw new TypeError('year must be an integer');
  return { start: toISO(new Date(year, 0, 1)), end: toISO(new Date(year, 2, 31)) };
}

// SEPs by scenario.
const SEP = {
  'losing-employer-coverage': { lengthMonths: 8, start: 'day after employer coverage ends',
    note: 'Part B SEP runs for 8 months after the month employment or group coverage ends, whichever is later.' },
  'esrd':                     { lengthMonths: null, start: '3 months before dialysis begins',
    note: 'ESRD eligibility begins the 4th month of dialysis or earlier with home-dialysis training.' },
  'disability-24mo':          { lengthMonths: null, start: '24th month of SSDI',
    note: 'Automatic Medicare entitlement after 24 months of SSDI cash benefits (no waiting period for ALS or ESRD).' },
};

export function medicareEnrollment({ dob, scenario, currentDate }) {
  const cur = currentDate ? parseISO(currentDate) : new Date();
  const iep = initialEnrollmentPeriod(dob);
  const gep = generalEnrollmentPeriod(cur.getFullYear());
  const sep = SEP[scenario] || null;
  const partDLEP =
    'Part D Late Enrollment Penalty: 1% of the national base beneficiary premium per uncovered month, ' +
    'added to the Part D premium for as long as you have Part D.';
  return { iep, gep, sep, partDLEP };
}

export const SEP_SCENARIOS = SEP;
