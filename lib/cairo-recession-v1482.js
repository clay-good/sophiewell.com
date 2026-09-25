// spec-v1482: Cairo classification of gingival recession, beside the Miller classification.
//
// Sources, read 2026-09-25:
//   Cairo F, Nieri M, Cincinelli S, Mervelt J, Pagliaro U. The interproximal clinical attachment level
//     to classify gingival recessions and predict root coverage outcomes: an explorative and
//     reliability study. J Clin Periodontol. 2011;38(7):661-666 (the original).
//   Types as stated in Front Oral Health 2026 (PMC13290863): "Recession type 1 (RT1): No interproximal
//     clinical attachment loss (CAL) and CEJ not exposed proximally. Recession type 2 (RT2):
//     interproximal CAL same or less than buccal CAL. Recession type 3 (RT3): interproximal CAL more
//     than buccal CAL."
//
// The type is derived from the two attachment losses, measured in mm. Pure: no DOM, no clock.

import { inputFault } from './num.js';

export function cairoRecession(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([
    ['the buccal attachment loss at the recession', o.buccalCal, 0, 20, 'mm'],
    ['the interproximal attachment loss', o.interproximalCal, 0, 20, 'mm'],
  ]);
  if (fault) return { valid: false, message: fault };
  const buccal = Number(o.buccalCal);
  const inter = Number(o.interproximalCal);
  if (buccal <= 0) return { valid: false, message: 'Enter the buccal attachment loss again: a recession has buccal attachment loss above 0 mm.' };

  let type;
  let text;
  if (inter === 0) { type = 'RT1'; text = 'no interproximal attachment loss; the cementoenamel junction is not exposed between the teeth'; }
  else if (inter <= buccal) { type = 'RT2'; text = `interproximal attachment loss (${inter} mm) no greater than the buccal loss (${buccal} mm)`; }
  else { type = 'RT3'; text = `interproximal attachment loss (${inter} mm) greater than the buccal loss (${buccal} mm)`; }

  return {
    valid: true,
    type,
    abnormal: type !== 'RT1',
    band: `Cairo ${type}: ${text}.`,
    bandLabel: type,
    notes: [
      'The Cairo types grade the interproximal attachment, which the original study used to predict root coverage; the Miller classes also weigh bone and soft-tissue loss and tooth position.',
      'Measure both attachment losses from the cementoenamel junction; the classification is only as reliable as the probing.',
    ],
    note: 'Cairo F et al, J Clin Periodontol 2011; types as stated in Front Oral Health 2026. It describes the recession; the choice of treatment is a clinical decision.',
  };
}
