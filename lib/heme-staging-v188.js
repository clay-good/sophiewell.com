// spec-v188: five deterministic leukemia / lymphoma staging and prognostic
// instruments (second feature spec of the Subspecialty Oncology & Hematology
// Staging program). Every id was verified absent by a direct scan of app.js
// first (spec-v85 §6.2). None duplicates a live tile; the existing `flipi` is
// FLIPI-1 (LDH + stage), whereas 2.4 here is the distinct FLIPI-2 revision
// (β2-microglobulin). v188 runs no AI and makes no runtime network call. These
// stage and prognosticate — they are not treatment orders (spec-v11 §5.3).
//
//   binetCll    - Binet clinical stage (CLL)
//   raiCll      - Rai clinical stage (CLL)
//   annArbor    - Ann Arbor stage (Lugano modification) for lymphoma
//   flipi2      - Follicular Lymphoma International Prognostic Index 2
//   hasfordCml  - Hasford (Euro) score for CML
//
// STAGE BOUNDARIES / WEIGHTS / THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97),
// each cross-verified across >= 2 independent sources at implementation:
//   - binetCll (Binet JL, et al, Cancer 1981;48(1):198-206): Stage A Hb >= 10
//     g/dL AND platelets >= 100 x10^9/L AND < 3 involved lymphoid areas; Stage B
//     same counts with >= 3 areas; Stage C Hb < 10 and/or platelets < 100 (any
//     area count). Five areas: cervical, axillary, inguinal nodes, spleen, liver.
//   - raiCll (Rai KR, et al, Blood 1975;46(2):219-234; modified risk grouping):
//     0 lymphocytosis only; I + lymphadenopathy; II + spleen/liver enlargement;
//     III + anemia (Hb < 11 g/dL); IV + thrombocytopenia (platelets < 100). Low
//     0, intermediate I-II, high III-IV — stage set by the highest feature.
//   - annArbor (Carbone PP, et al, Cancer Res 1971;31(11):1860-1861; Lugano:
//     Cheson BD, et al, J Clin Oncol 2014;32(27):3059-3068): I one region; II
//     >= 2 regions same side of the diaphragm; III both sides; IV disseminated
//     extranodal — A/B suffix for B symptoms; limited (I-II) vs advanced (III-IV).
//   - flipi2 (Federico M, et al, J Clin Oncol 2009;27(27):4555-4562): five
//     factors 1 point each (age > 60, elevated beta-2-microglobulin, longest node
//     > 6 cm, bone-marrow involvement, Hb < 12 g/dL); low 0, intermediate 1-2,
//     high 3-5.
//   - hasfordCml (Hasford J, et al, J Natl Cancer Inst 1998;90(11):850-858):
//     (0.6666*[age > 50] + 0.0420*spleen + 0.0584*blasts + 0.0413*eosinophils
//     + 0.2039*[basophils > 3%] + 1.0956*[platelets > 1500]) * 1000; low <= 780,
//     intermediate 781-1480, high > 1480. Cross-verified against the ClinCaseQuest
//     / Sokal-Hasford-EUTOS formula reference.

import { r1 } from './num.js';

function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}
function nonNeg(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > max) return null;
  return n;
}
function truthy(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on' || v === 'yes'; }
function cap(s) { return s.replace(/^./, (m) => m.toUpperCase()); }

// --- 2.1 Binet stage --------------------------------------------------------
const BINET_NOTE = 'Binet staging for chronic lymphocytic leukemia (Binet JL, et al, Cancer 1981;48(1):198-206). Stage A: hemoglobin >= 10 g/dL and platelets >= 100 x10^9/L with fewer than 3 involved lymphoid areas; Stage B: preserved counts with >= 3 areas; Stage C: hemoglobin < 10 g/dL and/or platelets < 100 x10^9/L (any number of areas). The five areas are cervical, axillary, and inguinal nodes, spleen, and liver. A clinical stage, not a treatment order.';

export function binetCll(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const areas = nonNeg(o.areas, 5);
  const hb = pos(o.hb, 30);
  const platelets = pos(o.platelets, 3000);
  const missing = [];
  if (areas === null) missing.push('number of involved lymphoid areas (0–5)');
  if (hb === null) missing.push('hemoglobin (g/dL)');
  if (platelets === null) missing.push('platelet count (×10⁹/L)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const cytopenia = hb < 10 || platelets < 100;
  let stage; let basis;
  if (cytopenia) {
    stage = 'C';
    basis = hb < 10 && platelets < 100 ? 'anemia and thrombocytopenia' : hb < 10 ? 'anemia (Hb < 10)' : 'thrombocytopenia (platelets < 100)';
  } else if (areas >= 3) {
    stage = 'B'; basis = `${areas} involved areas, counts preserved`;
  } else {
    stage = 'A'; basis = `${areas} involved area${areas === 1 ? '' : 's'}, counts preserved`;
  }
  const abnormal = stage !== 'A';
  return {
    valid: true,
    stage,
    abnormal,
    bandLabel: `Binet stage ${stage}`,
    band: `Binet stage ${stage} — ${basis}.`,
    detail: `${Math.round(areas)} of 5 lymphoid areas involved; Hb ${r1(hb)} g/dL, platelets ${r1(platelets)} ×10⁹/L. Stage C is set by anemia (< 10) or thrombocytopenia (< 100) regardless of area count.`,
    note: BINET_NOTE,
  };
}

// --- 2.2 Rai stage ----------------------------------------------------------
const RAI_NOTE = 'Rai staging for chronic lymphocytic leukemia (Rai KR, et al, Blood 1975;46(2):219-234; modified three-tier risk grouping). Stage 0 lymphocytosis only; I + lymphadenopathy; II + spleen and/or liver enlargement; III + anemia (Hb < 11 g/dL); IV + thrombocytopenia (platelets < 100 x10^9/L). The stage is the highest feature present. Modified risk: low (0), intermediate (I–II), high (III–IV). A clinical stage, not a treatment order.';
const RAI_LABEL = { 0: '0', 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };

export function raiCll(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const lymphocytosis = truthy(o.lymphocytosis);
  const lymphadenopathy = truthy(o.lymphadenopathy);
  const organomegaly = truthy(o.organomegaly);
  const hb = pos(o.hb, 30);
  const platelets = pos(o.platelets, 3000);
  if (!lymphocytosis) return { valid: false, message: 'Rai staging requires blood + marrow lymphocytosis; confirm it is present.' };
  const missing = [];
  if (hb === null) missing.push('hemoglobin (g/dL)');
  if (platelets === null) missing.push('platelet count (×10⁹/L)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  let stageNum; let basis;
  if (platelets < 100) { stageNum = 4; basis = 'thrombocytopenia (platelets < 100)'; }
  else if (hb < 11) { stageNum = 3; basis = 'anemia (Hb < 11)'; }
  else if (organomegaly) { stageNum = 2; basis = 'spleen and/or liver enlargement'; }
  else if (lymphadenopathy) { stageNum = 1; basis = 'lymphadenopathy'; }
  else { stageNum = 0; basis = 'lymphocytosis only'; }
  const risk = stageNum === 0 ? 'low' : stageNum <= 2 ? 'intermediate' : 'high';
  const abnormal = stageNum >= 3;
  const stage = RAI_LABEL[stageNum];
  return {
    valid: true,
    stage,
    risk,
    abnormal,
    bandLabel: `Rai stage ${stage}`,
    band: `Rai stage ${stage} (${risk} risk) — ${basis}.`,
    detail: `Hb ${r1(hb)} g/dL, platelets ${r1(platelets)} ×10⁹/L. The stage is the highest feature present; the modified grouping is low (0), intermediate (I–II), high (III–IV).`,
    note: RAI_NOTE,
  };
}

// --- 2.3 Ann Arbor (Lugano) -------------------------------------------------
const ANN_NOTE = 'Ann Arbor staging with the Lugano modification for lymphoma (Carbone PP, et al, Cancer Res 1971; Lugano: Cheson BD, et al, J Clin Oncol 2014;32(27):3059-3068). Stage I one nodal region; II >= 2 regions on the same side of the diaphragm; III regions on both sides; IV disseminated extranodal involvement. The A/B suffix marks the absence/presence of B symptoms; E marks limited contiguous extranodal extension; S marks splenic involvement. Limited (I–II) versus advanced (III–IV) drives the treatment paradigm. A stage, not a treatment order.';
const ANN_DIST = {
  'single-region': { stage: 'I', text: 'one nodal region (or single extranodal site)' },
  'multi-same-side': { stage: 'II', text: '≥ 2 regions on the same side of the diaphragm' },
  'both-sides': { stage: 'III', text: 'regions on both sides of the diaphragm' },
  disseminated: { stage: 'IV', text: 'disseminated / diffuse extranodal involvement' },
};

export function annArbor(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const dist = typeof o.distribution === 'string' && ANN_DIST[o.distribution] ? o.distribution : '';
  if (!dist) return { valid: false, message: 'Choose the anatomic distribution of involvement.' };
  const bSymptoms = truthy(o.bSymptoms);
  const extranodal = truthy(o.extranodal);
  const splenic = truthy(o.splenic);
  const base = ANN_DIST[dist];
  const suffix = bSymptoms ? 'B' : 'A';
  const modifiers = [];
  if (extranodal) modifiers.push('E');
  if (splenic) modifiers.push('S');
  const stage = `${base.stage}${suffix}${modifiers.length ? ' ' + modifiers.join('') : ''}`;
  const advanced = base.stage === 'III' || base.stage === 'IV';
  const paradigm = advanced ? 'advanced-stage (III–IV)' : 'limited-stage (I–II)';
  return {
    valid: true,
    stage,
    advanced,
    abnormal: advanced || bSymptoms,
    bandLabel: `Ann Arbor ${stage}`,
    band: `Ann Arbor stage ${stage} — ${paradigm}.`,
    detail: `${cap(base.text)}; B symptoms ${bSymptoms ? 'present (B)' : 'absent (A)'}${extranodal ? '; extranodal extension (E)' : ''}${splenic ? '; splenic involvement (S)' : ''}. Limited vs advanced drives the treatment paradigm.`,
    note: ANN_NOTE,
  };
}

// --- 2.4 FLIPI-2 ------------------------------------------------------------
const FLIPI2_NOTE = 'Follicular Lymphoma International Prognostic Index 2 (Federico M, et al, J Clin Oncol 2009;27(27):4555-4562). Five factors, 1 point each: age > 60, elevated beta-2-microglobulin (above the upper limit of normal), longest involved lymph node > 6 cm, bone-marrow involvement, and hemoglobin < 12 g/dL. Risk: low 0, intermediate 1–2, high 3–5. FLIPI-2 uses beta-2-microglobulin and node size where the original FLIPI uses LDH and Ann Arbor stage. A prognostic index, not a treatment order.';
const FLIPI2_ITEMS = [
  { key: 'ageOver60', label: 'age > 60' },
  { key: 'b2m', label: 'elevated β₂-microglobulin' },
  { key: 'nodeOver6cm', label: 'longest node > 6 cm' },
  { key: 'marrow', label: 'bone-marrow involvement' },
  { key: 'hbUnder12', label: 'hemoglobin < 12 g/dL' },
];

export function flipi2(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const present = FLIPI2_ITEMS.filter((it) => truthy(o[it.key])).map((it) => it.label);
  const score = present.length;
  const risk = score === 0 ? 'low' : score <= 2 ? 'intermediate' : 'high';
  const pfs = { low: '~80% 5-year PFS', intermediate: '~51% 5-year PFS', high: '~19% 5-year PFS' }[risk];
  return {
    valid: true,
    score,
    risk,
    abnormal: score >= 3,
    bandLabel: `FLIPI-2 ${cap(risk)} risk`,
    band: `FLIPI-2 ${score} factor${score === 1 ? '' : 's'} — ${risk} risk (${pfs}).`,
    detail: present.length ? `Present: ${present.join(', ')}.` : 'No adverse factors present.',
    note: FLIPI2_NOTE,
  };
}

// --- 2.5 Hasford (Euro) CML score -------------------------------------------
const HASFORD_NOTE = 'Hasford (Euro) prognostic score for chronic myeloid leukemia (Hasford J, et al, J Natl Cancer Inst 1998;90(11):850-858). Score = (0.6666 × [age > 50] + 0.0420 × spleen cm + 0.0584 × blast % + 0.0413 × eosinophil % + 0.2039 × [basophils > 3%] + 1.0956 × [platelets > 1500 ×10⁹/L]) × 1000. Risk: low ≤ 780, intermediate 781–1480, high > 1480. Spleen is centimeters below the costal margin. A prognostic score (an older comparator to the live Sokal, superseded in the TKI era by EUTOS/ELTS), not a treatment order.';

export function hasfordCml(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 120);
  const spleen = nonNeg(o.spleen, 40);
  const platelets = pos(o.platelets, 5000);
  const blasts = nonNeg(o.blasts, 100);
  const eosinophils = nonNeg(o.eosinophils, 100);
  const basophils = nonNeg(o.basophils, 100);
  const missing = [];
  if (age === null) missing.push('age (years)');
  if (spleen === null) missing.push('spleen size (cm below costal margin)');
  if (platelets === null) missing.push('platelet count (×10⁹/L)');
  if (blasts === null) missing.push('peripheral blast %');
  if (eosinophils === null) missing.push('peripheral eosinophil %');
  if (basophils === null) missing.push('peripheral basophil %');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const raw = 0.6666 * (age > 50 ? 1 : 0)
    + 0.0420 * spleen
    + 0.0584 * blasts
    + 0.0413 * eosinophils
    + 0.2039 * (basophils > 3 ? 1 : 0)
    + 1.0956 * (platelets > 1500 ? 1 : 0);
  const score = r1(raw * 1000);
  const risk = score <= 780 ? 'low' : score <= 1480 ? 'intermediate' : 'high';
  return {
    valid: true,
    score,
    risk,
    abnormal: score > 780,
    bandLabel: `Hasford ${cap(risk)} risk`,
    band: `Hasford score ${score} — ${risk} risk.`,
    detail: `Age ${r1(age)}${age > 50 ? ' (> 50)' : ''}, spleen ${r1(spleen)} cm, platelets ${r1(platelets)} ×10⁹/L${platelets > 1500 ? ' (> 1500)' : ''}, blasts ${r1(blasts)}%, eosinophils ${r1(eosinophils)}%, basophils ${r1(basophils)}%${basophils > 3 ? ' (> 3%)' : ''}. Bands: low ≤ 780, intermediate 781–1480, high > 1480.`,
    note: HASFORD_NOTE,
  };
}
