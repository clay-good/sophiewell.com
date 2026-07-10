// spec-v281: hepatocellular-carcinoma surveillance & detection — the GALAD score
// (HCC probability from serum biomarkers) and the Toronto HCC Risk Index (THRI,
// 10-year HCC risk in cirrhosis). Both ids were verified absent (spec-v85 §6.2) by
// a direct scan of app.js AND the MCP adapter set first. v281 runs no AI and makes
// no runtime network call.
//
// These compute a probability or a risk category — they are NOT a diagnosis and
// NOT a biopsy / imaging / surveillance-interval order (spec-v11 §5.3). The
// decision stays with the hepatology team.
//
// DEFINITIONS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see each function header).

import { num, r1, r2 } from './num.js';

function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
const log10 = (x) => Math.log(x) / Math.LN10;

// --- GALAD score (Johnson 2014) ----------------------------------------------
// Johnson PJ, Pirrie SJ, Cox TF, et al. The detection of hepatocellular carcinoma
// using a prospectively developed and validated model based on serological
// biomarkers. Cancer Epidemiol Biomarkers Prev. 2014;23(1):144-153. The GALAD
// linear predictor Z (which IS the reported score) is:
//   Z = -10.08 + 0.09*age + 1.67*sex(male=1,female=0) + 2.34*log10(AFP)
//       + 0.04*AFP-L3(%) + 1.33*log10(DCP)
// probability = e^Z / (1 + e^Z). The model is commonly applied at the Z = -0.63
// cutoff (~85% sensitivity / 90% specificity in the derivation cohort). Assay
// units: AFP in ng/mL, DCP (des-gamma-carboxy-prothrombin, a.k.a. PIVKA-II) in
// mAU/mL, AFP-L3 as a percentage. Coefficients cross-verified against the primary
// paper and independent reproductions (they agree on every coefficient and the
// -0.63 cutoff).
const GALAD_CUTOFF = -0.63;
const GALAD_NOTE = 'GALAD score (Johnson 2014): a serum-biomarker model for the probability that a lesion is hepatocellular carcinoma, from Gender, Age, AFP-L3, AFP, and DCP (des-gamma-carboxy-prothrombin / PIVKA-II). Z = -10.08 + 0.09*age + 1.67*(male=1) + 2.34*log10(AFP) + 0.04*AFP-L3 + 1.33*log10(DCP); probability = e^Z/(1+e^Z). Commonly applied at the Z = -0.63 cutoff (~85% sensitivity / 90% specificity). Assay units: AFP ng/mL, DCP mAU/mL, AFP-L3 %. It outperforms AFP alone but reports a probability, not a diagnosis or a biopsy/imaging order.';

export function galadHcc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const male = o.sex === 'male' ? 1 : (o.sex === 'female' ? 0 : null);
  const age = pos(o.age, 0, 120);
  const afpL3 = pos(o.afpL3, 0, 100);
  const afp = pos(o.afp, 0.0001, 5000000); // ng/mL, > 0 for the log domain
  const dcp = pos(o.dcp, 0.0001, 5000000); // mAU/mL, > 0 for the log domain
  if (male === null || age === null || afpL3 === null || afp === null || dcp === null) {
    return { valid: false, message: 'Enter sex, age, AFP-L3 (%), AFP (ng/mL), and DCP/PIVKA-II (mAU/mL). AFP and DCP must be greater than 0.' };
  }
  const z = num('GALAD Z', -10.08 + 0.09 * age + 1.67 * male + 2.34 * log10(afp) + 0.04 * afpL3 + 1.33 * log10(dcp), { min: -100, max: 100 });
  const prob = num('GALAD probability', Math.min(100, Math.max(0, 100 * (Math.exp(z) / (1 + Math.exp(z))))), { min: 0, max: 100 });
  const zR = r2(z);
  const probR = r1(prob);
  const above = z >= GALAD_CUTOFF;
  return {
    valid: true,
    score: zR,
    z: zR,
    probability: probR,
    aboveCutoff: above,
    abnormal: above,
    bandLabel: `GALAD Z ${zR} (${probR}% probability)`,
    detail: `GALAD Z ${zR} (logistic probability ${probR}%) — ${above ? 'at or above' : 'below'} the Z = ${GALAD_CUTOFF} cutoff${above ? ' (higher HCC probability)' : ''}. AFP ${afp} ng/mL, AFP-L3 ${afpL3}%, DCP ${dcp} mAU/mL, age ${age}, ${male ? 'male' : 'female'}.`,
    note: GALAD_NOTE,
  };
}

// --- Toronto HCC Risk Index (Sharma 2017) ------------------------------------
// Sharma SA, Kowgier M, Cerocchi O, et al. Toronto HCC risk index: a validated
// scoring system to predict 10-year risk of HCC in patients with cirrhosis. J
// Hepatol. 2017;68(1):92-99. Table 3 point weights (transcribed verbatim from the
// primary paper; total 0-366):
//   Age:        <45 -> 0,  45-60 -> 50,  >60 -> 100
//   Etiology:   autoimmune / HCV-SVR -> 0, other -> 36, steatohepatitis -> 54,
//               HCV -> 97, HBV -> 97
//   Sex:        female -> 0, male -> 80
//   Platelets:  >200 -> 0, 140-200 -> 20, 80-139 -> 70, <80 -> 89 (x10^9/L)
// Risk bands (verified against the paper + external validations): low < 120,
// medium 120-240, high > 240, with 10-year cumulative HCC incidence ~3% / 10% /
// 32% respectively.
const THRI_ETIOLOGY = { autoimmune: 0, 'hcv-svr': 0, other: 36, steatohepatitis: 54, hcv: 97, hbv: 97 };
const THRI_ETIOLOGY_LABEL = {
  autoimmune: 'autoimmune (AIH/PBC/PSC)', 'hcv-svr': 'HCV with SVR', other: 'other', steatohepatitis: 'steatohepatitis (NAFLD/ALD)', hcv: 'HCV', hbv: 'HBV',
};
const THRI_NOTE = 'Toronto HCC Risk Index (THRI; Sharma 2017): a validated score for 10-year HCC risk in cirrhosis from age, sex, cirrhosis etiology, and platelet count (total 0-366). Age <45/45-60/>60 = 0/50/100; etiology autoimmune or HCV-SVR = 0, other = 36, steatohepatitis = 54, HCV or HBV = 97; male = 80; platelets >200/140-200/80-139/<80 = 0/20/70/89 (x10^9/L). Bands: low < 120 (~3% 10-year HCC), medium 120-240 (~10%), high > 240 (~32%). A surveillance-risk category, not a surveillance-interval order.';

function thriAgePoints(age) {
  if (age < 45) return 0;
  if (age <= 60) return 50;
  return 100;
}
function thriPlateletPoints(plt) {
  if (plt > 200) return 0;
  if (plt >= 140) return 20;
  if (plt >= 80) return 70;
  return 89;
}

export function torontoHccRisk(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 0, 120);
  const male = o.sex === 'male' ? 1 : (o.sex === 'female' ? 0 : null);
  const etPts = THRI_ETIOLOGY[o.etiology];
  const plt = pos(o.platelets, 0, 3000);
  if (age === null || male === null || etPts === undefined || plt === null) {
    return { valid: false, message: 'Enter age, sex, cirrhosis etiology, and platelet count (x10^9/L).' };
  }
  const agePts = thriAgePoints(age);
  const sexPts = male ? 80 : 0;
  const pltPts = thriPlateletPoints(plt);
  const score = num('THRI', agePts + etPts + sexPts + pltPts, { min: 0, max: 366 });
  const band = score > 240 ? 'high' : (score >= 120 ? 'medium' : 'low');
  const risk = band === 'high' ? '~32% 10-year HCC risk' : (band === 'medium' ? '~10% 10-year HCC risk' : '~3% 10-year HCC risk');
  return {
    valid: true,
    score,
    band,
    abnormal: band === 'high',
    bandLabel: `THRI ${score} — ${band} 10-year HCC risk`,
    detail: `Toronto HCC Risk Index ${score}/366 — ${band}-risk group (${risk}). Points: age ${agePts}, sex ${sexPts}, etiology ${etPts} (${THRI_ETIOLOGY_LABEL[o.etiology]}), platelets ${pltPts}.`,
    note: THRI_NOTE,
  };
}
