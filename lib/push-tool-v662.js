// spec-v662: PUSH tool (Pressure Ulcer Scale for Healing), version 3.0 (NPUAP).
//
// A trend/monitoring companion to the built pressure-ulcer risk tools (braden, norton,
// waterlow, bates-jensen). Source:
//   Thomas DR, Rodeheaver GT, Bartolucci AA, et al. Pressure ulcer scale for healing:
//   derivation and validation of the PUSH tool. Adv Wound Care. 1997;10(5):96-101.
//   Stotts NA, et al. J Gerontol A Biol Sci Med Sci. 2001;56(12):M795-M799. (NPUAP PUSH
//   Tool 3.0.)
//
// Three subscores summed to 0-17:
//   surface area (length x width, cm2) scored 0-10 by category;
//   exudate amount scored 0-3 (none/light/moderate/heavy);
//   tissue type scored 0-4 (closed/epithelial/granulation/slough/necrotic; worst tissue
//     present wins).
// A decreasing total over time indicates healing; an increasing total, deterioration.
//
// Pure: no DOM, no clock, no network.

function areaScore(cm2) {
  if (cm2 === 0) return 0;
  if (cm2 < 0.3) return 1;
  if (cm2 <= 0.6) return 2;
  if (cm2 <= 1.0) return 3;
  if (cm2 <= 2.0) return 4;
  if (cm2 <= 3.0) return 5;
  if (cm2 <= 4.0) return 6;
  if (cm2 <= 8.0) return 7;
  if (cm2 <= 12.0) return 8;
  if (cm2 <= 24.0) return 9;
  return 10;
}

const EXUDATE = { 0: 'none', 1: 'light', 2: 'moderate', 3: 'heavy' };
const TISSUE = { 0: 'closed', 1: 'epithelial tissue', 2: 'granulation tissue', 3: 'slough', 4: 'necrotic tissue (eschar)' };

export const PUSH_MIN = 0;
export const PUSH_MAX = 17;

export const PUSH_NOTE = 'PUSH tool (Pressure Ulcer Scale for Healing), version 3.0 (NPUAP; Thomas DR, et al., Adv Wound Care 1997;10(5):96-101; Stotts NA, et al., J Gerontol 2001). Three subscores are summed. Surface area (length times width in cm2) is scored 0 to 10 by category (0, then under 0.3, 0.3-0.6, 0.7-1.0, 1.1-2.0, 2.1-3.0, 3.1-4.0, 4.1-8.0, 8.1-12.0, 12.1-24.0, over 24.0). Exudate amount is scored 0 to 3 (none, light, moderate, heavy). Tissue type is scored 0 to 4 (closed, epithelial, granulation, slough, necrotic), taking the worst tissue present. The sum is 0 to 17; a decreasing total over serial assessments indicates healing and an increasing total indicates deterioration. PUSH is a monitoring instrument, so the meaningful output is the score trended over time rather than a single-visit interpretation.';

export function pushTool(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const lRaw = o.length;
  const wRaw = o.width;
  if (lRaw === '' || lRaw === null || lRaw === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'length', message: 'Enter the wound length in cm.' };
  }
  if (wRaw === '' || wRaw === null || wRaw === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'width', message: 'Enter the wound width in cm.' };
  }
  const length = typeof lRaw === 'number' ? lRaw : Number(String(lRaw).trim());
  const width = typeof wRaw === 'number' ? wRaw : Number(String(wRaw).trim());
  if (!Number.isFinite(length) || length < 0) {
    return { valid: false, code: 'OUT_OF_RANGE', field: 'length', message: `Wound length is a number of cm (0 or more). Got "${lRaw}".` };
  }
  if (!Number.isFinite(width) || width < 0) {
    return { valid: false, code: 'OUT_OF_RANGE', field: 'width', message: `Wound width is a number of cm (0 or more). Got "${wRaw}".` };
  }

  const eRaw = o.exudate;
  if (eRaw === '' || eRaw === null || eRaw === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'exudate', message: 'Score the exudate amount 0 to 3.' };
  }
  const exudate = typeof eRaw === 'number' ? eRaw : Number(String(eRaw).trim());
  if (!Number.isInteger(exudate) || exudate < 0 || exudate > 3) {
    return { valid: false, code: 'OUT_OF_RANGE', field: 'exudate', message: `Exudate amount is 0, 1, 2, or 3. Got "${eRaw}".` };
  }

  const tRaw = o.tissue;
  if (tRaw === '' || tRaw === null || tRaw === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'tissue', message: 'Score the tissue type 0 to 4.' };
  }
  const tissue = typeof tRaw === 'number' ? tRaw : Number(String(tRaw).trim());
  if (!Number.isInteger(tissue) || tissue < 0 || tissue > 4) {
    return { valid: false, code: 'OUT_OF_RANGE', field: 'tissue', message: `Tissue type is 0, 1, 2, 3, or 4. Got "${tRaw}".` };
  }

  const area = length * width;
  const aScore = areaScore(area);
  const total = aScore + exudate + tissue;

  return {
    valid: true,
    total,
    min: PUSH_MIN,
    max: PUSH_MAX,
    area: Math.round(area * 100) / 100,
    areaScore: aScore,
    exudateScore: exudate,
    tissueScore: tissue,
    abnormal: total > 0,
    bandLabel: `PUSH ${total} of ${PUSH_MAX}`,
    detail: `area ${Math.round(area * 100) / 100} cm2 -> ${aScore}; exudate ${EXUDATE[exudate]} (${exudate}); tissue ${TISSUE[tissue]} (${tissue}).`,
    note: PUSH_NOTE,
  };
}
