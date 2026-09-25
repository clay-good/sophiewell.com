// spec-v1470: lateral center-edge angle (LCEA) of Wiberg, read against the published bands.
//
// Source, read 2026-09-25: Atzmon R, Safran MR. Arthroscopic Treatment of Mild/Borderline Hip
// Dysplasia with Concomitant Femoroacetabular Impingement: Literature Review. Curr Rev Musculoskelet
// Med. 2022;15(4):300-310 (PMC9276885, open access). The angle of Wiberg (Acta Chir Scand 1939;83
// Suppl 58) is drawn on an AP pelvic radiograph from a vertical line through the center of the
// femoral head and a line from that center to the lateral edge of the sourcil, "not necessarily the
// most lateral aspect of the acetabulum". The review: normal 25 to 39 degrees; under 20 degrees a
// dysplastic hip; 20 to 25 degrees borderline hip dysplasia, "with some studies defining it between
// 18 and 25 degrees". It also says the LCEA alone is insufficient to choose the operation, and lists
// an LCEA under 15 degrees among the predictors of failed arthroscopy in a systematic review.
// J Hip Preserv Surg 2024 (PMC11973426) confirms both borderline definitions (18-25 and 20-25).
//
// Boundaries: the review's ranges share the endpoint 25 (borderline "20 and 25", normal "25 and
// 39"). Exactly 25 reads normal and says so. Between 18 and 20 the two definitions disagree, and the
// answer states both rather than picking one.
//
// Input limits: -20 to 70 degrees. A negative angle is possible when the head is subluxed past the
// sourcil edge. Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const LCEA_MIN = -20;
export const LCEA_MAX = 70;

const NOTE = 'Atzmon R, Safran MR, Curr Rev Musculoskelet Med 2022 (review of borderline hip dysplasia); angle of Wiberg 1939.';

export function lateralCenterEdgeAngle(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([['the lateral center-edge angle', o.angle, LCEA_MIN, LCEA_MAX, 'degrees']]);
  if (fault) return { valid: false, message: fault };
  const angle = typeof o.angle === 'number' ? o.angle : Number(String(o.angle).trim());
  const lead = `Lateral center-edge angle ${angle} degrees`;
  let band;
  let bandLabel;
  if (angle < 18) {
    band = `${lead}: hip dysplasia (below 18 degrees, dysplastic under both borderline definitions).`;
    bandLabel = 'Dysplasia';
  } else if (angle < 20) {
    band = `${lead}: dysplastic under the 20 to 25 degree borderline definition, but borderline hip dysplasia under the 18 to 25 degree definition some studies use.`;
    bandLabel = 'Dysplasia or borderline, by definition';
  } else if (angle < 25) {
    band = `${lead}: borderline hip dysplasia (20 to 25 degrees).`;
    bandLabel = 'Borderline dysplasia';
  } else if (angle <= 39) {
    band = `${lead}: normal (25 to 39 degrees).`;
    bandLabel = 'Normal';
  } else {
    band = `${lead}: above the 25 to 39 degree normal range the review gives.`;
    bandLabel = 'Above the normal range';
  }
  const notes = [];
  if (angle === 25) {
    notes.push('The review\'s ranges share the endpoint 25 degrees (borderline 20 to 25, normal 25 to 39); exactly 25 is read here as normal.');
  }
  if (angle < 15) {
    notes.push('The review reports an LCEA under 15 degrees among the predictors of failed hip arthroscopy in a systematic review.');
  }
  notes.push(
    'Borderline dysplasia is defined two ways: 20 to 25 degrees, or 18 to 25 degrees in some studies.',
    'The angle is measured to the lateral edge of the sourcil, not necessarily the most lateral bone of the acetabulum.',
    'The review states the LCEA alone is insufficient to choose which operation to perform.',
  );
  return {
    valid: true,
    abnormal: angle < 25 || angle > 39,
    angle,
    band,
    bandLabel,
    notes,
    note: NOTE,
  };
}
