// spec-v183 MCP wave 14: adapter for the lib/derm-v151.js SCORAD tile. dom keys
// mirror views/group-v151.js; arg names mirror the lib signature. Extent and the
// subjective pruritus / sleeplessness VAS are numbers; the six intensity items
// are 0–3 ordinal selects (enums).
//
// pasi, easi, and dlqi joined in wave 53. Their per-region / per-item field
// groups still map through the DEFAULT toArgs: the adapter names each region
// field with the arg the lib reads (`headE`, `headArea`, …), so no bespoke
// toArgs is needed — absent regions default to 0 in the lib (grade/areaGrade).

import * as F from '../../lib/derm-v151.js';

// PASI/EASI share the same four body regions (head, upper, trunk, lower).
const DERM_REGIONS = [
  { key: 'head', label: 'Head / neck' },
  { key: 'upper', label: 'Upper limbs' },
  { key: 'trunk', label: 'Trunk' },
  { key: 'lower', label: 'Lower limbs' },
];
const SEV5 = ['0', '1', '2', '3', '4'];
const SEV4 = ['0', '1', '2', '3'];
// PASI: erythema/induration/desquamation 0–4 + % area, per region.
const PASI_FIELDS = DERM_REGIONS.flatMap((r) => [
  { dom: `pasi-${r.key}-e`, arg: `${r.key}E`, kind: 'enum', values: SEV5, label: `${r.label}: erythema (0–4)` },
  { dom: `pasi-${r.key}-i`, arg: `${r.key}I`, kind: 'enum', values: SEV5, label: `${r.label}: induration (0–4)` },
  { dom: `pasi-${r.key}-d`, arg: `${r.key}D`, kind: 'enum', values: SEV5, label: `${r.label}: desquamation (0–4)` },
  { dom: `pasi-${r.key}-area`, arg: `${r.key}Area`, kind: 'number', label: `${r.label}: % area involved (0–100)` },
]);
// EASI: erythema/edema/excoriation/lichenification 0–3 + % area, per region, plus the age-weighting axis.
const EASI_FIELDS = [
  { dom: 'easi-age', arg: 'age', kind: 'enum', values: ['adult', 'child'], label: 'Age band (adult ≥ 8 yr / child < 8 yr) — sets the region weights' },
  ...DERM_REGIONS.flatMap((r) => [
    { dom: `easi-${r.key}-e`, arg: `${r.key}E`, kind: 'enum', values: SEV4, label: `${r.label}: erythema (0–3)` },
    { dom: `easi-${r.key}-ed`, arg: `${r.key}Ed`, kind: 'enum', values: SEV4, label: `${r.label}: edema / papulation (0–3)` },
    { dom: `easi-${r.key}-ex`, arg: `${r.key}Ex`, kind: 'enum', values: SEV4, label: `${r.label}: excoriation (0–3)` },
    { dom: `easi-${r.key}-l`, arg: `${r.key}L`, kind: 'enum', values: SEV4, label: `${r.label}: lichenification (0–3)` },
    { dom: `easi-${r.key}-area`, arg: `${r.key}Area`, kind: 'number', label: `${r.label}: % area involved (0–100)` },
  ]),
];
// DLQI: ten questions, each 0–3.
const DLQI_FIELDS = Array.from({ length: 10 }, (_, i) => ({
  dom: `dlqi-q${i + 1}`, arg: `q${i + 1}`, kind: 'enum', values: SEV4, required: true, label: `Q${i + 1} (0–3)`,
}));

export default [
  {
    id: 'pasi',
    summary: 'PASI (Fredriksson 1978): psoriasis severity — for each of four regions grade erythema/induration/desquamation 0–4 and enter % area; PASI = Σ (E+I+D) × area grade × region weight (0–72; mild < 10, moderate 10–20, severe > 20).',
    compute: F.pasi,
    fields: PASI_FIELDS,
  },
  {
    id: 'easi',
    summary: 'EASI (Hanifin 2001): atopic-dermatitis severity — per region grade erythema/edema/excoriation/lichenification 0–3 and enter % area; weights are age-dependent (0–72; Leshem strata).',
    compute: F.easi,
    fields: EASI_FIELDS,
  },
  {
    id: 'dlqi',
    summary: 'DLQI (Finlay 1994): ten quality-of-life questions each 0–3 (total 0–30; 0–1 no effect, 2–5 small, 6–10 moderate, 11–20 very large, 21–30 extremely large effect).',
    compute: F.dlqi,
    fields: DLQI_FIELDS,
  },
  {
    id: 'scorad',
    summary: 'SCORAD (European Task Force on Atopic Dermatitis 1993): extent (A) + six intensity items (B) + subjective pruritus and sleeplessness VAS (C) → a 0–103 atopic-dermatitis severity score (with the objective oSCORAD).',
    compute: F.scorad,
    fields: [
      { dom: 'scorad-extent', arg: 'extent', kind: 'number', label: 'Extent (% BSA affected)' },
      { dom: 'scorad-erythema', arg: 'erythema', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Erythema (0–3)' },
      { dom: 'scorad-edema', arg: 'edema', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Edema / papulation (0–3)' },
      { dom: 'scorad-oozing', arg: 'oozing', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Oozing / crusting (0–3)' },
      { dom: 'scorad-excoriation', arg: 'excoriation', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Excoriation (0–3)' },
      { dom: 'scorad-lichenification', arg: 'lichenification', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Lichenification (0–3)' },
      { dom: 'scorad-dryness', arg: 'dryness', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Dryness of uninvolved skin (0–3)' },
      { dom: 'scorad-pruritus', arg: 'pruritus', kind: 'number', label: 'Pruritus VAS (0–10)' },
      { dom: 'scorad-sleeplessness', arg: 'sleeplessness', kind: 'number', label: 'Sleeplessness VAS (0–10)' },
    ],
  },
];
