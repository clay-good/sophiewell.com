// spec-v777: AWOL delirium risk-stratification score.
//
// Source:
//   Douglas VC, Hessler CS, Dhaliwal G, et al. The AWOL tool: derivation and
//   validation of a delirium prediction rule. J Hosp Med. 2013;8(9):493-499.
//   (PMID 23922253.)
//
// Four items, one point each (total 0-4), assessed at admission:
//   A  Age 80 years or older
//   W  cannot spell "world" backward correctly
//   O  not Oriented to city, state, county, hospital name and floor
//   L  nurse-rated iLlness severity moderately ill or worse
//
// Delirium developed during the hospital stay in the combined derivation and
// validation cohorts: score 0 in 2%, 1 in 4%, 2 in 14%, 3 in 20%, 4 in 64%.
//
// This predicts delirium that has not happened yet. It is not a delirium screen -
// a patient already delirious at admission was excluded from the derivation cohort.
//
// Pure: no DOM, no clock, no network.

export const AWOL_NOTE = 'The AWOL tool (Douglas VC, Hessler CS, Dhaliwal G, et al, J Hosp Med 2013;8(9):493-499) predicts, at admission, how likely a medical inpatient is to develop delirium during the stay. It adds one point each for age 80 or older, being unable to spell the word world backward, not being oriented to city, state, county, hospital name and floor, and a nurse rating of moderately ill or worse, for a total of 0 to 4. Delirium developed in about 2 percent of patients scoring 0, 4 percent at 1, 14 percent at 2, 20 percent at 3, and 64 percent at 4. It predicts delirium that has not happened yet, so it is not a delirium screen and does not replace one; it points toward prevention measures rather than ordering any of them.';

const ILLNESS = new Set(['not-ill', 'mildly-ill', 'moderately-ill', 'severely-ill', 'moribund']);
const ILLNESS_POINT = new Set(['moderately-ill', 'severely-ill', 'moribund']);
const INCIDENCE = ['about 2%', 'about 4%', 'about 14%', 'about 20%', 'about 64%'];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function awol(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const illness = o.illness === undefined || o.illness === null || o.illness === '' ? 'not-ill' : String(o.illness).trim();
  if (!ILLNESS.has(illness)) {
    return { valid: false, code: 'INVALID_INPUT', field: 'illness', message: 'Illness severity must be not-ill, mildly-ill, moderately-ill, severely-ill or moribund.', note: AWOL_NOTE };
  }

  let total = 0;
  const factors = [];
  if (truthy(o.age80)) { total += 1; factors.push('age 80 or older'); }
  if (truthy(o.spellFail)) { total += 1; factors.push('cannot spell world backward'); }
  if (truthy(o.disoriented)) { total += 1; factors.push('not oriented to place'); }
  if (ILLNESS_POINT.has(illness)) { total += 1; factors.push(`nurse-rated ${illness.replace('-', ' ')}`); }

  const incidence = INCIDENCE[total];
  return {
    valid: true,
    score: total,
    incidence,
    factors,
    // 2 of 4 is where observed delirium incidence steps up from 4% to 14%.
    abnormal: total >= 2,
    bandLabel: `AWOL ${total} of 4`,
    band: `AWOL ${total} of 4 — delirium developed in ${incidence} of patients at this score.`,
    detail: 'One point each for age 80 or older, failing to spell world backward, not being oriented to city, state, county, hospital name and floor, and a nurse rating of moderately ill or worse. Observed delirium during the stay: 0 in about 2%, 1 in about 4%, 2 in about 14%, 3 in about 20%, 4 in about 64%.',
    note: AWOL_NOTE,
  };
}
