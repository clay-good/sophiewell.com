// spec-v183 MCP wave 14: adapters for the four lib/radiology-v165.js imaging
// tiles. dom keys mirror views/group-v165.js; arg names mirror the lib
// signatures. Ordinal descriptors are enums; the punctate/macro/rim echogenic
// foci and the Bosniak calcification checkbox are booleans.

import * as F from '../../lib/radiology-v165.js';

export default [
  {
    id: 'acr-tirads',
    summary: 'ACR TI-RADS (Tessler 2017): additive point score from composition, echogenicity, shape, margin, and echogenic foci → TR1–TR5 level with a size-gated FNA / follow-up recommendation.',
    compute: F.acrTirads,
    fields: [
      { dom: 'tir-comp', arg: 'composition', kind: 'enum', values: ['cystic', 'spongiform', 'mixed', 'solid'], label: 'Composition' },
      { dom: 'tir-echo', arg: 'echogenicity', kind: 'enum', values: ['anechoic', 'hyper', 'hypo', 'veryhypo'], label: 'Echogenicity' },
      { dom: 'tir-shape', arg: 'shape', kind: 'enum', values: ['wider', 'taller'], label: 'Shape' },
      { dom: 'tir-margin', arg: 'margin', kind: 'enum', values: ['smooth', 'illdefined', 'lobulated', 'ete'], label: 'Margin' },
      { dom: 'tir-macro', arg: 'fociMacro', kind: 'bool', label: 'Macrocalcifications' },
      { dom: 'tir-rim', arg: 'fociRim', kind: 'bool', label: 'Peripheral (rim) calcifications' },
      { dom: 'tir-punctate', arg: 'fociPunctate', kind: 'bool', label: 'Punctate echogenic foci' },
      { dom: 'tir-diameter', arg: 'diameter', kind: 'number', label: 'Maximum diameter (cm)' },
    ],
  },
  {
    id: 'adrenal-ct-washout',
    summary: 'Adrenal CT washout: absolute washout = (enhanced − delayed)/(enhanced − unenhanced) and relative washout = (enhanced − delayed)/enhanced, characterizing a lipid-poor adenoma.',
    compute: F.adrenalCtWashout,
    fields: [
      { dom: 'aw-e', arg: 'enhanced', kind: 'number', label: 'Enhanced (portal-venous) HU' },
      { dom: 'aw-d', arg: 'delayed', kind: 'number', label: 'Delayed (15 min) HU' },
      { dom: 'aw-u', arg: 'unenhanced', kind: 'number', label: 'Unenhanced HU' },
    ],
  },
  {
    id: 'bosniak',
    summary: 'Bosniak 2019 renal-cyst classification: wall, septa, enhancing protrusion, and calcification map to class I–IV with a corresponding malignancy estimate.',
    compute: F.bosniak,
    fields: [
      { dom: 'bos-wall', arg: 'wall', kind: 'enum', values: ['thin', 'minimal', 'thick'], label: 'Wall' },
      { dom: 'bos-septa', arg: 'septa', kind: 'enum', values: ['none', 'few', 'many'], label: 'Septa' },
      { dom: 'bos-prot', arg: 'protrusion', kind: 'enum', values: ['none', 'obtuseSmall', 'obtuseLarge', 'acute'], label: 'Enhancing protrusion / nodule' },
      { dom: 'bos-calc', arg: 'calcification', kind: 'bool', label: 'Calcification present' },
    ],
  },
  {
    id: 'ct-effective-dose',
    summary: 'CT effective dose (AAPM Report 96): effective dose (mSv) = DLP × region-specific k conversion coefficient.',
    compute: F.ctEffectiveDose,
    fields: [
      { dom: 'ct-dlp', arg: 'dlp', kind: 'number', label: 'Dose-length product (mGy·cm)' },
      { dom: 'ct-region', arg: 'region', kind: 'enum', values: ['head', 'headneck', 'neck', 'chest', 'abdomen', 'pelvis', 'abdomenpelvis'], label: 'Body region' },
    ],
  },
];
