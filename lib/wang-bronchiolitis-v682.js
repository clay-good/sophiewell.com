// spec-v682: Wang Bronchiolitis Respiratory Score.
//
// A bedside severity score for infant bronchiolitis. Source:
//   Wang EE, Milner RA, Navas L, Maj H. Observer agreement for respiratory signs and
//   oximetry in infants hospitalized with lower respiratory infections. Am Rev Respir
//   Dis. 1992;145(1):106-109. (PMID 1731571.)
//
// Four signs, each 0-3, summed to a total of 0-12:
//   Respiratory rate (breaths/min): < 30 = 0, 30-45 = 1, 46-60 = 2, > 60 = 3
//   Wheezing: none = 0; terminal expiratory / only with stethoscope = 1;
//     entire expiration / audible without stethoscope = 2;
//     inspiration and expiration without stethoscope = 3
//   Retraction: none = 0; intercostal only = 1; tracheosternal = 2;
//     severe with nasal flaring = 3
//   General condition: normal = 0; irritable, lethargic, or poor feeding = 3
//     (this item takes only 0 or 3 — there is no 1 or 2)
//
// DISAGREEING BANDS (spec-v97): published severity cut-points differ between sources
// (e.g. mild <= 3 / moderate 4-8 / severe >= 9 vs mild < 5 / moderate 5-9 / severe >= 9),
// so this tile reports the deterministic total and names the commonly cited cut-points as
// ADVISORY only, without asserting one band set. Higher = more severe.
//
// Pure: no DOM, no clock, no network.

export const WANG_NOTE = 'Wang Bronchiolitis Respiratory Score (Wang EE, Milner RA, Navas L, Maj H, Am Rev Respir Dis 1992;145(1):106-109). A bedside severity score for infant bronchiolitis summing four signs, each 0 to 3, for a total of 0 to 12: respiratory rate (under 30 = 0, 30 to 45 = 1, 46 to 60 = 2, over 60 = 3), wheezing (none = 0, terminal expiratory or only with a stethoscope = 1, entire expiration or audible without a stethoscope = 2, inspiration and expiration without a stethoscope = 3), retraction (none = 0, intercostal only = 1, tracheosternal = 2, severe with nasal flaring = 3), and general condition (normal = 0, or irritable, lethargic, or poor feeding = 3, with no intermediate values). A higher total means more severe disease. Published severity cut-points DISAGREE between sources, so this tool reports the total and treats bands as advisory only; commonly cited groupings put roughly a total of 3 or below as mild, the middle as moderate, and 9 or above as severe. It is a severity aid, not a criterion for admission or discharge, and it supports rather than replaces clinical judgment.';

function num(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}
function opt(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 3) return null;
  return n;
}

function rrBand(rr) {
  if (rr < 30) return 0;
  if (rr <= 45) return 1;
  if (rr <= 60) return 2;
  return 3;
}

// Advisory only — sources disagree on cut-points; this is the most commonly cited set.
function advisoryBand(total) {
  if (total <= 3) return 'mild';
  if (total <= 8) return 'moderate';
  return 'severe';
}

export function wangBronchiolitis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const rr = num(o.respiratoryRate);
  if (!Number.isFinite(rr) || rr < 0 || rr > 200) {
    return { valid: false, code: 'MISSING_INPUT', field: 'respiratoryRate', message: 'Enter the respiratory rate in breaths per minute.', note: WANG_NOTE };
  }
  const wheeze = opt(o.wheezing);
  if (wheeze === null) {
    return { valid: false, code: 'MISSING_INPUT', field: 'wheezing', message: 'Select the wheezing grade (0-3).', note: WANG_NOTE };
  }
  const retraction = opt(o.retraction);
  if (retraction === null) {
    return { valid: false, code: 'MISSING_INPUT', field: 'retraction', message: 'Select the retraction grade (0-3).', note: WANG_NOTE };
  }
  // General condition takes only 0 or 3.
  const condRaw = opt(o.generalCondition);
  if (condRaw === null || !(condRaw === 0 || condRaw === 3)) {
    return { valid: false, code: 'MISSING_INPUT', field: 'generalCondition', message: 'Select the general condition (normal = 0, or distressed = 3).', note: WANG_NOTE };
  }

  const rrPts = rrBand(rr);
  const total = rrPts + wheeze + retraction + condRaw;
  const advisory = advisoryBand(total);

  return {
    valid: true,
    score: total,
    rrPoints: rrPts,
    advisoryBand: advisory,
    // No asserted clinical cutoff; higher = more severe. Flag the upper (severe) band.
    abnormal: total >= 9,
    bandLabel: `Wang ${total} of 12`,
    band: `Wang ${total} of 12 — higher is more severe (advisory band: ${advisory}).`,
    detail: `Respiratory rate ${rrPts}, wheezing ${wheeze}, retraction ${retraction}, general condition ${condRaw}. Published severity cut-points disagree, so the band is advisory only.`,
    note: WANG_NOTE,
  };
}
