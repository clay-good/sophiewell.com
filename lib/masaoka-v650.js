// spec-v650: Masaoka-Koga staging of thymic epithelial tumors (thymoma).
//
// A decision-logic staging classifier: it maps the most advanced invasion/spread
// finding to a stage (I, IIa, IIb, III, IVa, IVb). Standard system is the Koga (1994)
// modification of Masaoka (1981), with terms clarified by ITMIG (Detterbeck 2011).
// Sources:
//   Koga K, Matsuno Y, Noguchi M, et al. A review of 79 thymomas: modification of
//   staging system... Pathol Int. 1994;44(5):359-367 (PMID 8044305).
//   Detterbeck FC, et al. The Masaoka-Koga stage classification for thymic
//   malignancies: clarification and definition of terms. J Thorac Oncol.
//   2011;6(7 Suppl 3):S1710-S1716 (PMID 21847052).
//
// Stages (verbatim intent): I completely encapsulated (invasion INTO but not THROUGH
// the capsule is still I); IIa microscopic transcapsular invasion; IIb macroscopic
// invasion into surrounding fat, or gross adherence to but not through the mediastinal
// pleura/pericardium; III macroscopic invasion into a neighboring organ (pericardium,
// great vessel, or lung); IVa pleural/pericardial dissemination (separate implant
// nodules); IVb lymphogenous or hematogenous (nodal/distant) metastasis. Stage III is
// NOT subdivided in the standard system (IIIA/IIIB is non-standard, not implemented).
//
// Pure: no DOM, no clock, no network.

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

// Ordered from most to least advanced; the first matching finding sets the stage.
const LADDER = [
  { key: 'distantMets', stage: 'IVb', label: 'lymphogenous or hematogenous (nodal/distant) metastasis' },
  { key: 'dissemination', stage: 'IVa', label: 'pleural or pericardial dissemination (separate implant nodules)' },
  { key: 'organInvasion', stage: 'III', label: 'macroscopic invasion into a neighboring organ (pericardium, great vessel, or lung)' },
  { key: 'macroInvasion', stage: 'IIb', label: 'macroscopic invasion into surrounding fat, or gross adherence to (not through) the pleura/pericardium' },
  { key: 'microInvasion', stage: 'IIa', label: 'microscopic transcapsular invasion' },
];

const STAGE_LABEL = {
  I: 'completely encapsulated',
  IIa: 'microscopic transcapsular invasion',
  IIb: 'macroscopic invasion into fat or gross pleural/pericardial adherence',
  III: 'macroscopic invasion into a neighboring organ',
  IVa: 'pleural or pericardial dissemination',
  IVb: 'lymphogenous or hematogenous metastasis',
};

export const MASAOKA_NOTE = 'Masaoka-Koga staging of thymic epithelial tumors (Koga K, et al, Pathol Int 1994;44(5):359-367; terms clarified by ITMIG, Detterbeck FC, et al, J Thorac Oncol 2011;6(7 Suppl 3):S1710-S1716). The stage is set by the most advanced finding present. Stage I: grossly and microscopically completely encapsulated, including invasion into but not through the capsule. Stage IIa: microscopic transcapsular invasion. Stage IIb: macroscopic invasion into surrounding fatty tissue, or grossly adherent to but not breaking through the mediastinal pleura or pericardium. Stage III: macroscopic invasion into a neighboring organ (pericardium, great vessel, or lung). Stage IVa: pleural or pericardial dissemination (separate implant nodules). Stage IVb: lymphogenous or hematogenous (nodal or distant) metastasis. Stage III is not subdivided in the standard system. It is a pathologic staging applied to a resected specimen, read with the full pathology report and the WHO histologic type.';

export function masaokaKoga(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let stage = 'I';
  let reason = 'completely encapsulated (no transcapsular invasion, dissemination, or metastasis entered)';
  for (const rung of LADDER) {
    if (onFlag(o[rung.key])) { stage = rung.stage; reason = rung.label; break; }
  }
  return {
    valid: true,
    stage,
    stageDescription: STAGE_LABEL[stage],
    abnormal: stage === 'III' || stage === 'IVa' || stage === 'IVb',
    bandLabel: `Masaoka-Koga stage ${stage}`,
    detail: `Stage ${stage}: ${reason}.`,
    note: MASAOKA_NOTE,
  };
}
