// spec-v139 (second feature spec of Wave 7 of the spec-v100 MDCalc Parity
// Completion program): six deterministic gynecology decision rules that fill
// confirmed gaps. None duplicates a live tile; v139 parses no report and runs
// no AI.
//
//   flammVbac        - Flamm & Geiger admission VBAC-success score (free Grobman substitute)
//   romaOvarian      - Risk of Ovarian Malignancy Algorithm (HE4 + CA-125 + menopause)
//   rmiOvarian       - Risk of Malignancy Index I / II / III (U x M x CA-125)
//   iotaSimpleRules  - IOTA Simple Rules benign / malignant / inconclusive (free ADNEX substitute)
//   rotterdamPcos    - Rotterdam 2003 two-of-three PCOS criteria
//   popqStaging      - POP-Q pelvic-organ-prolapse stage 0-IV from the measured points
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v139.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the score / index / verdict and the source's
// framing; the management decision stays with the clinician (spec-v11 §5.3).
//
// COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-verified
// across >= 2 independent sources. NO-FABRICATION / SOURCE-GOVERNANCE:
//   - flammVbac (Flamm & Geiger 1997, Obstet Gynecol 90(6):907-910): the five
//     admission factors -- maternal age < 40 (2), prior vaginal birth (before &
//     after first cesarean 4, after only 2, before only 1, none 0), reason other
//     than failure to progress for the prior cesarean (1), cervical effacement
//     (>75% 2, 25-75% 1, <25% 0), and cervical dilation >= 4 cm (1) -- sum 0-10.
//     Predicted-success bands per the source: 0-2 ~49%, 3 ~60%, 4 ~67%, 5 ~77%,
//     6 ~89%, 7 ~93%, 8-10 ~95%. Class A. The free Flamm score substitutes for the
//     excluded paywalled Grobman MFMU calculator (spec-v100 §8).
//   - romaOvarian (Moore 2009, Gynecol Oncol 112(1):40-46): a logistic predictive
//     index with NATURAL-LOG marker terms.
//       premenopausal:  PI = -12.0 + 2.38*ln(HE4) + 0.0626*ln(CA125)
//       postmenopausal: PI =  -8.09 + 1.04*ln(HE4) + 0.732*ln(CA125)
//     ROMA% = 100 * exp(PI)/(1+exp(PI)). High-risk cut-points per Moore 2009
//     (Architect platform): >= 13.1% premenopausal, >= 27.7% postmenopausal. The
//     cutoffs are assay-platform-dependent and revisable -> Class B (citation-
//     staleness row). The ln domains are guarded for non-positive markers and the
//     logistic exponent is overflow-clamped -- never a probability from NaN.
//   - rmiOvarian (Jacobs 1990, Br J Obstet Gynaecol 97(10):922-929; Tingulstad
//     1996/1999 for II/III): RMI = U x M x CA-125 (U/mL). The ultrasound feature
//     count is over multilocular cyst, solid areas, bilateral lesions, ascites, and
//     intra-abdominal metastases. The U and M scaling change with the variant:
//       RMI I:   U = {0 features -> 0, 1 -> 1, 2-5 -> 3};  M = {pre 1, post 3}
//       RMI II:  U = {0-1 -> 1, 2-5 -> 4};                 M = {pre 1, post 4}
//       RMI III: U = {0-1 -> 1, 2-5 -> 3};                 M = {pre 1, post 3}
//     High-risk threshold RMI > 200 (the conventional cut). Class A.
//   - iotaSimpleRules (Timmerman 2008, Ultrasound Obstet Gynecol 31(6):681-690):
//     five B (benign) and five M (malignant) ultrasound descriptors. Verdict:
//     benign if >= 1 B and no M; malignant if >= 1 M and no B; inconclusive if both
//     or neither. Class A. The free Simple Rules substitute for the excluded IOTA
//     ADNEX model (spec-v100 §8).
//   - rotterdamPcos (Rotterdam ESHRE/ASRM 2003 consensus, Hum Reprod 2004;19(1):
//     41-47): two of three features -- oligo/anovulation, clinical/biochemical
//     hyperandrogenism, polycystic ovarian morphology -- after exclusion of mimics.
//     Class B (the consensus criteria are revisable -> citation-staleness row).
//   - popqStaging (Bump 1996, Am J Obstet Gynecol 175(1):10-17): the leading edge
//     (most distal / most positive of Aa, Ba, C, D, Ap, Bp, in cm relative to the
//     hymen at 0) drives the stage: 0 (no descent: Aa=Ba=Ap=Bp=-3 and C <= -(TVL-2)),
//     I (leading edge < -1), II (-1 to +1), III (> +1 but < +(TVL-2)), IV (>= +(TVL-2)).
//     Class A. The catalog vocab has no urogynecology term; obstetrics-gynecology
//     is used (flagged in the audit + spec).

import { r1 } from './num.js';

const pos = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const fin = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clampExp = (x) => (x > 40 ? 40 : x < -40 ? -40 : x);
// Overflow-safe logistic: never returns Infinity for extreme inputs.
const sigmoid = (x) => {
  const z = clampExp(x);
  if (z >= 0) { const e = Math.exp(-z); return 1 / (1 + e); }
  const e = Math.exp(z); return e / (1 + e);
};

// --- 2.1 flamm-vbac -----------------------------------------------------------
const FLAMM_NOTE = 'Flamm VBAC admission score (Flamm BL, Geiger AM, Obstet Gynecol 1997): an admission scoring system summing five factors known at the time of admission for a trial of labor after cesarean -- maternal age under 40 (2 points), prior vaginal birth (before and after the first cesarean 4, after only 2, before only 1, none 0), the prior cesarean being for a reason other than failure to progress (1), cervical effacement (over 75% 2, 25 to 75% 1, under 25% 0), and cervical dilation of 4 cm or more (1). The total of 0 to 10 maps to a predicted likelihood of a successful vaginal birth. It is a counseling estimate, offered here as the free substitute for the paywalled Grobman MFMU calculator; the trial-of-labor decision stays with the patient and clinician.';

const FLAMM_VB = { beforeAfter: 4, after: 2, before: 1, none: 0 };
const FLAMM_EFF = { gt75: 2, mid: 1, lt25: 0 };
// Predicted VBAC-success likelihood by total score, per Flamm & Geiger 1997.
function flammSuccess(score) {
  if (score <= 2) return 49;
  if (score === 3) return 60;
  if (score === 4) return 67;
  if (score === 5) return 77;
  if (score === 6) return 89;
  if (score === 7) return 93;
  return 95; // 8-10
}

export function flammVbac(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vb = FLAMM_VB[o.vaginalBirth];
  const eff = FLAMM_EFF[o.effacement];
  if (vb === undefined || eff === undefined) return { valid: false, message: 'Choose the prior-vaginal-birth and cervical-effacement categories.' };
  const score = (onFlag(o.ageUnder40) ? 2 : 0)
    + vb
    + (onFlag(o.reasonNotFtp) ? 1 : 0)
    + eff
    + (onFlag(o.dilation4) ? 1 : 0);
  const pct = flammSuccess(score);
  return {
    valid: true, score, success: pct,
    abnormal: false,
    band: `Flamm VBAC admission score ${score}/10: estimated likelihood of a successful vaginal birth about ${pct}%.`,
    note: FLAMM_NOTE,
  };
}

// --- 2.2 roma-ovarian ---------------------------------------------------------
const ROMA_NOTE = 'ROMA -- Risk of Ovarian Malignancy Algorithm (Moore RG, McMeekin DS, Brown AK, et al, Gynecol Oncol 2009): a logistic model combining HE4, CA-125, and menopausal status to predict epithelial ovarian cancer in a woman with a pelvic mass. The predictive index uses natural-log marker terms; ROMA% is the back-transformed probability. The Moore 2009 high-risk cut-points are about 13.1% premenopausal and 27.7% postmenopausal, but the cutoff is assay-platform dependent -- read it against the threshold validated for your laboratory assay. It frames a probability, not a surgery referral; the management decision stays with the clinician.';

export function romaOvarian(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const he4 = pos(o.he4);     // pmol/L
  const ca125 = pos(o.ca125); // U/mL
  if (he4 === null || ca125 === null) return { valid: false, message: 'Enter positive HE4 (pmol/L) and CA-125 (U/mL).' };
  const post = onFlag(o.postmenopausal);
  const pi = post
    ? (-8.09 + 1.04 * Math.log(he4) + 0.732 * Math.log(ca125))
    : (-12.0 + 2.38 * Math.log(he4) + 0.0626 * Math.log(ca125));
  if (!Number.isFinite(pi)) return { valid: false, message: 'Marker values out of plausible range.' };
  const p = sigmoid(pi);
  const pct = r1(p * 100);
  const cutoff = post ? 27.7 : 13.1;
  const status = post ? 'postmenopausal' : 'premenopausal';
  const high = pct >= cutoff;
  return {
    valid: true, roma: pct, cutoff, postmenopausal: post,
    abnormal: high,
    band: `ROMA ${pct.toFixed(1)}% (${status}; high-risk cut-point ${cutoff}%): ${high ? 'elevated risk of epithelial ovarian cancer' : 'low risk'}.`,
    note: ROMA_NOTE,
  };
}

// --- 2.3 rmi-ovarian ----------------------------------------------------------
const RMI_NOTE = 'Risk of Malignancy Index (Jacobs I, et al, Br J Obstet Gynaecol 1990; Tingulstad 1996/1999 for II/III): RMI = U x M x CA-125, where U is the ultrasound score from the count of features (multilocular cyst, solid areas, bilateral lesions, ascites, intra-abdominal metastases), M is the menopausal score, and CA-125 is in U/mL. The U and M scaling differs by variant. An RMI over 200 is the conventional high-risk threshold prompting referral to a gynecologic-oncology centre. It frames an index, not a diagnosis; the decision stays with the clinician.';

const RMI_FEATURES = ['multilocular', 'solidAreas', 'bilateral', 'ascites', 'metastases'];

export function rmiOvarian(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ca125 = pos(o.ca125);
  if (ca125 === null) return { valid: false, message: 'Enter a positive CA-125 (U/mL).' };
  const variant = o.variant === '2' || o.variant === '3' ? o.variant : '1';
  const count = RMI_FEATURES.reduce((n, k) => n + (onFlag(o[k]) ? 1 : 0), 0);
  const post = onFlag(o.postmenopausal);
  let u; let m;
  if (variant === '1') {
    u = count === 0 ? 0 : count === 1 ? 1 : 3;
    m = post ? 3 : 1;
  } else if (variant === '2') {
    u = count <= 1 ? 1 : 4;
    m = post ? 4 : 1;
  } else { // '3'
    u = count <= 1 ? 1 : 3;
    m = post ? 3 : 1;
  }
  const rmi = r1(u * m * ca125);
  const high = rmi > 200;
  return {
    valid: true, rmi, u, m, variant, features: count,
    abnormal: high,
    band: `RMI ${variant} = U(${u}) x M(${m}) x CA-125(${r1(ca125)}) = ${rmi}: ${high ? 'high risk (over 200)' : 'lower risk (200 or below)'}.`,
    note: RMI_NOTE,
  };
}

// --- 2.4 iota-simple-rules ----------------------------------------------------
const IOTA_NOTE = 'IOTA Simple Rules (Timmerman D, Testa AC, Bourne T, et al, Ultrasound Obstet Gynecol 2008): five benign (B) and five malignant (M) ultrasound descriptors. If one or more B features apply and no M feature, the mass is benign; if one or more M features and no B feature, malignant; if both or neither apply, the result is inconclusive and a second-stage test or expert review is advised. Offered as the free substitute for the IOTA ADNEX model. It classifies the read ultrasound features, not the image; the management decision stays with the clinician.';

const IOTA_B = ['b1', 'b2', 'b3', 'b4', 'b5'];
const IOTA_M = ['m1', 'm2', 'm3', 'm4', 'm5'];

export function iotaSimpleRules(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bCount = IOTA_B.reduce((n, k) => n + (onFlag(o[k]) ? 1 : 0), 0);
  const mCount = IOTA_M.reduce((n, k) => n + (onFlag(o[k]) ? 1 : 0), 0);
  let verdict; let abnormal;
  if (bCount >= 1 && mCount === 0) { verdict = 'benign'; abnormal = false; }
  else if (mCount >= 1 && bCount === 0) { verdict = 'malignant'; abnormal = true; }
  else { verdict = 'inconclusive'; abnormal = false; }
  return {
    valid: true, verdict, bCount, mCount,
    abnormal,
    band: `IOTA Simple Rules: ${bCount} B (benign) and ${mCount} M (malignant) feature${bCount + mCount === 1 ? '' : 's'} present -> ${verdict}${verdict === 'inconclusive' ? ' (both or neither -- second-stage test advised)' : ''}.`,
    note: IOTA_NOTE,
  };
}

// --- 2.5 rotterdam-pcos -------------------------------------------------------
const ROTTERDAM_NOTE = 'Rotterdam PCOS criteria (Rotterdam ESHRE/ASRM-Sponsored PCOS Consensus Workshop Group, Hum Reprod 2004): polycystic ovary syndrome requires at least two of three features -- oligo- or anovulation, clinical and/or biochemical hyperandrogenism, and polycystic ovarian morphology on ultrasound -- after the exclusion of mimics (thyroid disease, hyperprolactinemia, non-classic congenital adrenal hyperplasia, and androgen-secreting tumors). It states whether the criteria are met and the phenotype; the workup and management stay with the clinician.';

const PHENOTYPE = {
  '111': 'phenotype A (hyperandrogenism + ovulatory dysfunction + polycystic morphology)',
  '110': 'phenotype B (hyperandrogenism + ovulatory dysfunction)',
  '101': 'phenotype C (hyperandrogenism + polycystic morphology)',
  '011': 'phenotype D (ovulatory dysfunction + polycystic morphology)',
};

export function rotterdamPcos(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hyper = onFlag(o.hyperandrogenism) ? 1 : 0;
  const oligo = onFlag(o.oligoAnovulation) ? 1 : 0;
  const pcom = onFlag(o.pcom) ? 1 : 0;
  const excluded = onFlag(o.mimicsExcluded);
  const count = hyper + oligo + pcom;
  const met = count >= 2 && excluded;
  let band;
  if (!excluded) {
    band = `${count} of 3 Rotterdam features present, but mimics not yet excluded: criteria not confirmed until thyroid disease, hyperprolactinemia, non-classic CAH, and androgen-secreting tumors are excluded.`;
  } else if (met) {
    const pheno = PHENOTYPE[`${hyper}${oligo}${pcom}`] || 'all three features';
    band = `${count} of 3 Rotterdam features present after exclusion of mimics: PCOS criteria met -- ${pheno}.`;
  } else {
    band = `${count} of 3 Rotterdam features present after exclusion of mimics: criteria not met (two of three are required).`;
  }
  return {
    valid: true, count, met, mimicsExcluded: excluded,
    abnormal: met,
    band,
    note: ROTTERDAM_NOTE,
  };
}

// --- 2.6 popq-staging ---------------------------------------------------------
const POPQ_NOTE = 'POP-Q staging (Bump RC, Mattiasson A, Bø K, et al, Am J Obstet Gynecol 1996): the leading (most dependent) edge of prolapse -- the most positive of points Aa, Ba, C, D, Ap, and Bp, measured in centimeters relative to the hymen at zero -- drives the stage. Stage 0 is no descent (Aa, Ba, Ap, Bp all at -3 cm and the cervix/cuff at or above -(TVL-2)); stage I is a leading edge more than 1 cm above the hymen; stage II is within 1 cm of the hymen; stage III is more than 1 cm below; stage IV is essentially complete eversion. It reports the stage and the leading point; the management decision stays with the clinician.';

const POPQ_POINTS = [['Aa', 'aa'], ['Ba', 'ba'], ['C', 'c'], ['D', 'd'], ['Ap', 'ap'], ['Bp', 'bp']];

export function popqStaging(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const tvl = pos(o.tvl);
  if (tvl === null) return { valid: false, message: 'Enter the total vaginal length (TVL, cm).' };
  // D is optional (absent after hysterectomy); the other five points are required.
  const required = [['Aa', 'aa'], ['Ba', 'ba'], ['C', 'c'], ['Ap', 'ap'], ['Bp', 'bp']];
  const vals = {};
  for (const [name, key] of required) {
    const v = fin(o[key]);
    if (v === null) return { valid: false, message: 'Enter the prolapse points Aa, Ba, C, Ap, Bp (cm) and TVL.' };
    vals[name] = v;
  }
  const dVal = fin(o.d);
  if (dVal !== null) vals.D = dVal;
  // Leading edge = the most positive (most dependent) measured point.
  let lead = -Infinity; let leadName = '';
  for (const [name] of POPQ_POINTS) {
    if (vals[name] != null && vals[name] > lead) { lead = vals[name]; leadName = name; }
  }
  const evert = r1(tvl - 2); // +(TVL-2) cm: the stage III / IV boundary
  const stage0 = vals.Aa === -3 && vals.Ba === -3 && vals.Ap === -3 && vals.Bp === -3
    && vals.C <= -evert && (vals.D == null || vals.D <= -evert);
  let stage;
  if (stage0) stage = '0';
  else if (lead < -1) stage = 'I';
  else if (lead <= 1) stage = 'II';
  else if (lead < evert) stage = 'III';
  else stage = 'IV';
  const leadStr = lead >= 0 ? `+${r1(lead)}` : `${r1(lead)}`;
  return {
    valid: true, stage, leadingEdge: r1(lead), leadingPoint: leadName,
    abnormal: stage !== '0' && stage !== 'I',
    band: stage === '0'
      ? 'POP-Q stage 0: no prolapse demonstrated.'
      : `POP-Q stage ${stage}: leading edge ${leadStr} cm at point ${leadName}.`,
    note: POPQ_NOTE,
  };
}
