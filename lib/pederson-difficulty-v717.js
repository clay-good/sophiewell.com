// spec-v717: Pederson Difficulty Index for impacted mandibular third-molar extraction.
//
// Predicts the surgical difficulty of removing an impacted lower wisdom tooth from three
// radiographic parameters. Source:
//   Pederson GW. Oral Surgery. Philadelphia: WB Saunders; 1988 (the Pederson difficulty
//   index, combining Winter's angulation and Pell & Gregory depth/ramus classifications).
//
// Three parameters summed (range 3-10):
//   Angulation (Winter):  mesioangular 1 / horizontal 2 / vertical 3 / distoangular 4
//   Depth (Pell & Gregory): Level A (high) 1 / Level B (mid) 2 / Level C (deep) 3
//   Ramus relationship / space (Pell & Gregory): Class I (sufficient) 1 / Class II (reduced) 2 /
//     Class III (none) 3
//
// Difficulty bands: 3-4 slightly/minimally difficult; 5-6 moderately difficult; 7-10 very
// difficult. (Some sources overlap the moderate/very-difficult boundary at 7; the
// non-overlapping cut above is used.)
//
// Pure: no DOM, no clock, no network.

export const PEDERSON_NOTE = 'Pederson Difficulty Index for impacted mandibular third-molar extraction (Pederson GW, Oral Surgery, WB Saunders 1988), which predicts surgical difficulty from three radiographic parameters combining Winter angulation and Pell and Gregory depth and ramus classifications. Angulation scores mesioangular 1, horizontal 2, vertical 3, and distoangular 4; depth scores Level A (high) 1, Level B (mid) 2, and Level C (deep) 3; and the ramus relationship or available space scores Class I (sufficient) 1, Class II (reduced) 2, and Class III (none) 3. The three are summed to a total of 3 to 10, where 3 to 4 is slightly or minimally difficult, 5 to 6 is moderately difficult, and 7 to 10 is very difficult (some sources overlap the moderate and very-difficult boundary at 7; a non-overlapping cut is used here). It predicts difficulty to guide planning and does not by itself dictate technique or referral; it supports rather than replaces the surgical assessment and clinical judgment.';

function optIn(v, allowed) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || !allowed.includes(n)) return null;
  return n;
}

const ITEMS = [
  { key: 'angulation', allowed: [1, 2, 3, 4] },
  { key: 'depth', allowed: [1, 2, 3] },
  { key: 'ramus', allowed: [1, 2, 3] },
];

function band(total) {
  if (total <= 4) return { tier: 'slight', label: 'slightly / minimally difficult' };
  if (total <= 6) return { tier: 'moderate', label: 'moderately difficult' };
  return { tier: 'very-difficult', label: 'very difficult' };
}

export function pedersonDifficulty(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (const it of ITEMS) {
    const v = optIn(o[it.key], it.allowed);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: it.key, message: `Select a valid value for ${it.key}.`, note: PEDERSON_NOTE };
    }
    total += v;
  }

  const b = band(total);
  return {
    valid: true,
    score: total,
    tier: b.tier,
    abnormal: total >= 7,
    bandLabel: `Pederson ${total} of 10`,
    band: `Pederson ${total} of 10 — ${b.label} extraction.`,
    detail: 'Angulation (mesio 1 / horizontal 2 / vertical 3 / disto 4) + depth (A 1 / B 2 / C 3) + ramus (I 1 / II 2 / III 3). Bands: 3-4 slight, 5-6 moderate, 7-10 very difficult.',
    note: PEDERSON_NOTE,
  };
}
