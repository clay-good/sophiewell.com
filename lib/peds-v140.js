// spec-v140 (third feature spec of Wave 7 of the spec-v100 MDCalc Parity
// Completion program): pediatric and neonatal severity instruments that fill
// confirmed gaps. None duplicates a live tile; v140 parses no report and runs
// no AI.
//
//   eosCalculator             - Kaiser neonatal early-onset-sepsis posterior probability
//   snappeII                  - SNAPPE-II neonatal illness-severity / mortality points
//   rdaiTal                   - RDAI bronchiolitis distress total (+ Tal respiratory score)
//   clinicalDehydrationScale  - Goldman four-item CDS (none / some / moderate-severe)
//   koffBladderCapacity       - Koff expected bladder capacity (mL) = (age + 2) x 30
//
// (crib-ii, the sixth tile proposed in docs/spec-v140.md, is DEFERRED: the
// Parry 2003 birth-weight x gestational-age x sex point matrix could be sourced
// from only a single reproduction and the primary table was access-blocked at
// implementation, so shipping it would violate the spec-v97 "re-fetch and
// cross-verify across >= 2 independent sources" discipline for ~150 cell values
// that drive a neonatal mortality estimate. It is parked alongside the other
// deferred ids until a second independent source for the matrix is in hand.)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v140.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the probability / score / band and the
// source's framing; the management decision stays with the clinician
// (spec-v11 §5.3).
//
// COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-verified
// across >= 2 independent sources. NO-FABRICATION / SOURCE-GOVERNANCE:
//   - eosCalculator (Kuzniewicz MW, Puopolo KM, et al, JAMA Pediatr 2017; model
//     of Puopolo KM, et al, Pediatrics 2011;128(5):e1155): the maternal/prenatal
//     prior is a logistic regression on the linear predictor
//       bx = intercept + 0.8680*tempF - 6.9325*GA + 0.0877*GA^2
//          + 1.2256*(ROMhours + 0.05)^0.2
//          - 1.0488*approptx1 - 1.1861*approptx2
//          + 0.5771*GBSpositive + 0.0427*GBSunknown
//     where tempF is the highest intrapartum temperature in degrees FAHRENHEIT
//     (raw, to 0.1F), GA is gestational age in decimal weeks (a QUADRATIC term,
//     not a spline), ROM enters through a fractional-power transform, approptx1
//     = 1 if GBS-specific antibiotics >= 2 h OR any broad-spectrum antibiotics
//     2 to 3.9 h before delivery, approptx2 = 1 if broad-spectrum antibiotics
//     >= 4 h before delivery, and the incidence-specific intercept is
//     {0.3/1000: 40.0528, 0.4/1000: 40.3415, 0.5/1000: 40.5656, 0.6/1000:
//     40.7489} (Kaiser EMR FAQ, corrected from the Puopolo 2011 supplement,
//     whose GBS-unknown term carried the wrong sign -- it is +0.0427). The prior
//     probability is converted to odds, multiplied by the clinical-exam
//     likelihood ratio (well-appearing 0.41, equivocal 5.0, clinical illness
//     21.2; the upper-95%-CI LRs the published calculator uses), and converted
//     back to the posterior EOS probability per 1,000 live births. The logistic
//     exponent is clamped to [-40, 40] and the ROM transform guards a negative
//     time -- never a probability from NaN/Infinity. Management bands per
//     Kuzniewicz 2017: posterior < 1/1000 routine care; 1 to < 3/1000 blood
//     culture; >= 3/1000 empiric antibiotics; enhanced observation when the risk
//     at birth is >= 1/1000. Class A (fixed published coefficients).
//   - snappeII (Richardson DK, Corcoran JD, Escobar GJ, Lee SK, J Pediatr 2001;
//     138(1):92-100): nine banded variables summing 0-162. Mean BP (mmHg)
//     >=30 -> 0, 20-29 -> 9, <20 -> 19; lowest temp (degC) >35.6 -> 0,
//     35.0-35.6 -> 8, <35.0 -> 15; PaO2(mmHg)/FiO2(%) ratio >2.49 -> 0,
//     1.0-2.49 -> 5, 0.3-0.99 -> 16, <0.3 -> 28; lowest serum pH >=7.20 -> 0,
//     7.10-7.19 -> 7, <7.10 -> 16; multiple seizures 19; urine output
//     (mL/kg/h) >=1 -> 0, 0.1-0.9 -> 5, <0.1 -> 18; birth weight (g) >=1000 -> 0,
//     750-999 -> 10, <750 -> 17; SGA (<3rd percentile) 12; 5-minute Apgar
//     >=7 -> 0, <7 -> 18. Unmeasured physiologic items score their 0 band
//     (the SNAP convention). The PaO2/FiO2 ratio guards a zero FiO2. Class A.
//   - rdaiTal (Lowell DI, Lister G, Von Koss H, McCarthy P, Pediatrics 1987;
//     79(6):939-945; Tal A, et al, Pediatrics 1983;71(1):13-18): RDAI sums six
//     sub-scores -- wheeze on expiration (0-4), inspiration (0-2), and location
//     (0-2), plus supraclavicular, intercostal, and subcostal retractions (each
//     0-3) -- to 0-17. The Tal respiratory score sums respiratory rate, wheeze,
//     cyanosis, and accessory-muscle use (each 0-3) to 0-12 when its inputs are
//     entered. Class A.
//   - clinicalDehydrationScale (Goldman RD, Friedman JN, Parkin PC, Pediatrics
//     2008;122(3):545-549): four items -- general appearance, eyes, mucous
//     membranes, tears -- each 0-2, summing 0-8. 0 none, 1-4 some, 5-8
//     moderate-severe dehydration. Class A.
//   - koffBladderCapacity (Koff SA, Urology 1983;21(3):248): expected bladder
//     capacity (mL) = (age in years + 2) x 30. Guards a negative age and notes
//     the formula's applicable age range. Class A.

import { r1, r2 } from './num.js';

const pos = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const fin = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
// Clamp an integer sub-score into [lo, hi]; a blank or non-finite value -> lo.
const band = (v, lo, hi) => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return lo;
  const i = Math.round(n);
  return i < lo ? lo : i > hi ? hi : i;
};
// Logistic odds from a linear predictor, clamped so exp() never overflows to
// Infinity (Math.exp(709) is the last finite double). Working in odds space --
// odds = e^bx, probability = odds/(1+odds) -- avoids the catastrophic 1-p
// cancellation that makes p === 1 exactly for large bx and leaks NaN.
const logisticOdds = (bx) => Math.exp(bx > 700 ? 700 : bx < -700 ? -700 : bx);
const probFromOdds = (odds) => odds / (1 + odds);

// --- 2.1 eos-calculator -------------------------------------------------------
const EOS_NOTE = 'Neonatal Early-Onset Sepsis Calculator (Kuzniewicz MW, Puopolo KM, et al, JAMA Pediatr 2017; on the model of Puopolo 2011). A maternal/prenatal logistic model estimates the risk of early-onset sepsis at birth from gestational age, the highest intrapartum temperature, rupture-of-membrane duration, GBS status, and intrapartum antibiotics; that prior is then combined by Bayes with the newborn examination (well-appearing, equivocal, or clinical illness) to give the posterior EOS probability per 1,000 live births. The source frames management by the posterior risk -- routine care below 1, blood culture from 1 to under 3, and empiric antibiotics at or above 3 per 1,000, with enhanced observation when the risk at birth is 1 per 1,000 or higher. Enter the highest intrapartum temperature in degrees Fahrenheit. It reports a probability and the source’s stated management tier; the antibiotic, culture, and admission decisions stay with the clinician and local protocol.';

const EOS_INTERCEPT = { '0.3': 40.0528, '0.4': 40.3415, '0.5': 40.5656, '0.6': 40.7489 };
const EOS_LR = { well: 0.41, equivocal: 5.0, illness: 21.2 };
const EOS_EXAM_LABEL = { well: 'well-appearing', equivocal: 'equivocal', illness: 'clinical illness' };

function eosBand(priorR, postR, postStr, priorStr) {
  if (postR >= 3) return `EOS risk ${postStr} per 1,000: at or above 3 per 1,000 -- empiric antibiotics and vitals per NICU protocol.`;
  if (postR >= 1) return `EOS risk ${postStr} per 1,000: 1 to under 3 per 1,000 -- blood culture and vitals every 4 h for 24 h.`;
  if (priorR >= 1) return `EOS risk ${postStr} per 1,000 (risk at birth ${priorStr} per 1,000): below the 1 per 1,000 culture threshold, but the risk at birth is 1 per 1,000 or higher -- enhanced observation with vitals every 4 h for 24 h.`;
  return `EOS risk ${postStr} per 1,000: below 1 per 1,000 -- routine newborn care (no culture, no antibiotics, routine vitals).`;
}

export function eosCalculator(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const intercept = EOS_INTERCEPT[o.incidence] !== undefined ? EOS_INTERCEPT[o.incidence] : EOS_INTERCEPT['0.5'];
  const ga = fin(o.ga);          // decimal weeks
  const tempF = fin(o.tempF);    // highest intrapartum temp, degrees F
  const rom = fin(o.rom);        // ROM duration, hours
  const lr = EOS_LR[o.exam];
  if (ga === null || tempF === null || rom === null) return { valid: false, message: 'Enter gestational age (weeks), highest intrapartum temperature (°F), and rupture-of-membranes duration (hours).' };
  if (ga < 22 || ga > 43) return { valid: false, message: 'Gestational age is outside the model range (22 to 43 weeks).' };
  if (tempF < 90 || tempF > 110) return { valid: false, message: 'Intrapartum temperature is outside a plausible range (90 to 110 °F).' };
  if (rom < 0) return { valid: false, message: 'Rupture-of-membranes duration cannot be negative.' };
  if (lr === undefined) return { valid: false, message: 'Choose the newborn clinical-examination category.' };
  const tx1 = o.abx === 'tx1' ? 1 : 0; // GBS-specific >= 2 h OR broad-spectrum 2-3.9 h before delivery
  const tx2 = o.abx === 'tx2' ? 1 : 0; // broad-spectrum >= 4 h before delivery
  const gbsPos = o.gbs === 'positive' ? 1 : 0;
  const gbsUnk = o.gbs === 'unknown' ? 1 : 0;
  const bx = intercept
    + 0.8680 * tempF
    - 6.9325 * ga
    + 0.0877 * ga * ga
    + 1.2256 * Math.pow(rom + 0.05, 0.2)
    - 1.0488 * tx1
    - 1.1861 * tx2
    + 0.5771 * gbsPos
    + 0.0427 * gbsUnk;
  if (!Number.isFinite(bx)) return { valid: false, message: 'Inputs out of plausible range.' };
  const priorOdds = logisticOdds(bx);        // odds of EOS at birth
  const postOdds = priorOdds * lr;           // Bayes: posterior odds = prior odds x LR
  const priorPer1000 = probFromOdds(priorOdds) * 1000;
  const postPer1000 = probFromOdds(postOdds) * 1000;
  const priorStr = priorPer1000.toFixed(2);
  const postStr = postPer1000.toFixed(2);
  return {
    valid: true,
    priorRisk: r2(priorPer1000),
    posteriorRisk: r2(postPer1000),
    exam: EOS_EXAM_LABEL[o.exam],
    likelihoodRatio: lr,
    abnormal: postPer1000 >= 1,
    band: eosBand(priorPer1000, postPer1000, postStr, priorStr),
    note: EOS_NOTE,
  };
}

// --- 2.2 snappe-ii ------------------------------------------------------------
const SNAPPE_NOTE = 'SNAPPE-II -- Score for Neonatal Acute Physiology with Perinatal Extension-II (Richardson DK, Corcoran JD, Escobar GJ, Lee SK, J Pediatr 2001). Nine variables from the first hours of life -- mean blood pressure, lowest temperature, the PaO2/FiO2 ratio, lowest serum pH, multiple seizures, urine output, birth weight, small-for-gestational-age, and the 5-minute Apgar -- sum to a 0-162 illness-severity score; higher totals carry a higher mortality risk. Enter the PaO2 in mmHg and the FiO2 as a percentage. Items left blank score their normal (0-point) band, per the SNAP convention. It reports the point total and the source’s severity framing; the management decision stays with the clinician.';

function pf(pao2, fio2pct) {
  const p = pos(pao2);
  const f = pos(fio2pct);
  if (p === null || f === null) return null; // not measured -> 0 band
  return p / f;
}

export function snappeII(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const map = pf(o.pao2, o.fio2);
  const bp = fin(o.map);
  const temp = fin(o.temp);
  const ph = fin(o.ph);
  const urine = fin(o.urine);
  const bw = fin(o.bw);
  const apgar = fin(o.apgar5);
  // Each variable contributes its banded points; a blank value scores 0.
  const sBp = bp === null ? 0 : bp >= 30 ? 0 : bp >= 20 ? 9 : 19;
  const sTemp = temp === null ? 0 : temp > 35.6 ? 0 : temp >= 35.0 ? 8 : 15;
  const sOxy = map === null ? 0 : map > 2.49 ? 0 : map >= 1.0 ? 5 : map >= 0.3 ? 16 : 28;
  const sPh = ph === null ? 0 : ph >= 7.20 ? 0 : ph >= 7.10 ? 7 : 16;
  const sSeiz = onFlag(o.seizures) ? 19 : 0;
  const sUrine = urine === null ? 0 : urine >= 1.0 ? 0 : urine >= 0.1 ? 5 : 18;
  const sBw = bw === null ? 0 : bw >= 1000 ? 0 : bw >= 750 ? 10 : 17;
  const sSga = onFlag(o.sga) ? 12 : 0;
  const sApgar = apgar === null ? 0 : apgar >= 7 ? 0 : 18;
  const score = sBp + sTemp + sOxy + sPh + sSeiz + sUrine + sBw + sSga + sApgar;
  const sev = score >= 40 ? 'high' : score >= 21 ? 'moderate' : 'lower';
  return {
    valid: true, score,
    abnormal: score >= 40,
    band: `SNAPPE-II ${score}/162: ${sev} illness severity -- higher totals carry a higher neonatal mortality risk.`,
    note: SNAPPE_NOTE,
  };
}

// --- 2.3 rdai-tal -------------------------------------------------------------
const RDAI_NOTE = 'RDAI -- Respiratory Distress Assessment Instrument (Lowell DI, Lister G, Von Koss H, McCarthy P, Pediatrics 1987) -- grades bronchiolitis distress from six observations: wheezing on expiration (0-4) and inspiration (0-2), wheeze location (0-2), and supraclavicular, intercostal, and subcostal retractions (each 0-3), summing 0-17. The optional Tal respiratory score (Tal A, et al, Pediatrics 1983) sums respiratory rate, wheezing, cyanosis, and accessory-muscle use (each 0-3) to 0-12. Both grade severity for trend; neither sets a treatment threshold. It reports the totals and names the components scored; the management decision stays with the clinician.';

export function rdaiTal(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const wExp = band(o.wheezeExp, 0, 4);
  const wInsp = band(o.wheezeInsp, 0, 2);
  const wLoc = band(o.wheezeLoc, 0, 2);
  const rSupra = band(o.retSupraclav, 0, 3);
  const rInter = band(o.retIntercostal, 0, 3);
  const rSub = band(o.retSubcostal, 0, 3);
  const rdai = wExp + wInsp + wLoc + rSupra + rInter + rSub;
  // The Tal score is reported only when at least one of its inputs is entered.
  const talKeys = ['talRr', 'talWheeze', 'talCyanosis', 'talAccessory'];
  const talEntered = talKeys.some((k) => o[k] !== undefined && o[k] !== '' && o[k] !== null);
  let tal = null; let talBand = '';
  if (talEntered) {
    tal = band(o.talRr, 0, 3) + band(o.talWheeze, 0, 3) + band(o.talCyanosis, 0, 3) + band(o.talAccessory, 0, 3);
    const tsev = tal >= 9 ? 'severe' : tal >= 6 ? 'moderate' : 'mild';
    talBand = ` Tal respiratory score ${tal}/12: ${tsev}.`;
  }
  return {
    valid: true, rdai, tal,
    abnormal: rdai >= 11 || (tal !== null && tal >= 9),
    band: `RDAI ${rdai}/17: bronchiolitis respiratory-distress total (higher means greater distress).${talBand}`,
    note: RDAI_NOTE,
  };
}

// --- 2.4 clinical-dehydration-scale -------------------------------------------
const CDS_NOTE = 'Clinical Dehydration Scale (Goldman RD, Friedman JN, Parkin PC, Pediatrics 2008), validated in children roughly 1 to 36 months with acute gastroenteritis. Four items -- general appearance, eyes, mucous membranes, and tears -- are each scored 0, 1, or 2 and summed to 0-8: a total of 0 is no dehydration, 1 to 4 is some dehydration, and 5 to 8 is moderate to severe dehydration. It reports the total and band; the rehydration decision stays with the clinician.';

export function clinicalDehydrationScale(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const appearance = band(o.appearance, 0, 2);
  const eyes = band(o.eyes, 0, 2);
  const mucous = band(o.mucous, 0, 2);
  const tears = band(o.tears, 0, 2);
  const score = appearance + eyes + mucous + tears;
  const grade = score === 0 ? 'no dehydration' : score <= 4 ? 'some dehydration' : 'moderate to severe dehydration';
  return {
    valid: true, score,
    abnormal: score >= 5,
    band: `Clinical Dehydration Scale ${score}/8: ${grade}.`,
    note: CDS_NOTE,
  };
}

// --- 2.5 koff-bladder-capacity ------------------------------------------------
const KOFF_NOTE = 'Koff expected bladder capacity (Koff SA, Urology 1983): expected bladder capacity in millilitres = (age in years + 2) x 30. It is the standard estimate for children roughly 1 to 12 years; under about 1 year other weight-based formulas are used, and in older children the estimate plateaus near the adult capacity. It reports an expected capacity for reference; the clinical interpretation stays with the clinician.';

export function koffBladderCapacity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = fin(o.age);
  if (age === null) return { valid: false, message: 'Enter the child’s age in years.' };
  if (age < 0) return { valid: false, message: 'Age cannot be negative.' };
  const ml = r1((age + 2) * 30);
  const range = age < 1 || age > 12 ? ' (validated roughly for ages 1 to 12 years).' : '.';
  return {
    valid: true, capacity: ml, age: r1(age),
    abnormal: false,
    band: `Expected bladder capacity ${ml} mL for age ${r1(age)} years ((${r1(age)} + 2) × 30)${range}`,
    note: KOFF_NOTE,
  };
}
