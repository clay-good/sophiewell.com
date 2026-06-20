// spec-v132 (Wave 6 of the spec-v100 MDCalc Parity Completion program): the
// thrombotic-microangiopathy / coagulopathy cluster that sits beside the
// existing four-ts (HIT probability) and khorana (cancer-VTE) tiles. Five
// deterministic instruments; none duplicates a live tile. Each consumes
// clinician-entered labs / findings and returns a score plus the source's
// interpretation -- not a browsable reference table (spec-v100 §2).
//
//   plasmicTtp        - PLASMIC score (0-7): pretest probability of severe
//                       ADAMTS13 deficiency before plasma exchange
//   frenchTtp         - French TTP score (0-3): the European pretest rule
//   jaamDic           - JAAM acute-DIC score (0-8), DIC threshold >= 4
//   ipsetThrombosis   - revised IPSET-thrombosis 4-tier category (essential
//                       thrombocythemia)
//   cisne             - CISNE (0-8): serious-complication risk in CLINICALLY
//                       STABLE febrile neutropenia
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v132.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the score/class and the source's framing; the
// management decision (plasma exchange, transfusion, cytoreduction, admission /
// antibiotics) stays with the clinician and local protocol (spec-v11 §5.3). All
// five are Class A (fixed published point tables; journal+author citations, no
// ISSUER_PATTERN trip) -- no docs/citation-staleness.md row.
//
// POINT TABLES RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-verified
// across >= 2 independent sources. NO-FABRICATION / SOURCE-GOVERNANCE:
//   - plasmicTtp (Bendapudi 2017, Lancet Haematol 4:e157): 1 point each for
//     platelet < 30 x10^9/L; a hemolysis composite (reticulocyte > 2.5% OR
//     undetectable haptoglobin OR indirect bilirubin > 2.0 mg/dL); NO active
//     cancer in the prior year; NO history of solid-organ or stem-cell
//     transplant; MCV < 90 fL; INR < 1.5; creatinine < 2.0 mg/dL. The cancer
//     and transplant points score for the ABSENCE of the condition (the common
//     coding bug -- guarded by tests). Total 0-7. Bands 0-4 low, 5 intermediate,
//     6-7 high probability of severe ADAMTS13 deficiency.
//   - frenchTtp (Coppo 2010, PLoS One 5:e10208): 1 point each for platelet
//     < 30 x10^9/L; creatinine <= 2.26 mg/dL (<= 200 umol/L -- INCLUSIVE per
//     the source, governing over the spec draft's strict "<"); ANA positive.
//     Total 0-3. Score 0 makes severe ADAMTS13 deficiency very unlikely; 2-3
//     makes it highly likely.
//   - jaamDic (Gando 2006, Crit Care Med 34:625 -- the 2006 REVISED criteria,
//     fibrinogen REMOVED, max 8, NOT the older max-10 fibrinogen form): SIRS
//     >= 3 criteria = 1; platelet < 80 x10^9/L OR > 50% drop in 24 h = 3, else
//     80 to < 120 OR > 30% drop = 1; FDP >= 25 ug/mL = 3, 10 to < 25 = 1; PT
//     ratio >= 1.2 = 1. The platelet-drop limb needs both a current and a
//     24-h-prior platelet count. Total 0-8; DIC diagnosed at >= 4.
//   - ipsetThrombosis (Barbui 2015, Blood Cancer J 5:e369): a finite decision
//     tree over age > 60, prior thrombosis, and JAK2 V617F. HIGH = prior
//     thrombosis OR (age > 60 AND JAK2); INTERMEDIATE = age > 60, no JAK2, no
//     history; LOW = JAK2 only (age <= 60, no history); VERY LOW = none of the
//     three. Cardiovascular risk factors modulate annual rates WITHIN a tier
//     but do NOT change the category (confirmed against the source).
//   - cisne (Carmona-Bayonas 2015, J Clin Oncol 33:465): ECOG >= 2 = 2;
//     stress-induced hyperglycemia = 2; COPD = 1; chronic cardiovascular
//     disease = 1; NCI mucositis grade >= 2 = 1; monocytes < 200/uL = 1.
//     Total 0-8. Bands 0 low (~1.1%), 1-2 intermediate (~6.2%), >= 3 high
//     (~36%) risk of serious complications in the STABLE febrile-neutropenia
//     subgroup MASCC does not refine.

const obj = (input) => (input && typeof input === 'object' ? input : {});
const num = (v) => {
  // Number(null) === 0 and Number('') === 0, so reject the empty cases up front:
  // a blank graded field must surface a fallback, never silently score 0.
  if (v === null || v === undefined || v === '' || typeof v === 'boolean') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};
const pos = (v) => {
  const n = num(v);
  return n !== null && n > 0 ? n : null;
};
const intIn = (v, lo, hi) => {
  const n = num(v);
  return n !== null && Number.isInteger(n) && n >= lo && n <= hi ? n : null;
};
const present = (v) => v === true || v === 1 || v === '1' || v === 'yes';
// a yes/no flag that must be explicitly answered: 'yes'/'no'/'1'/'0'/bool.
// Returns true, false, or null (blank -> surfaced fallback, never silent 0).
const flag = (v) => {
  if (v === true || v === 1 || v === '1' || v === 'yes') return true;
  if (v === false || v === 0 || v === '0' || v === 'no') return false;
  return null;
};

// --- 2.1 plasmic-ttp ----------------------------------------------------------
const PLASMIC_NOTE = 'PLASMIC score (Bendapudi PK, et al, Lancet Haematol 2017): a 0-7 pretest-probability score for severe ADAMTS13 deficiency (acquired TTP) in a patient with a thrombotic microangiopathy, scored before the assay returns. One point each for platelet < 30 x10^9/L; a hemolysis sign (reticulocyte > 2.5%, undetectable haptoglobin, or indirect bilirubin > 2.0 mg/dL); no active cancer in the past year; no prior solid-organ or stem-cell transplant; MCV < 90 fL; INR < 1.5; and creatinine < 2.0 mg/dL. 0-4 = low (~0-4%), 5 = intermediate (~5-24%), 6-7 = high (~62-82%) probability of severe ADAMTS13 deficiency. It frames pretest probability; the decision to start plasma exchange stays with the clinician.';

export function plasmicTtp(input = {}) {
  const o = obj(input);
  const platelet = pos(o.platelet);
  const hemolysis = flag(o.hemolysis);
  const cancer = flag(o.activeCancer);
  const transplant = flag(o.transplant);
  const mcv = pos(o.mcv);
  const inr = pos(o.inr);
  const creatinine = pos(o.creatinine);
  if (platelet === null || hemolysis === null || cancer === null || transplant === null || mcv === null || inr === null || creatinine === null) {
    return { valid: false, message: 'Enter platelet count, MCV, INR and creatinine, and answer the hemolysis, active-cancer and transplant questions.' };
  }
  const scored = [];
  let total = 0;
  if (platelet < 30) { total += 1; scored.push('platelet < 30'); }
  if (hemolysis) { total += 1; scored.push('hemolysis present'); }
  if (!cancer) { total += 1; scored.push('no active cancer'); }
  if (!transplant) { total += 1; scored.push('no transplant'); }
  if (mcv < 90) { total += 1; scored.push('MCV < 90'); }
  if (inr < 1.5) { total += 1; scored.push('INR < 1.5'); }
  if (creatinine < 2.0) { total += 1; scored.push('creatinine < 2.0'); }
  const tier = total >= 6 ? 'High' : total === 5 ? 'Intermediate' : 'Low';
  const prob = total >= 6 ? 'high (~62-82%)' : total === 5 ? 'intermediate (~5-24%)' : 'low (~0-4%)';
  return {
    valid: true, total, tier,
    abnormal: total >= 5,
    band: `PLASMIC ${total} of 7 -- ${prob} probability of severe ADAMTS13 deficiency (0-4 low, 5 intermediate, 6-7 high).${scored.length ? ' Counted: ' + scored.join(', ') + '.' : ''}`,
    note: PLASMIC_NOTE,
  };
}

// --- 2.2 french-ttp -----------------------------------------------------------
const FRENCH_NOTE = 'French TTP score (Coppo P, et al, PLoS One 2010): a 0-3 pretest rule for severe acquired ADAMTS13 deficiency in idiopathic thrombotic microangiopathy. One point each for platelet < 30 x10^9/L, creatinine <= 2.26 mg/dL (<= 200 umol/L), and a positive antinuclear antibody (ANA). A score of 0 makes severe ADAMTS13 deficiency very unlikely; a score of 2-3 makes it highly likely (the source reports ~98.8% sensitivity for a score >= 1 and a high positive predictive value at 2-3). It frames pretest probability; the plasma-exchange decision stays with the clinician.';

export function frenchTtp(input = {}) {
  const o = obj(input);
  const platelet = pos(o.platelet);
  const creatinine = pos(o.creatinine);
  const ana = flag(o.ana);
  if (platelet === null || creatinine === null || ana === null) {
    return { valid: false, message: 'Enter platelet count and creatinine (mg/dL), and answer whether the ANA is positive.' };
  }
  const scored = [];
  let total = 0;
  if (platelet < 30) { total += 1; scored.push('platelet < 30'); }
  if (creatinine <= 2.26) { total += 1; scored.push('creatinine <= 2.26 mg/dL'); }
  if (ana) { total += 1; scored.push('ANA positive'); }
  const tier = total >= 2 ? 'High' : total === 1 ? 'Intermediate' : 'Low';
  const framing = total >= 2 ? 'severe ADAMTS13 deficiency is highly likely'
    : total === 0 ? 'severe ADAMTS13 deficiency is very unlikely'
    : 'intermediate probability of severe ADAMTS13 deficiency';
  return {
    valid: true, total, tier,
    abnormal: total >= 2,
    band: `French TTP ${total} of 3 -- ${framing}.${scored.length ? ' Counted: ' + scored.join(', ') + '.' : ''}`,
    note: FRENCH_NOTE,
  };
}

// --- 2.3 jaam-dic -------------------------------------------------------------
const JAAM_NOTE = 'JAAM DIC score (Gando S, et al, Crit Care Med 2006, the 2006 revised acute-DIC criteria): a 0-8 score for disseminated intravascular coagulation in critically ill patients. SIRS >= 3 criteria = 1; platelet < 80 x10^9/L or a > 50% fall in 24 h = 3, otherwise 80 to < 120 or a > 30% fall = 1; fibrin/fibrinogen degradation products (FDP) >= 25 ug/mL = 3, 10 to < 25 = 1; prothrombin-time ratio >= 1.2 = 1. A total >= 4 meets the JAAM criteria for DIC. It frames the diagnostic threshold; management stays with the clinician.';

function jaamPlateletPoints(current, prior) {
  // absolute-count band
  let pts = current < 80 ? 3 : current < 120 ? 1 : 0;
  // 24-h relative-drop band (only when a prior count is supplied)
  if (prior !== null && prior > 0 && current <= prior) {
    const dropPct = ((prior - current) / prior) * 100;
    if (dropPct > 50) pts = Math.max(pts, 3);
    else if (dropPct > 30) pts = Math.max(pts, 1);
  }
  return pts;
}

export function jaamDic(input = {}) {
  const o = obj(input);
  const sirs = flag(o.sirs);
  const platelet = pos(o.platelet);
  const priorPlatelet = o.priorPlatelet === '' || o.priorPlatelet == null ? undefined : pos(o.priorPlatelet);
  const fdp = num(o.fdp);
  const ptRatio = pos(o.ptRatio);
  if (sirs === null || platelet === null || fdp === null || fdp < 0 || ptRatio === null) {
    return { valid: false, message: 'Enter platelet count, FDP (ug/mL) and the PT ratio, and answer whether >= 3 SIRS criteria are met. A 24-h-prior platelet is optional (it scores the > 30%/> 50% fall).' };
  }
  const sirsPts = sirs ? 1 : 0;
  const plateletPts = jaamPlateletPoints(platelet, priorPlatelet === undefined ? null : priorPlatelet);
  const fdpPts = fdp >= 25 ? 3 : fdp >= 10 ? 1 : 0;
  const ptPts = ptRatio >= 1.2 ? 1 : 0;
  const total = sirsPts + plateletPts + fdpPts + ptPts;
  const dic = total >= 4;
  return {
    valid: true, total, dic,
    parts: { sirs: sirsPts, platelet: plateletPts, fdp: fdpPts, pt: ptPts },
    abnormal: dic,
    band: `JAAM DIC ${total} of 8 -- ${dic ? 'meets the criteria for DIC (>= 4)' : 'below the DIC threshold (< 4)'} (SIRS ${sirsPts}, platelet ${plateletPts}, FDP ${fdpPts}, PT ${ptPts}).`,
    note: JAAM_NOTE,
  };
}

// --- 2.4 ipset-thrombosis -----------------------------------------------------
const IPSET_NOTE = 'Revised IPSET-thrombosis (Barbui T, et al, Blood Cancer J 2015): stratifies thrombotic risk in WHO-defined essential thrombocythemia into four categories from age > 60 years, a history of thrombosis, and the JAK2 V617F mutation. Very low = none of the three (annual thrombosis ~0.44%); low = JAK2 only (~1.59%); intermediate = age > 60 without JAK2 or thrombosis (~1.44%); high = a thrombosis history, or age > 60 with JAK2 (~2.36-4.17%). Cardiovascular risk factors modulate the rate within a tier but do not change the category. It frames risk; the antiplatelet/cytoreduction decision stays with the clinician.';

export function ipsetThrombosis(input = {}) {
  const o = obj(input);
  const older = flag(o.ageOver60);
  const thrombosis = flag(o.thrombosis);
  const jak2 = flag(o.jak2);
  if (older === null || thrombosis === null || jak2 === null) {
    return { valid: false, message: 'Answer whether the patient is older than 60, has a history of thrombosis, and carries the JAK2 V617F mutation.' };
  }
  let category;
  let rate;
  if (thrombosis || (older && jak2)) { category = 'High'; rate = '~2.36-4.17%/yr'; }
  else if (older && !jak2) { category = 'Intermediate'; rate = '~1.44%/yr'; }
  else if (jak2) { category = 'Low'; rate = '~1.59%/yr'; }
  else { category = 'Very low'; rate = '~0.44%/yr'; }
  const factors = [];
  if (older) factors.push('age > 60');
  if (thrombosis) factors.push('prior thrombosis');
  if (jak2) factors.push('JAK2 V617F');
  return {
    valid: true, category, rate,
    abnormal: category === 'High' || category === 'Intermediate',
    band: `Revised IPSET-thrombosis: ${category.toLowerCase()} risk (${rate}).${factors.length ? ' Determinants: ' + factors.join(', ') + '.' : ' No determinants present.'}`,
    note: IPSET_NOTE,
  };
}

// --- 2.5 cisne ----------------------------------------------------------------
const CISNE_NOTE = 'CISNE (Carmona-Bayonas A, et al, J Clin Oncol 2015): the Clinical Index of Stable Febrile Neutropenia, a 0-8 score predicting serious complications in solid-tumour outpatients who appear CLINICALLY STABLE at presentation (the subgroup MASCC does not refine). ECOG performance status >= 2 = 2; stress-induced hyperglycemia = 2; COPD = 1; chronic cardiovascular disease = 1; NCI grade >= 2 mucositis = 1; monocytes < 200/uL = 1. 0 = low (~1.1% complications), 1-2 = intermediate (~6.2%), >= 3 = high (~36%). It frames complication risk; the disposition (admission, antibiotics) stays with the clinician.';

export function cisne(input = {}) {
  const o = obj(input);
  const ecog = intIn(o.ecog, 0, 4);
  const hyperglycemia = flag(o.hyperglycemia);
  const copd = flag(o.copd);
  const cardiovascular = flag(o.cardiovascular);
  const mucositis = intIn(o.mucositis, 0, 4);
  const monocytes = num(o.monocytes);
  if (ecog === null || hyperglycemia === null || copd === null || cardiovascular === null || mucositis === null || monocytes === null || monocytes < 0) {
    return { valid: false, message: 'Enter the ECOG status (0-4), the NCI mucositis grade (0-4) and the monocyte count (/uL), and answer the hyperglycemia, COPD and cardiovascular-disease questions.' };
  }
  const scored = [];
  let total = 0;
  if (ecog >= 2) { total += 2; scored.push('ECOG >= 2'); }
  if (hyperglycemia) { total += 2; scored.push('stress hyperglycemia'); }
  if (copd) { total += 1; scored.push('COPD'); }
  if (cardiovascular) { total += 1; scored.push('cardiovascular disease'); }
  if (mucositis >= 2) { total += 1; scored.push('mucositis grade >= 2'); }
  if (monocytes < 200) { total += 1; scored.push('monocytes < 200'); }
  const tier = total >= 3 ? 'High' : total >= 1 ? 'Intermediate' : 'Low';
  const prob = total >= 3 ? 'high (~36%)' : total >= 1 ? 'intermediate (~6.2%)' : 'low (~1.1%)';
  return {
    valid: true, total, tier,
    abnormal: total >= 1,
    band: `CISNE ${total} of 8 -- ${prob} risk of serious complications (0 low, 1-2 intermediate, >= 3 high).${scored.length ? ' Counted: ' + scored.join(', ') + '.' : ''}`,
    note: CISNE_NOTE,
  };
}
