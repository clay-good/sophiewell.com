// spec-v115 (Wave 3 of the spec-v100 MDCalc Parity Completion program):
// five deterministic pulmonary decision rules that fill confirmed gaps beside
// the existing chronic-airways staging tools and the acute-PE cluster -- the
// incidental and screen-detected nodule malignancy models, the Fleischner 2017
// follow-up matrix, the PAH REVEAL Lite 2 risk score, and the pleural-infection
// RAPID score. None duplicates a live tile. v115 closes Wave 3.
//
//   mayoSpn        - Mayo Clinic Solitary Pulmonary Nodule malignancy probability
//   brockNodule    - Brock University / PanCan nodule malignancy probability
//   fleischner2017 - Fleischner Society 2017 nodule follow-up matrix
//   revealLite2    - REVEAL Lite 2 (PAH) 1-year-risk score
//   rapidPleural   - RAPID score (pleural infection) 3-month-mortality risk
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v40.js wire these to the home grid and
// render the spec-v50 §3 clinical-posture note. Each tile reports the
// probability / interval / score and the source's stated interpretation; the
// biopsy, PET, surveillance, escalate-care, or drainage decision stays with the
// clinician and local protocol -- none authors that order in Sophie's voice
// (spec-v11 §5.3).
//
// COEFFICIENTS / POINT TABLES / MATRIX RE-FETCHED, NEVER RECALLED (spec-v97
// lesson), each cross-verified across >= 2 independent sources (original paper
// + MDCalc / Radiology Assistant / PMC reproductions). Notes:
//   - mayoSpn (Swensen 1997): logistic, x = -6.8272 + 0.0391*age + 0.7917*smoke
//     + 1.3388*cancer + 0.1274*diameter + 1.0407*spiculation + 0.7838*upperlobe;
//     prob = e^x/(1+e^x). All seven coefficients re-fetched and confirmed against
//     the spec draft. Class A.
//   - brockNodule (McWilliams/PanCan 2013, full model with spiculation):
//     x = -6.7892 + 0.0287*(age-62) + 0.6011*female + 0.2961*familyHistory
//       + 0.2953*emphysema - 5.3854*((size/10)^-0.5 - 1.58113883)
//       + typeCoef + 0.6581*upperlobe - 0.0824*(count-4) + 0.7729*spiculation,
//     typeCoef solid 0 / part-solid +0.377 / non-solid (ground-glass) -0.1276.
//     The age and count terms are CENTERED (at 62 and 4). The size term is a
//     power transform ((size/10)^-0.5), NOT a literal subtraction; the centering
//     constant 1.58113883 = 0.4^-0.5. Class A. size > 0 domain-guarded.
//   - Both logistics clamp x to [-40, 40] so a fuzzed extreme (e.g. a 1e9 mm
//     diameter) cannot overflow e^x to Infinity; a non-finite intermediate
//     returns a surfaced valid:false fallback, never a probability from NaN.
//   - fleischner2017 (MacMahon 2017): the 2017 follow-up matrix, keyed on nodule
//     type (solid / part-solid / ground-glass), size band, single vs multiple,
//     and patient risk (low/high, which only changes the solid cells). Class B
//     (revisable Fleischner Society guidance -> docs/citation-staleness.md).
//   - revealLite2 (Benza 2021): additive from a base of 6; six all-noninvasive
//     variables; total 1-14; bands low 1-5 (2.9% 1-yr mortality), intermediate
//     6-7 (7.1%), high >= 8 (25.1%). Class A.
//   - rapidPleural (Rahman 2014): Renal (urea band) + Age band + Purulence +
//     Infection source + Dietary (albumin), total 0-7; bands low 0-2, medium
//     3-4, high 5-7, with derivation-cohort 3-month mortality ~1.5 / 17 / 47%.
//     Class A.

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
// Round to 1 dp, but stay overflow-safe: `n * 10` overflows to Infinity near
// Number.MAX_VALUE, which would otherwise leak a non-finite token into a
// `detail` string. For such absurd magnitudes, fall back to the un-scaled value.
const r1 = (n) => { const s = Math.round(n * 10) / 10; return Number.isFinite(s) ? s : n; };
const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);

// Logistic with x clamped to [-40, 40] (e^40 ~ 2.4e17, far from Number overflow).
function logisticPct(x) {
  if (!Number.isFinite(x)) return null;
  const xc = clamp(x, -40, 40);
  const p = 1 / (1 + Math.exp(-xc));
  return Number.isFinite(p) ? p * 100 : null;
}

// Shared pretest-probability framing for both nodule models. Thresholds are the
// pragmatic low / intermediate / high pretest framing (ACCP / Gould) -- the
// management decision stays with the clinician.
function noduleTier(pct) {
  if (pct < 5) return { name: 'low', cut: '< 5%' };
  if (pct <= 65) return { name: 'intermediate', cut: '5-65%' };
  return { name: 'high', cut: '> 65%' };
}

// --- 2.1 mayo-spn -------------------------------------------------------------
const MAYO_NOTE = 'Mayo Clinic Solitary Pulmonary Nodule model (Swensen SJ, Silverstein MD, Ilstrup DM, Schleck CD, Edell ES, Arch Intern Med 1997): a logistic model that estimates the probability of malignancy in an incidental, radiologically indeterminate solitary pulmonary nodule from six clinical and radiographic descriptors -- age, current/former smoking, a prior extrathoracic cancer diagnosed more than 5 years ago, nodule diameter (mm), spiculation, and upper-lobe location -- as probability = e^x/(1+e^x). A pragmatic pretest framing reads < 5% as low, 5-65% as intermediate, and > 65% as high probability of malignancy. It frames pretest probability; the surveillance, PET, or biopsy decision stays with the clinician and local protocol.';

export function mayoSpn(input = {}) {
  const age = fin(input.age);
  const diameter = fin(input.diameter);
  if (age == null || diameter == null) {
    return { valid: false, band: 'Enter the patient age and the nodule diameter (mm), then mark the smoking, prior-cancer, spiculation, and upper-lobe items, to estimate the Mayo malignancy probability.', note: MAYO_NOTE };
  }
  if (age < 0 || diameter < 0) {
    return { valid: false, band: 'Age and nodule diameter must be non-negative; enter the values from the chart and the CT.', note: MAYO_NOTE };
  }
  const smoke = onFlag(input.smoking);
  const cancer = onFlag(input.cancer);
  const spic = onFlag(input.spiculation);
  const upper = onFlag(input.upperlobe);
  const x = -6.8272 + 0.0391 * age + 0.7917 * (smoke ? 1 : 0) + 1.3388 * (cancer ? 1 : 0)
    + 0.1274 * diameter + 1.0407 * (spic ? 1 : 0) + 0.7838 * (upper ? 1 : 0);
  const pct = logisticPct(x);
  if (pct == null) {
    return { valid: false, band: 'The malignancy probability could not be computed from the values entered; check the age and diameter.', note: MAYO_NOTE };
  }
  const p = r1(pct);
  const tier = noduleTier(p);
  const counted = [];
  if (smoke) counted.push('smoking');
  if (cancer) counted.push('prior extrathoracic cancer');
  if (spic) counted.push('spiculation');
  if (upper) counted.push('upper-lobe location');
  return {
    valid: true, pct: p, tier: tier.name, cut: tier.cut,
    abnormal: p > 5,
    band: `Mayo malignancy probability ${p}% -- ${tier.name} pretest probability (${tier.cut}).`,
    counted: counted.length ? counted.join(', ') : 'no positive risk descriptors',
    note: MAYO_NOTE,
  };
}

// --- 2.2 brock-nodule ---------------------------------------------------------
const BROCK_NOTE = 'Brock University / PanCan nodule model (McWilliams A, Tammemagi MC, Mayo JR, et al, N Engl J Med 2013): a logistic model -- validated on lung-screening cohorts -- that estimates the probability of cancer in a pulmonary nodule from age, female sex, family history of lung cancer, emphysema, nodule size (mm, entered as a power transform), nodule type (solid / part-solid / non-solid), upper-lobe location, nodule count, and spiculation, as probability = e^x/(1+e^x). The age and count terms are centered (at 62 and 4). A pragmatic pretest framing reads < 5% as low, 5-65% as intermediate, and > 65% as high probability of malignancy. It frames pretest probability; the surveillance, PET, or biopsy decision stays with the clinician and local protocol.';
const BROCK_TYPE = { solid: 0, 'part-solid': 0.377, 'non-solid': -0.1276 };

export function brockNodule(input = {}) {
  const age = fin(input.age);
  const size = fin(input.size);
  const count = fin(input.count);
  if (age == null || size == null || count == null) {
    return { valid: false, band: 'Enter the patient age, the nodule size (mm), and the number of nodules, then choose the nodule type and mark the sex, family-history, emphysema, upper-lobe, and spiculation items, to estimate the Brock probability.', note: BROCK_NOTE };
  }
  if (age < 0 || size <= 0 || count < 1) {
    return { valid: false, band: 'Age must be non-negative, the nodule size must be greater than 0 mm, and the nodule count at least 1.', note: BROCK_NOTE };
  }
  const typeKey = BROCK_TYPE[input.type] != null ? input.type : 'solid';
  const female = onFlag(input.female);
  const fh = onFlag(input.familyHistory);
  const emph = onFlag(input.emphysema);
  const upper = onFlag(input.upperlobe);
  const spic = onFlag(input.spiculation);
  const sizeTerm = Math.pow(size / 10, -0.5) - 1.58113883;
  const x = -6.7892 + 0.0287 * (age - 62) + 0.6011 * (female ? 1 : 0) + 0.2961 * (fh ? 1 : 0)
    + 0.2953 * (emph ? 1 : 0) - 5.3854 * sizeTerm + BROCK_TYPE[typeKey]
    + 0.6581 * (upper ? 1 : 0) - 0.0824 * (count - 4) + 0.7729 * (spic ? 1 : 0);
  const pct = logisticPct(x);
  if (pct == null) {
    return { valid: false, band: 'The malignancy probability could not be computed from the values entered; check the nodule size and count.', note: BROCK_NOTE };
  }
  const p = r1(pct);
  const tier = noduleTier(p);
  const typeLabel = typeKey === 'part-solid' ? 'part-solid' : typeKey === 'non-solid' ? 'non-solid (ground-glass)' : 'solid';
  return {
    valid: true, pct: p, tier: tier.name, cut: tier.cut, type: typeLabel,
    abnormal: p > 5,
    band: `Brock malignancy probability ${p}% -- ${tier.name} pretest probability (${tier.cut}).`,
    detail: `${typeLabel} nodule, ${r1(size)} mm, ${count} nodule${count === 1 ? '' : 's'}`,
    note: BROCK_NOTE,
  };
}

// --- 2.3 fleischner-2017 ------------------------------------------------------
const FLEISCHNER_NOTE = 'Fleischner Society 2017 guidelines (MacMahon H, Naidich DP, Goo JM, et al, Radiology 2017): the recommended CT-surveillance interval for an incidental pulmonary nodule, keyed on nodule type (solid / part-solid / pure ground-glass), size, single vs multiple, and patient risk (low vs high). It applies to incidental nodules in patients >= 35 years and NOT to lung-cancer screening, a known primary cancer, or immunosuppression; subsolid recommendations assume a persistent nodule. Size is the average of long and short axis. It reports the guideline cell; the follow-up, PET, or tissue-sampling decision stays with the clinician and local protocol.';

// Each cell: the guideline recommendation string. Solid cells split by risk.
function fleischnerSolid(size, multiple, high) {
  if (size < 6) {
    return multiple
      ? (high ? 'No routine follow-up; optional CT at 12 months.' : 'No routine follow-up.')
      : (high ? 'No routine follow-up; optional CT at 12 months for suspicious morphology or upper-lobe location.' : 'No routine follow-up.');
  }
  if (size <= 8) {
    return multiple
      ? 'CT at 3-6 months, then consider CT at 18-24 months.'
      : (high ? 'CT at 6-12 months, then CT at 18-24 months.' : 'CT at 6-12 months, then consider CT at 18-24 months.');
  }
  // > 8 mm
  return multiple
    ? 'CT at 3-6 months, then consider CT at 18-24 months.'
    : 'Consider CT at 3 months, PET/CT, or tissue sampling.';
}
function fleischnerGroundGlass(size, multiple) {
  if (size < 6) {
    return multiple
      ? 'CT at 3-6 months; if stable, consider CT at 2 and 4 years.'
      : 'No routine follow-up.';
  }
  return multiple
    ? 'CT at 3-6 months, then manage by the most suspicious nodule.'
    : 'CT at 6-12 months to confirm persistence, then CT every 2 years until 5 years.';
}
function fleischnerPartSolid(size, multiple) {
  if (size < 6) {
    return multiple
      ? 'CT at 3-6 months, then manage by the most suspicious nodule.'
      : 'No routine follow-up.';
  }
  return multiple
    ? 'CT at 3-6 months, then manage by the most suspicious nodule.'
    : 'CT at 3-6 months to confirm persistence; if unchanged and the solid component stays < 6 mm, annual CT for 5 years.';
}

export function fleischner2017(input = {}) {
  const size = fin(input.size);
  if (size == null) {
    return { valid: false, band: 'Enter the nodule size (mm) and choose the nodule type, multiplicity, and patient risk to read the Fleischner 2017 follow-up recommendation.', note: FLEISCHNER_NOTE };
  }
  if (size <= 0) {
    return { valid: false, band: 'The nodule size must be greater than 0 mm.', note: FLEISCHNER_NOTE };
  }
  const type = ['solid', 'part-solid', 'ground-glass'].includes(input.type) ? input.type : 'solid';
  const multiple = input.multiplicity === 'multiple';
  const high = input.risk === 'high';
  const s = r1(size);
  let rec;
  let cell;
  if (type === 'solid') {
    rec = fleischnerSolid(s, multiple, high);
    const sizeBand = s < 6 ? '< 6 mm' : s <= 8 ? '6-8 mm' : '> 8 mm';
    cell = `${multiple ? 'multiple' : 'single'} solid, ${sizeBand}${s <= 8 ? `, ${high ? 'high' : 'low'} risk` : ''}`;
  } else if (type === 'ground-glass') {
    rec = fleischnerGroundGlass(s, multiple);
    cell = `${multiple ? 'multiple' : 'single'} ground-glass, ${s < 6 ? '< 6 mm' : '>= 6 mm'}`;
  } else {
    rec = fleischnerPartSolid(s, multiple);
    cell = `${multiple ? 'multiple' : 'single'} part-solid, ${s < 6 ? '< 6 mm' : '>= 6 mm'}`;
  }
  const noFollow = /^No routine follow-up\.$/.test(rec);
  return {
    valid: true, recommendation: rec, cell,
    abnormal: !noFollow,
    band: `Fleischner 2017 (${cell}): ${rec}`,
    note: FLEISCHNER_NOTE,
  };
}

// --- 2.4 reveal-lite-2 --------------------------------------------------------
const REVEAL_NOTE = 'REVEAL Lite 2 (Benza RL, Kanwar MK, Raina A, et al, Chest 2021): an abridged, all-noninvasive risk score for pulmonary arterial hypertension. It starts from a base of 6 and adjusts for six variables -- renal insufficiency (eGFR < 60 = +1), WHO/NYHA functional class (I = -1, II = 0, III = +1, IV = +2), systolic BP (< 110 = +1), heart rate (> 96 = +1), 6-minute walk distance (>= 440 = -2, 320 to < 440 = -1, 165 to < 320 = 0, < 165 = +1), and BNP / NT-proBNP band -- for a total of 1-14. Bands: low 1-5 (2.9% 1-year mortality), intermediate 6-7 (7.1%), high >= 8 (25.1%). It frames 1-year risk; the treatment-escalation decision stays with the clinician and local protocol.';
const REVEAL_BNP = {
  // value -> { points, label }
  low: { points: -2, label: 'BNP < 50 / NT-proBNP < 300 pg/mL (-2)' },
  mid: { points: 0, label: 'BNP 50 to < 200 / NT-proBNP 300 to < 1100 pg/mL (0)' },
  high1: { points: 1, label: 'BNP 200 to < 800 pg/mL (+1)' },
  high2: { points: 2, label: 'BNP >= 800 / NT-proBNP >= 1100 pg/mL (+2)' },
};

export function revealLite2(input = {}) {
  const egfr = fin(input.egfr);
  const sbp = fin(input.sbp);
  const hr = fin(input.hr);
  const mwd = fin(input.mwd);
  if (egfr == null || sbp == null || hr == null || mwd == null) {
    return { valid: false, band: 'Enter the eGFR, systolic BP, heart rate, and 6-minute walk distance, then choose the WHO functional class and the BNP/NT-proBNP band, to compute REVEAL Lite 2.', note: REVEAL_NOTE };
  }
  if (egfr < 0 || sbp < 0 || hr < 0 || mwd < 0) {
    return { valid: false, band: 'The eGFR, systolic BP, heart rate, and walk distance must be non-negative.', note: REVEAL_NOTE };
  }
  const counted = [];
  let total = 6;
  if (egfr < 60) { total += 1; counted.push('eGFR < 60 (+1)'); }
  const fc = input.who;
  const fcPts = fc === '1' ? -1 : fc === '3' ? 1 : fc === '4' ? 2 : 0;
  total += fcPts;
  if (fcPts !== 0) counted.push(`WHO FC ${fc} (${fcPts > 0 ? '+' : ''}${fcPts})`);
  if (sbp < 110) { total += 1; counted.push('SBP < 110 (+1)'); }
  if (hr > 96) { total += 1; counted.push('HR > 96 (+1)'); }
  let mwdPts;
  if (mwd >= 440) { mwdPts = -2; }
  else if (mwd >= 320) { mwdPts = -1; }
  else if (mwd >= 165) { mwdPts = 0; }
  else { mwdPts = 1; }
  total += mwdPts;
  if (mwdPts !== 0) counted.push(`6MWD ${mwdPts > 0 ? '+' : ''}${mwdPts}`);
  const bnp = REVEAL_BNP[input.bnp] || REVEAL_BNP.mid;
  total += bnp.points;
  if (bnp.points !== 0) counted.push(bnp.label);
  const tier = total <= 5 ? { name: 'low', pct: '2.9%' }
    : total <= 7 ? { name: 'intermediate', pct: '7.1%' }
      : { name: 'high', pct: '25.1%' };
  return {
    valid: true, total, tier: tier.name, mortality: tier.pct,
    abnormal: total >= 8,
    band: `REVEAL Lite 2 total ${total} (1-14): ${tier.name} risk (1-year mortality ${tier.pct}).`,
    counted: counted.length ? counted.join(', ') : 'all variables in their 0-point bands',
    note: REVEAL_NOTE,
  };
}

// --- 2.5 rapid-pleural --------------------------------------------------------
const RAPID_NOTE = 'RAPID score (Rahman NM, Kahan BC, Miller RF, Gleeson FV, Nunn AJ, Maskell NA, Chest 2014): predicts 3-month mortality in pleural infection (empyema / complicated parapneumonic effusion) from five items -- Renal (serum urea: < 5 mmol/L = 0, 5-8 = 1, > 8 = 2), Age (< 50 = 0, 50-70 = 1, > 70 = 2), Purulence (non-purulent fluid = 1), Infection source (hospital-acquired = 1), and Dietary albumin (< 27 g/L = 1) -- for a total of 0-7. Bands: low 0-2, medium 3-4, high 5-7, with derivation-cohort 3-month mortality of approximately 1.5%, 17%, and 47% respectively. It frames mortality risk; the drainage, antibiotic, and surgical-referral decisions stay with the clinician and local protocol.';
const RAPID_UREA = { low: { points: 0, label: 'urea < 5 mmol/L (0)' }, mid: { points: 1, label: 'urea 5-8 mmol/L (+1)' }, high: { points: 2, label: 'urea > 8 mmol/L (+2)' } };

export function rapidPleural(input = {}) {
  const age = fin(input.age);
  const albumin = fin(input.albumin);
  if (age == null || albumin == null) {
    return { valid: false, band: 'Enter the patient age and the serum albumin (g/L), then choose the urea band and mark the purulence and infection-source items, to compute the RAPID score.', note: RAPID_NOTE };
  }
  if (age < 0 || albumin < 0) {
    return { valid: false, band: 'Age and serum albumin must be non-negative.', note: RAPID_NOTE };
  }
  const counted = [];
  let total = 0;
  const urea = RAPID_UREA[input.urea] || RAPID_UREA.low;
  total += urea.points;
  if (urea.points !== 0) counted.push(urea.label);
  const agePts = age > 70 ? 2 : age >= 50 ? 1 : 0;
  total += agePts;
  if (agePts !== 0) counted.push(`age ${age > 70 ? '> 70' : '50-70'} (+${agePts})`);
  if (onFlag(input.nonPurulent)) { total += 1; counted.push('non-purulent fluid (+1)'); }
  if (onFlag(input.hospitalAcquired)) { total += 1; counted.push('hospital-acquired (+1)'); }
  if (albumin < 27) { total += 1; counted.push('albumin < 27 g/L (+1)'); }
  const tier = total <= 2 ? { name: 'low', pct: '~1.5%' }
    : total <= 4 ? { name: 'medium', pct: '~17%' }
      : { name: 'high', pct: '~47%' };
  return {
    valid: true, total, tier: tier.name, mortality: tier.pct,
    abnormal: total >= 5,
    band: `RAPID ${total}/7: ${tier.name} risk (derivation-cohort 3-month mortality ${tier.pct}).`,
    counted: counted.length ? counted.join(', ') : 'no RAPID points (all baseline)',
    note: RAPID_NOTE,
  };
}
