// spec-v660: PASS (Pheochromocytoma of the Adrenal gland Scaled Score).
//
// A histologic score for the potential for biologically aggressive behavior of adrenal
// pheochromocytoma; a companion to the built GAPP grade (gapp). Source:
//   Thompson LDR. Pheochromocytoma of the Adrenal gland Scaled Score (PASS) to separate
//   benign from malignant neoplasms: a clinicopathologic and immunophenotypic study of
//   100 cases. Am J Surg Pathol. 2002;26(5):551-566. PMID 11979086.
//
// Twelve histologic features, each present/absent, weighted 2 or 1, summed 0-20:
//   2 points each: large nests or diffuse growth; central or confluent tumor necrosis;
//     high cellularity; cellular monotony; tumor cell spindling; mitoses > 3 per 10 HPF;
//     atypical mitotic figures; extension into adipose tissue.
//   1 point each: vascular invasion; capsular invasion; profound nuclear pleomorphism;
//     nuclear hyperchromasia.
// PASS >= 4 indicates potential for biologically aggressive behavior; PASS < 4 behaves
// benignly.
//
// Reproducibility caveat: PASS has documented significant interobserver and intraobserver
// variation (Wu D, et al. Am J Surg Pathol 2009;33(4):599-608, PMID 19145205) and is best
// treated as a risk-stratification aid (a low score is reassuring) rather than a
// definitive malignancy call. Pure: no DOM, no clock, no network.

function toBool(v) {
  if (v === true) return true;
  if (v === false || v === '' || v === null || v === undefined) return false;
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === '1' || s === 'on';
}

export const PASS_FEATURES = [
  { key: 'largeNests', label: 'Large nests or diffuse growth', points: 2 },
  { key: 'necrosis', label: 'Central or confluent tumor necrosis', points: 2 },
  { key: 'highCellularity', label: 'High cellularity', points: 2 },
  { key: 'cellularMonotony', label: 'Cellular monotony', points: 2 },
  { key: 'spindling', label: 'Tumor cell spindling', points: 2 },
  { key: 'mitosesHigh', label: 'Mitotic figures > 3 per 10 HPF', points: 2 },
  { key: 'atypicalMitoses', label: 'Atypical mitotic figures', points: 2 },
  { key: 'adiposeExtension', label: 'Extension into adipose tissue', points: 2 },
  { key: 'vascularInvasion', label: 'Vascular invasion', points: 1 },
  { key: 'capsularInvasion', label: 'Capsular invasion', points: 1 },
  { key: 'pleomorphism', label: 'Profound nuclear pleomorphism', points: 1 },
  { key: 'hyperchromasia', label: 'Nuclear hyperchromasia', points: 1 },
];

export const PASS_MIN = 0;
export const PASS_MAX = 20;
export const PASS_CUTOFF = 4;

export const PASS_NOTE = 'PASS (Pheochromocytoma of the Adrenal gland Scaled Score; Thompson LDR, Am J Surg Pathol 2002;26(5):551-566). Twelve histologic features are each present or absent and weighted: 2 points each for large nests or diffuse growth, central or confluent tumor necrosis, high cellularity, cellular monotony, tumor cell spindling, mitoses greater than 3 per 10 high-power fields, atypical mitotic figures, and extension into adipose tissue; 1 point each for vascular invasion, capsular invasion, profound nuclear pleomorphism, and nuclear hyperchromasia. The sum is 0 to 20: a score of 4 or more indicates potential for biologically aggressive behavior, while a score under 4 behaves benignly. PASS has documented significant interobserver and intraobserver variation (Wu D, et al., Am J Surg Pathol 2009;33(4):599-608), so it is best used as a risk-stratification aid — a low score is reassuring — rather than a definitive malignancy call, and it is read with the full pathology report by the reporting pathologist.';

export function passPheo(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const present = [];
  for (const f of PASS_FEATURES) {
    if (toBool(o[f.key])) { total += f.points; present.push(`${f.label} (+${f.points})`); }
  }
  const aggressive = total >= PASS_CUTOFF;
  return {
    valid: true,
    total,
    min: PASS_MIN,
    max: PASS_MAX,
    cutoff: PASS_CUTOFF,
    aggressive,
    abnormal: aggressive,
    bandLabel: `PASS ${total} of ${PASS_MAX} — ${aggressive ? 'potential for aggressive behavior (>= 4)' : 'benign behavior (< 4)'}`,
    detail: present.length ? present.join('; ') + '.' : 'No histologic feature marked (PASS 0).',
    note: PASS_NOTE,
  };
}
