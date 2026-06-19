// spec-v114 (Wave 3 of the spec-v100 MDCalc Parity Completion program):
// six deterministic pulmonary / sleep-medicine decision rules that fill
// confirmed gaps beside the existing chronic-airways staging tools
// (gold-spirometry, bode-index, predicted-spirometry) and the stop-bang screen.
// None duplicates a live tile.
//
//   decafScore           - DECAF score (acute COPD exacerbation, in-hospital mortality)
//   bap65                - BAP-65 class (acute COPD exacerbation)
//   bronchiectasisBsi    - Bronchiectasis Severity Index
//   facedBronchiectasis  - FACED score
//   nosasScore           - NoSAS sleep-disordered-breathing screen
//   ahiOdiSeverity       - AHI / ODI -> AASM severity band
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v39.js wire these to the home grid and
// render the spec-v50 §3 clinical-posture note. Each tile reports the score /
// class / band and the source's stated interpretation; the admit, ventilate, or
// refer-for-sleep-study decision stays with the clinician and local protocol --
// none authors that order in Sophie's voice (spec-v11 §5.3).
//
// POINT TABLES / BANDS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each
// cross-verified across >= 2 independent sources (original paper + MDCalc /
// Bronchiectasis Toolbox / AASM). SOURCE GOVERNS over the spec draft where they
// diverged -- the re-fetch caught three spec-draft errors, fixed here:
//   - FACED Extension scores at > 2 lobes (i.e. >= 3 lobes), NOT the spec
//     draft's ">= 2 lobes"; 1-2 lobes = 0.
//   - FACED Dyspnea scores at mMRC >= 3, NOT the spec draft's "mMRC >= 2";
//     mMRC 0-2 = 0.
//   - BSI prior-admission window is the prior 2 YEARS, and BSI uses the MRC 1-5
//     dyspnea scale (4 = +2, 5 = +3), not mMRC.
// Other transcriptions:
//   - DECAF (Steer J, Thorax 2012): eMRCD 1-4 = 0, 5a = +1, 5b = +2;
//     eosinopenia < 0.05 x10^9/L = 1, consolidation = 1, acidemia pH < 7.30 = 1,
//     atrial fibrillation = 1; total 0-6. Bands: low 0-1 (1.4% in-hospital
//     mortality), intermediate 2 (8.4%), high 3-6 (34.6%). Class A.
//   - BAP-65 (Tabak YP, Arch Intern Med 2009): the class is driven by the COUNT
//     of the three acute variables (BUN >= 25 mg/dL, altered mental status,
//     pulse >= 109/min); age > 65 only splits class I from II at zero acute
//     variables. Class I = 0 vars & age <= 65; II = 0 vars & age > 65; III = 1
//     var; IV = 2 vars; V = 3 vars. Per-class in-hospital mortality 0.3 / 0.9 /
//     2.1 / 6.3 / 13.8%; need-for-mechanical-ventilation rises steeply (~30% at
//     class IV, ~55% at class V). Class A.
//   - BSI (Chalmers JD, AJRCCM 2014): full weighted table below; bands low 0-4,
//     intermediate 5-8, high >= 9 (> 8). Class A.
//   - FACED (Martinez-Garcia MA, ERJ 2014): FEV1 < 50% = 2, age >= 70 = 2,
//     chronic Pseudomonas = 1, extension >= 3 lobes = 1, dyspnea mMRC >= 3 = 1;
//     total 0-7. Bands mild 0-2, moderate 3-4, severe 5-7; derivation-cohort
//     5-year mortality 4.3 / 25.3 / 68.8%. Class A.
//   - NoSAS (Marti-Soler H, Lancet Respir Med 2016): neck > 40 cm = 4, BMI
//     25 to < 30 = 3 or >= 30 = 5 (single mutually-exclusive item), snoring = 2,
//     age > 55 = 4, male = 2; total 0-17, >= 8 high risk. Class A.
//   - AHI/ODI (AASM Task Force, Sleep 1999; AASM scoring-manual v2.0 2012):
//     AHI normal < 5, mild 5 to < 15, moderate 15 to < 30, severe >= 30
//     events/hr. ODI shown alongside with the 3%-vs-4% desaturation criterion
//     stated. Class B (revisable AASM criteria -> docs/citation-staleness.md).

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const r1 = (n) => Math.round(n * 10) / 10;

// --- 2.1 decaf-score ----------------------------------------------------------
const DECAF_NOTE = 'DECAF score (Steer J, Gibson J, Bourke SC, Thorax 2012): five items predict in-hospital mortality in a hospitalised acute exacerbation of COPD -- extended MRC dyspnea grade (eMRCD 1-4 = 0, 5a = +1, 5b = +2), eosinopenia < 0.05 x10^9/L (1), consolidation on chest radiograph (1), acidemia pH < 7.30 (1), and atrial fibrillation (1), for a total of 0-6. Derivation-cohort in-hospital mortality: low 0-1 (1.4%), intermediate 2 (8.4%), high 3-6 (34.6%). It frames mortality risk; the admit, escalate-care, or supported-discharge decision stays with the clinician and local protocol.';

export function decafScore(input = {}) {
  const dys = input.emrcd === '5b' ? 2 : input.emrcd === '5a' ? 1 : 0;
  const counted = [];
  if (dys === 1) counted.push('eMRCD 5a (+1)');
  if (dys === 2) counted.push('eMRCD 5b (+2)');
  let total = dys;
  const items = [
    ['eosinopenia', 'eosinopenia < 0.05'],
    ['consolidation', 'consolidation'],
    ['acidemia', 'acidemia pH < 7.30'],
    ['af', 'atrial fibrillation'],
  ];
  for (const [key, label] of items) {
    if (onFlag(input[key])) { total += 1; counted.push(label); }
  }
  const tier = total <= 1 ? { name: 'low', pct: '1.4%' }
    : total === 2 ? { name: 'intermediate', pct: '8.4%' }
      : { name: 'high', pct: '34.6%' };
  return {
    valid: true, total, tier: tier.name, mortality: tier.pct,
    abnormal: total >= 2,
    band: `DECAF ${total}/6: ${tier.name} risk (in-hospital mortality ${tier.pct}).`,
    counted: counted.length ? counted.join(', ') : 'no DECAF items present',
    note: DECAF_NOTE,
  };
}

// --- 2.2 bap-65 ---------------------------------------------------------------
const BAP_NOTE = 'BAP-65 class (Tabak YP, Sun X, Johannes RS, Gupta V, Shorr AF, Arch Intern Med 2009): the class is driven by the count of three acute variables -- BUN >= 25 mg/dL, altered mental status, and pulse >= 109/min -- with age > 65 splitting class I from II only when no acute variable is present. Class I = 0 acute variables and age <= 65; II = 0 and age > 65; III = 1; IV = 2; V = all 3. Derivation-cohort in-hospital mortality rises 0.3% (I), 0.9% (II), 2.1% (III), 6.3% (IV), 13.8% (V); the need for mechanical ventilation rises steeply with class (about 30% at class IV and 55% at class V). It frames mortality and ventilation risk; the disposition and ventilation decision stay with the clinician and local protocol.';
const BAP_CLASSES = {
  I: { mortality: '0.3%', mv: 'low' },
  II: { mortality: '0.9%', mv: 'low' },
  III: { mortality: '2.1%', mv: 'intermediate' },
  IV: { mortality: '6.3%', mv: 'about 30%' },
  V: { mortality: '13.8%', mv: 'about 55%' },
};

export function bap65(input = {}) {
  const acute = [];
  if (onFlag(input.bun)) acute.push('BUN >= 25 mg/dL');
  if (onFlag(input.ams)) acute.push('altered mental status');
  if (onFlag(input.pulse)) acute.push('pulse >= 109/min');
  const over65 = onFlag(input.ageOver65);
  const count = acute.length;
  const cls = count === 0 ? (over65 ? 'II' : 'I')
    : count === 1 ? 'III'
      : count === 2 ? 'IV'
        : 'V';
  const c = BAP_CLASSES[cls];
  const met = count ? acute.join(', ') : (over65 ? 'no acute variables (age > 65)' : 'no acute variables (age <= 65)');
  return {
    valid: true, cls, count, over65, mortality: c.mortality, ventilation: c.mv,
    abnormal: cls === 'IV' || cls === 'V',
    band: `BAP-65 class ${cls}: in-hospital mortality ${c.mortality}; mechanical-ventilation need ${c.mv}.`,
    met,
    note: BAP_NOTE,
  };
}

// --- 2.3 bronchiectasis-bsi ---------------------------------------------------
const BSI_NOTE = 'Bronchiectasis Severity Index (Chalmers JD, Goeminne P, Aliberti S, et al, Am J Respir Crit Care Med 2014): nine weighted items -- age (< 50 = 0, 50-69 = 2, 70-79 = 4, >= 80 = 6), BMI (< 18.5 = 2), FEV1 % predicted (> 80 = 0, 50-80 = 1, 30-49 = 2, < 30 = 3), a hospital admission in the prior 2 years (5), >= 3 exacerbations in the prior year (2), MRC dyspnea (4 = 2, 5 = 3), Pseudomonas colonization (3), other-organism colonization (1), and radiology (>= 3 lobes = 1, cystic = 1). Bands: low 0-4, intermediate 5-8, high >= 9, with rising mortality and hospitalization risk. It frames severity; the management decision stays with the clinician and local protocol.';

export function bronchiectasisBsi(input = {}) {
  const age = fin(input.age);
  const bmi = fin(input.bmi);
  const fev1 = fin(input.fev1);
  const exac = fin(input.exacerbations);
  const mrc = fin(input.mrc);
  if (age == null || bmi == null || fev1 == null || exac == null || mrc == null) {
    return { valid: false, band: 'Enter the age, BMI, FEV1 % predicted, number of exacerbations in the prior year, and MRC dyspnea score (1-5), then mark the colonization and radiology items, to compute the BSI.', note: BSI_NOTE };
  }
  const agePts = age < 50 ? 0 : age <= 69 ? 2 : age <= 79 ? 4 : 6;
  const bmiPts = bmi < 18.5 ? 2 : 0;
  const fevPts = fev1 > 80 ? 0 : fev1 >= 50 ? 1 : fev1 >= 30 ? 2 : 3;
  const admPts = onFlag(input.priorAdmission) ? 5 : 0;
  const exacPts = exac >= 3 ? 2 : 0;
  const mrcRounded = Math.round(mrc);
  const mrcPts = mrcRounded >= 5 ? 3 : mrcRounded === 4 ? 2 : 0;
  const psPts = onFlag(input.pseudomonas) ? 3 : 0;
  const otherPts = onFlag(input.otherOrganism) ? 1 : 0;
  const radPts = (onFlag(input.lobes3) ? 1 : 0) + (onFlag(input.cystic) ? 1 : 0);
  const total = agePts + bmiPts + fevPts + admPts + exacPts + mrcPts + psPts + otherPts + radPts;
  const tier = total <= 4 ? { name: 'low', mort: '0-2.8% 1-year mortality', hosp: '0-3.4% 1-year hospitalization' }
    : total <= 8 ? { name: 'intermediate', mort: '0.8-4.8% 1-year mortality', hosp: '1.0-7.2% 1-year hospitalization' }
      : { name: 'high', mort: '7.6-10.5% 1-year mortality', hosp: '16.7-52.6% 1-year hospitalization' };
  return {
    valid: true, total, tier: tier.name,
    parts: `age ${agePts}, BMI ${bmiPts}, FEV1 ${fevPts}, admission ${admPts}, exacerbations ${exacPts}, MRC ${mrcPts}, Pseudomonas ${psPts}, other organism ${otherPts}, radiology ${radPts}`,
    abnormal: total >= 5,
    band: `BSI ${total}: ${tier.name} severity (${tier.mort}, ${tier.hosp}).`,
    note: BSI_NOTE,
  };
}

// --- 2.4 faced-bronchiectasis -------------------------------------------------
const FACED_NOTE = 'FACED score (Martinez-Garcia MA, de Gracia J, Vendrell Relat M, et al, Eur Respir J 2014): five items -- FEV1 < 50% predicted (2), Age >= 70 (2), chronic Pseudomonas Colonization (1), radiological Extension >= 3 lobes (1), and Dyspnea mMRC >= 3 (1) -- for a total of 0-7. Bands: mild 0-2, moderate 3-4, severe 5-7, with derivation-cohort 5-year mortality of 4.3%, 25.3%, and 68.8% respectively. It frames severity; the management decision stays with the clinician and local protocol.';

export function facedBronchiectasis(input = {}) {
  const fev1 = fin(input.fev1);
  const age = fin(input.age);
  if (fev1 == null || age == null) {
    return { valid: false, band: 'Enter the FEV1 % predicted and the age, then mark the Pseudomonas, extension, and dyspnea items, to compute the FACED score.', note: FACED_NOTE };
  }
  const counted = [];
  let total = 0;
  if (fev1 < 50) { total += 2; counted.push('FEV1 < 50% (+2)'); }
  if (age >= 70) { total += 2; counted.push('age >= 70 (+2)'); }
  if (onFlag(input.pseudomonas)) { total += 1; counted.push('chronic Pseudomonas (+1)'); }
  if (onFlag(input.extension)) { total += 1; counted.push('extension >= 3 lobes (+1)'); }
  if (onFlag(input.dyspnea)) { total += 1; counted.push('dyspnea mMRC >= 3 (+1)'); }
  const tier = total <= 2 ? { name: 'mild', pct: '4.3%' }
    : total <= 4 ? { name: 'moderate', pct: '25.3%' }
      : { name: 'severe', pct: '68.8%' };
  return {
    valid: true, total, tier: tier.name, mortality: tier.pct,
    abnormal: total >= 3,
    band: `FACED ${total}/7: ${tier.name} (derivation-cohort 5-year mortality ${tier.pct}).`,
    counted: counted.length ? counted.join(', ') : 'no FACED items present',
    note: FACED_NOTE,
  };
}

// --- 2.5 nosas-score ----------------------------------------------------------
const NOSAS_NOTE = 'NoSAS score (Marti-Soler H, Hirotsu C, Marques-Vidal P, et al, Lancet Respir Med 2016): neck circumference > 40 cm (4), BMI 25 to < 30 kg/m^2 (3) or >= 30 (5, a single mutually-exclusive item), snoring (2), age > 55 (4), and male sex (2), for a total of 0-17. A score of >= 8 indicates a high probability of clinically significant sleep-disordered breathing and warrants further sleep evaluation. It is a screen, complementary to STOP-BANG; the referral-for-sleep-study decision stays with the clinician and local protocol.';

export function nosasScore(input = {}) {
  const neck = fin(input.neck);
  const bmi = fin(input.bmi);
  const age = fin(input.age);
  if (neck == null || bmi == null || age == null) {
    return { valid: false, band: 'Enter the neck circumference (cm), BMI, and age, then mark snoring and sex, to compute the NoSAS score.', note: NOSAS_NOTE };
  }
  const counted = [];
  let total = 0;
  if (neck > 40) { total += 4; counted.push('neck > 40 cm (+4)'); }
  if (bmi >= 30) { total += 5; counted.push('BMI >= 30 (+5)'); }
  else if (bmi >= 25) { total += 3; counted.push('BMI 25 to < 30 (+3)'); }
  if (onFlag(input.snoring)) { total += 2; counted.push('snoring (+2)'); }
  if (age > 55) { total += 4; counted.push('age > 55 (+4)'); }
  if (onFlag(input.male)) { total += 2; counted.push('male sex (+2)'); }
  const high = total >= 8;
  return {
    valid: true, total, high,
    abnormal: high,
    band: high
      ? `NoSAS ${total}/17: >= 8 -- high probability of sleep-disordered breathing; consider sleep evaluation.`
      : `NoSAS ${total}/17: < 8 -- below the high-risk threshold for sleep-disordered breathing.`,
    counted: counted.length ? counted.join(', ') : 'no NoSAS items present',
    note: NOSAS_NOTE,
  };
}

// --- 2.6 ahi-odi-severity -----------------------------------------------------
const AHI_NOTE = 'AHI / ODI severity (American Academy of Sleep Medicine Task Force, Sleep 1999; AASM scoring-manual v2.0 2012): the apnea-hypopnea index bands obstructive sleep apnea severity as normal < 5, mild 5 to < 15, moderate 15 to < 30, and severe >= 30 events per hour. The oxygen desaturation index (ODI) is shown alongside with the desaturation criterion stated -- the 4% rule (no arousal-only events; still required by CMS) scores fewer events than the recommended 3%-or-arousal rule, so the same patient can cross a severity band by which rule is applied. It reports the band; the diagnostic and treatment decision stays with the clinician and local protocol.';
const AHI_BAND = (n) => n < 5 ? 'normal' : n < 15 ? 'mild' : n < 30 ? 'moderate' : 'severe';

export function ahiOdiSeverity(input = {}) {
  const ahi = fin(input.ahi);
  if (ahi == null) {
    return { valid: false, band: 'Enter the apnea-hypopnea index (events/hour) to classify the severity; the oxygen desaturation index is optional.', note: AHI_NOTE };
  }
  if (ahi < 0) {
    return { valid: false, band: 'The apnea-hypopnea index cannot be negative; enter the events per hour from the sleep study.', note: AHI_NOTE };
  }
  const ahiR = r1(ahi);
  const severity = AHI_BAND(ahiR);
  const criterion = input.criterion === '4%' ? '4%' : '3%';
  const odi = fin(input.odi);
  let odiText = null;
  if (odi != null && odi >= 0) {
    const odiR = r1(odi);
    odiText = `ODI ${odiR}/hr (${criterion} desaturation criterion): ${AHI_BAND(odiR)} range.`;
  }
  return {
    valid: true, ahi: ahiR, severity, criterion, odi: odi != null && odi >= 0 ? r1(odi) : null,
    abnormal: severity === 'moderate' || severity === 'severe',
    band: `AHI ${ahiR}/hr: ${severity} obstructive sleep apnea (AASM bands -- normal < 5, mild 5-<15, moderate 15-<30, severe >= 30).`,
    odiText,
    note: AHI_NOTE,
  };
}
