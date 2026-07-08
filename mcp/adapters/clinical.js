// spec-v183 MCP wave 54: adapters for the foundational core in lib/clinical.js -
// the Group E clinical-math tiles (BMI, BSA, MAP, anion gap, corrected Ca/Na,
// A-a gradient, eGFR / Cockcroft-Gault, pack-years, QTc, P/F ratio) plus the
// Group F drip-rate / weight-dose / concentration-rate math. dom keys mirror
// views/group-e.js and views/group-f.js; unit-selector companions are omitted -
// each numeric input is documented in its canonical (default) unit.

import * as F from '../../lib/clinical.js';
import * as V4 from '../../lib/clinical-v4.js';

export default [
  {
    id: 'unit-converter',
    summary: 'General healthcare unit converter: weight (kg/g/mg/lb/oz), volume (mL/L/fl_oz/cup), temperature (C/F/K). The result echoes the inputs so the JSON is self-describing.',
    // The lib call is positional (convert(value, from, to, kind)), not a
    // named-object call; the wrapper maps the flat args onto that order.
    compute: (a) => {
      const converted = F.convert(a.value, a.from, a.to, a.kind);
      return converted == null ? null : { value: a.value, from: a.from, to: a.to, converted };
    },
    fields: [
      { dom: 'kind', arg: 'kind', kind: 'enum', values: ['weight', 'volume', 'temperature'], required: true, label: 'Quantity kind' },
      { dom: 'val', arg: 'value', kind: 'number', required: true, label: 'Value to convert' },
      { dom: 'from', arg: 'from', kind: 'string', required: true, label: 'From unit (e.g. kg, mL, C)' },
      { dom: 'to', arg: 'to', kind: 'string', required: true, label: 'To unit (e.g. lb, L, F)' },
    ],
  },
  {
    id: 'bmi',
    summary: 'Body mass index = weight(kg) / height(m)^2, with WHO category. Threshold: >=25 overweight, >=30 obese.',
    compute: F.bmi,
    fields: [
      { dom: 'w', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'h', arg: 'heightM', kind: 'number', required: true, label: 'Height', unit: 'm' },
    ],
  },
  {
    id: 'bsa',
    summary: 'Body surface area by both Du Bois (0.007184 x W^0.425 x H^0.725) and Mosteller (sqrt(W x H / 3600)) from weight (kg) and height (cm).',
    // The tile reports both formulas side by side; the wrapper composes the
    // two pure lib functions over the same argument object.
    compute: (a) => {
      const duBois = F.bsaDuBois(a);
      const mosteller = F.bsaMosteller(a);
      return duBois == null && mosteller == null ? null : { duBois, mosteller, unit: 'm^2' };
    },
    fields: [
      { dom: 'w', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'h', arg: 'heightCm', kind: 'number', required: true, label: 'Height', unit: 'cm' },
    ],
  },
  {
    id: 'map',
    summary: 'Mean arterial pressure = (SBP + 2*DBP)/3.',
    compute: F.map,
    fields: [
      { dom: 's', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'd', arg: 'dbp', kind: 'number', required: true, label: 'Diastolic BP', unit: 'mmHg' },
    ],
  },
  {
    id: 'anion-gap',
    summary: 'Serum anion gap = Na - (Cl + HCO3), with optional albumin correction. Normal roughly 8-12 mEq/L.',
    compute: F.anionGap,
    fields: [
      { dom: 'na', arg: 'sodium', kind: 'number', required: true, label: 'Sodium', unit: 'mEq/L' },
      { dom: 'cl', arg: 'chloride', kind: 'number', required: true, label: 'Chloride', unit: 'mEq/L' },
      { dom: 'hco3', arg: 'bicarbonate', kind: 'number', required: true, label: 'Bicarbonate', unit: 'mEq/L' },
      { dom: 'alb', arg: 'albuminGdl', kind: 'number', required: true, label: 'Albumin', unit: 'g/dL' },
    ],
  },
  {
    id: 'corrected-calcium',
    summary: 'Albumin-corrected calcium = measured Ca + 0.8*(4.0 - albumin). Returns a single number (mg/dL).',
    compute: F.correctedCalcium,
    fields: [
      { dom: 'ca', arg: 'measuredCa', kind: 'number', required: true, label: 'Measured calcium', unit: 'mg/dL' },
      { dom: 'alb', arg: 'albuminGdl', kind: 'number', required: true, label: 'Albumin', unit: 'g/dL' },
    ],
  },
  {
    id: 'corrected-sodium',
    summary: 'Glucose-corrected sodium (hyperglycemia) by Katz 1973 (factor 1.6) and Hillier 1999 (factor 2.4). Returns naBy1_6 and naBy2_4.',
    // Echo the two correction factors so the JSON names which coefficient
    // produced each value.
    compute: (a) => {
      const r = F.correctedSodium(a);
      return r == null ? null : { ...r, katzFactor: 1.6, hillierFactor: 2.4 };
    },
    fields: [
      { dom: 'na', arg: 'measuredNa', kind: 'number', required: true, label: 'Measured sodium', unit: 'mEq/L' },
      { dom: 'g', arg: 'glucose', kind: 'number', required: true, label: 'Glucose', unit: 'mg/dL' },
    ],
  },
  {
    id: 'aa-gradient',
    summary: 'Alveolar-arterial oxygen gradient: PAO2 = FiO2*(760-47) - PaCO2/0.8, A-a = PAO2 - PaO2.',
    compute: F.aaGradient,
    fields: [
      { dom: 'fio2', arg: 'fio2', kind: 'number', required: true, label: 'FiO2 (0-1)' },
      { dom: 'paco2', arg: 'paco2', kind: 'number', required: true, label: 'PaCO2', unit: 'mmHg' },
      { dom: 'pao2', arg: 'pao2', kind: 'number', required: true, label: 'PaO2', unit: 'mmHg' },
    ],
  },
  {
    id: 'egfr',
    summary: 'Estimated GFR by CKD-EPI 2021 race-free equation from creatinine, age, sex (mL/min/1.73m^2).',
    compute: (a) => {
      const egfr = F.egfrCkdEpi2021(a);
      return egfr == null ? null : { egfr, unit: 'mL/min/1.73m^2' };
    },
    fields: [
      { dom: 'scr', arg: 'scr', kind: 'number', required: true, label: 'Serum creatinine', unit: 'mg/dL' },
      { dom: 'age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex' },
    ],
  },
  {
    id: 'cockcroft-gault',
    summary: 'Cockcroft-Gault creatinine clearance from age, weight, creatinine, sex (mL/min).',
    compute: F.cockcroftGault,
    fields: [
      { dom: 'age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'w', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'scr', arg: 'scr', kind: 'number', required: true, label: 'Serum creatinine', unit: 'mg/dL' },
      { dom: 'sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex' },
    ],
  },
  {
    id: 'pack-years',
    summary: 'Cigarette pack-years = packs per day * years smoked.',
    compute: F.packYears,
    fields: [
      { dom: 'p', arg: 'packsPerDay', kind: 'number', required: true, label: 'Packs per day' },
      { dom: 'y', arg: 'years', kind: 'number', required: true, label: 'Years smoked' },
    ],
  },
  {
    id: 'qtc',
    summary: 'Corrected QT by Bazett, Fridericia, Framingham, and Hodges from QT interval and heart rate.',
    compute: F.qtc,
    fields: [
      { dom: 'qt', arg: 'qtMs', kind: 'number', required: true, label: 'QT interval', unit: 'ms' },
      { dom: 'hr', arg: 'hrBpm', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
    ],
  },
  {
    id: 'pf-ratio',
    summary: 'PaO2/FiO2 ratio with ARDS severity category (<=300 mild, <=200 moderate, <=100 severe).',
    compute: F.pfRatio,
    fields: [
      { dom: 'pao2', arg: 'pao2', kind: 'number', required: true, label: 'PaO2', unit: 'mmHg' },
      { dom: 'fio2', arg: 'fio2', kind: 'number', required: true, label: 'FiO2 (0-1)' },
    ],
  },
  {
    id: 'corrected-ca-na',
    summary: 'Combined electrolyte-correction panel: albumin-corrected calcium plus glucose-corrected sodium (Katz factor 1.6 and Hillier factor 2.4).',
    compute: (a) => {
      const correctedCa = F.correctedCalcium({ measuredCa: a.measuredCa, albuminGdl: a.albuminGdl });
      const correctedNa = F.correctedSodium({ measuredNa: a.measuredNa, glucose: a.glucose });
      return correctedCa == null && correctedNa == null ? null : { correctedCa, correctedNa };
    },
    fields: [
      { dom: 'ca', arg: 'measuredCa', kind: 'number', required: true, label: 'Measured calcium', unit: 'mg/dL' },
      { dom: 'cca-alb', arg: 'albuminGdl', kind: 'number', required: true, label: 'Albumin', unit: 'g/dL' },
      { dom: 'csna-na', arg: 'measuredNa', kind: 'number', required: true, label: 'Measured sodium', unit: 'mEq/L' },
      { dom: 'glu', arg: 'glucose', kind: 'number', required: true, label: 'Glucose', unit: 'mg/dL' },
    ],
  },
  {
    id: 'aa-pf-suite',
    summary: 'Combined oxygenation panel: A-a gradient, the age-expected A-a gradient (age/4 + 4), and the PaO2/FiO2 ratio with ARDS category.',
    compute: (a) => {
      const aa = F.aaGradient({ fio2: a.fio2, paco2: a.paco2, pao2: a.pao2 });
      const pf = F.pfRatio({ pao2: a.pao2, fio2: a.fio2 });
      if (aa == null && pf == null) return null;
      // The renderer computes the age-expected gradient inline as age/4 + 4.
      const expectedAaForAge = a.age == null ? null : a.age / 4 + 4;
      return { aaGradient: aa, expectedAaForAge, pfRatio: pf };
    },
    fields: [
      { dom: 'sf-fio2', arg: 'fio2', kind: 'number', required: true, label: 'FiO2 (0-1)' },
      { dom: 'sf-pao2', arg: 'pao2', kind: 'number', required: true, label: 'PaO2', unit: 'mmHg' },
      { dom: 'sf-paco2', arg: 'paco2', kind: 'number', required: true, label: 'PaCO2', unit: 'mmHg' },
      { dom: 'sf-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
    ],
  },
  {
    id: 'egfr-suite',
    summary: 'Renal-function panel: CKD-EPI 2021 eGFR, MDRD eGFR, and Cockcroft-Gault creatinine clearance side by side.',
    compute: (a) => {
      const ckdEpi2021 = F.egfrCkdEpi2021({ scr: a.scr, age: a.age, sex: a.sex });
      const mdrd = V4.egfrMdrd({ scr: a.scr, age: a.age, sex: a.sex });
      const cockcroftGault = F.cockcroftGault({ age: a.age, weightKg: a.weightKg, scr: a.scr, sex: a.sex });
      return ckdEpi2021 == null && mdrd == null && cockcroftGault == null
        ? null : { ckdEpi2021, mdrd, cockcroftGault };
    },
    fields: [
      { dom: 'es-scr', arg: 'scr', kind: 'number', required: true, label: 'Serum creatinine', unit: 'mg/dL' },
      { dom: 'es-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'es-w', arg: 'weightKg', kind: 'number', required: true, label: 'Weight (Cockcroft-Gault only)', unit: 'kg' },
      { dom: 'es-sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex' },
    ],
  },
  {
    id: 'drip-rate',
    summary: 'IV drip rate arithmetic: rate (mL/hr) = volume x 60 / duration, drops/min = volume x drop factor / duration. Returns mlPerHr and gttsPerMin.',
    compute: F.dripRate,
    fields: [
      { dom: 'v', arg: 'volumeMl', kind: 'number', required: true, label: 'Volume', unit: 'mL' },
      { dom: 't', arg: 'durationMin', kind: 'number', required: true, label: 'Duration', unit: 'minutes' },
      { dom: 'df', arg: 'dropFactor', kind: 'number', required: true, label: 'Drop factor', unit: 'gtts/mL' },
    ],
  },
  {
    id: 'weight-dose',
    summary: 'Weight-based total dose: total = weight (kg) x per-kg dose. Standard formulary arithmetic; the dose-unit text is display-only.',
    compute: F.weightDose,
    fields: [
      { dom: 'w', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'd', arg: 'dosePerKg', kind: 'number', required: true, label: 'Dose per kg' },
      { dom: 'u', arg: 'unit', kind: 'string', required: true, label: 'Dose unit (e.g. mg/kg)' },
    ],
  },
  {
    id: 'conc-rate',
    summary: 'Converts an ordered drug dose (mcg/kg/min, mcg/min, mg/min, units/hr, units/min) plus bag concentration into a pump rate in mL/hr. Standard infusion math.',
    // Echo the dose / weight / concentration inputs (with the mg/mL -> mcg/mL
    // definitional restatement the tile prints) so the JSON is self-describing.
    compute: (a) => {
      const r = F.concentrationToRate(a);
      if (r == null) return null;
      const concentrationUgPerMl = a.concentrationUnit === 'mg/mL' && a.concentrationValue != null
        ? a.concentrationValue * 1000 : null;
      return { ...r, doseValue: a.doseValue, doseUnit: a.doseUnit, weightKg: a.weightKg, concentrationUgPerMl };
    },
    fields: [
      { dom: 'dv', arg: 'doseValue', kind: 'number', required: true, label: 'Dose value' },
      { dom: 'du', arg: 'doseUnit', kind: 'enum', values: ['mcg/kg/min', 'mcg/min', 'mg/min', 'units/hr', 'units/min'], required: true, label: 'Dose unit' },
      { dom: 'w', arg: 'weightKg', kind: 'number', required: true, label: 'Patient weight (if dose per kg)', unit: 'kg' },
      { dom: 'cv', arg: 'concentrationValue', kind: 'number', required: true, label: 'Concentration value' },
      { dom: 'cu', arg: 'concentrationUnit', kind: 'enum', values: ['mg/mL', 'units/mL'], required: true, label: 'Concentration unit' },
    ],
  },
];
