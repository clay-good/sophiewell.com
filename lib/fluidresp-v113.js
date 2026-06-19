// spec-v113 (Wave 3 of the spec-v100 MDCalc Parity Completion program):
// three deterministic dynamic preload-responsiveness indices that fill confirmed
// gaps beside the static hemodynamic-suite / shock-index math. None duplicates a
// live tile.
//
//   ivcFluidResponsiveness - IVC collapsibility (spontaneous) / distensibility
//                            (mechanical) index, %
//   ppvSvv                 - pulse-pressure / stroke-volume variation, %
//   passiveLegRaise        - passive leg raise stroke-volume change, %
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v38.js wire these to the home grid and
// render the spec-v50 §3 applicability/technique posture note. Each tile reports
// the index and the source's responsiveness threshold; the give-fluid / withhold
// / start-pressor decision stays with the clinician and local protocol -- none
// authors a fluid order in Sophie's voice (spec-v11 §5.3).
//
// FORMULAS / THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each a
// published deterministic ratio with cited cutoffs:
//   - IVC index (Barbier C, et al, Intensive Care Med 2004): mechanically
//     ventilated distensibility dIVC = (Dmax - Dmin) / Dmin x 100, with the
//     cited ~18% cutoff predicting a fluid response; the spontaneous-breathing
//     collapsibility index (caval index) = (Dmax - Dmin) / Dmax x 100, with the
//     widely-taught ~40-50% suggestive range. Class A. Denominator guarded
//     per mode (Dmax > 0 collapsibility, Dmin > 0 distensibility).
//   - PPV / SVV (Michard F, et al, Am J Respir Crit Care Med 2000): variation =
//     (max - min) / ([max + min] / 2) x 100; PPV > ~13% (and the commonly-cited
//     SVV > ~12%) predict responsiveness in the regular-rhythm, passively
//     ventilated patient with adequate tidal volume. Class A. The (max + min)/2
//     mean denominator is guarded (max + min > 0).
//   - Passive leg raise (Monnet X, et al, Crit Care Med 2006): %dSV =
//     (peak - baseline) / baseline x 100; a rise of >= 10-15% predicts
//     responsiveness regardless of rhythm or ventilation mode. Class A. Baseline
//     denominator guarded (baseline > 0).

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const r1 = (n) => Math.round(n * 10) / 10;

// --- 2.1 ivc-fluid-responsiveness --------------------------------------------
const IVC_NOTE = 'IVC respiratory-variation index (Barbier C, Loubieres Y, Schmit C, Hayon J, Ricome JL, Jardin F, Vieillard-Baron A, Intensive Care Med 2004): in the mechanically ventilated patient the distensibility index dIVC = (Dmax - Dmin) / Dmin x 100, where the cited cutoff of about 18% predicts a fluid response; in the spontaneously breathing patient the collapsibility (caval) index = (Dmax - Dmin) / Dmax x 100, with a high value (widely taught as about 40-50%) suggesting responsiveness. The index mode must match the breathing mode. It reports the percentage and the cited threshold; the fluid decision stays with the clinician and local protocol.';

export function ivcFluidResponsiveness(input = {}) {
  const dmax = fin(input.dmax);
  const dmin = fin(input.dmin);
  const mechanical = input.mode === 'mechanical';
  if (dmax == null || dmin == null) {
    return { valid: false, band: 'Enter the maximum and minimum IVC diameter and select the ventilation mode to compute the index.', note: IVC_NOTE };
  }
  const denom = mechanical ? dmin : dmax;
  if (!(denom > 0)) {
    return { valid: false, band: mechanical
      ? 'The minimum IVC diameter must be greater than 0 to compute the distensibility index.'
      : 'The maximum IVC diameter must be greater than 0 to compute the collapsibility index.', note: IVC_NOTE };
  }
  const index = r1((dmax - dmin) / denom * 100);
  if (mechanical) {
    const responsive = index >= 18;
    return {
      valid: true, mode: 'distensibility', index, responsive,
      abnormal: responsive,
      band: `IVC distensibility ${index}% (Dmax ${dmax} / Dmin ${dmin} cm): ${responsive ? '>= ~18% -- predicts a fluid response (mechanically ventilated).' : '< ~18% -- below the cited fluid-response threshold (mechanically ventilated).'}`,
      note: IVC_NOTE,
    };
  }
  const responsive = index >= 40;
  return {
    valid: true, mode: 'collapsibility', index, responsive,
    abnormal: responsive,
    band: `IVC collapsibility ${index}% (Dmax ${dmax} / Dmin ${dmin} cm): ${responsive ? 'a high collapsibility index (~40-50%) suggests a fluid response (spontaneously breathing).' : 'a low collapsibility index argues against a fluid response (spontaneously breathing).'}`,
    note: IVC_NOTE,
  };
}

// --- 2.2 ppv-svv -------------------------------------------------------------
const PPV_NOTE = 'Pulse-pressure / stroke-volume variation (Michard F, Boussat S, Chemla D, Anguel N, Mercat A, Lecarpentier Y, Richard C, Pinsky MR, Teboul JL, Am J Respir Crit Care Med 2000): variation = (max - min) / ([max + min] / 2) x 100 over a respiratory cycle. A pulse-pressure variation above about 13% (and the commonly-cited stroke-volume variation above about 12%) predicts fluid responsiveness -- but only in a patient with a regular rhythm, passive (controlled-ventilation) breathing, and an adequate tidal volume; arrhythmia, spontaneous effort, or low tidal volume invalidate it. It reports the percentage and the cited threshold; the fluid decision stays with the clinician and local protocol.';

export function ppvSvv(input = {}) {
  const max = fin(input.max);
  const min = fin(input.min);
  const svv = input.mode === 'svv';
  if (max == null || min == null) {
    return { valid: false, band: 'Enter the maximum and minimum value over the respiratory cycle and select pulse-pressure or stroke-volume to compute the variation.', note: PPV_NOTE };
  }
  if (!(max + min > 0)) {
    return { valid: false, band: 'The mean of the maximum and minimum must be greater than 0 to compute the variation.', note: PPV_NOTE };
  }
  const variation = r1((max - min) / ((max + min) / 2) * 100);
  const cutoff = svv ? 12 : 13;
  const responsive = variation >= cutoff;
  const label = svv ? 'Stroke-volume variation' : 'Pulse-pressure variation';
  const unit = svv ? 'mL' : 'mmHg';
  return {
    valid: true, mode: svv ? 'svv' : 'ppv', variation, responsive,
    abnormal: responsive,
    band: `${label} ${variation}% (max ${max} / min ${min} ${unit}): ${responsive ? `> ~${cutoff}% -- suggests fluid responsiveness (regular rhythm, controlled ventilation, adequate tidal volume).` : `<= ~${cutoff}% -- below the cited fluid-responsiveness threshold.`}`,
    note: PPV_NOTE,
  };
}

// --- 2.3 passive-leg-raise ---------------------------------------------------
const PLR_NOTE = 'Passive leg raise stroke-volume response (Monnet X, Rienzo M, Osman D, Anguel N, Richard C, Pinsky MR, Teboul JL, Crit Care Med 2006): %dSV = (peak - baseline) / baseline x 100. Starting from a semi-recumbent position, tilting the trunk down and the legs up autotransfuses about 300 mL of venous blood; a real-time stroke-volume (or cardiac-output / aortic-VTI surrogate) rise of >= 10-15%, measured within about one minute, predicts fluid responsiveness regardless of rhythm or ventilation mode. It reports the percentage change and the cited threshold; the fluid decision stays with the clinician and local protocol.';

export function passiveLegRaise(input = {}) {
  const baseline = fin(input.baseline);
  const peak = fin(input.peak);
  if (baseline == null || peak == null) {
    return { valid: false, band: 'Enter the baseline and peak stroke volume (or cardiac output / VTI surrogate) during the passive leg raise to compute the percentage change.', note: PLR_NOTE };
  }
  if (!(baseline > 0)) {
    return { valid: false, band: 'The baseline value must be greater than 0 to compute a percentage change.', note: PLR_NOTE };
  }
  const change = r1((peak - baseline) / baseline * 100);
  const responsive = change >= 10;
  const falling = change < 0;
  let verdict;
  if (falling) verdict = `a fall of ${Math.abs(change)}% argues against fluid responsiveness`;
  else if (responsive) verdict = '>= 10-15% -- predicts fluid responsiveness';
  else verdict = '< 10% -- below the cited fluid-responsiveness threshold';
  return {
    valid: true, change, responsive, falling,
    abnormal: responsive,
    band: `Passive leg raise ${change >= 0 ? '+' : ''}${change}% stroke volume (${baseline} -> ${peak}): ${verdict}.`,
    note: PLR_NOTE,
  };
}
