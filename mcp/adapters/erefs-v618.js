// spec-v618 MCP wave: adapter for the EREFS endoscopic reference score in lib/erefs-v618.js. The dom keys
// mirror the browser renderer (views/group-v618.js) and META.erefs.example.
//
// **THE PROXIMAL AND DISTAL ESOPHAGUS ARE SCORED SEPARATELY: 0-9 EACH, 0-18 OVERALL.** NEVER report a single
// regional score as "the EREFS" - that halves the scale. Both regional scores and the total are returned.
//
// **THE FIVE FEATURES HAVE DIFFERENT MAXIMA** (edema 1, rings 3, exudates 2, furrows 2, stricture 1) and are
// NOT equally weighted. **STRICTURE IS PRESENT-OR-ABSENT ONLY** - the least granular item, worth the same one
// point as edema.
//
// **"THE EREFS SCORE" IS AMBIGUOUS.** At least three composites are published from the same five features, so
// `total`, `inflammatoryScore` (edema + exudates + furrows only) and `modifiedScore` (presence-or-absence) are
// ALL returned. NEVER report a bare number without naming which variant it is.
//
// **NO SEVERITY BAND IS RETURNED** - `band` is always null, because none is validated. The instrument is used
// as a trial endpoint by CHANGE from a patient's own baseline.
//
// It does NOT diagnose eosinophilic esophagitis - that needs a biopsy eosinophil count, and a normal-looking
// esophagus can still be histologically active.

import * as E from '../../lib/erefs-v618.js';

export default [
  {
    id: 'erefs',
    summary: `The EREFS ENDOSCOPIC REFERENCE SCORE (Hirano and colleagues 2013) grades five endoscopic features of eosinophilic esophagitis: ${E.FEATURES.map((f) => `${f.text} [${f.grades.map((g) => `${g.grade} = ${g.text}`).join('; ')}]`).join('. ')}. **${E.REGION_NOTE}** NEVER report a single regional score as "the EREFS". **${E.WEIGHT_NOTE}** **${E.STRICTURE_NOTE}** **${E.VARIANT_NOTE}** \`total\`, \`inflammatoryScore\` and \`modifiedScore\` are ALL returned - never report a bare number without naming which variant it is. **${E.NO_BANDS_NOTE}** \`band\` is ALWAYS null. ${E.RINGS_NOTE} ${E.EXUDATE_BOUNDARY_NOTE} This DESCRIBES endoscopic appearance. It does NOT diagnose eosinophilic esophagitis - that requires an esophageal biopsy with an eosinophil count, and a NORMAL-LOOKING ESOPHAGUS CAN STILL BE HISTOLOGICALLY ACTIVE - does NOT measure symptoms or dysphagia, does NOT decide dilation, diet elimination, topical steroid or biologic therapy, and does NOT establish treatment response on its own.`,
    compute: E.erefs,
    fields: E.REGIONS.flatMap((r) => E.FEATURES.map((f) => ({
      dom: `erefs-${E.argKey(r.key, f.key)}`,
      arg: E.argKey(r.key, f.key),
      kind: 'enum', values: f.grades.map((g) => String(g.grade)), required: true,
      label: `${r.text} - ${f.text} [${f.grades.map((g) => `${g.grade} = ${g.text}`).join('; ')}]. Contributes up to ${f.grades.length - 1} point${f.grades.length - 1 === 1 ? '' : 's'} in this region.`,
    }))),
  },
];
