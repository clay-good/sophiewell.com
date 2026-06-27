// spec-v163 (the first feature spec of the spec-v162 Cross-Discipline
// Completion program): three deterministic evidence-based-medicine computes that
// fill a confirmed gap — the catalog cites sensitivity / likelihood-ratios in
// tile notes but has no tool to compute post-test probability, predictive
// values, or numbers-needed-to-treat. None duplicates a live tile; v163 runs no
// AI and makes no runtime network call.
//
//   faganPostTest  - Fagan post-test probability from a pre-test probability and
//                    a likelihood ratio (or sens/spec), computed in odds space
//   diagnostic2x2  - sensitivity / specificity / PPV / NPV / accuracy / LR± from
//                    a 2×2 table, with optional Bayes PPV/NPV at a user prevalence
//   nntArr         - absolute / relative risk reduction, relative risk, and the
//                    number needed to treat / harm from two event rates
//
// Per the spec-v100 §2 doctrine each is closed-form arithmetic over the entered
// values; the formulas are textbook-standard and were cross-verified against >= 2
// independent sources at implementation (spec-v97). Citations live inline in
// lib/meta.js; the renderers in views/group-v163.js render the spec-v50 §3
// posture note and defer interpretation to the clinician (spec-v11 §5.3).
//
// SOURCE-GOVERNANCE (cross-verified, spec-v97):
//   - faganPostTest (Fagan TJ, N Engl J Med 1975;293(5):257): pre-test odds =
//     p/(1−p); post-test odds = pre-test odds × LR; post-test p = odds/(1+odds).
//     Computed in ODDS space (not sigmoid-then-subtract) to avoid the float64
//     clamp at p→0/1 that produced a NaN leak in spec-v140. When sens & spec are
//     supplied instead of an LR, LR+ = sens/(1−spec) and LR− = (1−sens)/spec and
//     both post-test probabilities are reported.
//   - diagnostic2x2 (Altman DG, Bland JM, BMJ 1994;308:1552 & 309:102):
//     sens = TP/(TP+FN), spec = TN/(TN+FP), PPV = TP/(TP+FP), NPV = TN/(TN+FN),
//     accuracy = (TP+TN)/N, LR+ = sens/(1−spec), LR− = (1−sens)/spec. PPV/NPV may
//     be recomputed by Bayes at a user-supplied prevalence so the study PPV is not
//     implied to transfer to a different population.
//   - nntArr (Laupacis A, Sackett DL, Roberts RS, N Engl J Med 1988;318:1728):
//     ARR = CER − EER; RRR = ARR/CER; relative risk RR = EER/CER; NNT = 1/ARR.
//     When EER > CER the treatment increases events: NNH = 1/|ARR| with the harm
//     framing. ARR = 0 is surfaced as "no measurable difference" (NNT undefined)
//     rather than a divide-by-zero.

import { num, r1, r2 } from './num.js';

// Read a probability entered as a percent in [0, 100] (exclusive of the 0/100
// endpoints when `strict`, since pre-test odds need p in (0,1)). '' / null /
// undefined / non-finite / out-of-range -> null so the caller surfaces a
// complete-the-fields fallback rather than NaN / Infinity.
function pct(v, { strict = false } = {}) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 100) return null;
  if (strict && (n <= 0 || n >= 100)) return null;
  return n;
}

// Read a non-negative count (0 allowed): blank / non-finite / negative -> null.
function count(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

// Read a strictly positive number with an optional upper bound.
function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}

// post-test probability (%) from a pre-test probability (%) and a likelihood
// ratio, entirely in odds space. pPct in (0,100); lr >= 0.
function postTestPct(pPct, lr) {
  const p = pPct / 100;
  const preOdds = p / (1 - p); // p guarded to (0,1) by pct(strict)
  const postOdds = preOdds * lr;
  const post = postOdds / (1 + postOdds);
  return r1(num('post-test probability', post * 100, { min: 0, max: 100 }));
}

// --- 2.1 Fagan post-test probability ----------------------------------------
const FAGAN_NOTE = 'Fagan post-test probability (Fagan TJ, N Engl J Med 1975;293(5):257). Pre-test odds = p/(1−p); post-test odds = pre-test odds × likelihood ratio; post-test probability = odds/(1+odds). Enter a likelihood ratio directly, or enter test sensitivity and specificity to derive LR+ = sens/(1−spec) and LR− = (1−sens)/spec and report the post-test probability for a positive and a negative result. Computed in odds space so extreme pre-test probabilities do not leak a non-finite value.';

export function faganPostTest(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pre = pct(o.pretest, { strict: true });
  const mode = o.mode === 'sensspec' ? 'sensspec' : 'lr';
  if (pre === null) {
    return { valid: false, message: 'Enter a pre-test probability between 0 and 100% (exclusive).' };
  }
  if (mode === 'sensspec') {
    const sens = pct(o.sens);
    const spec = pct(o.spec, { strict: true }); // spec=100 -> 1-spec=0 -> LR+ infinite; exclude
    const missing = [];
    if (sens === null) missing.push('sensitivity (%)');
    if (spec === null) missing.push('specificity (0–100% exclusive)');
    if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
    const s = sens / 100; const sp = spec / 100;
    const lrPos = r2(num('LR+', s / (1 - sp), { min: 0, max: 1e6 }));
    const lrNeg = r2(num('LR−', (1 - s) / sp, { min: 0, max: 1e6 }));
    const postPos = postTestPct(pre, lrPos);
    const postNeg = postTestPct(pre, lrNeg);
    return {
      valid: true,
      mode,
      pretest: pre,
      lrPos,
      lrNeg,
      postPos,
      postNeg,
      bandLabel: 'Post-test probability',
      band: `Pre-test ${pre}% → positive result ${postPos}% (LR+ ${lrPos}), negative result ${postNeg}% (LR− ${lrNeg}).`,
      detail: `LR+ = sens/(1−spec) = ${lrPos}; LR− = (1−sens)/spec = ${lrNeg}. A positive test raises and a negative test lowers the probability of disease.`,
      note: FAGAN_NOTE,
    };
  }
  const lr = pos(o.lr, 1e6);
  if (lr === null) return { valid: false, message: 'Enter a likelihood ratio greater than 0.' };
  const post = postTestPct(pre, lr);
  const direction = lr > 1 ? 'raises' : lr < 1 ? 'lowers' : 'does not change';
  return {
    valid: true,
    mode,
    pretest: pre,
    lr: r2(lr),
    posttest: post,
    bandLabel: 'Post-test probability',
    band: `Pre-test ${pre}% × LR ${r2(lr)} → post-test ${post}%.`,
    detail: `An LR of ${r2(lr)} ${direction} the probability of disease (LR > 1 raises, < 1 lowers, = 1 is uninformative).`,
    note: FAGAN_NOTE,
  };
}

// --- 2.2 Diagnostic 2×2 -----------------------------------------------------
const DX2X2_NOTE = 'Diagnostic test 2×2 (Altman DG, Bland JM, BMJ 1994;308:1552 & 309:102). From the four cells: sensitivity = TP/(TP+FN), specificity = TN/(TN+FP), positive predictive value PPV = TP/(TP+FP), negative predictive value NPV = TN/(TN+FN), accuracy = (TP+TN)/N, LR+ = sens/(1−spec), LR− = (1−sens)/spec. The sample PPV/NPV reflect the study prevalence; an optional target prevalence recomputes PPV/NPV by Bayes so the study values are not assumed to transfer to a different population.';

export function diagnostic2x2(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const tp = count(o.tp);
  const fp = count(o.fp);
  const fn = count(o.fn);
  const tn = count(o.tn);
  const missing = [];
  if (tp === null) missing.push('true positives');
  if (fp === null) missing.push('false positives');
  if (fn === null) missing.push('false negatives');
  if (tn === null) missing.push('true negatives');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')} (counts ≥ 0).` };
  const diseased = tp + fn;
  const well = tn + fp;
  const testPos = tp + fp;
  const testNeg = tn + fn;
  const n = tp + fp + fn + tn;
  if (diseased === 0 || well === 0) {
    return { valid: false, message: 'Both disease columns must be non-empty: enter at least one diseased (TP+FN) and one non-diseased (TN+FP) subject.' };
  }
  if (n === 0) return { valid: false, message: 'Enter the four 2×2 cell counts.' };
  const sens = r1(num('sensitivity', (tp / diseased) * 100, { min: 0, max: 100 }));
  const spec = r1(num('specificity', (tn / well) * 100, { min: 0, max: 100 }));
  const accuracy = r1(num('accuracy', ((tp + tn) / n) * 100, { min: 0, max: 100 }));
  const samplePrev = r1(num('prevalence', (diseased / n) * 100, { min: 0, max: 100 }));
  const ppv = testPos === 0 ? null : r1(num('PPV', (tp / testPos) * 100, { min: 0, max: 100 }));
  const npv = testNeg === 0 ? null : r1(num('NPV', (tn / testNeg) * 100, { min: 0, max: 100 }));
  const s = tp / diseased; const sp = tn / well;
  const lrPos = sp >= 1 ? null : r2(num('LR+', s / (1 - sp), { min: 0, max: 1e6 }));
  const lrNeg = sp <= 0 ? null : r2(num('LR−', (1 - s) / sp, { min: 0, max: 1e6 }));
  // Optional Bayes PPV/NPV at a user-supplied target prevalence.
  const targetPrev = pct(o.prevalence);
  let bayesPpv = null; let bayesNpv = null;
  if (targetPrev !== null) {
    const pr = targetPrev / 100;
    const tpr = s; const tnr = sp; const fpr = 1 - sp;
    const ppvDen = tpr * pr + fpr * (1 - pr);
    const npvDen = tnr * (1 - pr) + (1 - tpr) * pr;
    bayesPpv = ppvDen === 0 ? null : r1(num('Bayes PPV', ((tpr * pr) / ppvDen) * 100, { min: 0, max: 100 }));
    bayesNpv = npvDen === 0 ? null : r1(num('Bayes NPV', ((tnr * (1 - pr)) / npvDen) * 100, { min: 0, max: 100 }));
  }
  return {
    valid: true,
    sens,
    spec,
    ppv,
    npv,
    accuracy,
    samplePrev,
    lrPos,
    lrNeg,
    targetPrev,
    bayesPpv,
    bayesNpv,
    bandLabel: 'Diagnostic performance',
    band: `Sensitivity ${sens}%, specificity ${spec}% (LR+ ${lrPos === null ? '∞' : lrPos}, LR− ${lrNeg === null ? '∞' : lrNeg}).`,
    detail: `Sample prevalence ${samplePrev}%: PPV ${ppv === null ? '—' : `${ppv}%`}, NPV ${npv === null ? '—' : `${npv}%`}, accuracy ${accuracy}%.${targetPrev === null ? ' Enter a target prevalence to recompute PPV/NPV by Bayes for a different population.' : ` At a target prevalence of ${targetPrev}%: PPV ${bayesPpv === null ? '—' : `${bayesPpv}%`}, NPV ${bayesNpv === null ? '—' : `${bayesNpv}%`}.`}`,
    note: DX2X2_NOTE,
  };
}

// --- 2.3 NNT / ARR ----------------------------------------------------------
const NNT_NOTE = 'Number needed to treat / absolute risk reduction (Laupacis A, Sackett DL, Roberts RS, N Engl J Med 1988;318:1728-1733). From a control event rate (CER) and an experimental event rate (EER): absolute risk reduction ARR = CER − EER; relative risk reduction RRR = ARR/CER; relative risk RR = EER/CER; number needed to treat NNT = 1/ARR. When EER > CER the intervention increases events and the result is a number needed to harm NNH = 1/|ARR|. ARR = 0 means no measurable difference (NNT undefined).';

export function nntArr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const cer = pct(o.cer);
  const eer = pct(o.eer);
  const missing = [];
  if (cer === null) missing.push('control event rate (%)');
  if (eer === null) missing.push('experimental event rate (%)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const c = cer / 100; const e = eer / 100;
  const arr = r2(num('ARR', (c - e) * 100, { min: -100, max: 100 }));
  const rr = c === 0 ? null : r2(num('RR', e / c, { min: 0, max: 1e6 }));
  const rrr = c === 0 ? null : r1(num('RRR', ((c - e) / c) * 100, { min: -1e6, max: 100 }));
  const absArr = Math.abs(arr);
  if (absArr === 0) {
    return {
      valid: true,
      arr,
      rr,
      rrr,
      nnt: null,
      harm: false,
      bandLabel: 'No measurable difference',
      band: 'ARR 0% — no measurable difference between the groups; NNT is undefined.',
      detail: rr === null ? 'Control event rate is 0%, so relative risk is undefined.' : `Relative risk ${rr}.`,
      note: NNT_NOTE,
    };
  }
  const harm = e > c; // experimental event rate higher -> treatment harms
  const nnt = Math.ceil(100 / absArr); // 1/|ARR| with ARR as a proportion; round up (whole patients)
  return {
    valid: true,
    arr,
    rr,
    rrr,
    nnt,
    harm,
    bandLabel: harm ? 'Number needed to harm' : 'Number needed to treat',
    band: harm
      ? `ARR ${arr}% (event rate increased) — NNH ${nnt}: treating ${nnt} causes one additional event.`
      : `ARR ${arr}% — NNT ${nnt}: treat ${nnt} to prevent one event.`,
    detail: `${rr === null ? 'Relative risk undefined (control rate 0%).' : `Relative risk ${rr}`}${rrr === null ? '' : `; relative risk reduction ${rrr}%`}. NNT/NNH = 1/|ARR|, rounded up to whole patients.`,
    note: NNT_NOTE,
  };
}
