// spec-v183 MCP wave 54: adapters for lib/medication-v5.js - the high-alert
// medication protocol math: heparin nomogram, vancomycin AUC, aminoglycoside
// peaks/troughs, acetaminophen (Rumack-Matthew) nomogram, digoxin, local
// anesthetic maximums, MgSO4 preeclampsia, PCA pump, sugammadex, ketamine /
// propofol, pediatric fluid deficit, pediatric resuscitation, and percent
// concentration conversions. dom keys mirror views/group-f.js / group-v8.js.

import * as F from '../../lib/medication-v5.js';

export default [
  {
    id: 'heparin-nomogram',
    summary: 'Raschke 1993 weight-based heparin nomogram: VTE 80 u/kg bolus + 18 u/kg/h or ACS 60 u/kg (max 4000) + 12 u/kg/h (max 1000), with aPTT-driven titration steps.',
    compute: F.heparinNomogram,
    fields: [
      { dom: 'hep-wt', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'hep-ind', arg: 'indication', kind: 'enum', values: ['vte', 'acs'], required: true, label: 'Indication' },
      { dom: 'hep-aptt', arg: 'aptt', kind: 'number', required: true, label: 'Current aPTT (optional)', unit: 'seconds' },
    ],
  },
  {
    id: 'vanc-auc',
    summary: 'AUC-guided vancomycin (ASHP/IDSA 2020, target AUC24/MIC 400-600) by the first-order two-level Sawchuk-Zaske method: k, half-life, extrapolated Cmax/Cmin, AUC24, and AUC24/MIC.',
    compute: F.vancAuc,
    fields: [
      { dom: 'va-peak', arg: 'peak', kind: 'number', required: true, label: 'Peak level', unit: 'mg/L' },
      { dom: 'va-tpeak', arg: 'tPeak', kind: 'number', required: true, label: 'Peak draw time after infusion end', unit: 'h' },
      { dom: 'va-trough', arg: 'trough', kind: 'number', required: true, label: 'Trough level', unit: 'mg/L' },
      { dom: 'va-ttrough', arg: 'tTrough', kind: 'number', required: true, label: 'Trough draw time after infusion end', unit: 'h' },
      { dom: 'va-tinf', arg: 'tInf', kind: 'number', required: true, label: 'Infusion duration', unit: 'h' },
      { dom: 'va-tau', arg: 'tau', kind: 'number', required: true, label: 'Dosing interval', unit: 'h' },
      { dom: 'va-mic', arg: 'mic', kind: 'number', required: true, label: 'MIC', unit: 'mg/L' },
    ],
  },
  {
    id: 'aminoglycoside',
    summary: 'Hartford extended-interval aminoglycoside dosing (Nicolau 1995): gentamicin/tobramycin 7 mg/kg or amikacin 15 mg/kg with a CrCl-derived starting interval.',
    compute: F.aminoglycoside,
    fields: [
      { dom: 'ag-drug', arg: 'drug', kind: 'enum', values: ['gentamicin', 'tobramycin', 'amikacin'], required: true, label: 'Drug' },
      { dom: 'ag-wt', arg: 'weightKg', kind: 'number', required: true, label: 'Dosing weight', unit: 'kg' },
      { dom: 'ag-crcl', arg: 'crCl', kind: 'number', required: true, label: 'Creatinine clearance', unit: 'mL/min' },
      { dom: 'ag-dialysis', arg: 'dialysis', kind: 'bool', required: false, label: 'On dialysis' },
    ],
  },
  {
    id: 'acetaminophen-nomogram',
    summary: 'Rumack-Matthew nomogram (US treatment line 150 ug/mL at 4 h): treatment-line level at the entered time post single acute ingestion and whether the measured level is above it.',
    // Echo the timing / level inputs and the nomogram's valid 4-24 h window.
    compute: (a) => {
      const r = F.acetaminophenNomogram(a);
      return r == null ? r : { ...r, hoursPostIngestion: a.hours, levelUgMl: a.levelUgMl, validWindowHours: { from: 4, to: 24 } };
    },
    fields: [
      { dom: 'apap-h', arg: 'hours', kind: 'number', required: true, label: 'Hours since single acute ingestion (4-24 h)', unit: 'h' },
      { dom: 'apap-lvl', arg: 'levelUgMl', kind: 'number', required: true, label: 'Serum acetaminophen', unit: 'ug/mL' },
    ],
  },
  {
    id: 'digoxin',
    summary: 'Digoxin maintenance guidance and level interpretation (ACC/AHA/HFSA 2022): renal/age-adjusted dose guidance, indication-specific target range, and a <6 h post-dose timing warning.',
    compute: F.digoxin,
    fields: [
      { dom: 'dig-crcl', arg: 'crCl', kind: 'number', required: true, label: 'Creatinine clearance', unit: 'mL/min' },
      { dom: 'dig-age', arg: 'ageYears', kind: 'number', required: false, label: 'Age (optional)', unit: 'years' },
      { dom: 'dig-ind', arg: 'indication', kind: 'enum', values: ['hf', 'af'], required: true, label: 'Indication' },
      { dom: 'dig-lvl', arg: 'levelNgMl', kind: 'number', required: true, label: 'Measured level (optional)', unit: 'ng/mL' },
      { dom: 'dig-hrs', arg: 'hoursPostDose', kind: 'number', required: true, label: 'Hours post-dose (optional)', unit: 'h' },
    ],
  },
  {
    id: 'local-anesthetic-max',
    summary: 'ASRA 2018 local anesthetic maximum dose: per-agent mg/kg ceiling times weight (100 kg cap), converted to a maximum volume at the entered solution concentration.',
    // Echo the entered solution concentration (percent) alongside the volume.
    compute: (a) => {
      const r = F.localAnestheticMax(a);
      return r == null ? r : { ...r, concentrationPercent: a.concPct };
    },
    fields: [
      { dom: 'la-agent', arg: 'agent', kind: 'enum', values: ['lidocaine', 'lidocaine-epi', 'bupivacaine', 'bupivacaine-epi', 'ropivacaine'], required: true, label: 'Agent' },
      { dom: 'la-wt', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'la-conc', arg: 'concPct', kind: 'number', required: true, label: 'Solution concentration', unit: '%' },
    ],
  },
  {
    id: 'mgso4-preeclampsia',
    summary: 'Magnesium sulfate for preeclampsia/eclampsia (ACOG PB 222, Magpie): loading volume for the 4 or 6 g load and maintenance mL/h at the bag concentration, halved in renal impairment.',
    // Echo the standard 20-30 min loading-infusion window the tile prints.
    compute: (a) => {
      const r = F.mgso4Preeclampsia(a);
      return r == null ? r : { ...r, loadingMinutes: { from: 20, to: 30 } };
    },
    fields: [
      { dom: 'mg-load', arg: 'loadG', kind: 'enum', values: ['4', '6'], required: true, label: 'Loading dose', to: Number },
      { dom: 'mg-maint', arg: 'maintGPerH', kind: 'enum', values: ['2', '1'], required: true, label: 'Maintenance rate', to: Number },
      { dom: 'mg-conc', arg: 'concGPerMl', kind: 'number', required: true, label: 'Bag concentration', unit: 'g/mL' },
      { dom: 'mg-renal', arg: 'renalImpairment', kind: 'bool', required: false, label: 'Renal impairment' },
    ],
  },
  {
    id: 'pca-pump',
    summary: 'PCA pump settings math (ISMP/ASPMN safe-PCA): max demand doses/h = 60 / lockout, max hourly mg = demand x doses/h + basal, demand volume per dose at the concentration.',
    compute: (a) => {
      const r = F.pcaPump(a);
      return r == null ? r : { ...r, lockoutMin: a.lockoutMin };
    },
    fields: [
      { dom: 'pca-conc', arg: 'concMgPerMl', kind: 'number', required: true, label: 'Concentration', unit: 'mg/mL' },
      { dom: 'pca-demand', arg: 'demandMg', kind: 'number', required: true, label: 'Demand (bolus) dose', unit: 'mg' },
      { dom: 'pca-lockout', arg: 'lockoutMin', kind: 'number', required: true, label: 'Lockout interval', unit: 'min' },
      { dom: 'pca-basal', arg: 'basalMgPerH', kind: 'number', required: false, label: 'Continuous (basal) rate', unit: 'mg/h', to: (v) => v || 0 },
      { dom: 'pca-limit', arg: 'oneHourLimitMg', kind: 'number', required: false, label: '1-hour limit', unit: 'mg' },
    ],
  },
  {
    id: 'sugammadex',
    summary: 'Sugammadex reversal dose per the Bridion US label on actual body weight: 2 mg/kg at T2 reappearance, 4 mg/kg at 1-2 post-tetanic counts, 16 mg/kg immediate; volume at 100 mg/mL.',
    compute: (a) => {
      const r = F.sugammadex(a);
      return r == null ? r : { ...r, weightKg: a.weightKg, concentrationMgPerMl: 100 };
    },
    fields: [
      { dom: 'sug-wt', arg: 'weightKg', kind: 'number', required: true, label: 'Actual body weight', unit: 'kg' },
      { dom: 'sug-depth', arg: 'depth', kind: 'enum', values: ['t2', 'ptc', 'immediate'], required: true, label: 'Depth of block' },
    ],
  },
  {
    id: 'ketamine-propofol',
    summary: 'Procedural sedation dosing (ACEP): initial mg dose and syringe volume for ketamine (50 mg/mL), propofol (10 mg/mL), or 1:1 ketofol (5 mg/mL each) at the selected mg/kg, plus re-dose increment.',
    // Echo the per-kg dose and the agent syringe concentration used.
    compute: (a) => {
      const r = F.ketaminePropofol(a);
      if (r == null) return r;
      const concMgPerMl = { ketamine: 50, propofol: 10, ketofol: 5 }[a.agent];
      return { ...r, doseMgPerKg: a.mgkg, weightKg: a.weightKg, concentrationMgPerMl: concMgPerMl };
    },
    fields: [
      { dom: 'kp-agent', arg: 'agent', kind: 'enum', values: ['ketamine', 'propofol', 'ketofol'], required: true, label: 'Agent' },
      { dom: 'kp-wt', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'kp-mgkg', arg: 'mgkg', kind: 'number', required: true, label: 'Selected dose', unit: 'mg/kg' },
    ],
  },
  {
    id: 'peds-fluid-deficit',
    summary: 'Pediatric dehydration plan (Holliday-Segar 4-2-1): maintenance mL/h, total deficit = % dehydration x kg x 10, and first-8-h / next-16-h rates (maintenance + half deficit each).',
    compute: F.pedsFluidDeficit,
    fields: [
      { dom: 'pfd-wt', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'pfd-pct', arg: 'dehydrationPct', kind: 'number', required: true, label: 'Estimated dehydration', unit: '%' },
    ],
  },
  {
    id: 'peds-resus',
    summary: 'PALS 2020 pediatric fluid bolus: 10 or 20 mL/kg isotonic bolus volume (50 kg adult cap) with a cardiac/DKA caution flag.',
    compute: (a) => {
      const r = F.pedsResus(a);
      return r == null ? r : { ...r, weightKg: a.weightKg, mlPerKg: a.mlPerKg };
    },
    fields: [
      { dom: 'pr-wt', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'pr-ml', arg: 'mlPerKg', kind: 'enum', values: ['20', '10'], required: true, label: 'Bolus size', to: Number },
      { dom: 'pr-ctx', arg: 'context', kind: 'enum', values: ['sepsis', 'cardiac-dka'], required: true, label: 'Context' },
    ],
  },
  {
    id: 'conc-percent',
    summary: 'Concentration convention converter (USP): ratio 1:X, percent w/v, and mg/mL expressed in all three forms (1% = 10 mg/mL; 1:1000 = 1 mg/mL).',
    compute: F.concPercent,
    fields: [
      { dom: 'cp-mode', arg: 'mode', kind: 'enum', values: ['ratio', 'percent', 'mgml'], required: true, label: 'Enter as' },
      { dom: 'cp-val', arg: 'value', kind: 'number', required: true, label: 'Value' },
    ],
  },
];
