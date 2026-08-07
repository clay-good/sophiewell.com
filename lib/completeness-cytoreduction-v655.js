// spec-v655: Completeness of Cytoreduction (CC) score of Sugarbaker.
//
// The companion metric to the Peritoneal Cancer Index (peritoneal-cancer-index): after
// cytoreductive surgery (CRS) for peritoneal surface malignancy, the CC score grades the
// largest residual tumor nodule. Source:
//   Jacquet P, Sugarbaker PH. Clinical research methodologies in diagnosis and staging
//   of patients with peritoneal carcinomatosis. Cancer Treat Res. 1996;82:359-374.
//   PMID 8849962. (The same chapter that defines the PCI.)
//
// A decision-logic classifier from the largest residual nodule size (mm):
//   CC-0: no macroscopic residual tumor (0 mm);
//   CC-1: residual nodules < 2.5 mm;
//   CC-2: residual nodules 2.5 mm to 2.5 cm (>= 2.5 mm and <= 25 mm);
//   CC-3: residual nodules > 2.5 cm, or confluence of unresectable disease.
// CC-0 and CC-1 are a "complete" cytoreduction (nodules < 2.5 mm are within the
// penetration depth of intraperitoneal chemotherapy); CC-2 and CC-3 are incomplete.
//
// Pure: no DOM, no clock, no network.

export const CC_MIN = 0;
export const CC_MAX = 3;

function toBool(v) {
  if (v === true) return true;
  if (v === false || v === '' || v === null || v === undefined) return false;
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === '1' || s === 'on';
}

const LABEL = {
  0: 'CC-0 (no macroscopic residual tumor)',
  1: 'CC-1 (residual nodules < 2.5 mm)',
  2: 'CC-2 (residual nodules 2.5 mm to 2.5 cm)',
  3: 'CC-3 (residual nodules > 2.5 cm or confluence)',
};

export const CC_NOTE = 'Completeness of Cytoreduction (CC) score (Jacquet P, Sugarbaker PH, Cancer Treat Res 1996;82:359-374; the same chapter that defines the PCI). After cytoreductive surgery, the largest residual tumor nodule sets the grade: CC-0 is no macroscopic residual tumor; CC-1 is residual nodules under 2.5 mm; CC-2 is residual nodules from 2.5 mm to 2.5 cm; CC-3 is residual nodules over 2.5 cm or confluence of unresectable disease. CC-0 and CC-1 are considered a complete cytoreduction because nodules under 2.5 mm are within the penetration depth of intraperitoneal chemotherapy; CC-2 and CC-3 are incomplete. The grade is read alongside the Peritoneal Cancer Index and the operative findings; the decision stays with the surgical team.';

export function completenessCytoreduction(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const confluence = toBool(o.confluence);

  if (confluence) {
    return {
      valid: true,
      cc: 3,
      code: 'CC-3',
      complete: false,
      confluence: true,
      abnormal: true,
      gradeLabel: LABEL[3],
      bandLabel: 'CC-3',
      detail: 'Confluence of unresectable disease -> CC-3.',
      note: CC_NOTE,
    };
  }

  const raw = o.residualMm;
  if (raw === '' || raw === null || raw === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'residualMm', message: 'Enter the largest residual nodule size in mm (or mark confluence).' };
  }
  const mm = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isFinite(mm) || mm < 0) {
    return { valid: false, code: 'OUT_OF_RANGE', field: 'residualMm', message: `Residual nodule size is a number of mm (0 or more). Got "${raw}".` };
  }

  let cc;
  if (mm === 0) cc = 0;
  else if (mm < 2.5) cc = 1;
  else if (mm <= 25) cc = 2;
  else cc = 3;

  const complete = cc <= 1;
  return {
    valid: true,
    cc,
    code: `CC-${cc}`,
    complete,
    confluence: false,
    abnormal: cc >= 2,
    gradeLabel: LABEL[cc],
    bandLabel: `CC-${cc}`,
    detail: `Largest residual nodule ${mm} mm -> CC-${cc}${complete ? ' (complete cytoreduction)' : ' (incomplete)'}.`,
    note: CC_NOTE,
  };
}
