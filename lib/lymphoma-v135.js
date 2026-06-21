// spec-v135 (Wave 6 of the spec-v100 MDCalc Parity Completion program): the
// lymphoma / CLL prognostic-index cluster that sits beside the existing flipi
// (follicular index) and ipss-r-mds (MDS prognosis) tiles. Five deterministic
// indices; none duplicates a live tile. Each consumes clinician-entered
// factors and returns an outcome group or weighted score plus the source's
// survival framing -- not a browsable reference table (spec-v100 §2).
//
//   rIpi          - Revised IPI for DLBCL (5 IPI factors -> 3 outcome groups)
//   nccnIpi       - NCCN-IPI for DLBCL (banded age/LDH + stage/ECOG/extranodal, 0-8)
//   gelfCriteria  - GELF high-tumor-burden criteria for follicular lymphoma (any-one flag)
//   hodgkinIps    - Hasenclever International Prognostic Score (advanced Hodgkin, 0-7)
//   cllIpi        - CLL International Prognostic Index (weighted 0-10 -> 4 groups)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v135.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the outcome group / score and the source's
// survival framing; the management decision (treat vs observe, chemotherapy
// line) stays with the clinician and local protocol (spec-v11 §5.3). All five
// are Class A (fixed derivation papers / point weights, journal+author
// citations -- no ISSUER_PATTERN trip, no docs/citation-staleness.md row).
//
// POINT TABLES / THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each
// cross-verified across >= 2 independent sources. NO-FABRICATION / SOURCE-GOV:
//   - rIpi (Sehn 2007, Blood 109:1857): the 5 standard IPI factors -- age > 60,
//     LDH above normal, Ann Arbor stage III-IV, >= 2 extranodal sites, ECOG >= 2
//     -- collapsed to THREE R-CHOP-era outcome groups: Very Good = 0 (4-yr PFS
//     ~94%, OS ~94%), Good = 1-2 (~80% / ~79%), Poor = 3-5 (~53% / ~55%).
//   - nccnIpi (Zhou 2014, Blood 123:837): BANDED contributions -- age >40-60 = 1,
//     >60-75 = 2, >75 = 3; LDH normalized ratio >1-3 = 1, >3 = 2; Ann Arbor
//     stage III-IV = 1; ECOG >= 2 = 1; extranodal disease in a MAJOR site (bone
//     marrow, CNS, liver/GI tract, or lung) = 1. Total 0-8 -> low (0-1),
//     low-intermediate (2-3), high-intermediate (4-5), high (6-8). 5-yr OS
//     ~96 / 82 / 64 / 33%. The "NCCN" in the name is not an issuing-society
//     acronym in the citation string (Zhou et al, Blood).
//   - gelfCriteria (Brice 1997, J Clin Oncol 15:1110): high-tumor-burden if ANY
//     ONE criterion is met -- any nodal/extranodal mass > 7 cm; >= 3 nodal sites
//     each > 3 cm; B symptoms; symptomatic splenomegaly; pleural/peritoneal
//     effusion; cytopenia (Hgb < 10 g/dL or platelets < 100 x10^9/L); leukemic
//     phase (> 5.0 x10^9/L circulating malignant cells). Met = treatment
//     indicated; not met = observation an option. Reports the criteria status,
//     never a "start chemotherapy" directive.
//   - hodgkinIps (Hasenclever 1998, N Engl J Med 339:1506): 7 adverse factors,
//     one each -- serum albumin < 4 g/dL; hemoglobin < 10.5 g/dL; male sex; age
//     >= 45; Ann Arbor stage IV; WBC >= 15 x10^9/L; lymphocytopenia (lymphocytes
//     < 600/uL OR < 8% of WBC). Count 0-7; each factor lowers 5-yr freedom from
//     progression ~7-8% (0 ~84% down to >=5 ~42%).
//   - cllIpi (CLL-IPI Working Group 2016, Lancet Oncol 17:779): WEIGHTED --
//     TP53 status (del(17p) and/or TP53 mutation) = 4; IGHV unmutated = 2; serum
//     beta2-microglobulin > 3.5 mg/L = 2; clinical stage (Rai I-IV / Binet B-C)
//     = 1; age > 65 = 1. Total 0-10 -> low (0-1), intermediate (2-3), high
//     (4-6), very high (7-10). 5-yr OS ~93 / 79 / 63 / 23%.

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
const nonneg = (v) => {
  const n = num(v);
  return n !== null && n >= 0 ? n : null;
};
// a yes/no flag that must be explicitly answered: 'yes'/'no'/'1'/'0'/bool.
// Returns true, false, or null (blank -> surfaced fallback, never silent 0).
const flag = (v) => {
  if (v === true || v === 1 || v === '1' || v === 'yes') return true;
  if (v === false || v === 0 || v === '0' || v === 'no') return false;
  return null;
};

// --- 2.1 r-ipi ----------------------------------------------------------------
const RIPI_NOTE = 'Revised International Prognostic Index for diffuse large B-cell lymphoma (Sehn LH, et al, Blood 2007): counts the five standard IPI adverse factors -- age > 60, serum LDH above normal, Ann Arbor stage III-IV, >= 2 extranodal sites, and ECOG performance status >= 2 -- and collapses the 0-5 count into three R-CHOP-era outcome groups. Very Good = 0 factors (4-year progression-free survival ~94%, overall survival ~94%); Good = 1-2 (~80% / ~79%); Poor = 3-5 (~53% / ~55%). It frames prognosis; the treatment decision stays with the clinician.';

export function rIpi(input = {}) {
  const o = obj(input);
  const age = flag(o.ageOver60);
  const ldh = flag(o.ldhHigh);
  const stage = flag(o.stageAdvanced);
  const extranodal = flag(o.extranodal2);
  const ecog = flag(o.ecog2);
  if (age === null || ldh === null || stage === null || extranodal === null || ecog === null) {
    return { valid: false, message: 'Answer all five IPI factors: age > 60, LDH above normal, Ann Arbor stage III-IV, >= 2 extranodal sites, and ECOG >= 2.' };
  }
  const scored = [];
  let count = 0;
  if (age) { count += 1; scored.push('age > 60'); }
  if (ldh) { count += 1; scored.push('LDH above normal'); }
  if (stage) { count += 1; scored.push('stage III-IV'); }
  if (extranodal) { count += 1; scored.push('>= 2 extranodal sites'); }
  if (ecog) { count += 1; scored.push('ECOG >= 2'); }
  let group;
  let survival;
  if (count === 0) { group = 'Very good'; survival = '4-year PFS ~94%, OS ~94%'; }
  else if (count <= 2) { group = 'Good'; survival = '4-year PFS ~80%, OS ~79%'; }
  else { group = 'Poor'; survival = '4-year PFS ~53%, OS ~55%'; }
  return {
    valid: true, count, group,
    abnormal: count >= 1,
    band: `R-IPI ${count} of 5 factors -- ${group} risk group; ${survival}.${scored.length ? ' Counted: ' + scored.join(', ') + '.' : ' No risk factors present.'}`,
    note: RIPI_NOTE,
  };
}

// --- 2.2 nccn-ipi -------------------------------------------------------------
const NCCNIPI_NOTE = 'NCCN International Prognostic Index for diffuse large B-cell lymphoma (Zhou Z, et al, Blood 2014): an enhanced, banded IPI for the rituximab era. Age is banded -- > 40-60 = 1, > 60-75 = 2, > 75 = 3; the LDH normalized ratio is banded -- > 1-3x = 1, > 3x = 2; Ann Arbor stage III-IV = 1; ECOG >= 2 = 1; extranodal disease in a major site (bone marrow, CNS, liver/GI tract, or lung) = 1. The 0-8 total maps to four risk groups -- low (0-1), low-intermediate (2-3), high-intermediate (4-5), high (6-8) -- with 5-year overall survival ~96 / 82 / 64 / 33%. It frames prognosis; the treatment decision stays with the clinician.';
const NCCNIPI_OS5 = ['~96%', '~82%', '~64%', '~33%'];
const NCCNIPI_LABEL = ['Low', 'Low-intermediate', 'High-intermediate', 'High'];

function nccnIpiGroupOf(total) {
  if (total <= 1) return 0;
  if (total <= 3) return 1;
  if (total <= 5) return 2;
  return 3;
}

export function nccnIpi(input = {}) {
  const o = obj(input);
  const age = nonneg(o.age);
  const ldhRatio = pos(o.ldhRatio);
  const stage = flag(o.stageAdvanced);
  const ecog = flag(o.ecog2);
  const extranodal = flag(o.extranodalMajor);
  if (age === null || age > 130 || ldhRatio === null || stage === null || ecog === null || extranodal === null) {
    return { valid: false, message: 'Enter age (years) and the LDH normalized ratio (measured / upper limit of normal), and answer the stage III-IV, ECOG >= 2 and major-site extranodal questions.' };
  }
  const scored = [];
  let total = 0;
  // Age bands: >40-60 = 1, >60-75 = 2, >75 = 3 (<= 40 scores 0).
  if (age > 75) { total += 3; scored.push('age > 75 (3)'); }
  else if (age > 60) { total += 2; scored.push('age > 60-75 (2)'); }
  else if (age > 40) { total += 1; scored.push('age > 40-60 (1)'); }
  // LDH normalized-ratio bands: >1-3 = 1, >3 = 2 (<= 1 scores 0).
  if (ldhRatio > 3) { total += 2; scored.push('LDH ratio > 3x (2)'); }
  else if (ldhRatio > 1) { total += 1; scored.push('LDH ratio > 1-3x (1)'); }
  if (stage) { total += 1; scored.push('stage III-IV (1)'); }
  if (ecog) { total += 1; scored.push('ECOG >= 2 (1)'); }
  if (extranodal) { total += 1; scored.push('major-site extranodal (1)'); }
  const gi = nccnIpiGroupOf(total);
  return {
    valid: true, total,
    group: NCCNIPI_LABEL[gi],
    abnormal: total >= 2,
    band: `NCCN-IPI ${total} of 8 -- ${NCCNIPI_LABEL[gi]} risk; 5-year overall survival ${NCCNIPI_OS5[gi]}.${scored.length ? ' Counted: ' + scored.join(', ') + '.' : ' No risk factors present.'}`,
    note: NCCNIPI_NOTE,
  };
}

// --- 2.3 gelf-criteria --------------------------------------------------------
const GELF_NOTE = 'GELF high-tumor-burden criteria for follicular lymphoma (Brice P, et al, Groupe d’Etude des Lymphomes Folliculaires, J Clin Oncol 1997): a treat-versus-watch flag. High tumor burden is met if ANY ONE of -- a nodal or extranodal mass > 7 cm; >= 3 nodal sites each > 3 cm; systemic (B) symptoms; symptomatic splenomegaly; a pleural or peritoneal effusion; cytopenia (hemoglobin < 10 g/dL or platelets < 100 x10^9/L); or a leukemic phase (> 5.0 x10^9/L circulating malignant cells) -- is present. Met suggests treatment is indicated; not met means observation remains an option. It reports the criteria status, not a "start chemotherapy" order.';

export function gelfCriteria(input = {}) {
  const o = obj(input);
  const maxMass = nonneg(o.maxMassCm);
  const nodalSites3cm = flag(o.nodalSites3cm);
  const bSymptoms = flag(o.bSymptoms);
  const splenomegaly = flag(o.splenomegaly);
  const effusion = flag(o.effusion);
  const hgb = pos(o.hgb);
  const platelet = pos(o.platelet);
  const leukemicPhase = flag(o.leukemicPhase);
  if (maxMass === null || nodalSites3cm === null || bSymptoms === null || splenomegaly === null
    || effusion === null || hgb === null || platelet === null || leukemicPhase === null) {
    return { valid: false, message: 'Enter the largest mass (cm), hemoglobin (g/dL) and platelet count (x10^9/L), and answer the >= 3 nodal-sites, B-symptoms, splenomegaly, effusion and leukemic-phase questions.' };
  }
  const met = [];
  if (maxMass > 7) met.push('mass > 7 cm');
  if (nodalSites3cm) met.push('>= 3 nodal sites > 3 cm');
  if (bSymptoms) met.push('B symptoms');
  if (splenomegaly) met.push('symptomatic splenomegaly');
  if (effusion) met.push('pleural/peritoneal effusion');
  if (hgb < 10 || platelet < 100) met.push('cytopenia (Hgb < 10 or platelets < 100)');
  if (leukemicPhase) met.push('leukemic phase (> 5.0 x10^9/L)');
  const high = met.length > 0;
  return {
    valid: true,
    highTumorBurden: high,
    count: met.length,
    abnormal: high,
    band: high
      ? `GELF high-tumor-burden criteria MET (${met.length} criterion${met.length === 1 ? '' : 'a'}: ${met.join(', ')}) -- treatment is indicated rather than observation.`
      : 'GELF high-tumor-burden criteria NOT met -- low tumor burden; observation remains an option.',
    note: GELF_NOTE,
  };
}

// --- 2.4 hodgkin-ips ----------------------------------------------------------
const HODGKIN_NOTE = 'Hasenclever International Prognostic Score for advanced Hodgkin lymphoma (Hasenclever D, Diehl V, N Engl J Med 1998): counts seven adverse factors, one point each -- serum albumin < 4 g/dL; hemoglobin < 10.5 g/dL; male sex; age >= 45; Ann Arbor stage IV; WBC >= 15 x10^9/L; and lymphocytopenia (lymphocyte count < 600/uL or < 8% of the WBC). Each factor lowers 5-year freedom from progression by roughly 7-8% -- about 84% at 0 factors down to about 42% at >= 5. It frames prognosis; the treatment decision stays with the clinician.';
const HODGKIN_FFP = ['~84%', '~77%', '~67%', '~60%', '~51%', '~42%', '~42%', '~42%'];

export function hodgkinIps(input = {}) {
  const o = obj(input);
  const albumin = pos(o.albumin);
  const hgb = pos(o.hgb);
  const male = flag(o.male);
  const age = nonneg(o.age);
  const stage4 = flag(o.stage4);
  const wbc = pos(o.wbc);
  // Lymphocytopenia: absolute lymphocyte count (per uL) OR lymphocyte percent.
  const lymphCount = nonneg(o.lymphCount);
  const lymphPct = nonneg(o.lymphPct);
  if (albumin === null || hgb === null || male === null || age === null || age > 130
    || stage4 === null || wbc === null || lymphCount === null || lymphPct === null) {
    return { valid: false, message: 'Enter serum albumin (g/dL), hemoglobin (g/dL), age (years), WBC (x10^9/L), lymphocyte count (cells/uL) and lymphocyte percent, and answer the male-sex and stage-IV questions.' };
  }
  const scored = [];
  let count = 0;
  if (albumin < 4) { count += 1; scored.push('albumin < 4 g/dL'); }
  if (hgb < 10.5) { count += 1; scored.push('hemoglobin < 10.5 g/dL'); }
  if (male) { count += 1; scored.push('male sex'); }
  if (age >= 45) { count += 1; scored.push('age >= 45'); }
  if (stage4) { count += 1; scored.push('stage IV'); }
  if (wbc >= 15) { count += 1; scored.push('WBC >= 15'); }
  if (lymphCount < 600 || lymphPct < 8) { count += 1; scored.push('lymphocytopenia (< 600/uL or < 8%)'); }
  return {
    valid: true, count,
    abnormal: count >= 1,
    band: `Hasenclever IPS ${count} of 7 adverse factors -- 5-year freedom from progression ${HODGKIN_FFP[count]}.${scored.length ? ' Counted: ' + scored.join(', ') + '.' : ' No adverse factors present.'}`,
    note: HODGKIN_NOTE,
  };
}

// --- 2.5 cll-ipi --------------------------------------------------------------
const CLLIPI_NOTE = 'CLL International Prognostic Index (International CLL-IPI Working Group, Lancet Oncol 2016): a weighted score. TP53 status -- del(17p) and/or TP53 mutation -- = 4; IGHV unmutated = 2; serum beta2-microglobulin > 3.5 mg/L = 2; advanced clinical stage (Rai I-IV or Binet B-C) = 1; age > 65 = 1. The 0-10 total maps to four risk groups -- low (0-1), intermediate (2-3), high (4-6), very high (7-10) -- with 5-year overall survival ~93 / 79 / 63 / 23%. It frames prognosis; the treatment decision stays with the clinician.';
const CLLIPI_OS5 = ['~93%', '~79%', '~63%', '~23%'];
const CLLIPI_LABEL = ['Low', 'Intermediate', 'High', 'Very high'];

function cllIpiGroupOf(total) {
  if (total <= 1) return 0;
  if (total <= 3) return 1;
  if (total <= 6) return 2;
  return 3;
}

export function cllIpi(input = {}) {
  const o = obj(input);
  const tp53 = flag(o.tp53);
  const ighv = flag(o.ighvUnmutated);
  const b2m = flag(o.b2mHigh);
  const stage = flag(o.stageAdvanced);
  const age = flag(o.ageOver65);
  if (tp53 === null || ighv === null || b2m === null || stage === null || age === null) {
    return { valid: false, message: 'Answer all five questions: TP53 abnormality (del(17p)/mutation), IGHV unmutated, beta2-microglobulin > 3.5 mg/L, advanced clinical stage (Rai I-IV / Binet B-C), and age > 65.' };
  }
  const scored = [];
  let total = 0;
  if (tp53) { total += 4; scored.push('TP53 del(17p)/mutation (4)'); }
  if (ighv) { total += 2; scored.push('IGHV unmutated (2)'); }
  if (b2m) { total += 2; scored.push('beta2-microglobulin > 3.5 (2)'); }
  if (stage) { total += 1; scored.push('advanced stage (1)'); }
  if (age) { total += 1; scored.push('age > 65 (1)'); }
  const gi = cllIpiGroupOf(total);
  return {
    valid: true, total,
    group: CLLIPI_LABEL[gi],
    abnormal: total >= 2,
    band: `CLL-IPI ${total} of 10 -- ${CLLIPI_LABEL[gi]} risk; 5-year overall survival ${CLLIPI_OS5[gi]}.${scored.length ? ' Counted: ' + scored.join(', ') + '.' : ' No risk factors present.'}`,
    note: CLLIPI_NOTE,
  };
}
