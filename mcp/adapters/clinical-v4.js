// spec-v183 MCP wave 54: adapters for lib/clinical-v4.js - the delta-delta /
// osmolal-gap / Winters acid-base set, the shock-index and body-weight suites,
// FENa/FEUrea, maintenance fluids, the QTc suite, and the FIB-4 / APRI / ROX /
// VIS bedside indices. dom keys mirror views/group-e.js and views/group-v7.js.

import * as F from '../../lib/clinical-v4.js';
import * as C from '../../lib/clinical.js';

export default [
  {
    id: 'anion-gap-dd',
    summary: 'Anion gap with delta-delta analysis: AG (albumin-corrected when albumin given), delta-AG = AG - 12, delta-HCO3 = 24 - HCO3, and their ratio to detect a mixed acid-base disorder.',
    // The tile computes the (corrected) anion gap first, then feeds it into the
    // delta-delta; the wrapper composes the same two pure functions.
    compute: (a) => {
      const gap = C.anionGap({ sodium: a.sodium, chloride: a.chloride, bicarbonate: a.bicarbonate, albuminGdl: a.albuminGdl });
      if (gap == null) return null;
      const ag = gap.correctedAnionGap != null ? gap.correctedAnionGap : gap.anionGap;
      const dd = F.deltaDelta({ anionGap: ag, hco3: a.bicarbonate });
      return dd == null ? gap : { ...gap, ...dd };
    },
    fields: [
      { dom: 'na', arg: 'sodium', kind: 'number', required: true, label: 'Sodium', unit: 'mEq/L' },
      { dom: 'cl', arg: 'chloride', kind: 'number', required: true, label: 'Chloride', unit: 'mEq/L' },
      { dom: 'hco3', arg: 'bicarbonate', kind: 'number', required: true, label: 'HCO3', unit: 'mEq/L' },
      { dom: 'alb', arg: 'albuminGdl', kind: 'number', required: true, label: 'Albumin', unit: 'g/dL' },
    ],
  },
  {
    id: 'osmolal-gap',
    summary: 'Osmolal gap = measured - calculated serum osmolality (2*Na + glucose/18 + BUN/2.8 + EtOH/3.7); >10 raises suspicion of toxic alcohols.',
    compute: F.osmolalGap,
    fields: [
      { dom: 'measured', arg: 'measuredOsm', kind: 'number', required: true, label: 'Measured serum osmolality', unit: 'mOsm/kg' },
      { dom: 'og-na', arg: 'sodium', kind: 'number', required: true, label: 'Sodium', unit: 'mEq/L' },
      { dom: 'og-glu', arg: 'glucoseMgDl', kind: 'number', required: true, label: 'Glucose', unit: 'mg/dL' },
      { dom: 'og-bun', arg: 'bunMgDl', kind: 'number', required: true, label: 'BUN', unit: 'mg/dL' },
      { dom: 'og-etoh', arg: 'etohMgDl', kind: 'number', required: true, label: 'EtOH', unit: 'mg/dL' },
    ],
  },
  {
    id: 'winters',
    summary: 'Winters formula expected PaCO2 for metabolic acidosis = 1.5*HCO3 + 8 +/- 2; flags secondary respiratory disorder if measured PaCO2 given.',
    compute: F.wintersFormula,
    fields: [
      { dom: 'wf-hco3', arg: 'hco3', kind: 'number', required: true, label: 'HCO3', unit: 'mEq/L' },
      { dom: 'wf-paco2', arg: 'measuredPaco2', kind: 'number', required: true, label: 'Measured PaCO2', unit: 'mmHg' },
    ],
  },
  {
    id: 'shock-index',
    summary: 'Perfusion panel: shock index (HR/SBP, concerning >= 0.9), modified shock index (HR/MAP), MAP, and pulse pressure from SBP/DBP/HR.',
    compute: (a) => {
      const mapV = C.map({ sbp: a.sbp, dbp: a.dbp });
      const pulsePressure = F.pulsePressure({ sbp: a.sbp, dbp: a.dbp });
      const shockIndex = F.shockIndex({ hr: a.hr, sbp: a.sbp });
      const modifiedShockIndex = F.modifiedShockIndex({ hr: a.hr, sbp: a.sbp, dbp: a.dbp });
      return mapV == null && shockIndex == null ? null
        : { map: mapV, pulsePressure, shockIndex, modifiedShockIndex };
    },
    fields: [
      { dom: 'si-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'si-dbp', arg: 'dbp', kind: 'number', required: true, label: 'Diastolic BP', unit: 'mmHg' },
      { dom: 'si-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
    ],
  },
  {
    id: 'bw-bsa-suite',
    summary: 'Body-weight panel: ideal body weight (Devine), adjusted body weight (IBW + 0.4 x excess), and BSA by Mosteller and Du Bois.',
    compute: (a) => {
      const ibw = F.ibwDevine({ heightInches: a.heightInches, sex: a.sex });
      if (ibw == null) return null;
      const adjusted = F.adjBW({ ibw, actualKg: a.actualKg });
      const heightCm = a.heightInches == null ? null : a.heightInches * 2.54;
      const bsaMosteller = heightCm == null ? null : C.bsaMosteller({ weightKg: a.actualKg, heightCm });
      const bsaDuBois = heightCm == null ? null : C.bsaDuBois({ weightKg: a.actualKg, heightCm });
      return { ibw, adjusted, bsaMosteller, bsaDuBois };
    },
    fields: [
      { dom: 'bw-hin', arg: 'heightInches', kind: 'number', required: true, label: 'Height', unit: 'inches' },
      { dom: 'bw-kg', arg: 'actualKg', kind: 'number', required: true, label: 'Actual weight', unit: 'kg' },
      { dom: 'bw-sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex' },
    ],
  },
  {
    id: 'fena-feurea',
    summary: 'Fractional excretion of sodium (FENa, %) and of urea (FEUrea, %) for AKI workup; FENa < 1% / FEUrea < 35% suggest a prerenal state.',
    compute: (a) => {
      const feNa = F.feNa({ urineNa: a.urineNa, plasmaNa: a.plasmaNa, urineCr: a.urineCr, plasmaCr: a.plasmaCr });
      const feUrea = F.feUrea({ urineUrea: a.urineUrea, plasmaUrea: a.plasmaUrea, urineCr: a.urineCr, plasmaCr: a.plasmaCr });
      return feNa == null && feUrea == null ? null : { feNaPct: feNa, feUreaPct: feUrea };
    },
    fields: [
      { dom: 'fn-una', arg: 'urineNa', kind: 'number', required: true, label: 'Urine sodium', unit: 'mEq/L' },
      { dom: 'fn-pna', arg: 'plasmaNa', kind: 'number', required: true, label: 'Plasma sodium', unit: 'mEq/L' },
      { dom: 'fn-ucr', arg: 'urineCr', kind: 'number', required: true, label: 'Urine creatinine', unit: 'mg/dL' },
      { dom: 'fn-pcr', arg: 'plasmaCr', kind: 'number', required: true, label: 'Plasma creatinine', unit: 'mg/dL' },
      { dom: 'fu-uu', arg: 'urineUrea', kind: 'number', required: true, label: 'Urine urea', unit: 'mg/dL' },
      { dom: 'fu-pu', arg: 'plasmaUrea', kind: 'number', required: true, label: 'Plasma urea (BUN)', unit: 'mg/dL' },
    ],
  },
  {
    id: 'maint-fluids',
    summary: 'Maintenance IV fluid rate by 4-2-1 rule (4 mL/kg/hr first 10 kg + 2 next 10 kg + 1 over 20 kg).',
    // Expose the per-tier breakdown alongside the total so the JSON shows the
    // 4-2-1 derivation the rendered tile prints.
    compute: (a) => {
      const mlPerHour = F.maintenanceFluids(a);
      if (mlPerHour == null) return null;
      const w = a.weightKg;
      const first10 = Math.min(w, 10) * 4;
      const next10 = Math.max(0, Math.min(w, 20) - 10) * 2;
      const above20 = Math.max(0, w - 20) * 1;
      return { mlPerHour, tiers: { first10kg: first10, next10kg: next10, above20kg: above20 } };
    },
    fields: [
      { dom: 'mf-w', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
    ],
  },
  {
    id: 'qtc-suite',
    summary: 'Corrected QT by Bazett, Fridericia, Framingham, and Hodges from QT and heart rate.',
    compute: F.qtcAll,
    fields: [
      { dom: 'qs-qt', arg: 'qtMs', kind: 'number', required: true, label: 'QT', unit: 'ms' },
      { dom: 'qs-hr', arg: 'hrBpm', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
    ],
  },
  {
    id: 'fib4',
    summary: 'FIB-4 hepatic fibrosis index (Sterling 2006) = age*AST/(platelets*sqrt(ALT)). <1.45 low, >3.25 high risk of advanced fibrosis.',
    compute: F.fib4,
    fields: [
      { dom: 'fib4-age', arg: 'ageYears', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'fib4-ast', arg: 'ast', kind: 'number', required: true, label: 'AST', unit: 'U/L' },
      { dom: 'fib4-alt', arg: 'alt', kind: 'number', required: true, label: 'ALT', unit: 'U/L' },
      { dom: 'fib4-plt', arg: 'plateletsK', kind: 'number', required: true, label: 'Platelets', unit: 'x10^9/L' },
    ],
  },
  {
    id: 'apri',
    summary: 'AST-to-platelet ratio index (Wai 2003) = (AST/AST-ULN)*100/platelets. Predicts significant fibrosis/cirrhosis.',
    compute: F.apri,
    fields: [
      { dom: 'apri-ast', arg: 'ast', kind: 'number', required: true, label: 'AST', unit: 'U/L' },
      { dom: 'apri-uln', arg: 'astUln', kind: 'number', required: true, label: 'AST upper limit of normal', unit: 'U/L' },
      { dom: 'apri-plt', arg: 'plateletsK', kind: 'number', required: true, label: 'Platelets', unit: 'x10^9/L' },
    ],
  },
  {
    id: 'rox',
    summary: 'ROX index (Roca 2019) = (SpO2/FiO2)/respiratory rate; predicts HFNC success. >=4.88 favorable.',
    compute: F.rox,
    fields: [
      { dom: 'rx-spo2', arg: 'spo2', kind: 'number', required: true, label: 'SpO2', unit: '%' },
      { dom: 'rx-fio2', arg: 'fio2', kind: 'number', required: true, label: 'FiO2 (0-1)' },
      { dom: 'rx-rr', arg: 'rr', kind: 'number', required: true, label: 'Respiratory rate', unit: 'breaths/min' },
      { dom: 'rx-hr', arg: 'hoursAfterStart', kind: 'number', required: true, label: 'Hours after HFNC start' },
    ],
  },
  {
    id: 'vis',
    summary: 'Vasoactive-inotropic score (Gaies 2010) and inotrope score (Wernovsky 1995) from vasoactive drug doses.',
    compute: F.vis,
    fields: [
      { dom: 'vs-dop', arg: 'dopamine', kind: 'number', required: true, label: 'Dopamine', unit: 'mcg/kg/min' },
      { dom: 'vs-dob', arg: 'dobutamine', kind: 'number', required: true, label: 'Dobutamine', unit: 'mcg/kg/min' },
      { dom: 'vs-epi', arg: 'epinephrine', kind: 'number', required: true, label: 'Epinephrine', unit: 'mcg/kg/min' },
      { dom: 'vs-ne', arg: 'norepinephrine', kind: 'number', required: true, label: 'Norepinephrine', unit: 'mcg/kg/min' },
      { dom: 'vs-mil', arg: 'milrinone', kind: 'number', required: true, label: 'Milrinone', unit: 'mcg/kg/min' },
      { dom: 'vs-vaso', arg: 'vasopressin', kind: 'number', required: true, label: 'Vasopressin', unit: 'units/kg/min' },
    ],
  },
];
