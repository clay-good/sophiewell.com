// spec-v661: International Prognostic Score (IPS) for advanced Hodgkin lymphoma.
//
// A companion to the built lymphoma prognostic scores (flipi, ipi). Source:
//   Hasenclever D, Diehl V. A prognostic score for advanced Hodgkin's disease.
//   International Prognostic Factors Project on Advanced Hodgkin's Disease. N Engl J Med.
//   1998;339(21):1506-1514. PMID 9819449.
//
// Seven adverse prognostic factors, each 1 point, summed 0-7:
//   serum albumin < 4 g/dL; hemoglobin < 10.5 g/dL; male sex; age >= 45 years; Ann Arbor
//   stage IV; leukocytosis (WBC >= 15,000/mm3); lymphocytopenia (lymphocyte count
//   < 600/mm3 and/or < 8% of the white cell count). Higher score = lower 5-year freedom
//   from progression and overall survival.
//
// The lymphocytopenia factor fires on EITHER arm (absolute < 600 or percentage < 8) but
// scores at most 1 point. Pure: no DOM, no clock, no network.

function toBool(v) {
  if (v === true) return true;
  if (v === false || v === '' || v === null || v === undefined) return false;
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === '1' || s === 'on';
}
function optNum(raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  return Number.isFinite(n) ? n : NaN;
}

export const IPS_MIN = 0;
export const IPS_MAX = 7;

export const IPS_NOTE = 'International Prognostic Score for advanced Hodgkin lymphoma (Hasenclever D, Diehl V, N Engl J Med 1998;339(21):1506-1514). Seven adverse factors are each worth 1 point: serum albumin under 4 g/dL, hemoglobin under 10.5 g/dL, male sex, age 45 years or older, Ann Arbor stage IV, leukocytosis (white cell count 15,000/mm3 or more), and lymphocytopenia (lymphocyte count under 600/mm3 and/or under 8% of the white cell count). The sum is 0 to 7; a higher score predicts lower 5-year freedom from progression and overall survival. This estimates prognosis in advanced-stage disease and supports the treatment discussion; it is read with the full clinical picture and the treating team.';

export function ipsHodgkin(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const albumin = optNum(o.albumin);
  const hemoglobin = optNum(o.hemoglobin);
  const age = optNum(o.age);
  const wbc = optNum(o.wbc);
  const lymphAbs = optNum(o.lymphocyteCount);
  const lymphPct = optNum(o.lymphocytePct); // optional second arm

  const missing = [];
  if (albumin === null) missing.push('albumin');
  if (hemoglobin === null) missing.push('hemoglobin');
  if (age === null) missing.push('age');
  if (wbc === null) missing.push('wbc');
  if (lymphAbs === null) missing.push('lymphocyteCount');
  if (missing.length) {
    return { valid: false, code: 'MISSING_INPUT', field: missing[0], message: `Enter albumin, hemoglobin, age, WBC, and lymphocyte count. Still needed: ${missing.join(', ')}.` };
  }
  const bad = [];
  if (Number.isNaN(albumin) || albumin < 0) bad.push('albumin');
  if (Number.isNaN(hemoglobin) || hemoglobin < 0) bad.push('hemoglobin');
  if (Number.isNaN(age) || age < 0) bad.push('age');
  if (Number.isNaN(wbc) || wbc < 0) bad.push('wbc');
  if (Number.isNaN(lymphAbs) || lymphAbs < 0) bad.push('lymphocyteCount');
  if (lymphPct !== null && (Number.isNaN(lymphPct) || lymphPct < 0)) bad.push('lymphocytePct');
  if (bad.length) {
    return { valid: false, code: 'OUT_OF_RANGE', message: `Each value must be a non-negative number. Check: ${bad.join(', ')}.` };
  }

  const male = toBool(o.male);
  const stageIV = toBool(o.stageIV);
  const lymphocytopenia = lymphAbs < 600 || (lymphPct !== null && lymphPct < 8);

  const factors = [
    { key: 'albumin', label: 'albumin < 4 g/dL', met: albumin < 4 },
    { key: 'hemoglobin', label: 'hemoglobin < 10.5 g/dL', met: hemoglobin < 10.5 },
    { key: 'male', label: 'male sex', met: male },
    { key: 'age', label: 'age >= 45 years', met: age >= 45 },
    { key: 'stageIV', label: 'Ann Arbor stage IV', met: stageIV },
    { key: 'wbc', label: 'WBC >= 15,000/mm3', met: wbc >= 15000 },
    { key: 'lymphocytopenia', label: 'lymphocytopenia (< 600/mm3 and/or < 8%)', met: lymphocytopenia },
  ];
  const present = factors.filter((f) => f.met);
  const total = present.length;

  return {
    valid: true,
    total,
    min: IPS_MIN,
    max: IPS_MAX,
    abnormal: total >= 4,
    bandLabel: `IPS ${total} of ${IPS_MAX}`,
    detail: present.length ? present.map((f) => f.label).join('; ') + '.' : 'No adverse factor present (IPS 0).',
    note: IPS_NOTE,
  };
}
