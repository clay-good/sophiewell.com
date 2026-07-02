// spec-v195: four deterministic gas-exchange / ventilation-efficiency
// instruments (Advanced Specialist Quantitation program, spec-v193 §1.1). Every
// id was verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v195 runs no AI and makes no runtime network call.
// These grade oxygenation and ventilation — they are not ventilator-setting or
// escalation orders (spec-v11 §5.3).
//
//   sfRatio               - SpO2/FiO2 (S/F) ratio with estimated P/F
//   ventilatoryRatio      - Ventilatory ratio (VR)
//   osi                   - Oxygen saturation index (OSI)
//   ventilationIndex      - Ventilation index (VI)
//
// COEFFICIENTS / SEVERITY BANDS RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent sources at implementation:
//   - S/F = SpO2 / FiO2; estimated P/F = (S/F - 64) / 0.84 (Rice TW, et al, Chest
//     2007;132(2):410-417). S/F 315 ~ P/F 300 (ALI), S/F 235 ~ P/F 200 (ARDS).
//     Valid only when SpO2 <= 97% (ceiling effect).
//   - VR = (VE_measured x PaCO2) / (PBW x 100 x 37.5) (Sinha P, et al, Br J
//     Anaesth 2009;102(5):692-697). PBW = ARDSNet predicted body weight. Normal
//     ~1; rising VR (> 2) tracks ARDS mortality. Guards PBW > 0.
//   - OSI = (FiO2 x mean airway pressure x 100) / SpO2 (PALICC, Pediatr Crit Care
//     Med 2015;16(5):428-439). PARDS: mild 5-<7.5, moderate 7.5-<12.3, severe
//     >=12.3. Valid only when SpO2 <= 97%. Guards SpO2 > 0.
//   - VI = (respiratory rate x PIP x PaCO2) / 1000 (Paret G, et al, Pediatr
//     Pulmonol 1998;26(2):125-128). Higher = worse; a PEEP-corrected variant uses
//     (PIP - PEEP).

import { num, r1, r2 } from './num.js';

function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}
function inRange(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

const CEILING = 'S/F- and SpO₂-based indices are reliable only when SpO₂ ≤ 97% — above that the oximeter saturates and the ratio loses discrimination.';

// --- 2.1 S/F ratio ----------------------------------------------------------
const SF_NOTE = 'SpO₂/FiO₂ (S/F) ratio with Rice-regression P/F estimate (Rice TW, et al, Chest 2007;132(2):410-417). S/F = SpO₂ ÷ FiO₂; estimated P/F ≈ (S/F − 64) / 0.84. S/F 315 ≈ P/F 300 (acute lung injury), S/F 235 ≈ P/F 200 (ARDS). The P/F is an estimate, not a measured ratio, and is reliable only when SpO₂ ≤ 97%. A non-invasive oxygenation grade, not an order.';

export function sfRatio(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const spo2 = inRange(o.spo2, 1, 100); // %
  const fio2 = inRange(o.fio2, 0.18, 1.0); // fraction
  const missing = [];
  if (spo2 === null) missing.push('SpO₂ (%, 1–100)');
  if (fio2 === null) missing.push('FiO₂ (fraction, 0.21–1.0)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const sf = r1(num('S/F', spo2 / fio2, { min: 0, max: 100000 }));
  const pf = r1(num('est P/F', (sf - 64) / 0.84, { min: -100000, max: 100000 }));
  const ceilingHit = spo2 > 97;
  const abnormal = sf <= 315;
  let band;
  if (sf <= 235) band = `S/F ${sf} (est P/F ${pf}) — at or below 235 (≈ P/F 200): ARDS-range oxygenation.`;
  else if (sf <= 315) band = `S/F ${sf} (est P/F ${pf}) — at or below 315 (≈ P/F 300): acute-lung-injury-range oxygenation.`;
  else band = `S/F ${sf} (est P/F ${pf}) — above 315.`;
  return {
    valid: true,
    sf,
    pf,
    ceilingHit,
    abnormal,
    bandLabel: `S/F ${sf}`,
    band,
    detail: `SpO₂ ${r1(spo2)}% ÷ FiO₂ ${r2(fio2)} = ${sf}; estimated P/F = (S/F − 64) ÷ 0.84 = ${pf}.${ceilingHit ? ' SpO₂ > 97% — above the reliable ceiling; interpret with caution.' : ''}`,
    caveat: CEILING,
    note: SF_NOTE,
  };
}

// --- 2.2 Ventilatory ratio --------------------------------------------------
const VR_NOTE = 'Ventilatory ratio VR = (measured minute ventilation × measured PaCO₂) / (predicted body weight × 100 × 37.5) (Sinha P, et al, Br J Anaesth 2009;102(5):692-697). Predicted body weight uses the ARDSNet formula. Normal ≈ 1; higher marks worse ventilatory efficiency / larger dead-space fraction, and VR rising above ~2 tracks ARDS mortality. A ventilation-efficiency grade, not an order.';

function pbwArdsnet(sex, heightCm) {
  const base = sex === 'female' ? 45.5 : 50;
  return base + 0.91 * (heightCm - 152.4);
}

export function ventilatoryRatio(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ve = pos(o.ve, 100000); // mL/min
  const paco2 = pos(o.paco2, 300); // mmHg
  const height = pos(o.height, 260); // cm
  const sex = o.sex === 'female' || o.sex === 'male' ? o.sex : '';
  const missing = [];
  if (ve === null) missing.push('measured minute ventilation (mL/min)');
  if (paco2 === null) missing.push('measured PaCO₂ (mmHg)');
  if (height === null) missing.push('height (cm)');
  if (!sex) missing.push('sex');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const pbw = pbwArdsnet(sex, height);
  if (pbw <= 0) return { valid: false, message: 'Predicted body weight is not positive — check the entered height.' };
  const vr = r2(num('VR', (ve * paco2) / (pbw * 100 * 37.5), { min: 0, max: 100000 }));
  const abnormal = vr > 2;
  let band;
  if (vr > 2) band = `Ventilatory ratio ${vr} — above 2: worse ventilatory efficiency, tracks ARDS mortality.`;
  else if (vr > 1.4) band = `Ventilatory ratio ${vr} — elevated (normal ≈ 1): larger dead-space fraction.`;
  else band = `Ventilatory ratio ${vr} — near the normal value of ~1.`;
  return {
    valid: true,
    vr,
    pbw: r1(pbw),
    abnormal,
    bandLabel: `VR ${vr}`,
    band,
    detail: `PBW ${r1(pbw)} kg (ARDSNet, ${sex}). VR = (V̇E ${r1(ve)} × PaCO₂ ${r1(paco2)}) ÷ (PBW × 100 × 37.5).`,
    note: VR_NOTE,
  };
}

// --- 2.3 OSI ----------------------------------------------------------------
const OSI_NOTE = 'Oxygen saturation index OSI = (FiO₂ × mean airway pressure × 100) / SpO₂ (PALICC, Pediatr Crit Care Med 2015;16(5):428-439). The non-invasive analogue of the PaO₂-based oxygenation index. PARDS severity: mild 5–<7.5, moderate 7.5–<12.3, severe ≥12.3. Reliable only when SpO₂ ≤ 97%. A gas-exchange grade, not an order.';

export function osi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fio2 = inRange(o.fio2, 0.18, 1.0); // fraction
  const map = pos(o.map, 100); // cmH2O
  const spo2 = inRange(o.spo2, 1, 100); // %
  const missing = [];
  if (fio2 === null) missing.push('FiO₂ (fraction, 0.21–1.0)');
  if (map === null) missing.push('mean airway pressure (cmH₂O)');
  if (spo2 === null) missing.push('SpO₂ (%, 1–100)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const value = r2(num('OSI', (fio2 * map * 100) / spo2, { min: 0, max: 100000 }));
  const ceilingHit = spo2 > 97;
  let sev; let abnormal = true;
  if (value >= 12.3) sev = 'severe PARDS (≥ 12.3)';
  else if (value >= 7.5) sev = 'moderate PARDS (7.5–< 12.3)';
  else if (value >= 5) sev = 'mild PARDS (5–< 7.5)';
  else { sev = 'below the mild-PARDS threshold (< 5)'; abnormal = false; }
  return {
    valid: true,
    value,
    ceilingHit,
    abnormal,
    bandLabel: `OSI ${value}`,
    band: `OSI ${value} — ${sev}.`,
    detail: `(FiO₂ ${r2(fio2)} × MAP ${r1(map)} cmH₂O × 100) ÷ SpO₂ ${r1(spo2)}%.${ceilingHit ? ' SpO₂ > 97% — above the reliable ceiling; interpret with caution.' : ''}`,
    caveat: CEILING,
    note: OSI_NOTE,
  };
}

// --- 2.4 Ventilation index --------------------------------------------------
const VI_NOTE = 'Ventilation index VI = (respiratory rate × peak inspiratory pressure × PaCO₂) / 1000 (Paret G, et al, Pediatr Pulmonol 1998;26(2):125-128). Higher = worse; used to track mortality / extubation-failure risk in pediatric respiratory failure. A PEEP-corrected variant substitutes (PIP − PEEP) for PIP. A tracking index, not an order.';

export function ventilationIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const rr = pos(o.rr, 200); // breaths/min
  const pip = pos(o.pip, 120); // cmH2O
  const paco2 = pos(o.paco2, 300); // mmHg
  const missing = [];
  if (rr === null) missing.push('respiratory rate (breaths/min)');
  if (pip === null) missing.push('peak inspiratory pressure (cmH₂O)');
  if (paco2 === null) missing.push('PaCO₂ (mmHg)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const value = r1(num('VI', (rr * pip * paco2) / 1000, { min: 0, max: 100000 }));
  const abnormal = value > 40;
  let band;
  if (value > 40) band = `Ventilation index ${value} — markedly elevated: higher mortality / extubation-failure risk.`;
  else band = `Ventilation index ${value} — a higher value marks worse ventilation.`;
  return {
    valid: true,
    value,
    abnormal,
    bandLabel: `VI ${value}`,
    band,
    detail: `(RR ${r1(rr)} × PIP ${r1(pip)} cmH₂O × PaCO₂ ${r1(paco2)} mmHg) ÷ 1000. A PEEP-corrected variant uses (PIP − PEEP).`,
    note: VI_NOTE,
  };
}
