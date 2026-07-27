// spec-v520: the Spigelman classification of duodenal polyposis in familial adenomatous polyposis (FAP).
// Zero-hit before this tile: "spigelman", "duodenal polyposis", and "ampullary" across corpus.json, app.js,
// and lib/meta.js, with no test/unit file. The catalog already carries several colorectal-polyposis and
// hereditary-cancer instruments, but all of them look at the COLON. The duodenum is where FAP patients who
// have already had a colectomy actually die, and this is the score that drives duodenal surveillance.
//
// FOUR PARAMETERS, EACH 1-3 POINTS, TOTAL 4-12:
//   polyp number     1-4 (1) / 5-20 (2) / more than 20 (3)      -- endoscopic
//   polyp size       1-4 mm (1) / 5-10 mm (2) / over 10 mm (3)  -- endoscopic
//   histology        tubular (1) / tubulovillous (2) / villous (3)  -- histopathologic
//   dysplasia        mild (1) / moderate (2) / severe (3)          -- histopathologic
// Stage 0 = 0 points, I = 1-4, II = 5-6, III = 7-8, IV = 9-12.
//
// TWO THINGS THIS TILE REFUSES TO PAPER OVER:
//
// (1) STAGE 0 IS NOT A SCORE OF ZERO ON THESE FOUR ITEMS. There is no zero row in any of the four
//     parameters, so the lowest total reachable once ANY adenoma is present is 4 (1+1+1+1). Stage 0 means no
//     duodenal adenomas were found at all -- a finding made BEFORE the score is computed, not by computing
//     it. That also makes the published stage-I band of "1 to 4 points" arithmetically reachable only at its
//     top end. The tile states both facts instead of silently offering a zero option that the source does
//     not define.
//
// (2) THE DYSPLASIA TERMINOLOGY CHANGED; THE SCORE DID NOT. Spigelman's 1989 table graded dysplasia as
//     mild / moderate / severe for 1 / 2 / 3 points. Pathology has since moved to a two-tiered low-grade /
//     high-grade report to reduce interobserver variability, and a two-tiered report maps to the original
//     ends: low grade scores 1, high grade scores 3. Each option therefore names BOTH the original grade and
//     its two-tiered equivalent, and says plainly that "moderate" is a three-tier grade a modern report will
//     not contain. Offering low/high only would misstate the original instrument; offering mild/moderate/
//     severe without the mapping would leave a reader holding a modern report unable to use it.
//
// HIGH-STAKES: this is a severity stage, not a management instruction. Published surveillance intervals
// differ by guideline and by registry and depend on much more than the stage -- ampullary involvement,
// resectability, prior duodenal surgery, the patient's colonic status and age. This tile therefore reports
// the stage and the standard severity reading of that stage and stops there: it does NOT emit a surveillance
// interval and does NOT indicate endoscopic resection, duodenectomy, or pancreas-preserving surgery
// (spec-v11 section 5.3). It also does not stage the ampulla, which is assessed separately and can harbor
// advanced disease at a low duodenal stage. The management decision stays with the clinician.
//
// PARAMETERS, POINTS, AND STAGE BANDS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing
// sources:
//   - Spigelman AD, Williams CB, Talbot IC, Domizio P, Phillips RK. Upper gastrointestinal cancer in
//     patients with familial adenomatous polyposis. Lancet. 1989;2(8666):783-785.
//   - FAP duodenal-surveillance reviews reproducing the same four parameters, the same 1/2/3 point values,
//     and the same stage bands (0 points stage 0, 1-4 stage I, 5-6 stage II, 7-8 stage III, 9-12 stage IV).
//   - Sources documenting the mild/moderate/severe to low-grade/high-grade transition in dysplasia grading.

export const SPIGELMAN_ITEMS = [
  {
    key: 'number',
    text: 'Number of duodenal polyps',
    options: [
      { value: '1', text: '1 point - 1 to 4 polyps' },
      { value: '2', text: '2 points - 5 to 20 polyps' },
      { value: '3', text: '3 points - more than 20 polyps' },
    ],
  },
  {
    key: 'size',
    text: 'Size of the largest polyp',
    options: [
      { value: '1', text: '1 point - 1 to 4 mm' },
      { value: '2', text: '2 points - 5 to 10 mm' },
      { value: '3', text: '3 points - more than 10 mm' },
    ],
  },
  {
    key: 'histology',
    text: 'Histology',
    options: [
      { value: '1', text: '1 point - tubular' },
      { value: '2', text: '2 points - tubulovillous' },
      { value: '3', text: '3 points - villous' },
    ],
  },
  {
    key: 'dysplasia',
    text: 'Dysplasia',
    options: [
      { value: '1', text: '1 point - mild (reported as low grade in a two-tiered report)' },
      { value: '2', text: '2 points - moderate (a three-tier grade; a two-tiered report will not contain it)' },
      { value: '3', text: '3 points - severe (reported as high grade in a two-tiered report)' },
    ],
  },
];

const MIN_WITH_ADENOMAS = 4;
const MAX_TOTAL = 12;

const STAGES = [
  { max: 4, stage: 'I', severity: 'mild disease' },
  { max: 6, stage: 'II', severity: 'moderate disease' },
  { max: 8, stage: 'III', severity: 'severe disease' },
  { max: MAX_TOTAL, stage: 'IV', severity: 'severe disease' },
];

const NOTE = 'The Spigelman classification (Spigelman and colleagues 1989) stages duodenal polyposis in familial adenomatous polyposis from four parameters, each worth 1 to 3 points: the number of polyps, the size of the largest polyp, the histology, and the grade of dysplasia. Stage 0 is 0 points, stage I is 1 to 4, stage II is 5 to 6, stage III is 7 to 8, and stage IV is 9 to 12. None of the four parameters has a zero row, so once any adenoma is present the lowest reachable total is 4: stage 0 means no duodenal adenomas were found at all, which is established before the score is computed rather than by computing it. Spigelman graded dysplasia as mild, moderate, or severe; pathology has since moved to a two-tiered low-grade and high-grade report, which maps to the original ends, so low grade scores 1 and high grade scores 3. This is a severity stage, not a management instruction. Published surveillance intervals differ by guideline and by registry and depend on much more than the stage, so this tile does not emit one and does not indicate endoscopic resection or duodenal surgery. It also does not stage the ampulla, which is assessed separately and can harbor advanced disease at a low duodenal stage.';

function readItem(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > 3) return NaN;
  return n;
}

// input: number, size, histology, dysplasia -- each 1-3. All four required.
export function spigelman(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const values = SPIGELMAN_ITEMS.map((item) => readItem(o[item.key]));

  if (values.some((n) => n === null)) {
    return { valid: false, message: 'Score all four parameters: polyp number, polyp size, histology, and dysplasia. Stage 0 means no duodenal adenomas were found, which is not scored here.' };
  }
  if (values.some((n) => Number.isNaN(n))) {
    return { valid: false, message: 'Each parameter must be a whole number from 1 to 3. There is no zero row in the Spigelman table.' };
  }

  const total = values.reduce((a, b) => a + b, 0);
  const entry = STAGES.find((s) => total <= s.max);

  const floorNote = total === MIN_WITH_ADENOMAS
    ? ' This is the lowest total reachable once any adenoma is present, because no parameter has a zero row.'
    : '';

  return {
    valid: true,
    total,
    stage: entry.stage,
    severity: entry.severity,
    bandLabel: `Spigelman ${total} of ${MAX_TOTAL}, stage ${entry.stage}`,
    band: `Stage ${entry.stage} (${entry.severity}), total ${total} of ${MAX_TOTAL}.${floorNote} The stage is a severity reading, not a surveillance interval.`,
    note: NOTE,
  };
}
