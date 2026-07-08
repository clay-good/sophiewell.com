// spec-v183 MCP wave 54: adapters for lib/clinical-v6.js - hematology bedside
// indices (ANC, reticulocyte index, TSAT, platelet CCI), lipid/glycemic
// conversions (LDL, eAG), oxygenation math (CaO2/DO2, OI, driving pressure),
// and renal indices (TTKG, urine anion gap, acid-base deficit, Schwartz eGFR).

import * as F from '../../lib/clinical-v6.js';

export default [
  {
    id: 'anc',
    summary: 'Absolute neutrophil count = WBC * (segs + bands)/100; grades neutropenia (severe <500). Neutropenic-precautions flag.',
    compute: F.anc,
    fields: [
      { dom: 'anc-wbc', arg: 'wbc', kind: 'number', required: true, label: 'WBC', unit: 'x10^9/L' },
      { dom: 'anc-segs', arg: 'segs', kind: 'number', required: true, label: 'Segmented neutrophils', unit: '%' },
      { dom: 'anc-bands', arg: 'bands', kind: 'number', required: true, label: 'Bands', unit: '%' },
    ],
  },
  {
    id: 'retic-index',
    summary: 'Reticulocyte production index: corrected retic and RPI using a maturation factor from hematocrit; RPI <2 inadequate marrow response.',
    compute: F.reticIndex,
    fields: [
      { dom: 'ri-retic', arg: 'reticPct', kind: 'number', required: true, label: 'Reticulocyte', unit: '%' },
      { dom: 'ri-hct', arg: 'hct', kind: 'number', required: true, label: 'Hematocrit', unit: '%' },
    ],
  },
  {
    id: 'tsat',
    summary: 'Transferrin saturation = 100*iron/TIBC; with ferritin, characterizes iron-deficiency vs overload pattern.',
    compute: F.tsat,
    fields: [
      { dom: 'ts-iron', arg: 'ironUgDl', kind: 'number', required: true, label: 'Serum iron', unit: 'ug/dL' },
      { dom: 'ts-tibc', arg: 'tibcUgDl', kind: 'number', required: true, label: 'TIBC', unit: 'ug/dL' },
      { dom: 'ts-ferritin', arg: 'ferritinNgMl', kind: 'number', required: true, label: 'Ferritin', unit: 'ng/mL' },
    ],
  },
  {
    id: 'cci-platelet',
    summary: 'Corrected count increment for platelet transfusion = increment*BSA/dose; low CCI at 1h/24h indicates refractoriness.',
    compute: F.cciPlatelet,
    fields: [
      { dom: 'cci-pre', arg: 'prePlt', kind: 'number', required: true, label: 'Pre-transfusion platelet', unit: 'x10^9/L' },
      { dom: 'cci-post', arg: 'postPlt', kind: 'number', required: true, label: 'Post-transfusion platelet', unit: 'x10^9/L' },
      { dom: 'cci-bsa', arg: 'bsaM2', kind: 'number', required: true, label: 'Body surface area', unit: 'm^2' },
      { dom: 'cci-dose', arg: 'doseE11', kind: 'number', required: true, label: 'Platelet dose', unit: 'x10^11' },
    ],
  },
  {
    id: 'ldl-calc',
    summary: 'LDL cholesterol by Friedewald and NIH (Sampson 2020) equations plus non-HDL; Friedewald invalid at TG >=400.',
    compute: F.ldlCalc,
    fields: [
      { dom: 'ldl-tc', arg: 'totalChol', kind: 'number', required: true, label: 'Total cholesterol', unit: 'mg/dL' },
      { dom: 'ldl-hdl', arg: 'hdl', kind: 'number', required: true, label: 'HDL cholesterol', unit: 'mg/dL' },
      { dom: 'ldl-tg', arg: 'tg', kind: 'number', required: true, label: 'Triglycerides', unit: 'mg/dL' },
    ],
  },
  {
    id: 'eag-a1c',
    summary: 'Estimated average glucose from HbA1c (ADAG: eAG = 28.7*A1c - 46.7), reported in mg/dL and mmol/L.',
    compute: F.eagA1c,
    fields: [
      { dom: 'eag-a1c', arg: 'a1c', kind: 'number', required: true, label: 'HbA1c', unit: '%' },
    ],
  },
  {
    id: 'cao2-do2',
    summary: 'Arterial oxygen content CaO2 = 1.34*Hb*SaO2 + 0.003*PaO2, and O2 delivery DO2 = CaO2*cardiac output*10.',
    compute: F.cao2Do2,
    fields: [
      { dom: 'cao2-hb', arg: 'hb', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
      { dom: 'cao2-sao2', arg: 'sao2', kind: 'number', required: true, label: 'SaO2', unit: '%' },
      { dom: 'cao2-pao2', arg: 'pao2', kind: 'number', required: true, label: 'PaO2', unit: 'mmHg' },
      { dom: 'cao2-co', arg: 'cardiacOutput', kind: 'number', required: true, label: 'Cardiac output', unit: 'L/min' },
    ],
  },
  {
    id: 'oxygenation-index',
    summary: 'Oxygenation index OI = FiO2*MAP*100/PaO2 and oxygen saturation index OSI = FiO2*MAP*100/SpO2; pediatric ARDS severity.',
    compute: F.oxygenationIndex,
    fields: [
      { dom: 'oi-fio2', arg: 'fio2', kind: 'number', required: true, label: 'FiO2 (0.21-1.0)' },
      { dom: 'oi-map', arg: 'map', kind: 'number', required: true, label: 'Mean airway pressure', unit: 'cmH2O' },
      { dom: 'oi-pao2', arg: 'pao2', kind: 'number', required: true, label: 'PaO2', unit: 'mmHg' },
      { dom: 'oi-spo2', arg: 'spo2', kind: 'number', required: true, label: 'SpO2', unit: '%' },
    ],
  },
  {
    id: 'driving-pressure',
    summary: 'Ventilator driving pressure dP = plateau - PEEP, plus static compliance; dP >15 cmH2O flags elevated risk.',
    compute: F.drivingPressure,
    fields: [
      { dom: 'dp-plat', arg: 'plateau', kind: 'number', required: true, label: 'Plateau pressure', unit: 'cmH2O' },
      { dom: 'dp-peep', arg: 'peep', kind: 'number', required: true, label: 'PEEP', unit: 'cmH2O' },
      { dom: 'dp-vt', arg: 'tidalVolume', kind: 'number', required: true, label: 'Tidal volume', unit: 'mL' },
    ],
  },
  {
    id: 'ttkg',
    summary: 'Transtubular potassium gradient = (urine K/plasma K)/(urine osm/plasma osm); assesses renal K handling. Valid only when urine osm >= plasma and urine Na > 25.',
    compute: F.ttkg,
    fields: [
      { dom: 'ttkg-uk', arg: 'urineK', kind: 'number', required: true, label: 'Urine K', unit: 'mEq/L' },
      { dom: 'ttkg-pk', arg: 'plasmaK', kind: 'number', required: true, label: 'Plasma K', unit: 'mEq/L' },
      { dom: 'ttkg-uosm', arg: 'urineOsm', kind: 'number', required: true, label: 'Urine osmolality', unit: 'mOsm/kg' },
      { dom: 'ttkg-posm', arg: 'plasmaOsm', kind: 'number', required: true, label: 'Plasma osmolality', unit: 'mOsm/kg' },
      { dom: 'ttkg-una', arg: 'urineNa', kind: 'number', required: true, label: 'Urine Na', unit: 'mEq/L' },
    ],
  },
  {
    id: 'urine-anion-gap',
    summary: 'Urine anion gap = urine Na + urine K - urine Cl; negative suggests GI HCO3 loss, positive suggests renal (RTA) cause of NAGMA.',
    compute: F.urineAnionGap,
    fields: [
      { dom: 'uag-na', arg: 'urineNa', kind: 'number', required: true, label: 'Urine Na', unit: 'mEq/L' },
      { dom: 'uag-k', arg: 'urineK', kind: 'number', required: true, label: 'Urine K', unit: 'mEq/L' },
      { dom: 'uag-cl', arg: 'urineCl', kind: 'number', required: true, label: 'Urine Cl', unit: 'mEq/L' },
    ],
  },
  {
    id: 'acid-base-deficit',
    summary: 'Bicarbonate and sodium deficit estimates from total body water (sex-based fraction), measured vs target values.',
    compute: F.acidBaseDeficit,
    fields: [
      { dom: 'abd-wt', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'abd-sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex (TBW fraction)' },
      { dom: 'abd-mhco3', arg: 'measuredHco3', kind: 'number', required: true, label: 'Measured HCO3', unit: 'mEq/L' },
      { dom: 'abd-thco3', arg: 'targetHco3', kind: 'number', required: true, label: 'Target HCO3', unit: 'mEq/L' },
      { dom: 'abd-mna', arg: 'measuredNa', kind: 'number', required: true, label: 'Measured Na', unit: 'mEq/L' },
      { dom: 'abd-tna', arg: 'targetNa', kind: 'number', required: true, label: 'Target Na', unit: 'mEq/L' },
    ],
  },
  {
    id: 'schwartz-egfr',
    summary: 'Bedside Schwartz pediatric eGFR = 0.413*height(cm)/creatinine; validated ages 1-18 with IDMS-traceable creatinine.',
    compute: (a) => {
      const r = F.schwartzEgfr(a);
      return r == null ? r : { ...r, unit: 'mL/min/1.73m^2' };
    },
    fields: [
      { dom: 'se-ht', arg: 'heightCm', kind: 'number', required: true, label: 'Height', unit: 'cm' },
      { dom: 'se-scr', arg: 'scr', kind: 'number', required: true, label: 'Serum creatinine', unit: 'mg/dL' },
    ],
  },
];
