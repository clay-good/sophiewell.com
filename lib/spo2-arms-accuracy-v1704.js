// spec-v1704 (biosignal-analysis tool 6): pulse oximeter accuracy from paired SpO2 and co-oximeter SaO2 readings.
// d = SpO2 - SaO2; Arms = sqrt(sum d^2 / n) over all pairs (the 2025 draft's definition; the 2013 guidance defers to
// ISO 80601-2-61, not read). Bland JM, Altman DG. J Biopharm Stat 2007;17:571-582, the true value varying: the
// within-subject variance is the residual mean square of a one-way analysis of variance of d by subject; the
// between-subject variance is (MS between - MS within) / [((sum m)^2 - sum m^2) / ((n - 1) sum m)], floored at 0; the
// 95% limits of agreement are bias +/- 1.96 x sqrt(total variance). Checked against FDA's 2013 guidance (in force) and,
// labeled as a draft, the January 2025 draft guidance; the numbers are in lib/fda-pulse-oximeter.js. The draft's
// confidence-interval and hypothesis-test criteria are not computed (the draft gives no method), and no draft "pass"
// is printed.
//
// Pure: no DOM, no network; `now` is passed in (or the SOPHIEWELL_NOW pin) for the guidances' re-read date.

import { measured } from './num.js';
import { todayUtc, parseDate, diffDays } from './pa/date.js';
import { PULSE_OX_2013 as F, PULSE_OX_2025_DRAFT as D } from './fda-pulse-oximeter.js';

export const SENSOR_OPTIONS = [
  { value: 'transmittance', text: 'Transmittance (wrap or clip)' },
  { value: 'ear', text: 'Ear clip' },
  { value: 'reflectance', text: 'Reflectance' },
];
const sig = (x) => Number(x.toPrecision(4));
const MST_GROUPS = [['1-4', 1, 4], ['5-7', 5, 7], ['8-10', 8, 10]];

// baLimits({ n, sumM, sumM2, msBetween, msWithin, bias }) -> Bland and Altman 2007's variance components and limits.
export function baLimits({ n, sumM, sumM2, msBetween, msWithin, bias }) {
  const divisor = (sumM * sumM - sumM2) / ((n - 1) * sumM);
  const between = Math.max(0, (msBetween - msWithin) / divisor);
  const total = between + msWithin;
  const half = 1.96 * Math.sqrt(total);
  const out = { divisor, between, within: msWithin, total, lower: bias - half, upper: bias + half };
  // Anything that is not a finite number in gives null, never NaN.
  return Object.values(out).every((x) => typeof x === 'number' && Number.isFinite(x)) ? out : null;
}

function parsePairs(raw) {
  const lines = String(raw ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { message: 'Enter the paired readings, one per line: subject, SpO2, SaO2.' };
  if (lines.length > 20000) return { message: 'Enter at most 20,000 pairs.' };
  const pairs = [];
  for (const [i, l] of lines.entries()) {
    const f = l.split(/\s*[,;\t]\s*/);
    if (f.length !== 3) return { message: `Pair line ${i + 1}: write it as subject, SpO2, SaO2.` };
    const spo2 = measured(f[1]);
    const sao2 = measured(f[2]);
    if (spo2 === null || sao2 === null || spo2 < 0 || spo2 > 100 || sao2 < 0 || sao2 > 100) return { message: `Pair line ${i + 1}: SpO2 and SaO2 must be percentages from 0 to 100.` };
    if (!f[0]) return { message: `Pair line ${i + 1}: name the subject.` };
    pairs.push({ subject: f[0], spo2, sao2, d: spo2 - sao2 });
  }
  return { pairs };
}

function parseSubjects(raw) {
  const out = new Map();
  const lines = String(raw ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const [i, l] of lines.entries()) {
    const f = l.split(/\s*[,;\t]\s*/);
    if (!f[0]) return { message: `Subject line ${i + 1}: name the subject.` };
    const dark = (f[1] || '').toLowerCase();
    const mst = f[2] ? measured(f[2]) : null;
    const ita = f[3] ? measured(f[3]) : null;
    const sex = (f[4] || '').toUpperCase();
    if (dark && !['yes', 'no', 'y', 'n'].includes(dark)) return { message: `Subject line ${i + 1}: darkly pigmented is yes or no.` };
    if (f[2] && (mst === null || !Number.isInteger(mst) || mst < 1 || mst > 10)) return { message: `Subject line ${i + 1}: the Monk Skin Tone value is a whole number from 1 to 10.` };
    if (f[3] && ita === null) return { message: `Subject line ${i + 1}: ITA is a number of degrees.` };
    if (sex && sex !== 'F' && sex !== 'M') return { message: `Subject line ${i + 1}: sex is F or M.` };
    out.set(f[0], { dark: dark ? dark.startsWith('y') : null, mst, ita, sex: sex || null });
  }
  return { subjects: out };
}

const atOrAbove = (x, min) => (x >= min ? 'at or above' : 'below');

export function spo2ArmsAccuracy(input = {}, now = undefined) {
  const o = input && typeof input === 'object' ? input : {};
  const today = todayUtc(now);
  for (const g of [F, D]) {
    if (diffDays(today, parseDate(g.validThrough)) > 0) return { valid: false, message: `FDA's pulse oximeter guidance numbers (${g.edition}) were last read ${g.readOn} and are due to be read again; this tool does not answer until they are.` };
  }
  const sensor = String(o.sensor ?? '').trim();
  if (!F.arms[sensor]) return { valid: false, message: 'Choose the sensor type: transmittance, ear clip or reflectance.' };
  const p = parsePairs(o.pairs);
  if (p.message) return { valid: false, message: p.message };
  const s = parseSubjects(o.subjects);
  if (s.message) return { valid: false, message: s.message };
  const pairs = p.pairs;
  const N = pairs.length;
  const bySubject = new Map();
  for (const x of pairs) { if (!bySubject.has(x.subject)) bySubject.set(x.subject, []); bySubject.get(x.subject).push(x.d); }
  const n = bySubject.size;
  if (n < 2) return { valid: false, message: 'Enter pairs from at least two subjects; the variance between subjects needs more than one.' };
  if (N <= n) return { valid: false, message: 'At least one subject needs two or more pairs; the variance within subjects needs repeated readings.' };
  const arms = Math.sqrt(pairs.reduce((t, x) => t + x.d * x.d, 0) / N);
  const bias = pairs.reduce((t, x) => t + x.d, 0) / N;
  let ssw = 0;
  let ssb = 0;
  let sumM2 = 0;
  for (const ds of bySubject.values()) {
    const m = ds.reduce((t, x) => t + x, 0) / ds.length;
    for (const x of ds) ssw += (x - m) ** 2;
    ssb += ds.length * (m - bias) ** 2;
    sumM2 += ds.length ** 2;
  }
  const ba = baLimits({ n, sumM: N, sumM2, msBetween: ssb / (n - 1), msWithin: ssw / (N - n), bias });
  if (!ba || ![arms, bias].every(Number.isFinite)) return { valid: false, message: 'These readings give no finite result.' };

  const typical = F.arms[sensor];
  const lines = [
    `Arms ${sig(arms)}% over ${N} pairs from ${n} subjects (square root of the mean squared SpO2 - SaO2 difference).`,
    `Bias (mean SpO2 - SaO2) ${sig(bias)}%; within-subject variance ${sig(ba.within)}, between-subject variance ${sig(ba.between)}${ba.between === 0 ? ' (floored at 0)' : ''}; 95% limits of agreement ${sig(ba.lower)}% to ${sig(ba.upper)}% (Bland and Altman 2007, true value varying).`,
  ];
  const f13 = [`2013 guidance (in force): Arms ${sig(arms)}% against the typical ${typical.toFixed(1)}% for this sensor type (Table 3); ${n} subjects (10 or more recommended); ${N} pairs (200 or more).`];
  const subj = s.subjects;
  const info = [...bySubject.keys()].map((k) => subj.get(k) || {});
  const known = info.filter((x) => x.dark !== null && x.dark !== undefined);
  if (known.length === n) {
    // 0.15 x 20 is 3.0000000000000004 in floating point; without the nudge it would round up to 4.
    const need = Math.max(F.darkMin, Math.ceil(F.darkShare * n - 1e-9));
    const dark = known.filter((x) => x.dark).length;
    f13.push(`Darkly pigmented subjects: ${dark}; the guidance asks for at least ${need} (2, or 15% of ${n} rounded up, whichever is larger; the rounding up is this tool's reading).`);
  } else f13.push('Darkly pigmented subjects: not entered for every subject, so the 2013 pigmentation minimum is not checked.');

  const draft = [`January 2025 draft guidance (a draft, not in force): ${n} participants, ${atOrAbove(n, D.participants)} the draft's 150; ${N} pairs, ${atOrAbove(N, D.pairs)} its 3,000; Arms ${sig(arms)}% against its "less than 3%" (as a point value; the draft asks for this with statistical significance, which is not computed here).`];
  if (info.every((x) => x.mst)) {
    const need = Math.ceil(D.groupShare * n - 1e-9);
    for (const [label, lo, hi] of MST_GROUPS) {
      const members = info.filter((x) => x.mst >= lo && x.mst <= hi);
      let line = `MST ${label}: ${members.length} participants (the draft asks for at least ${need}, 25% of ${n})`;
      if (members.length) {
        const sexKnown = members.every((x) => x.sex);
        if (sexKnown) {
          const f = members.filter((x) => x.sex === 'F').length;
          line += `; ${sig((100 * f) / members.length)}% female, ${sig((100 * (members.length - f)) / members.length)}% male (40% or more of each asked)`;
        }
        if (label === '8-10' && members.every((x) => x.ita !== null && x.ita !== undefined)) {
          const lowIta = members.filter((x) => x.ita <= D.itaCut).length;
          line += `; ${sig((100 * lowIta) / members.length)}% with ITA at or below -50 degrees (50% or more asked)`;
        }
      }
      draft.push(`${line}.`);
    }
    // Largest pairwise difference in mean bias between MST groups, in the draft's two SaO2 bands.
    for (const [band, lo, hi, cap, loInc] of [['70% to 85%', 70, 85, D.biasGapLow, true], ['above 85% to 100%', 85, 100, D.biasGapHigh, false]]) {
      const means = [];
      for (const [label, glo, ghi] of MST_GROUPS) {
        const ds = pairs.filter((x) => { const m = (subj.get(x.subject) || {}).mst; return m >= glo && m <= ghi && (loInc ? x.sao2 >= lo : x.sao2 > lo) && x.sao2 <= hi; }).map((x) => x.d);
        if (ds.length) means.push([label, ds.reduce((t, x) => t + x, 0) / ds.length]);
      }
      if (means.length >= 2) {
        const vals = means.map((m) => m[1]);
        draft.push(`SaO2 ${band}: mean bias by MST group ${means.map(([l, m]) => `${l} ${sig(m)}%`).join(', ')}; largest difference ${sig(Math.max(...vals) - Math.min(...vals))}% against the draft's "less than ${cap}%" (point value).`);
      } else draft.push(`SaO2 ${band}: fewer than two MST groups have pairs here, so no difference in bias is computed.`);
    }
  } else draft.push('Monk Skin Tone groups: not entered for every participant, so the draft\'s enrollment and bias-difference figures are not computed.');
  draft.push('The draft\'s ITA criterion (bias change per 100 degrees of sensor-site ITA) and its significance tests are not computed.');

  return {
    valid: true, arms: sig(arms), bias: sig(bias), lower: sig(ba.lower), upper: sig(ba.upper), subjects: n, pairs: N,
    abnormal: arms > typical,
    band: `Arms ${sig(arms)}% (${arms <= typical ? 'within' : 'above'} the 2013 guidance's typical ${typical.toFixed(1)}% for this sensor); bias ${sig(bias)}%, limits ${sig(ba.lower)}% to ${sig(ba.upper)}%.`,
    bandLabel: `Arms ${sig(arms)}%`,
    notes: [...lines, ...f13, ...draft],
    note: 'An analysis of the readings entered, not a clearance decision. The 2013 figures are "typical" values in nonbinding guidance; the 2025 figures are a draft.',
  };
}
