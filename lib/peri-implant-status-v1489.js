// spec-v1489: the 2017 World Workshop case definitions for peri-implant health and disease, beside
// periodontitis staging.
//
// Sources, read 2026-09-25:
//   Berglundh T, Armitage G, Araujo MG, et al. Peri-implant diseases and conditions: consensus report
//     of workgroup 4 of the 2017 World Workshop on the Classification of Periodontal and Peri-Implant
//     Diseases and Conditions. J Clin Periodontol. 2018;45 Suppl 20:S286-S291 (the original).
//   The definitions as applied in Clin Oral Implants Res 2026 (PMC13542762): peri-implantitis is
//     "(i) bleeding and/or suppuration on gentle probing ..., (ii) increased probing depth compared to
//     baseline ..., and (iii) progressive radiographic bone loss ..., exceeding crestal bone-level
//     changes attributable to initial bone remodelling. In the absence of complete baseline reference
//     data, peri-implantitis was diagnosed when bleeding/suppuration on gentle probing was present in
//     combination with probing depths >= 6 mm and radiographic bone levels >= 3 mm apical of the most
//     coronal portion of the intraosseous part of the implant." Peri-implant health: "the absence of
//     bleeding/suppuration on probing without signs of bone loss beyond physiological remodelling."
//   Mucositis, as the 2017 consensus report defines it: bleeding and/or suppuration on gentle probing
//     without bone loss beyond initial remodeling. (The Clin Oral Implants Res study used the 2023
//     ID-COSM update, bleeding at more than one site; this tool keeps the 2017 wording.)
//
// With a baseline record the three findings decide; without one, the probing depth and bone level
// thresholds do. Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
const yn = (v) => (v === 'yes' || v === 'no' ? v : null);

function result(label, band, abnormal, extra = []) {
  return {
    valid: true,
    category: label,
    abnormal,
    band,
    bandLabel: label,
    notes: [
      ...extra,
      'Probe gently, at about 0.25 N, as the studies applying these definitions do.',
      'Initial bone remodeling after the implant is placed is not bone loss; the baseline is the radiograph taken once the restoration is in place.',
    ],
    note: 'Case definitions of the 2017 World Workshop (Berglundh T et al, J Clin Periodontol 2018), as applied in Clin Oral Implants Res 2026. They define a case for a study or a chart; treatment is a clinical decision.',
  };
}

export function periImplantStatus(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bleed = yn(o.bleeding);
  const baseline = yn(o.baseline);
  if (!bleed) return { valid: false, message: 'Choose whether there is bleeding or suppuration on gentle probing.' };
  if (!baseline) return { valid: false, message: 'Choose whether an earlier radiograph and probing record (a baseline) is available.' };

  if (baseline === 'yes') {
    const boneLoss = yn(o.boneLoss);
    if (!boneLoss) return { valid: false, message: 'Choose whether there is bone loss beyond initial remodeling since the baseline radiograph.' };
    if (bleed === 'no' && boneLoss === 'no') {
      return result('Peri-implant health', 'Peri-implant health: no bleeding or suppuration on gentle probing, and no bone loss beyond initial remodeling.', false);
    }
    if (bleed === 'yes' && boneLoss === 'no') {
      return result('Peri-implant mucositis', 'Peri-implant mucositis: bleeding or suppuration on gentle probing without bone loss beyond initial remodeling.', true);
    }
    if (bleed === 'no') {
      return result('Fits no case definition', 'Fits none of the three case definitions: bone loss beyond remodeling without bleeding or suppuration on probing. Health requires no such loss, and both diseases require bleeding or suppuration.', true);
    }
    const deeper = yn(o.depthIncrease);
    if (!deeper) return { valid: false, message: 'Choose whether the probing depth has increased since the baseline.' };
    if (deeper === 'yes') {
      return result('Peri-implantitis', 'Peri-implantitis: bleeding or suppuration on gentle probing, a deeper probing depth than at baseline, and bone loss beyond initial remodeling.', true);
    }
    return result('Criteria not all met', 'Not all peri-implantitis criteria are met: bleeding or suppuration and bone loss beyond remodeling, but the probing depth has not increased since the baseline. The 2017 definition requires all three.', true);
  }

  if (bleed === 'no') {
    return result('No inflammation on probing', 'No bleeding or suppuration on gentle probing, as in peri-implant health. Health also requires no bone loss beyond initial remodeling, which cannot be judged without a baseline radiograph.', false);
  }
  const fault = inputFault([
    ['the deepest probing depth at the implant', o.probingDepth, 0, 20, 'mm'],
    ['the bone level below the most coronal part of the implant within bone', o.boneLevel, 0, 20, 'mm'],
  ]);
  if (fault) return { valid: false, message: fault };
  const pd = Number(o.probingDepth);
  const bone = Number(o.boneLevel);
  if (pd >= 6 && bone >= 3) {
    return result('Peri-implantitis', `Peri-implantitis (no baseline): bleeding or suppuration on gentle probing with a probing depth of ${pd} mm (6 mm or more) and a bone level ${bone} mm (3 mm or more) apical to the most coronal part of the implant within bone.`, true);
  }
  const short = [pd < 6 ? `the probing depth (${pd} mm) is below 6 mm` : null, bone < 3 ? `the bone level (${bone} mm) is below 3 mm` : null].filter(Boolean).join(' and ');
  return result('Inflamed, peri-implantitis thresholds not met', `Bleeding or suppuration on gentle probing, but ${short}, so the no-baseline peri-implantitis thresholds are not met. This reads as mucositis only if there is no bone loss beyond initial remodeling, which a baseline radiograph would show.`, true);
}
