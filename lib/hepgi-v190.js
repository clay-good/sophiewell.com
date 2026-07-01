// spec-v190: four deterministic hepatology / GI instruments. Every id was
// verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v190 runs no AI and makes no runtime network call.
// These grade, score, and classify — they are not a transplant-referral or
// diagnosis order (spec-v11 §5.3).
//
//   palbi       - Platelet-Albumin-Bilirubin (PALBI) grade (1-3)
//   meldNa      - MELD-Na, sodium-augmented MELD (OPTN/UNOS operational form)
//   clichy      - Clichy criteria for acute liver failure (met / not met)
//   romeIvIbs   - Rome IV diagnostic criteria for IBS (met / not met + subtype)
//
// COEFFICIENTS / BOUNDARIES / CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97),
// each cross-verified across >= 2 independent sources at implementation:
//   - palbi (Liu PH, et al, J Gastroenterol Hepatol 2017;32(4):879-886):
//     PALBI = 2.02·log10(bilirubin µmol/L) − 0.37·(log10 bilirubin)² −
//     0.04·(albumin g/L) − 3.48·log10(platelets 10⁹/L) + 1.01·(log10 platelets)².
//     Grade 1 ≤ −2.53; grade 2 > −2.53 and ≤ −2.09; grade 3 > −2.09. Inputs
//     accepted in US units (mg/dL, g/dL) and converted internally, matching the
//     live albi-grade convention (bilirubin ×17.1, albumin ×10; platelet count
//     in 10⁹/L equals the usual count in thousands/µL).
//   - meldNa (Kim WR, et al, N Engl J Med 2008;359(10):1018-1026; coefficients
//     per the OPTN/UNOS 2016 operational implementation): MELD(i) = 10·[0.957·
//     ln(Cr) + 0.378·ln(bilirubin) + 1.120·ln(INR) + 0.643], each lab floored to
//     1.0, creatinine capped at 4.0 (dialysis sets Cr = 4.0). If MELD(i) > 11:
//     MELD-Na = MELD(i) + 1.32·(137 − Na) − [0.033·MELD(i)·(137 − Na)], Na
//     clamped to [125, 137]. Result rounded and bounded to [6, 40]. (The Kim 2008
//     paper printed a different re-fit, 0.025 / ref-Na 140; the operational OPTN
//     coefficients used here match the spec-v190 formula and MDCalc/UNOS.)
//   - clichy (Bernuau J, et al, Hepatology 1986;6(4):648-651): transplant
//     evaluation is indicated when hepatic encephalopathy (grade 3-4, confusion
//     or coma) is present AND coagulation factor V is < 20% if age < 30, or
//     < 30% if age ≥ 30. A complement to the live King's College criteria.
//   - romeIvIbs (Lacy BE, et al, Gastroenterology 2016;150(6):1393-1407):
//     recurrent abdominal pain on average ≥ 1 day/week in the last 3 months
//     (onset ≥ 6 months prior), associated with ≥ 2 of: related to defecation,
//     change in stool frequency, change in stool form. Subtype IBS-C/D/M/U by the
//     predominant Bristol stool pattern on days with an abnormal bowel movement.

import { r1, r2 } from './num.js';

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

// --- 2.1 PALBI grade --------------------------------------------------------
const PALBI_NOTE = 'Platelet-Albumin-Bilirubin (PALBI) grade (Liu PH, Hsu CY, Hsia CY, et al, J Gastroenterol Hepatol 2017;32(4):879-886). PALBI = 2.02·log10(bilirubin µmol/L) − 0.37·(log10 bilirubin)² − 0.04·(albumin g/L) − 3.48·log10(platelets 10⁹/L) + 1.01·(log10 platelets)². Grade 1 (score ≤ −2.53) best liver function, grade 2 (> −2.53 to −2.09) intermediate, grade 3 (> −2.09) worst. PALBI refines ALBI by adding the platelet count (a portal-hypertension marker). Enter bilirubin in mg/dL, albumin in g/dL, and platelets in 10⁹/L (the usual count in thousands/µL); the first two are converted internally. It grades liver function; the staging and treatment decision stay with the clinician.';

export function palbi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const biliMg = pos(o.bilirubin, 100);      // mg/dL
  const albuminDl = pos(o.albumin, 10);      // g/dL
  const platelets = pos(o.platelets, 3000);  // 10^9/L
  if (biliMg === null || albuminDl === null || platelets === null) return { valid: false, note: PALBI_NOTE };
  const biliUmol = biliMg * 17.1;
  const albuminGL = albuminDl * 10;
  const lb = Math.log10(biliUmol);
  const lp = Math.log10(platelets);
  const score = 2.02 * lb - 0.37 * lb * lb - 0.04 * albuminGL - 3.48 * lp + 1.01 * lp * lp;
  let grade; let detail;
  if (score <= -2.53) { grade = 1; detail = 'the best preserved liver function'; }
  else if (score <= -2.09) { grade = 2; detail = 'intermediate liver function'; }
  else { grade = 3; detail = 'the poorest liver function'; }
  const s = r2(score);
  return {
    valid: true,
    score: s,
    grade,
    abnormal: grade >= 2,
    bandLabel: `PALBI grade ${grade}`,
    band: `PALBI score ${s} → grade ${grade}: ${detail}.`,
    detail: 'PALBI adds the platelet count to ALBI, so thrombocytopenia (portal hypertension) lowers the grade.',
    note: PALBI_NOTE,
  };
}

// --- 2.2 MELD-Na ------------------------------------------------------------
const MELDNA_NOTE = 'MELD-Na, the sodium-augmented MELD (Kim WR, et al, N Engl J Med 2008;359(10):1018-1026; coefficients per the OPTN/UNOS 2016 operational implementation). MELD(i) = 10·[0.957·ln(creatinine) + 0.378·ln(bilirubin) + 1.120·ln(INR) + 0.643], each lab floored at 1.0 mg/dL and creatinine capped at 4.0 (dialysis in the prior week sets creatinine to 4.0). Only when MELD(i) > 11 is sodium applied: MELD-Na = MELD(i) + 1.32·(137 − Na) − [0.033·MELD(i)·(137 − Na)], with sodium bounded to 125–137 mmol/L. The score is bounded to 6–40. MELD 3.0 further adds albumin and a sex adjustment. A waitlist-mortality estimate for the team; listing and allocation stay with the transplant center.';

export function meldNa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bili = pos(o.bilirubin, 100);
  const inr = pos(o.inr, 30);
  const creatRaw = pos(o.creatinine, 40);
  const sodium = pos(o.sodium, 200);
  if (bili === null || inr === null || creatRaw === null || sodium === null) return { valid: false, note: MELDNA_NOTE };
  const b = Math.max(bili, 1.0);
  const i = Math.max(inr, 1.0);
  let c = truthy(o.dialysis) ? 4.0 : creatRaw;
  c = Math.min(Math.max(c, 1.0), 4.0);
  let meldI = Math.round(10 * (0.957 * Math.log(c) + 0.378 * Math.log(b) + 1.120 * Math.log(i) + 0.643));
  let score = meldI;
  let naApplied = false;
  if (meldI > 11) {
    const na = Math.min(Math.max(sodium, 125), 137);
    score = meldI + 1.32 * (137 - na) - (0.033 * meldI * (137 - na));
    score = Math.round(score);
    naApplied = true;
  }
  score = Math.min(Math.max(score, 6), 40);
  return {
    valid: true,
    score,
    meldI,
    abnormal: score >= 15,
    bandLabel: `MELD-Na ${score}`,
    band: `MELD-Na ${score} (MELD ${meldI}${naApplied ? ', sodium adjustment applied' : ', sodium not applied — MELD ≤ 11'}).`,
    detail: `${truthy(o.dialysis) ? 'Dialysis in the prior week set creatinine to 4.0. ' : ''}Bilirubin, INR, and creatinine are floored at 1.0; creatinine is capped at 4.0; sodium is bounded to 125–137. Score bounded to 6–40.`,
    note: MELDNA_NOTE,
  };
}

// --- 2.3 Clichy criteria ----------------------------------------------------
const CLICHY_NOTE = 'Clichy criteria for acute (fulminant) liver failure (Bernuau J, Goudeau A, Poynard T, et al, Hepatology 1986;6(4):648-651). Emergency liver-transplant evaluation is indicated when hepatic encephalopathy (grade 3-4, i.e. confusion or coma) is present AND the coagulation factor V level is < 20% of normal if age < 30 years, or < 30% if age ≥ 30 years. Derived in fulminant hepatitis B; a complement to the live King\'s College criteria. It flags the need for transplant evaluation — the listing decision stays with the transplant center.';

export function clichy(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = nonneg(o.age, 130);
  const factorV = nonneg(o.factorV, 200); // percent of normal
  if (age === null || factorV === null) return { valid: false, note: CLICHY_NOTE };
  const encephalopathy = truthy(o.encephalopathy);
  const threshold = age < 30 ? 20 : 30;
  const factorVLow = factorV < threshold;
  const met = encephalopathy && factorVLow;
  return {
    valid: true,
    met,
    threshold,
    abnormal: met,
    bandLabel: met ? 'Criteria met' : 'Criteria not met',
    band: `Clichy criteria ${met ? 'MET' : 'not met'} — factor V threshold < ${threshold}% (age ${age < 30 ? '< 30' : '≥ 30'}).`,
    detail: `${encephalopathy ? 'Encephalopathy present' : 'No grade 3-4 encephalopathy'}; factor V ${r1(factorV)}% ${factorVLow ? '<' : '≥'} ${threshold}%. ${met ? 'Transplant evaluation is indicated.' : 'Both encephalopathy and the factor-V threshold are required.'}`,
    note: CLICHY_NOTE,
  };
}

// --- 2.4 Rome IV IBS --------------------------------------------------------
const ROME_NOTE = 'Rome IV diagnostic criteria for irritable bowel syndrome (Lacy BE, Mearin F, Chang L, et al, Gastroenterology 2016;150(6):1393-1407). IBS is diagnosed with recurrent abdominal pain on average ≥ 1 day/week in the last 3 months (symptom onset ≥ 6 months prior), associated with ≥ 2 of: related to defecation, associated with a change in stool frequency, associated with a change in stool form (appearance). The subtype (IBS-C / IBS-D / IBS-M / IBS-U) is set by the predominant Bristol stool pattern on days with an abnormal bowel movement. The criteria assume alarm features are absent and do not replace the exclusion of organic disease — that stays with the clinician.';
const IBS_SUBTYPE = {
  'ibs-c': 'IBS-C (constipation-predominant: > 25% hard/lumpy, < 25% loose/watery)',
  'ibs-d': 'IBS-D (diarrhea-predominant: > 25% loose/watery, < 25% hard/lumpy)',
  'ibs-m': 'IBS-M (mixed: > 25% hard/lumpy and > 25% loose/watery)',
  'ibs-u': 'IBS-U (unclassified: meets IBS but not a defined subtype)',
};

export function romeIvIbs(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pain = truthy(o.painFrequency);      // >= 1 day/week, last 3 months
  const onset = truthy(o.onset6mo);          // onset >= 6 months prior
  const assoc = [
    truthy(o.defecation) ? 'related to defecation' : null,
    truthy(o.stoolFrequency) ? 'change in stool frequency' : null,
    truthy(o.stoolForm) ? 'change in stool form' : null,
  ].filter(Boolean);
  const met = pain && onset && assoc.length >= 2;
  const subtypeKey = Object.prototype.hasOwnProperty.call(IBS_SUBTYPE, String(o.subtype)) ? String(o.subtype) : null;
  const subtypeText = met && subtypeKey ? IBS_SUBTYPE[subtypeKey] : null;
  let band;
  if (met) {
    band = `Rome IV criteria for IBS MET${subtypeText ? ` — ${subtypeText}` : ' (select a subtype)'}.`;
  } else {
    band = 'Rome IV criteria for IBS not met.';
  }
  const missing = [];
  if (!pain) missing.push('pain ≥ 1 day/week for 3 months');
  if (!onset) missing.push('onset ≥ 6 months prior');
  if (assoc.length < 2) missing.push(`≥ 2 associated features (have ${assoc.length})`);
  return {
    valid: true,
    met,
    subtype: subtypeText,
    associated: assoc.length,
    abnormal: met,
    bandLabel: met ? 'IBS criteria met' : 'IBS criteria not met',
    band,
    detail: met
      ? `${assoc.length} associated feature${assoc.length === 1 ? '' : 's'} present: ${assoc.join(', ')}. Alarm features assumed absent; organic disease not excluded.`
      : `Not met — need: ${missing.join('; ')}.`,
    note: ROME_NOTE,
  };
}
