// spec-v252: orthopedic / spine radiographic ratios & scores — the Insall-Salvati
// ratio, the Torg-Pavlov ratio, the Meyerding spondylolisthesis grade, and the
// Beighton hypermobility score. Each id was verified absent by a fixed-string scan
// of the extracted app.js id/name lists AND the MCP adapter set first (spec-v85
// §6.2). v252 runs no AI and makes no runtime network call.
//
// These compute a ratio / grade / score — they are NOT a diagnosis and NOT a
// treatment order (spec-v11 §5.3).
//
//   insall-salvati-ratio        - patellar-height ratio
//   torg-pavlov-ratio           - cervical canal / body ratio
//   meyerding-spondylolisthesis - anterior-slip grade
//   beighton-hypermobility      - generalized joint hypermobility (0-9)
//
// FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r2 } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function fin(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Insall-Salvati ratio ----------------------------------------------------
// Insall J, Salvati E. Radiology. 1971: ratio = patellar-tendon length / patellar-
// bone length. Normal 0.8-1.2; < 0.8 patella baja, > 1.2 patella alta. Cross-
// verified: physio-pedia; PMC4852039.
const IS_NOTE = 'Insall-Salvati ratio (Insall J, Salvati E. Radiology. 1971) = patellar-tendon length / patellar-bone length. Normal 0.8-1.2; < 0.8 patella baja, > 1.2 patella alta. A radiographic ratio, not a diagnosis or treatment order.';
export function insallSalvati(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const tendon = fin(o.tendon, 1, 150);
  const patella = fin(o.patella, 1, 100);
  if (tendon === null || patella === null) {
    return { valid: false, message: 'Enter patellar-tendon length and patellar-bone length (same units).' };
  }
  const score = r2(num('Insall-Salvati', tendon / patella, { min: 0, max: 10 }));
  let tier; let abnormal = true;
  if (score > 1.2) tier = 'patella alta (> 1.2)';
  else if (score < 0.8) tier = 'patella baja (< 0.8)';
  else { tier = 'normal patellar height (0.8-1.2)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `IS ${score}`, band: `Insall-Salvati ratio ${score} — ${tier}.`, detail: `Tendon ${tendon} / patella ${patella}.`, note: IS_NOTE };
}

// --- Torg-Pavlov ratio -------------------------------------------------------
// Pavlov H, Torg JS, et al. Radiology. 1987: ratio = sagittal canal diameter /
// vertebral-body diameter on a lateral cervical radiograph. <= 0.8 indicates
// developmental cervical canal stenosis (increased spinal-cord-injury risk).
// Cross-verified: EBMconsult; PubMed 11493847.
const TP_NOTE = 'Torg-Pavlov ratio (Pavlov H, Torg JS, et al. Radiology. 1987) = sagittal spinal-canal diameter / vertebral-body diameter on a lateral cervical radiograph. <= 0.8 indicates developmental cervical canal stenosis (increased spinal-cord-injury risk); the ratio can overstate stenosis with large vertebral bodies. A radiographic ratio, not a diagnosis or treatment order.';
export function torgPavlov(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const canal = fin(o.canal, 1, 50);
  const body = fin(o.body, 1, 60);
  if (canal === null || body === null) {
    return { valid: false, message: 'Enter the canal and vertebral-body sagittal diameters (same units).' };
  }
  const score = r2(num('Torg-Pavlov', canal / body, { min: 0, max: 5 }));
  const abnormal = score <= 0.8;
  return { valid: true, score, abnormal, bandLabel: `TP ${score}`, band: `Torg-Pavlov ratio ${score} — ${abnormal ? 'developmental cervical stenosis (<= 0.8)' : 'not stenotic (> 0.8)'}.`, detail: `Canal ${canal} / body ${body}.`, note: TP_NOTE };
}

// --- Meyerding spondylolisthesis grade ---------------------------------------
// Meyerding HW. 1932: percent anterior slip = (anterior displacement / AP width of
// the caudal endplate) x 100. Grade I 1-25%, II 26-50%, III 51-75%, IV 76-100%, V
// > 100% (spondyloptosis). Cross-verified: StatPearls NBK430767; Orthobullets.
const MEYERDING_NOTE = 'Meyerding grade (Meyerding HW. 1932): percent anterior slip = (anterior displacement / AP width of the caudal vertebral endplate) x 100. Grade I 1-25%, II 26-50%, III 51-75%, IV 76-100%, V > 100% (spondyloptosis). A radiographic grade, not a diagnosis or treatment order.';
export function meyerdingSpondylolisthesis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const disp = fin(o.displacement, 0, 200);
  const width = fin(o.width, 1, 100);
  if (disp === null || width === null) {
    return { valid: false, message: 'Enter the anterior displacement and the caudal-endplate AP width (same units).' };
  }
  if (disp > width * 2) return { valid: false, message: 'Displacement exceeds twice the endplate width.' };
  const pct = r2(num('slip %', disp / width * 100, { min: 0, max: 200 }));
  let grade; const roman = ['0', 'I', 'II', 'III', 'IV', 'V'];
  if (pct > 100) grade = 5; else if (pct > 75) grade = 4; else if (pct > 50) grade = 3; else if (pct > 25) grade = 2; else if (pct > 0) grade = 1; else grade = 0;
  const abnormal = grade >= 2;
  return { valid: true, score: grade, abnormal, bandLabel: `Grade ${roman[grade]}`, band: `Meyerding grade ${roman[grade]} — ${pct}% anterior slip.`, detail: `Displacement ${disp} / width ${width}.`, note: MEYERDING_NOTE };
}

// --- Beighton hypermobility score --------------------------------------------
// Beighton P, et al. Ann Rheum Dis. 1973: passive 5th-finger dorsiflexion > 90
// (L + R), thumb-to-forearm apposition (L + R), elbow hyperextension > 10 (L + R),
// knee hyperextension > 10 (L + R), and palms flat on the floor with knees straight
// (1). Total 0-9; >= 5 (adults) suggests generalized joint hypermobility. Cross-
// verified: PMC8390395; Ehlers-Danlos Society.
const BEIGHTON_ITEMS = ['finger5R', 'finger5L', 'thumbR', 'thumbL', 'elbowR', 'elbowL', 'kneeR', 'kneeL', 'palms'];
const BEIGHTON_NOTE = 'Beighton hypermobility score (Beighton P, et al. Ann Rheum Dis. 1973): passive 5th-finger dorsiflexion > 90 deg (L + R), thumb-to-forearm apposition (L + R), elbow hyperextension > 10 deg (L + R), knee hyperextension > 10 deg (L + R), and palms flat on floor with knees straight (1). Total 0-9; >= 5 in adults (>= 6 prepubertal, >= 4 age > 50) suggests generalized joint hypermobility. A screening score, not a diagnosis or treatment order.';
export function beightonHypermobility(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of BEIGHTON_ITEMS) if (bool(o[k])) s += 1;
  const score = Math.round(num('Beighton', s, { min: 0, max: 9 }));
  const abnormal = score >= 5;
  return { valid: true, score, abnormal, bandLabel: `Beighton ${score}`, band: `Beighton score ${score} of 9 — ${abnormal ? 'generalized hypermobility (>= 5 in adults)' : 'below the adult hypermobility threshold (< 5)'}.`, detail: '5th finger, thumb, elbow, knee (L + R each) + palms flat.', note: BEIGHTON_NOTE };
}
