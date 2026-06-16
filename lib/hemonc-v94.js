// spec-v94 (Wave 2 of the spec-v85 Advanced Clinical Calculators program):
// five deterministic hematology & oncology prognostic scores that close the
// catalog's malignancy-prognosis gap (it shipped the heme bedside cluster --
// anc, khorana, four-ts, isth-dic, tls-cairo-bishop -- but no scores that
// stratify a new diagnosis or set the survival expectation).
//
//   hscoreHlh - HScore for reactive hemophagocytic syndrome (Fardet 2014)
//   ipssrMds  - Revised IPSS-R for myelodysplastic syndromes (Greenberg 2012)
//   flipi     - Follicular-Lymphoma IPI + IPI for aggressive NHL
//   mascc     - MASCC risk index for febrile neutropenia (Klastersky 2000)
//   sokalCml  - Sokal relative risk + ELTS score for CML (Sokal 1984 / Pfirrmann 2016)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v20.js wire these to the home grid.
// Every function takes a single destructured object so the spec-v59 fuzz harness
// can drive each field through its adversarial matrix; the load-bearing guarded
// domains are the sokalCml exp() (a huge platelet/age input overflows to
// Infinity) and the ELTS (platelets/1000)^(-0.5) negative power (a zero/negative
// platelet count). Both are surfaced as a finite null, never a NaN/Infinity term.
// r2 comes from lib/num.js (spec-v53 §4.1). None authors a management or
// disposition order in Sophie's voice (spec-v11 §5.3) -- each surfaces the
// computation and the cited source's own band / category / index.

import { r2 } from './num.js';

// Finite-or-null: any non-finite input (NaN/Infinity/''/undefined/null) is
// treated as "not provided" rather than throwing, so optional fields are safe.
const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
// Strictly-positive finite or null (a value we can divide by / raise to a power).
const pos = (v) => { const f = fin(v); return f != null && f > 0 ? f : null; };
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1;
// A point lookup that maps an out-of-set selector to 0 (spec-v94 §3: an
// out-of-set value falls through to the lowest contribution, never undefined).
const pick = (map, v) => (Object.prototype.hasOwnProperty.call(map, String(v)) ? map[String(v)] : 0);

// --- 2.1 hscoreHlh - HScore for reactive hemophagocytic syndrome --------------
// Nine weighted items summing 0-337 (Fardet 2014). Temperature, ferritin,
// triglyceride, fibrinogen and AST are entered as raw values and banded
// internally; organomegaly and the cytopenia-lineage count are selectors;
// immunosuppression and marrow hemophagocytosis are yes/no. The probability of
// HLH is read from the published curve; the optimal cutoff (~169) maximizes
// sensitivity (93%)/specificity (86%).
function hscoreProbability(total) {
  // Fardet 2014 probability-of-HLH curve (published bracket values).
  if (total < 90) return '<1%';
  if (total < 100) return '~1%';
  if (total < 110) return '~3%';
  if (total < 120) return '~5%';
  if (total < 130) return '~9%';
  if (total < 140) return '~16%';
  if (total < 150) return '~25%';
  if (total < 160) return '~40%';
  if (total < 170) return '~54%';
  if (total < 180) return '~70%';
  if (total < 190) return '~80%';
  if (total < 200) return '~88%';
  if (total < 210) return '~93%';
  if (total < 220) return '~96%';
  if (total < 230) return '~98%';
  if (total < 250) return '~99%';
  return '>99%';
}
export function hscoreHlh({ immunosuppression, temp, organomegaly, cytopenias, ferritin, triglyceride, fibrinogen, ast, hemophagocytosis } = {}) {
  const t = fin(temp);
  const fer = fin(ferritin);
  const tg = fin(triglyceride);
  const fib = fin(fibrinogen);
  const as = fin(ast);
  const items = [];
  const add = (label, points) => { items.push({ label, points }); return points; };
  let total = 0;
  total += add('Known immunosuppression', onFlag(immunosuppression) ? 18 : 0);
  // Temperature (deg C): <38.4 -> 0; 38.4-39.4 -> 33; >39.4 -> 49.
  total += add('Temperature', t == null ? 0 : (t > 39.4 ? 49 : (t >= 38.4 ? 33 : 0)));
  // Organomegaly: none 0; hepatomegaly OR splenomegaly 23; both 38.
  total += add('Organomegaly', pick({ none: 0, one: 23, both: 38 }, organomegaly));
  // Number of cytopenias: 1 lineage 0; 2 lineages 24; 3 lineages 34.
  total += add('Cytopenias', pick({ 1: 0, 2: 24, 3: 34 }, cytopenias));
  // Ferritin (ng/mL): <2000 -> 0; 2000-6000 -> 35; >6000 -> 50.
  total += add('Ferritin', fer == null ? 0 : (fer > 6000 ? 50 : (fer >= 2000 ? 35 : 0)));
  // Triglyceride (mmol/L): <1.5 -> 0; 1.5-4 -> 44; >4 -> 64.
  total += add('Triglyceride', tg == null ? 0 : (tg > 4 ? 64 : (tg >= 1.5 ? 44 : 0)));
  // Fibrinogen (g/L): >2.5 -> 0; <=2.5 -> 30.
  total += add('Fibrinogen', fib == null ? 0 : (fib <= 2.5 ? 30 : 0));
  // AST (U/L): <30 -> 0; >=30 -> 19.
  total += add('AST', as == null ? 0 : (as >= 30 ? 19 : 0));
  total += add('Hemophagocytosis on marrow', onFlag(hemophagocytosis) ? 35 : 0);
  const probability = hscoreProbability(total);
  const high = total >= 169;
  return {
    valid: true,
    total,
    probability,
    high,
    items,
    band: `HScore ${total}: estimated HLH probability ${probability} (Fardet 2014).`,
    note: 'HScore (Fardet 2014) sums nine weighted items (max 337): immunosuppression 18; temperature 38.4-39.4 C = 33, > 39.4 = 49; organomegaly one organ 23, both 38; cytopenias 2 lineages 24, 3 lineages 34; ferritin 2000-6000 = 35, > 6000 = 50; triglyceride 1.5-4 mmol/L = 44, > 4 = 64; fibrinogen <= 2.5 g/L = 30; AST >= 30 = 19; marrow hemophagocytosis 35. An HScore >= 169 best discriminates reactive HLH (sensitivity 93%, specificity 86%). The diagnosis stays with the clinician.',
  };
}

// --- 2.2 ipssrMds - Revised IPSS-R for myelodysplastic syndromes --------------
// Weighted sum (0-10) of the cytogenetic risk group, marrow blast %, hemoglobin,
// platelets and ANC; mapped to a five-level category with the cited median
// overall survival and time to 25% AML evolution (Greenberg 2012).
const IPSSR_CYTO = { 'very-good': 0, good: 1, intermediate: 2, poor: 3, 'very-poor': 4 };
const IPSSR_BANDS = [
  { key: 'very-low', max: 1.5, label: 'Very low', os: '8.8 years', aml: 'not reached' },
  { key: 'low', max: 3, label: 'Low', os: '5.3 years', aml: '10.8 years' },
  { key: 'intermediate', max: 4.5, label: 'Intermediate', os: '3.0 years', aml: '3.2 years' },
  { key: 'high', max: 6, label: 'High', os: '1.6 years', aml: '1.4 years' },
  { key: 'very-high', max: Infinity, label: 'Very high', os: '0.8 years', aml: '0.7 years' },
];
export function ipssrMds({ cytogenetics, blasts, hemoglobin, platelets, anc } = {}) {
  const bl = fin(blasts);
  const hgb = fin(hemoglobin);
  const plt = fin(platelets);
  const an = fin(anc);
  if (bl == null || bl < 0 || hgb == null || hgb < 0 || plt == null || plt < 0 || an == null || an < 0) {
    return {
      valid: false,
      band: 'Enter the cytogenetic risk group, marrow blast %, hemoglobin (g/dL), platelets (x10⁹/L) and ANC (x10⁹/L).',
      note: 'IPSS-R weights the cytogenetic risk group, marrow blast %, hemoglobin, platelets and ANC (Greenberg 2012).',
    };
  }
  const cytoPts = pick(IPSSR_CYTO, cytogenetics);
  // Marrow blast %: <=2 -> 0; >2 to <5 -> 1; 5-10 -> 2; >10 -> 3.
  const blastPts = bl <= 2 ? 0 : (bl < 5 ? 1 : (bl <= 10 ? 2 : 3));
  // Hemoglobin (g/dL): >=10 -> 0; 8 to <10 -> 1; <8 -> 1.5.
  const hgbPts = hgb >= 10 ? 0 : (hgb >= 8 ? 1 : 1.5);
  // Platelets (x10^9/L): >=100 -> 0; 50 to <100 -> 0.5; <50 -> 1.
  const pltPts = plt >= 100 ? 0 : (plt >= 50 ? 0.5 : 1);
  // ANC (x10^9/L): >=0.8 -> 0; <0.8 -> 0.5.
  const ancPts = an >= 0.8 ? 0 : 0.5;
  const total = r2(cytoPts + blastPts + hgbPts + pltPts + ancPts);
  const band = IPSSR_BANDS.find((b) => total <= b.max);
  return {
    valid: true,
    total,
    bandKey: band.key,
    components: { cytogenetics: cytoPts, blasts: blastPts, hemoglobin: hgbPts, platelets: pltPts, anc: ancPts },
    survival: band.os,
    amlEvolution: band.aml,
    band: `IPSS-R ${total}: ${band.label} risk; median overall survival ${band.os}, time to 25% AML evolution ${band.aml} (Greenberg 2012).`,
    note: 'IPSS-R (Greenberg 2012): cytogenetic group (very good 0, good 1, intermediate 2, poor 3, very poor 4) + marrow blasts (<=2% 0, >2-<5% 1, 5-10% 2, >10% 3) + hemoglobin (>=10 g/dL 0, 8-<10 1, <8 1.5) + platelets (>=100 0, 50-<100 0.5, <50 1) + ANC (>=0.8 0, <0.8 0.5). Categories: very low <=1.5, low >1.5-3, intermediate >3-4.5, high >4.5-6, very high >6. Survival figures are the source medians; this is the clinical/cytogenetic IPSS-R, not the molecular IPSS-M.',
  };
}

// --- 2.3 flipi - Follicular-Lymphoma IPI + IPI for aggressive NHL -------------
// Two five-factor counts. FLIPI (Solal-Celigny 2004): age > 60, stage III/IV,
// Hgb < 12 g/dL, > 4 nodal areas, LDH > normal -> low 0-1, intermediate 2,
// high >= 3. IPI (1993): age > 60, stage III/IV, ECOG >= 2, LDH > normal,
// > 1 extranodal site -> low 0-1, low-int 2, high-int 3, high 4-5. Age, stage
// and LDH are shared inputs; the rest are index-specific.
export function flipi({ ageOver60, stageAdvanced, ldhHigh, hgbLow, nodalOver4, ecogOver2, extranodalOver1 } = {}) {
  const age = onFlag(ageOver60) ? 1 : 0;
  const stage = onFlag(stageAdvanced) ? 1 : 0;
  const ldh = onFlag(ldhHigh) ? 1 : 0;
  const flipiScore = age + stage + ldh + (onFlag(hgbLow) ? 1 : 0) + (onFlag(nodalOver4) ? 1 : 0);
  const ipiScore = age + stage + ldh + (onFlag(ecogOver2) ? 1 : 0) + (onFlag(extranodalOver1) ? 1 : 0);
  let flipiBand;
  let flipiOs;
  if (flipiScore <= 1) { flipiBand = 'low'; flipiOs = '~71% 10-year overall survival'; }
  else if (flipiScore === 2) { flipiBand = 'intermediate'; flipiOs = '~51% 10-year overall survival'; }
  else { flipiBand = 'high'; flipiOs = '~36% 10-year overall survival'; }
  let ipiBand;
  let ipiOs;
  if (ipiScore <= 1) { ipiBand = 'low'; ipiOs = '73% 5-year overall survival'; }
  else if (ipiScore === 2) { ipiBand = 'low-intermediate'; ipiOs = '51% 5-year overall survival'; }
  else if (ipiScore === 3) { ipiBand = 'high-intermediate'; ipiOs = '43% 5-year overall survival'; }
  else { ipiBand = 'high'; ipiOs = '26% 5-year overall survival'; }
  return {
    valid: true,
    flipiScore,
    ipiScore,
    flipiBand,
    ipiBand,
    flipiOs,
    ipiOs,
    band: `FLIPI ${flipiScore} (${flipiBand}); IPI ${ipiScore} (${ipiBand}).`,
    note: 'FLIPI (Solal-Celigny 2004) counts age > 60, Ann Arbor stage III/IV, hemoglobin < 12 g/dL, > 4 nodal areas, LDH > normal -> low 0-1, intermediate 2, high >= 3. IPI (1993, aggressive NHL) counts age > 60, stage III/IV, ECOG >= 2, LDH > normal, > 1 extranodal site -> low 0-1, low-intermediate 2, high-intermediate 3, high 4-5. Survival figures are the source estimates.',
  };
}

// --- 2.4 mascc - MASCC risk index for febrile neutropenia ---------------------
// Klastersky 2000. Burden of illness (no/mild 5, moderate 3, severe 0) + no
// hypotension 5 + no COPD 4 + solid tumor / no prior fungal 4 + no dehydration
// needing IV fluids 3 + outpatient at fever onset 3 + age < 60 2 (max 26). A
// total >= 21 identifies LOW risk -- a candidate for outpatient/oral management.
export function mascc({ burden, noHypotension, noCopd, solidNoFungal, noDehydration, outpatient, ageUnder60 } = {}) {
  const burdenPts = pick({ 'no-mild': 5, moderate: 3, severe: 0 }, burden);
  const items = [
    { label: 'Burden of illness', points: burdenPts },
    { label: 'No hypotension (SBP > 90)', points: onFlag(noHypotension) ? 5 : 0 },
    { label: 'No COPD', points: onFlag(noCopd) ? 4 : 0 },
    { label: 'Solid tumor or no prior fungal infection', points: onFlag(solidNoFungal) ? 4 : 0 },
    { label: 'No dehydration needing IV fluids', points: onFlag(noDehydration) ? 3 : 0 },
    { label: 'Outpatient at fever onset', points: onFlag(outpatient) ? 3 : 0 },
    { label: 'Age < 60', points: onFlag(ageUnder60) ? 2 : 0 },
  ];
  const total = items.reduce((s, it) => s + it.points, 0);
  const lowRisk = total >= 21;
  return {
    valid: true,
    total,
    lowRisk,
    items,
    band: `MASCC ${total}: ${lowRisk ? 'LOW risk for serious complications (>= 21) -- a candidate for outpatient/oral management per the source' : 'not low risk (< 21)'}.`,
    note: 'MASCC risk index (Klastersky 2000), max 26: burden of illness (no/mild symptoms 5, moderate 3, severe 0) + no hypotension 5 + no COPD 4 + solid tumor or no prior fungal infection 4 + no dehydration needing IV fluids 3 + outpatient at fever onset 3 + age < 60 2. A total >= 21 identifies a low-risk febrile-neutropenic patient. Reports the index only; the admission decision stays with the clinician and local protocol.',
  };
}

// --- 2.5 sokalCml - Sokal relative risk + ELTS score for CML ------------------
// Sokal (1984): RR = exp[0.0116*(age-43.4) + 0.0345*(spleen-7.51)
//   + 0.188*((platelets/700)^2 - 0.563) + 0.0887*(blasts-2.10)]
//   -> low < 0.8, intermediate 0.8-1.2, high > 1.2.
// ELTS (Pfirrmann 2016): 0.0025*(age/10)^3 + 0.0615*spleen + 0.1052*blasts
//   + 0.4104*(platelets/1000)^(-0.5)
//   -> low <= 1.5680, intermediate <= 2.2185, high > 2.2185.
// The exp() overflows to Infinity for an extreme age/platelet input and the
// ELTS negative power divides by platelets; both are surfaced as a finite null
// rather than a NaN/Infinity term (spec-v59).
export function sokalCml({ age, spleen, platelets, blasts } = {}) {
  const a = fin(age);
  const sp = fin(spleen);
  const plt = pos(platelets);
  const bl = fin(blasts);
  if (a == null || a < 0 || sp == null || sp < 0 || plt == null || bl == null || bl < 0) {
    return {
      valid: false,
      band: 'Enter age (years), spleen size (cm below the costal margin), platelet count (x10⁹/L, > 0) and peripheral-blood blast %.',
      note: 'Sokal and ELTS are at-diagnosis CML hazard formulas in age, spleen size, platelets and blast %; the platelet count must be > 0 (the ELTS term raises it to a negative power).',
    };
  }
  const sokalRaw = Math.exp(
    0.0116 * (a - 43.4)
    + 0.0345 * (sp - 7.51)
    + 0.188 * ((plt / 700) ** 2 - 0.563)
    + 0.0887 * (bl - 2.10),
  );
  const eltsRaw = 0.0025 * (a / 10) ** 3 + 0.0615 * sp + 0.1052 * bl + 0.4104 * (plt / 1000) ** -0.5;
  const sokal = Number.isFinite(sokalRaw) ? r2(sokalRaw) : null;
  const elts = Number.isFinite(eltsRaw) ? r2(eltsRaw) : null;
  const sokalBand = sokal == null ? null : (sokal < 0.8 ? 'low' : (sokal <= 1.2 ? 'intermediate' : 'high'));
  const eltsBand = elts == null ? null : (elts <= 1.5680 ? 'low' : (elts <= 2.2185 ? 'intermediate' : 'high'));
  const parts = [];
  if (sokal != null) parts.push(`Sokal relative risk ${sokal} (${sokalBand} risk)`);
  if (elts != null) parts.push(`ELTS ${elts} (${eltsBand} risk)`);
  if (parts.length === 0) {
    return {
      valid: false,
      band: 'The entered values overflow the hazard formula; check the platelet count and age.',
      note: 'An extreme input drove the Sokal exponential past the representable range.',
    };
  }
  return {
    valid: true,
    sokal,
    elts,
    sokalBand,
    eltsBand,
    band: `${parts.join('; ')}.`,
    note: 'Sokal RR = exp[0.0116*(age-43.4) + 0.0345*(spleen-7.51) + 0.188*((platelets/700)^2 - 0.563) + 0.0887*(blasts-2.10)] -> low < 0.8, intermediate 0.8-1.2, high > 1.2 (Sokal 1984). ELTS = 0.0025*(age/10)^3 + 0.0615*spleen + 0.1052*blasts + 0.4104*(platelets/1000)^(-0.5) -> low <= 1.5680, intermediate <= 2.2185, high > 2.2185 (Pfirrmann 2016). Spleen is cm below the costal margin; blasts are peripheral-blood %.',
  };
}
