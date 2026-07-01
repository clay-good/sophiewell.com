// spec-v191: four deterministic dermatology / urology severity & staging
// instruments. Every id was verified absent by a direct scan of app.js first
// (spec-v85 §6.2). None duplicates a live tile; v191 runs no AI and makes no
// runtime network call. These score, stage, and classify — they are not a
// biopsy, surgery, or prognosis order (spec-v11 §5.3).
//
//   scorten          - SCORTEN toxic-epidermal-necrolysis severity (0-7)
//   melanomaTStage   - AJCC 8th-edition melanoma T category (T element only)
//   piRads           - PI-RADS v2.1 prostate-MRI assessment category (1-5)
//   guysStoneScore   - Guy's stone score (PCNL complexity Grade I-IV)
//
// CRITERIA / STAGE BOUNDARIES / BANDS RE-FETCHED, NEVER RECALLED (spec-v97),
// each cross-verified across >= 2 independent sources at implementation:
//   - scorten (Bastuji-Garin S, et al, J Invest Dermatol 2000;115(2):149-153):
//     seven criteria each +1 — age >= 40, heart rate > 120, malignancy present,
//     body-surface-area detached > 10%, BUN > 28 mg/dL (urea > 10 mmol/L),
//     bicarbonate < 20 mEq/L, glucose > 252 mg/dL (> 14 mmol/L). Mortality by
//     score: 0-1 = 3.2%, 2 = 12.1%, 3 = 35.3%, 4 = 58.3%, >= 5 = 90%.
//   - melanomaTStage (Gershenwald JE, et al, CA Cancer J Clin 2017;67(6):472-492;
//     AJCC 8th ed Table 1): T1 <= 1.0 mm [T1a < 0.8 mm no ulceration; T1b < 0.8
//     mm with ulceration OR 0.8-1.0 mm any ulceration]; T2 > 1.0-2.0; T3 > 2.0-4.0;
//     T4 > 4.0; a = no ulceration, b = with ulceration for T2/T3/T4. Low bounds
//     strict-greater-than, high bounds inclusive; exactly 1.0 mm is T1.
//   - piRads (Turkbey B, et al, Eur Urol 2019;76(3):340-351; PI-RADS v2.1):
//     peripheral zone DWI is dominant, DWI 3 upgraded to category 4 if DCE
//     positive; transition zone T2W is dominant, T2W 2 upgraded to 3 if DWI >= 4,
//     T2W 3 upgraded to 4 only if DWI = 5.
//   - guysStoneScore (Thomas K, et al, Urology 2011;78(2):277-281): Grade I
//     (solitary mid/lower-pole or pelvic stone, simple anatomy; SFR ~81%),
//     Grade II (solitary upper-pole stone, or multiple stones with simple anatomy,
//     or a solitary stone with abnormal anatomy; ~72%), Grade III (multiple stones
//     with abnormal anatomy, or a calyceal-diverticulum stone, or a partial
//     staghorn; ~35%), Grade IV (staghorn calculus, or any stone with spina bifida
//     / spinal injury; ~29%).

import { r1 } from './num.js';

function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}
function nonneg(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > max) return null;
  return n;
}
function truthy(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on' || v === 'yes'; }
function intIn(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Math.trunc(Number(v));
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- 2.1 SCORTEN ------------------------------------------------------------
const SCORTEN_NOTE = 'SCORTEN severity-of-illness score for toxic epidermal necrolysis (Bastuji-Garin S, et al, J Invest Dermatol 2000;115(2):149-153). Seven criteria, each 1 point: age ≥ 40, heart rate > 120 bpm, associated malignancy, body surface area detached > 10%, BUN > 28 mg/dL (urea > 10 mmol/L), serum bicarbonate < 20 mEq/L, serum glucose > 252 mg/dL (> 14 mmol/L). Published in-hospital mortality by score: 0–1 ≈ 3.2%, 2 ≈ 12.1%, 3 ≈ 35.3%, 4 ≈ 58.3%, ≥ 5 ≈ 90%. Best calculated on day 1 and again on day 3. A severity score for the team, not a prognosis order.';
const SCORTEN_MORTALITY = ['3.2%', '3.2%', '12.1%', '35.3%', '58.3%', '90%', '90%', '90%'];

export function scorten(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = nonneg(o.age, 130);
  const hr = pos(o.heartRate, 400);
  const bsa = nonneg(o.bsaDetached, 100);
  const bun = pos(o.bun, 400);
  const bicarb = pos(o.bicarbonate, 80);
  const glucose = pos(o.glucose, 2000);
  const malignancy = truthy(o.malignancy);
  // Every lab that is entered must be valid; a filled-but-invalid field blocks.
  const provided = [
    ['age', o.age, age], ['heartRate', o.heartRate, hr], ['bsaDetached', o.bsaDetached, bsa],
    ['bun', o.bun, bun], ['bicarbonate', o.bicarbonate, bicarb], ['glucose', o.glucose, glucose],
  ];
  for (const [, raw, parsed] of provided) {
    if (raw !== null && raw !== undefined && raw !== '' && parsed === null) {
      return { valid: false, note: SCORTEN_NOTE };
    }
  }
  const hits = [];
  if (age !== null && age >= 40) hits.push('age ≥ 40');
  if (hr !== null && hr > 120) hits.push('heart rate > 120');
  if (malignancy) hits.push('malignancy');
  if (bsa !== null && bsa > 10) hits.push('BSA detached > 10%');
  if (bun !== null && bun > 28) hits.push('BUN > 28 mg/dL');
  if (bicarb !== null && bicarb < 20) hits.push('bicarbonate < 20 mEq/L');
  if (glucose !== null && glucose > 252) hits.push('glucose > 252 mg/dL');
  const score = hits.length;
  const mortality = SCORTEN_MORTALITY[score];
  const bandName = score <= 1 ? '0–1' : score >= 5 ? '≥ 5' : `${score}`;
  return {
    valid: true,
    score,
    mortality,
    abnormal: score >= 3,
    bandLabel: `SCORTEN ${score}`,
    band: `SCORTEN ${score} — predicted in-hospital mortality ≈ ${mortality} (band ${bandName}).`,
    detail: hits.length ? `Criteria met: ${hits.join(', ')}.` : 'No criteria met; enter age, vitals, and labs. Best scored on day 1 and again on day 3.',
    note: SCORTEN_NOTE,
  };
}

// --- 2.2 AJCC melanoma T category -------------------------------------------
const MELANOMA_NOTE = 'AJCC 8th-edition melanoma T category (Gershenwald JE, et al, CA Cancer J Clin 2017;67(6):472-492). From Breslow thickness and ulceration: T1 ≤ 1.0 mm (T1a < 0.8 mm without ulceration; T1b < 0.8 mm with ulceration, or 0.8–1.0 mm with or without ulceration), T2 > 1.0–2.0, T3 > 2.0–4.0, T4 > 4.0, with suffix a = no ulceration, b = with ulceration for T2/T3/T4. This is the T element only, not the full TNM stage. A staging aid, not a prognosis order.';

export function melanomaTStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mm = pos(o.breslow, 100);
  if (mm === null) return { valid: false, note: MELANOMA_NOTE };
  const ulcer = truthy(o.ulceration);
  const suffix = ulcer ? 'b' : 'a';
  let t;
  if (mm <= 1.0) {
    // T1: the a/b split turns on 0.8 mm and ulceration, not the generic suffix.
    if (mm < 0.8 && !ulcer) t = 'T1a';
    else t = 'T1b'; // < 0.8 with ulceration, or 0.8-1.0 with or without ulceration
  } else if (mm <= 2.0) t = `T2${suffix}`;
  else if (mm <= 4.0) t = `T3${suffix}`;
  else t = `T4${suffix}`;
  const thick = r1(mm);
  return {
    valid: true,
    tCategory: t,
    breslow: thick,
    abnormal: !t.startsWith('T1'),
    bandLabel: t,
    band: `${t} — Breslow ${thick} mm, ${ulcer ? 'with' : 'no'} ulceration.`,
    detail: `The T element only (AJCC 8th ed). Nodal (N) and metastatic (M) categories are staged separately.`,
    note: MELANOMA_NOTE,
  };
}

// --- 2.3 PI-RADS v2.1 -------------------------------------------------------
const PIRADS_NOTE = 'PI-RADS v2.1 prostate-MRI assessment category (Turkbey B, et al, Eur Urol 2019;76(3):340-351). Peripheral zone: DWI/ADC is the dominant sequence; a DWI score of 3 is upgraded to category 4 when DCE is positive. Transition zone: T2W is dominant; a T2W score of 2 is upgraded to category 3 when DWI ≥ 4, and a T2W score of 3 is upgraded to category 4 only when DWI = 5. A higher category carries a higher likelihood of clinically significant cancer (1 very low → 5 very high); biopsy is usually considered from category ≥ 3, more strongly ≥ 4. A reporting category, not a biopsy order.';
const PIRADS_LIKELIHOOD = { 1: 'very low', 2: 'low', 3: 'intermediate (equivocal)', 4: 'high', 5: 'very high' };

export function piRads(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const zone = o.zone === 'transition' ? 'transition' : o.zone === 'peripheral' ? 'peripheral' : null;
  if (!zone) return { valid: false, note: PIRADS_NOTE };
  let category;
  let driver;
  if (zone === 'peripheral') {
    const dwi = intIn(o.dwi, 1, 5);
    if (dwi === null) return { valid: false, note: PIRADS_NOTE };
    const dcePos = o.dce === 'positive' || truthy(o.dce);
    category = dwi;
    driver = `DWI/ADC ${dwi}`;
    if (dwi === 3 && dcePos) { category = 4; driver = 'DWI/ADC 3 upgraded by positive DCE'; }
  } else {
    const t2w = intIn(o.t2w, 1, 5);
    if (t2w === null) return { valid: false, note: PIRADS_NOTE };
    const dwi = intIn(o.dwi, 1, 5);
    category = t2w;
    driver = `T2W ${t2w}`;
    if (t2w === 2 && dwi !== null && dwi >= 4) { category = 3; driver = 'T2W 2 upgraded by DWI ≥ 4'; }
    else if (t2w === 3 && dwi === 5) { category = 4; driver = 'T2W 3 upgraded by DWI = 5'; }
  }
  const likelihood = PIRADS_LIKELIHOOD[category];
  return {
    valid: true,
    category,
    zone,
    abnormal: category >= 3,
    bandLabel: `PI-RADS ${category}`,
    band: `PI-RADS ${category} — ${likelihood} likelihood of clinically significant cancer (${zone} zone, ${driver}).`,
    detail: `Biopsy is usually considered from category ≥ 3 (equivocal), more strongly ≥ 4. A reporting category, not a biopsy order.`,
    note: PIRADS_NOTE,
  };
}

// --- 2.4 Guy's stone score --------------------------------------------------
const GUYS_NOTE = "Guy's stone score grading percutaneous-nephrolithotomy (PCNL) complexity (Thomas K, et al, Urology 2011;78(2):277-281). Grade I: a solitary stone in the mid/lower pole or renal pelvis with simple anatomy. Grade II: a solitary upper-pole stone, or multiple stones in a patient with simple anatomy, or a solitary stone in a patient with abnormal anatomy. Grade III: multiple stones in a patient with abnormal anatomy, or a stone in a calyceal diverticulum, or a partial staghorn. Grade IV: a staghorn calculus, or any stone in a patient with spina bifida or a spinal injury. It grades complexity — a complement to the S.T.O.N.E. nephrolithometry score — not a procedure order.";
const GUYS_GRADES = {
  1: { grade: 'Grade I', sfr: '~81%', desc: 'solitary mid/lower-pole or pelvic stone, simple anatomy' },
  2: { grade: 'Grade II', sfr: '~72%', desc: 'solitary upper-pole stone, or multiple stones (simple anatomy), or a solitary stone with abnormal anatomy' },
  3: { grade: 'Grade III', sfr: '~35%', desc: 'multiple stones with abnormal anatomy, or a calyceal-diverticulum stone, or a partial staghorn' },
  4: { grade: 'Grade IV', sfr: '~29%', desc: 'staghorn calculus, or any stone with spina bifida / spinal injury' },
};

export function guysStoneScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const g = intIn(o.grade, 1, 4);
  if (g === null) return { valid: false, note: GUYS_NOTE };
  const info = GUYS_GRADES[g];
  return {
    valid: true,
    grade: g,
    gradeLabel: info.grade,
    sfr: info.sfr,
    abnormal: g >= 3,
    bandLabel: info.grade,
    band: `Guy's stone score ${info.grade} — expected stone-free rate ${info.sfr} (${info.desc}).`,
    detail: 'Grades PCNL complexity; a complement to the S.T.O.N.E. nephrolithometry score. Higher grade predicts a lower stone-free rate.',
    note: GUYS_NOTE,
  };
}
