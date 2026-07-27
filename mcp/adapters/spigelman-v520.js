// spec-v520 MCP wave: adapter for the Spigelman duodenal-polyposis stage in lib/spigelman-v520.js.
// The dom keys mirror the browser renderer (views/group-v520.js) and META['spigelman'].example: spig-number,
// spig-size, spig-histology, spig-dysplasia map to the lib args number, size, histology, dysplasia. The
// `fields` array is GENERATED from the lib's exported SPIGELMAN_ITEMS, so each field's label carries that
// parameter's own point rows.
//
// The enum values are '1','2','3' with NO ZERO on any field, which is not an omission: the Spigelman table
// has no zero row, so once any adenoma is present the lowest reachable total is 4, and stage 0 means no
// duodenal adenomas were found at all. A caller that passes 0 gets an explicit invalid result saying so
// rather than a silently deflated stage. All four are in META.example, so all four are required.
//
// The dysplasia labels carry BOTH the original mild/moderate/severe wording and the two-tiered low-grade /
// high-grade equivalent, because a caller reading a modern pathology report will not find "moderate" in it
// and would otherwise have to guess which end to map to. The example scores 12 (stage IV); the total, the
// stage, and the severity reading are all carried by the result band, so it flows through the default
// makeToArgs with no custom toArgs. The tile deliberately emits NO surveillance interval.

import * as S from '../../lib/spigelman-v520.js';

export default [
  {
    id: 'spigelman',
    summary: 'The Spigelman classification of duodenal polyposis in familial adenomatous polyposis. Four parameters, each worth 1 to 3 points: the number of polyps (1 to 4, 5 to 20, more than 20), the size of the largest polyp (1 to 4 mm, 5 to 10 mm, more than 10 mm), the histology (tubular, tubulovillous, villous), and the grade of dysplasia (mild, moderate, severe). Stage 0 is 0 points, stage I is 1 to 4, stage II is 5 to 6, stage III is 7 to 8, and stage IV is 9 to 12. No parameter has a zero row, so once any adenoma is present the lowest reachable total is 4: stage 0 means no duodenal adenomas were found at all, which is established before the score is computed rather than by computing it. Spigelman graded dysplasia as mild, moderate, or severe; pathology has since moved to a two-tiered low-grade and high-grade report, which maps to the original ends, so low grade scores 1 and high grade scores 3. This is a severity stage, not a management instruction. Published surveillance intervals differ by guideline and by registry and depend on much more than the stage, so this tool does not emit one and does not indicate endoscopic resection or duodenal surgery. It also does not stage the ampulla, which is assessed separately and can harbor advanced disease at a low duodenal stage.',
    compute: S.spigelman,
    fields: S.SPIGELMAN_ITEMS.map((item) => ({
      dom: `spig-${item.key}`,
      arg: item.key,
      kind: 'enum',
      values: item.options.map((o) => o.value),
      label: `${item.text} [${item.options.map((o) => o.text).join('; ')}]`,
    })),
  },
];
