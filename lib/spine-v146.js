// spec-v146 (Wave 8 of the spec-v100 MDCalc Parity Completion program): five
// spinal tumor / trauma classification instruments that fill confirmed gaps. The
// catalog has the brain/cerebrovascular neurosurgical scores (ich-score,
// hunt-hess-wfns, nihss) but no spinal instability, spinal-metastasis, or
// spinal-trauma scoring tiles. None duplicates a live tile; v146 parses no image
// and runs no AI.
//
//   sinsScore         - Spinal Instability Neoplastic Score (0-18)
//   tokuhashiRevised  - Revised Tokuhashi metastatic-spine prognosis (0-15)
//   tomitaScore       - Tomita surgical-strategy score (2-10)
//   tlicsScore        - Thoracolumbar Injury Classification & Severity (0-10)
//   slicScore         - Subaxial Cervical Spine Injury Classification (0-10)
//
// Per the spec-v100 §2 classification clarification, each tile CONSUMES the
// clinician's read of the CT/MRI/radiograph and the neurologic exam as bounded
// selects and COMPUTES a score + the source's management interpretation -- they
// are not no-input reference tables. Pure functions only (spec-v29 §3 one-line
// test). Citations live inline in lib/meta.js; renderers in views/group-v146.js
// render the spec-v50 §3 clinical-posture note. The operative / radiation /
// brace decision stays with the clinician and a multidisciplinary spine team
// (spec-v11 §5.3).
//
// DEFINITIONS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-verified
// across >= 2 independent authoritative sources (the original papers, the CORR
// "Classifications in Brief" reviews, Radiopaedia, the AO Spine references, UW
// Emergency Radiology, MDCalc, and StatPearls). NO-FABRICATION / SOURCE-
// GOVERNANCE:
//   - sinsScore (Fisher CG, et al, Spine 2010;35(22):E1221-E1229): six components
//     -- location (junctional 3 / mobile 2 / semirigid 1 / rigid 0), mechanical
//     pain (3 / occasional 1 / none 0), bone lesion (lytic 2 / mixed 1 / blastic
//     0), alignment (subluxation 4 / de novo deformity 2 / normal 0), vertebral-
//     body collapse (>50% 3 / <50% 2 / no collapse but >50% involved 1 / none 0),
//     and posterolateral element involvement (bilateral 3 / unilateral 1 / none
//     0). Total 0-18: 0-6 stable, 7-12 indeterminate (potentially unstable),
//     13-18 unstable; a 7-18 score warrants surgical consultation. Class A.
//   - tokuhashiRevised (Tokuhashi Y, et al, Spine 2005;30(19):2186-2191): six
//     parameters -- general condition (KPS, 0-2), extraspinal bone metastases
//     (0-2), metastases in the vertebral body (0-2), major-organ metastases
//     (0-2), primary tumor site (0-5), and palsy (Frankel, 0-2). Total 0-15:
//     0-8 expected survival < 6 months, 9-11 >= 6 months, 12-15 >= 1 year.
//     A LOWER total is the worse prognosis. Class A.
//   - tomitaScore (Tomita K, et al, Spine 2001;26(3):298-306): three factors --
//     primary-tumor grade (slow 1 / moderate 2 / rapid or unknown 4), visceral
//     metastases (none 0 / treatable 2 / untreatable 4), and bone metastases
//     (solitary 1 / multiple 2). Total 2-10 with the non-overlapping surgical-
//     strategy bands 2-3 wide/marginal excision, 4-5 marginal/intralesional,
//     6-7 palliative, 8-10 supportive/terminal care. Class A.
//   - tlicsScore (Vaccaro AR, et al, Spine 2005;30(20):2325-2333): morphology
//     (compression 1 / burst 2 / translational-rotational 3 / distraction 4),
//     neurology (intact 0 / nerve root 2 / complete cord 2 / INCOMPLETE cord 3 /
//     cauda equina 3), and posterior-ligamentous-complex integrity (intact 0 /
//     indeterminate 2 / disrupted 3). Total 0-10: <= 3 nonoperative, 4
//     indeterminate (surgeon's discretion), >= 5 operative. Incomplete cord (3)
//     scores HIGHER than complete cord (2) by design -- it benefits more from
//     decompression; not a transcription error. Class A.
//   - slicScore (Vaccaro AR, et al, Spine 2007;32(21):2365-2374): morphology
//     (none 0 / compression 1 / burst 2 / distraction 3 / rotation-translation
//     4), disco-ligamentous complex (intact 0 / indeterminate 1 / disrupted 2),
//     and neurology (intact 0 / root 1 / complete cord 2 / INCOMPLETE cord 3),
//     plus a separate ADDITIVE +1 modifier for continuous cord compression with
//     an ongoing neurologic deficit. Total 0-10: <= 3 nonoperative, 4
//     indeterminate, >= 5 operative. The +1 is applied on top of the neuro
//     status, not a fifth neuro option, and is what lets the score reach 10.
//     Class A.

import { num } from './num.js';

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

// Generic bounded weighted sum over a list of { key, label, map } components.
// Each component is a labeled select whose chosen value indexes `map` (option ->
// { pts, label }). A blank/unknown selection makes the whole tile valid:false
// with a complete-the-fields message naming how many components remain, so a
// partial total is never scored as if a missing component were zero.
function sumComponents(o, components) {
  let total = 0;
  const parts = [];
  const missing = [];
  for (const c of components) {
    const opt = c.map[o[c.key]];
    if (!opt) { missing.push(c.label); continue; }
    total += opt.pts;
    parts.push(`${c.label} ${opt.label} (${opt.pts})`);
  }
  return { total, parts, missing };
}

function needMessage(missing, total) {
  const n = missing.length;
  return `Choose all ${total} components — ${n} still needed: ${missing.join(', ')}.`;
}

// --- 2.1 SINS — Spinal Instability Neoplastic Score --------------------------
const SINS_NOTE = 'Spinal Instability Neoplastic Score (Fisher CG, DiPaola CP, Ryken TC, et al, Spine 2010;35(22):E1221-E1229) — an evidence-based, expert-consensus score for neoplastic spinal instability. Six components sum 0–18: spinal location (junctional 3, mobile 2, semirigid 1, rigid 0), mechanical/loading pain (3, occasional non-mechanical 1, none 0), bone-lesion quality (lytic 2, mixed 1, blastic 0), radiographic alignment (subluxation/translation 4, de novo deformity 2, normal 0), vertebral-body collapse (>50% 3, <50% 2, no collapse but >50% of the body involved 1, none 0), and posterolateral element involvement (bilateral 3, unilateral 1, none 0). The bands are 0–6 stable, 7–12 indeterminate (potentially unstable), and 13–18 unstable; a score of 7–18 (indeterminate or unstable) warrants a surgical/spine-oncology consult. It reports the total, the component scores, and that framing; the stabilization decision stays with the multidisciplinary team.';
const SINS = [
  { key: 'location', label: 'location', map: {
    junctional: { pts: 3, label: 'junctional (occiput–C2, C7–T2, T11–L1, L5–S1)' },
    mobile: { pts: 2, label: 'mobile spine (C3–C6, L2–L4)' },
    semirigid: { pts: 1, label: 'semirigid (T3–T10)' },
    rigid: { pts: 0, label: 'rigid (S2–S5)' },
  } },
  { key: 'pain', label: 'pain', map: {
    mechanical: { pts: 3, label: 'mechanical / with loading' },
    occasional: { pts: 1, label: 'occasional, non-mechanical' },
    none: { pts: 0, label: 'pain-free' },
  } },
  { key: 'lesion', label: 'bone lesion', map: {
    lytic: { pts: 2, label: 'lytic' },
    mixed: { pts: 1, label: 'mixed' },
    blastic: { pts: 0, label: 'blastic' },
  } },
  { key: 'alignment', label: 'alignment', map: {
    subluxation: { pts: 4, label: 'subluxation / translation' },
    deformity: { pts: 2, label: 'de novo deformity (kyphosis / scoliosis)' },
    normal: { pts: 0, label: 'normal alignment' },
  } },
  { key: 'collapse', label: 'vertebral-body collapse', map: {
    over50: { pts: 3, label: '> 50% collapse' },
    under50: { pts: 2, label: '< 50% collapse' },
    involved: { pts: 1, label: 'no collapse but > 50% of the body involved' },
    none: { pts: 0, label: 'none of the above' },
  } },
  { key: 'posterolateral', label: 'posterolateral involvement', map: {
    bilateral: { pts: 3, label: 'bilateral' },
    unilateral: { pts: 1, label: 'unilateral' },
    none: { pts: 0, label: 'none' },
  } },
];

export function sinsScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const { total, parts, missing } = sumComponents(o, SINS);
  if (missing.length) return { valid: false, message: needMessage(missing, 6) };
  const t = num('SINS total', total, { min: 0, max: 18 });
  let band; let stability; let abnormal;
  if (t <= 6) { band = 'Stable'; stability = 'stable (0–6).'; abnormal = false; }
  else if (t <= 12) { band = 'Indeterminate'; stability = 'indeterminate / potentially unstable (7–12) — surgical consultation recommended.'; abnormal = true; }
  else { band = 'Unstable'; stability = 'unstable (13–18) — surgical consultation recommended.'; abnormal = true; }
  return {
    valid: true,
    score: t,
    bandLabel: band,
    abnormal,
    band: `SINS ${t}/18 — ${stability}`,
    detail: parts.join('; ') + '.',
    note: SINS_NOTE,
  };
}

// --- 2.2 Revised Tokuhashi Score ---------------------------------------------
const TOKUHASHI_NOTE = 'Revised Tokuhashi Score (Tokuhashi Y, Matsuzaki H, Oda H, Oshima M, Ryu J, Spine 2005;30(19):2186-2191) — a preoperative prognostic score for metastatic spine tumors. Six parameters sum 0–15: general condition (Karnofsky performance status — poor 10–40 = 0, moderate 50–70 = 1, good 80–100 = 2), number of extraspinal bone-metastasis foci (≥3 = 0, 1–2 = 1, 0 = 2), number of metastases in the vertebral body (≥3 = 0, 2 = 1, 1 = 2), metastases to major internal organs (unremovable = 0, removable = 1, none = 2), primary-tumor site (0–5, with lung/stomach lowest and thyroid/breast/prostate highest), and palsy by Frankel grade (complete A/B = 0, incomplete C/D = 1, none E = 2). A LOWER total is the worse prognosis: 0–8 predicts expected survival under 6 months, 9–11 at least 6 months, and 12–15 at least 1 year, guiding how aggressive surgery should be. It reports the total, the parameter scores, and the survival band; the operative decision stays with the spine/oncology team.';
const KPS = { poor: { pts: 0, label: 'poor (KPS 10–40)' }, moderate: { pts: 1, label: 'moderate (KPS 50–70)' }, good: { pts: 2, label: 'good (KPS 80–100)' } };
const COUNT3 = { ge3: { pts: 0, label: '≥ 3' }, mid: { pts: 1, label: '1–2' }, zero: { pts: 2, label: '0' } };
const VB3 = { ge3: { pts: 0, label: '≥ 3' }, two: { pts: 1, label: '2' }, one: { pts: 2, label: '1' } };
const ORGAN = { unremovable: { pts: 0, label: 'unremovable metastases' }, removable: { pts: 1, label: 'removable metastases' }, none: { pts: 2, label: 'no metastases' } };
const PRIMARY = {
  p0: { pts: 0, label: 'lung / osteosarcoma / stomach / bladder / esophagus / pancreas' },
  p1: { pts: 1, label: 'liver / gallbladder / unidentified' },
  p2: { pts: 2, label: 'other' },
  p3: { pts: 3, label: 'kidney / uterus' },
  p4: { pts: 4, label: 'rectum' },
  p5: { pts: 5, label: 'thyroid / breast / prostate / carcinoid tumor' },
};
const FRANKEL = { complete: { pts: 0, label: 'complete (Frankel A, B)' }, incomplete: { pts: 1, label: 'incomplete (Frankel C, D)' }, none: { pts: 2, label: 'none (Frankel E)' } };
const TOKUHASHI = [
  { key: 'general', label: 'general condition', map: KPS },
  { key: 'extraspinalBone', label: 'extraspinal bone metastases', map: COUNT3 },
  { key: 'vertebralMets', label: 'vertebral-body metastases', map: VB3 },
  { key: 'organMets', label: 'major-organ metastases', map: ORGAN },
  { key: 'primary', label: 'primary site', map: PRIMARY },
  { key: 'palsy', label: 'palsy', map: FRANKEL },
];

export function tokuhashiRevised(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const { total, parts, missing } = sumComponents(o, TOKUHASHI);
  if (missing.length) return { valid: false, message: needMessage(missing, 6) };
  const t = num('Tokuhashi total', total, { min: 0, max: 15 });
  let band; let survival; let abnormal;
  if (t <= 8) { band = 'Poor (< 6 months)'; survival = 'expected survival under 6 months (0–8) — conservative or palliative strategy.'; abnormal = true; }
  else if (t <= 11) { band = 'Intermediate (≥ 6 months)'; survival = 'expected survival at least 6 months (9–11) — palliative surgery may be appropriate.'; abnormal = false; }
  else { band = 'Favorable (≥ 1 year)'; survival = 'expected survival at least 1 year (12–15) — excisional surgery may be appropriate.'; abnormal = false; }
  return {
    valid: true,
    score: t,
    bandLabel: band,
    abnormal,
    band: `Revised Tokuhashi ${t}/15 — ${survival}`,
    detail: parts.join('; ') + '.',
    note: TOKUHASHI_NOTE,
  };
}

// --- 2.3 Tomita Surgical Strategy Score --------------------------------------
const TOMITA_NOTE = 'Tomita Surgical Strategy Score (Tomita K, Kawahara N, Kobayashi T, Yoshida A, Murakami H, Akamaru T, Spine 2001;26(3):298-306) — a prognostic score that maps three factors to a surgical goal for spinal metastases. Primary-tumor grade (slow growth e.g. breast/thyroid/prostate = 1, moderate growth e.g. kidney/uterus = 2, rapid growth or unknown primary = 4), visceral metastases (none = 0, treatable = 2, untreatable = 4), and bone metastases (solitary/isolated = 1, multiple = 2) sum to 2–10. The strategy bands are 2–3 wide or marginal excision (long-term local control), 4–5 marginal or intralesional excision (middle-term local control), 6–7 palliative surgery (short-term palliation), and 8–10 supportive / terminal care (nonoperative, hospice). It reports the total, the factor scores, and the strategy framing; the operative goal stays with the treating team.';
const TOMITA_PRIMARY = { slow: { pts: 1, label: 'slow growth (e.g. breast, thyroid, prostate)' }, moderate: { pts: 2, label: 'moderate growth (e.g. kidney, uterus)' }, rapid: { pts: 4, label: 'rapid growth or unknown primary (e.g. lung, stomach)' } };
const TOMITA_VISCERAL = { none: { pts: 0, label: 'no visceral metastases' }, treatable: { pts: 2, label: 'treatable visceral metastases' }, untreatable: { pts: 4, label: 'untreatable visceral metastases' } };
const TOMITA_BONE = { solitary: { pts: 1, label: 'solitary / isolated' }, multiple: { pts: 2, label: 'multiple' } };
const TOMITA = [
  { key: 'primary', label: 'primary tumor', map: TOMITA_PRIMARY },
  { key: 'visceral', label: 'visceral metastases', map: TOMITA_VISCERAL },
  { key: 'bone', label: 'bone metastases', map: TOMITA_BONE },
];

export function tomitaScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const { total, parts, missing } = sumComponents(o, TOMITA);
  if (missing.length) return { valid: false, message: needMessage(missing, 3) };
  const t = num('Tomita total', total, { min: 2, max: 10 });
  let band; let strategy; let abnormal;
  if (t <= 3) { band = 'Wide / marginal excision'; strategy = 'wide or marginal excision for long-term local control (2–3).'; abnormal = false; }
  else if (t <= 5) { band = 'Marginal / intralesional excision'; strategy = 'marginal or intralesional excision for middle-term local control (4–5).'; abnormal = false; }
  else if (t <= 7) { band = 'Palliative surgery'; strategy = 'palliative surgery for short-term palliation (6–7).'; abnormal = true; }
  else { band = 'Supportive / terminal care'; strategy = 'supportive / terminal (nonoperative) care (8–10).'; abnormal = true; }
  return {
    valid: true,
    score: t,
    bandLabel: band,
    abnormal,
    band: `Tomita ${t}/10 — ${strategy}`,
    detail: parts.join('; ') + '.',
    note: TOMITA_NOTE,
  };
}

// --- 2.4 TLICS — Thoracolumbar Injury Classification and Severity ------------
const TLICS_NOTE = 'Thoracolumbar Injury Classification and Severity Score (Vaccaro AR, Lehman RA Jr, Hurlbert RJ, et al, Spine 2005;30(20):2325-2333) — triages thoracolumbar (T1–L5) injury from three categories. Injury morphology (compression 1, burst 2, translational/rotational 3, distraction 4), neurologic status (intact 0, nerve root 2, complete cord/conus 2, incomplete cord/conus 3, cauda equina 3), and posterior-ligamentous-complex integrity (intact 0, indeterminate/suspected 2, injured/disrupted 3) sum to 0–10. The triage is ≤ 3 nonoperative, 4 indeterminate (surgeon’s discretion), and ≥ 5 operative. Incomplete cord injury (3) scores higher than complete (2) by design, because an incomplete deficit benefits more from decompression. It reports the total, the category scores, and the triage; the operative decision stays with the spine surgeon.';
const TLICS_MORPH = { compression: { pts: 1, label: 'compression' }, burst: { pts: 2, label: 'burst' }, translation: { pts: 3, label: 'translational / rotational' }, distraction: { pts: 4, label: 'distraction' } };
const TLICS_NEURO = { intact: { pts: 0, label: 'intact' }, root: { pts: 2, label: 'nerve root' }, complete: { pts: 2, label: 'complete cord / conus medullaris' }, incomplete: { pts: 3, label: 'incomplete cord / conus medullaris' }, cauda: { pts: 3, label: 'cauda equina' } };
const TLICS_PLC = { intact: { pts: 0, label: 'intact' }, indeterminate: { pts: 2, label: 'indeterminate / suspected injury' }, disrupted: { pts: 3, label: 'injured / disrupted' } };
const TLICS = [
  { key: 'morphology', label: 'injury morphology', map: TLICS_MORPH },
  { key: 'neuro', label: 'neurologic status', map: TLICS_NEURO },
  { key: 'plc', label: 'posterior ligamentous complex', map: TLICS_PLC },
];

export function tlicsScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const { total, parts, missing } = sumComponents(o, TLICS);
  if (missing.length) return { valid: false, message: needMessage(missing, 3) };
  const t = num('TLICS total', total, { min: 0, max: 10 });
  let band; let triage; let abnormal;
  if (t <= 3) { band = 'Nonoperative'; triage = 'nonoperative management (≤ 3).'; abnormal = false; }
  else if (t === 4) { band = 'Indeterminate'; triage = 'indeterminate — surgeon’s discretion (4).'; abnormal = true; }
  else { band = 'Operative'; triage = 'operative management (≥ 5).'; abnormal = true; }
  return {
    valid: true,
    score: t,
    bandLabel: band,
    abnormal,
    band: `TLICS ${t}/10 — ${triage}`,
    detail: parts.join('; ') + '.',
    note: TLICS_NOTE,
  };
}

// --- 2.5 SLIC — Subaxial Cervical Spine Injury Classification ----------------
const SLIC_NOTE = 'Subaxial Cervical Spine Injury Classification (Vaccaro AR, Hulbert RJ, Patel AA, et al, Spine 2007;32(21):2365-2374) — the C3–C7 parallel of TLICS. Injury morphology (no abnormality 0, compression 1, burst 2, distraction 3, rotation/translation 4), disco-ligamentous-complex integrity (intact 0, indeterminate 1, disrupted 2), and neurologic status (intact 0, root injury 1, complete cord 2, incomplete cord 3) sum to 0–10, with a separate additive +1 modifier when there is continuous cord compression and an ongoing neurologic deficit. The triage is ≤ 3 nonoperative, 4 indeterminate, and ≥ 5 operative. Incomplete cord injury (3) scores higher than complete (2), and the +1 is applied on top of the neuro status rather than as a fifth option. It reports the total, the category scores, and the triage; the operative decision stays with the spine surgeon.';
const SLIC_MORPH = { none: { pts: 0, label: 'no abnormality' }, compression: { pts: 1, label: 'compression' }, burst: { pts: 2, label: 'burst' }, distraction: { pts: 3, label: 'distraction (facet perch / hyperextension)' }, rotation: { pts: 4, label: 'rotation / translation (facet dislocation, unstable teardrop)' } };
const SLIC_DLC = { intact: { pts: 0, label: 'intact' }, indeterminate: { pts: 1, label: 'indeterminate' }, disrupted: { pts: 2, label: 'disrupted' } };
const SLIC_NEURO = { intact: { pts: 0, label: 'intact' }, root: { pts: 1, label: 'root injury' }, complete: { pts: 2, label: 'complete cord injury' }, incomplete: { pts: 3, label: 'incomplete cord injury' } };
const SLIC = [
  { key: 'morphology', label: 'injury morphology', map: SLIC_MORPH },
  { key: 'dlc', label: 'disco-ligamentous complex', map: SLIC_DLC },
  { key: 'neuro', label: 'neurologic status', map: SLIC_NEURO },
];

export function slicScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const { total, parts, missing } = sumComponents(o, SLIC);
  if (missing.length) return { valid: false, message: needMessage(missing, 3) };
  const ongoing = onFlag(o.continuousCompression);
  const t = num('SLIC total', total + (ongoing ? 1 : 0), { min: 0, max: 10 });
  if (ongoing) parts.push('continuous cord compression with deficit (+1)');
  let band; let triage; let abnormal;
  if (t <= 3) { band = 'Nonoperative'; triage = 'nonoperative management (≤ 3).'; abnormal = false; }
  else if (t === 4) { band = 'Indeterminate'; triage = 'indeterminate — surgeon’s discretion (4).'; abnormal = true; }
  else { band = 'Operative'; triage = 'operative management (≥ 5).'; abnormal = true; }
  return {
    valid: true,
    score: t,
    bandLabel: band,
    abnormal,
    band: `SLIC ${t}/10 — ${triage}`,
    detail: parts.join('; ') + '.',
    note: SLIC_NOTE,
  };
}
