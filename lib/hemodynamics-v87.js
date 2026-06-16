// spec-v87 (second feature spec of the spec-v85 Advanced Clinical Calculators
// program): three deterministic critical-care physiology calculators.
//
//   hemodynamicSuite - cardiac index, stroke volume, SVR/PVR resistance suite
//   mechanicalPower  - Gattinoni simplified mechanical power of ventilation
//   deadSpace        - Bohr-Enghoff physiologic dead-space fraction (Vd/Vt)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v13.js wire these to the home grid.
// Every function takes a single destructured object so the spec-v59 fuzz
// harness can drive each field through its adversarial matrix. Each division
// is guarded so no non-finite value reaches a returned string (spec-v59): a
// zero/blank denominator surfaces a `valid:false` fallback rather than an
// Infinity or NaN. r1/r2 come from lib/num.js (spec-v53 §4.1). None authors a
// management order in Sophie's voice (spec-v11 §5.3) - each surfaces the
// computation and the cited source's own normal ranges / risk thresholds.

import { r1, r2 } from './num.js';

// Finite-or-null: any non-finite input (NaN/Infinity/''/undefined/null) is
// treated as "not provided" rather than throwing, so optional fields are safe.
const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
// Strictly-positive finite or null (a denominator we can divide by).
const pos = (v) => { const f = fin(v); return f != null && f > 0 ? f : null; };

// --- 2.1 hemodynamicSuite - cardiac index + SVR/PVR resistance suite --------
// Given a cardiac output (thermodilution or Fick, entered) and the pressures
// from a pulmonary-artery catheter, the cardiac indices and vascular
// resistances follow from fixed equations (Swan-Ganz 1970). The ×80 factor
// converts (mmHg / (L/min)) to dynes·s·cm⁻⁵; PVR is additionally reported in
// Wood units = (mPAP − PCWP)/CO, the convention the 2022 ESC/ERS pulmonary-
// hypertension guideline states its < 2 WU threshold in. Every output is
// computed only when its inputs are present; CO and BSA gate the indexed forms.
export function hemodynamicSuite({
  cardiacOutput, heartRate, map, cvp, mpap, pcwp, bsa,
} = {}) {
  const co = pos(cardiacOutput);
  if (co == null) {
    return {
      valid: false,
      band: 'Enter a cardiac output greater than 0 (L/min).',
      note: 'Cardiac output is entered (thermodilution or Fick-derived); this tile computes the resistances and indices from it, it does not estimate CO itself.',
    };
  }
  const hr = pos(heartRate);
  const area = pos(bsa);
  const ma = fin(map);
  const cv = fin(cvp);
  const mpa = fin(mpap);
  const pcw = fin(pcwp);

  // Cardiac index (L/min/m²) - needs BSA.
  const ci = area != null ? co / area : null;
  // Stroke volume (mL) = CO(L/min)/HR × 1000; stroke volume index = SV/BSA.
  const sv = hr != null ? (co / hr) * 1000 : null;
  const svi = sv != null && area != null ? sv / area : null;
  // Systemic vascular resistance (dynes·s·cm⁻⁵) = 80·(MAP − CVP)/CO; SVRI ×BSA.
  const svr = ma != null && cv != null ? (80 * (ma - cv)) / co : null;
  const svri = svr != null && area != null ? svr * area : null;
  // Pulmonary vascular resistance: dynes form and Wood units (mmHg·min/L).
  const pvrWood = mpa != null && pcw != null ? (mpa - pcw) / co : null;
  const pvr = pvrWood != null ? pvrWood * 80 : null;
  const pvri = pvr != null && area != null ? pvr * area : null;

  const flag = (v, lo, hi) => (v == null ? null : (v < lo ? 'low' : (v > hi ? 'high' : 'normal')));

  return {
    valid: true,
    ci: ci == null ? null : r2(ci),
    ciFlag: flag(ci, 2.5, 4.0),
    sv: sv == null ? null : r1(sv),
    svFlag: flag(sv, 60, 100),
    svi: svi == null ? null : r1(svi),
    sviFlag: flag(svi, 33, 47),
    svr: svr == null ? null : Math.round(svr),
    svrFlag: flag(svr, 800, 1200),
    svri: svri == null ? null : Math.round(svri),
    pvr: pvr == null ? null : Math.round(pvr),
    pvrWood: pvrWood == null ? null : r2(pvrWood),
    // ESC/ERS 2022: PVR > 2 Wood units defines pre-capillary pulmonary HT.
    pvrFlag: pvrWood == null ? null : (pvrWood > 2 ? 'high' : 'normal'),
    pvri: pvri == null ? null : Math.round(pvri),
    note: 'Normal ranges: CI 2.5-4.0 L/min/m², SV 60-100 mL, SVI 33-47 mL/m², SVR 800-1200 dynes·s·cm⁻⁵, PVR under 2 Wood units (ESC/ERS 2022). The ×80 factor converts mmHg/(L/min) to dynes·s·cm⁻⁵. Decision support, not a diagnosis of shock type; the cardiogenic-vs-distributive-vs-obstructive judgment stays with the clinician.',
  };
}

// --- 2.2 mechanicalPower - mechanical power of ventilation ------------------
// Gattinoni 2016 simplified power equation (volume-controlled):
//   MP (J/min) ≈ 0.098 · RR · Vt(L) · (Ppeak − ½·(Pplat − PEEP))
// The 0.098 constant converts cmH₂O·L to joules (1 cmH₂O·L = 0.0981 J). The
// driving pressure (Pplat − PEEP) is shown as an intermediate. Serpa Neto 2018:
// power above ~17 J/min carries higher ventilator-induced-lung-injury risk.
export function mechanicalPower({
  respiratoryRate, tidalVolume, plateau, peep, peak,
} = {}) {
  const rr = pos(respiratoryRate);
  const vtMl = pos(tidalVolume);
  const pplat = fin(plateau);
  const peepV = fin(peep);
  const ppeak = fin(peak);
  if (rr == null || vtMl == null || pplat == null || peepV == null || ppeak == null) {
    return {
      valid: false,
      band: 'Enter respiratory rate, tidal volume, plateau, PEEP, and peak pressure.',
      note: 'The Gattinoni simplified power equation needs all five ventilator values.',
    };
  }
  const drivingPressure = pplat - peepV;
  const vtL = vtMl / 1000;
  // The bracket term is the per-breath pressure the tidal volume moves through.
  const pressureTerm = ppeak - 0.5 * drivingPressure;
  const power = 0.098 * rr * vtL * pressureTerm;
  const highRisk = power > 17;
  return {
    valid: true,
    mechanicalPower: r1(power),
    drivingPressure: r1(drivingPressure),
    highRisk,
    band: highRisk
      ? 'Mechanical power over 17 J/min: associated with higher ventilator-induced lung injury risk (Serpa Neto 2018).'
      : 'Mechanical power 17 J/min or below: below the higher-VILI-risk threshold (Serpa Neto 2018).',
    note: 'MP = 0.098 × RR × Vt(L) × (Ppeak − ½ × driving pressure); the 0.098 constant converts cmH₂O·L to joules. The 17 J/min threshold is an association, not a target; lung-protective ventilation is judged on the whole picture and local protocol.',
  };
}

// --- 2.3 deadSpace - Bohr-Enghoff physiologic dead-space fraction -----------
// Enghoff modification: Vd/Vt = (PaCO₂ − PĒCO₂) / PaCO₂. PĒCO₂ is the mixed-
// expired CO₂ (volumetric capnography); EtCO₂ (end-tidal) is a bedside
// surrogate that UNDERESTIMATES true dead space. Nuckton 2002: Vd/Vt > 0.6
// carried independent mortality risk in ARDS. A PĒCO₂ ≥ PaCO₂ (entry/measure
// error) yields a non-positive fraction - the tile reports the computed value
// and flags the implausible input rather than silently clamping.
export function deadSpace({ paco2, expiredCo2, source } = {}) {
  const pa = pos(paco2);
  const pe = fin(expiredCo2);
  if (pa == null || pe == null) {
    return {
      valid: false,
      band: 'Enter the arterial PaCO₂ and the expired CO₂.',
      note: 'Vd/Vt needs an arterial PaCO₂ and a mixed-expired (PĒCO₂) or end-tidal (EtCO₂) CO₂.',
    };
  }
  const isEtco2 = source === 'etco2';
  const ratio = (pa - pe) / pa;
  const implausible = pe >= pa;
  const elevated = !implausible && ratio > 0.6;
  let band;
  if (implausible) {
    band = 'Expired CO₂ is at or above PaCO₂: the fraction is non-positive, which is physiologically implausible - re-check the entries.';
  } else if (elevated) {
    band = 'Vd/Vt over 0.6: an elevated dead-space fraction, which carried independent mortality risk in ARDS (Nuckton 2002).';
  } else {
    band = 'Vd/Vt 0.6 or below.';
  }
  return {
    valid: true,
    ratio: r2(ratio),
    ratioPercent: Math.round(ratio * 100),
    elevated,
    implausible,
    isEtco2,
    band,
    note: isEtco2
      ? 'Using end-tidal EtCO₂ in place of mixed-expired PĒCO₂: this UNDERESTIMATES true physiologic dead space (the alveolar plateau reads higher than the mixed-expired average). Confirm with volumetric capnography when the number is decision-relevant.'
      : 'Vd/Vt = (PaCO₂ − PĒCO₂) / PaCO₂ (Enghoff form). PĒCO₂ is the mixed-expired CO₂ from volumetric capnography. Decision support per Nuckton 2002; correlate with the full ARDS picture.',
  };
}
