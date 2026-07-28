// spec-v545 MCP wave: adapter for FIGO PALM-COEIN in lib/palm-coein-v545.js. The dom keys mirror the browser
// renderer (views/group-v545.js) and META['palm-coein'].example: pc-<key> maps to the lib arg <key>.
//
// **EVERY CATEGORY ENUM HAS THREE VALUES, NOT TWO: '0', '1' AND '?'.** This is the design point. The obvious
// schema is nine booleans, and it would destroy the instrument's central property: PALM-COEIN is modelled on
// TNM staging, every category is addressed for every patient, and a category recorded as absent must be
// distinguishable from one never assessed. An agent that has not seen imaging or a coagulation screen must
// be able to say so rather than being forced to assert an absence. The result returns an `unassessed` list
// so a caller can see exactly which categories are unknown.
//
// **ALL NINE ARE REQUIRED, AND THAT IS THE POINT RATHER THAN AN INCONVENIENCE.** Omitting a category is not
// the same as scoring it 0. The lib refuses a partial classification and says why.
//
// **THE LEIOMYOMA SECONDARY TIER IS CONDITIONALLY REQUIRED.** When L is 1, SM versus O must be supplied,
// because that distinction - submucosal, involving the endometrial cavity, versus everything else - is the
// one that carries the clinical weight; submucosal lesions are the ones generally considered most likely to
// be causing the bleeding. The tertiary type 0-8 is genuinely optional and is omitted from the notation when
// not given.
//
// **THE EDITION IS STATED IN EVERY RESULT.** The 2011 and 2018 editions disagree in two ways that change a
// case: type 3 leiomyomas sit outside the submucous group in 2011 and inside it from 2018, and
// anticoagulant-associated bleeding is AUB-C in 2011 but AUB-I from 2018. Both remain in active use, so an
// agent comparing a stored classification against a fresh one must know which edition each used. This tool
// implements 2018 and returns `edition: '2018'`.
//
// The summary states that this does NOT exclude malignancy, because "AUB-M0" is exactly the string an agent
// could report as reassurance. M0 records that malignancy was assessed and not found; a classification made
// before endometrial sampling says nothing about whether cancer is present.

import * as P from '../../lib/palm-coein-v545.js';

export default [
  {
    id: 'palm-coein',
    summary: 'The FIGO PALM-COEIN classification of the causes of abnormal uterine bleeding in non-gravid women of reproductive age (Munro and colleagues 2011, revised 2018). THIS IS A NOTATION, NOT A SCORE. It is modelled on TNM staging: every one of the nine categories is addressed for every patient, so a complete classification reads for example "AUB P0 A0 L1(SM) M0 - C0 O1 E0 I0 N0". EACH CATEGORY TAKES ONE OF THREE VALUES: 0 for absent, 1 for present, and ? for NOT YET ASSESSED. The third value is essential and not a placeholder: a category left unstated is otherwise ambiguous between looked-for-and-not-found and never-assessed, and a clinician who has not done imaging or a coagulation screen must not be forced to assert an absence. PALM covers the categories defined by visually objective structural criteria - Polyp, Adenomyosis, Leiomyoma, and Malignancy with atypical hyperplasia. COEI covers those unrelated to structural anomalies - Coagulopathy, Ovulatory dysfunction, Endometrial, and Iatrogenic - and N is for entities not otherwise classified. MORE THAN ONE CATEGORY CAN BE POSITIVE AT ONCE and commonly is; assuming a visible structural lesion is the cause is a known error the system exists partly to prevent. The leiomyoma category has three tiers. The SECONDARY tier is required when leiomyoma is present and carries the clinical weight: SM means submucosal, involving the endometrial cavity, and O means all others, because submucosal lesions are generally considered most likely to cause the bleeding. The TERTIARY tier gives types 0 to 8 and is optional; a transmural lesion is notated with the endometrial relationship first and the serosal second, hyphenated. THIS TOOL IMPLEMENTS THE 2018 REVISION and reports the edition, because the editions disagree in ways that change a classification: type 3 sits outside the submucous group in 2011 and inside it from 2018, and anticoagulant-associated bleeding moved from AUB-C to AUB-I in 2018 along with medications causing ovulatory disorders. Both editions remain in active clinical use, so a record classified under one is not directly comparable with one classified under the other. This is a framework for organising a diagnosis, not a diagnosis. It does not establish that any category is present, since each requires its own assessment and the structural categories require imaging or histology. IT DOES NOT EXCLUDE MALIGNANCY: M0 records that malignancy was assessed and not found, and a classification made before endometrial sampling says nothing about whether cancer is present. It does not quantify bleeding, which is what the PBAC chart does, does not assess anemia, does not identify pregnancy, which must be excluded first in any woman of reproductive age, and is not a treatment algorithm.',
    compute: P.palmCoein,
    fields: [
      ...P.PALM_COEIN_CATEGORIES.map((c) => ({
        dom: `pc-${c.key}`, arg: c.key, kind: 'enum', values: P.CATEGORY_VALUES, required: true,
        label: `${c.letter} - ${c.name} [0 = absent; 1 = present; ? = not yet assessed]`,
      })),
      {
        dom: 'pc-leiomyomaSecondary', arg: 'leiomyomaSecondary', kind: 'enum',
        values: P.LEIOMYOMA_SECONDARY.map((s) => s.value),
        label: `Leiomyoma secondary classification. REQUIRED when leiomyoma is 1; this tier carries the clinical weight [${P.LEIOMYOMA_SECONDARY.map((s) => s.text).join('; ')}]`,
      },
      {
        dom: 'pc-leiomyomaType', arg: 'leiomyomaType', kind: 'enum',
        values: P.LEIOMYOMA_TYPES.map((t) => t.value),
        label: `Leiomyoma tertiary type, optional [${P.LEIOMYOMA_TYPES.map((t) => t.text).join('; ')}]`,
      },
    ],
  },
];
