// spec-v183 MCP wave 54: adapters for lib/clinical-v8.js - CPP, minute
// ventilation, weight-based peds dosing, anticoagulation reversal, infusion
// time remaining, enteral free water, APAP 24-h ceiling, ICU nutrition targets,
// VTE prophylaxis dosing, norepinephrine equivalents, O2 cylinder duration,
// neonatal feeding volume, and oxytocin titration. dom keys mirror the renderers.

import * as F from '../../lib/clinical-v8.js';

// clinical-v8's O2 cylinder tank-factor table (L/psi per cylinder size); the
// renderer maps the size letter through this same export so the schema cannot
// drift from the model.
const { O2_CYLINDER_FACTORS } = F;

export default [
  {
    id: 'cerebral-perfusion-pressure',
    summary: 'Cerebral perfusion pressure CPP = MAP - ICP (MAP measured or derived from SBP/DBP); BTF target band ~60-70 mmHg.',
    compute: F.cerebralPerfusionPressure,
    fields: [
      { dom: 'cpp-map', arg: 'map', kind: 'number', required: true, label: 'MAP', unit: 'mmHg' },
      { dom: 'cpp-sbp', arg: 'sbp', kind: 'number', required: false, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'cpp-dbp', arg: 'dbp', kind: 'number', required: false, label: 'Diastolic BP', unit: 'mmHg' },
      { dom: 'cpp-icp', arg: 'icp', kind: 'number', required: true, label: 'ICP', unit: 'mmHg' },
    ],
  },
  // minute-ventilation is intentionally NOT adapted: its META.example.expected
  // text ("... target PaCO2 is 24/min") carries the substring "PaCO2", which the
  // shared numeric-round-trip extractor reads as a spurious numeric fact "2" that
  // the compute result cannot own without fabricating a value. It stays in the
  // ledger's not-yet-adapted set; the unit tests cover its math directly.
  {
    id: 'peds-dose',
    summary: 'Weight-driven pediatric quick-dose panel (AAP, NLM/DailyMed, manufacturer labels): per-drug mg dose ranges at the entered weight with per-dose caps applied.',
    compute: F.pedsDosePanel,
    fields: [
      { dom: 'pd-w', arg: 'weightKg', kind: 'number', required: true, label: 'Child weight', unit: 'kg' },
    ],
  },
  {
    id: 'anticoag-reversal',
    summary: 'Anticoagulation reversal dosing: 4F-PCC / idarucizumab / andexanet for warfarin and the DOACs (weight and INR driven), or protamine for unfractionated heparin.',
    // The renderer branches on the agent: heparin -> protamineDose(heparinUnits),
    // every other agent -> anticoagReversalDose(weightKg, inr, agent).
    compute: (a) => {
      if (a.agent === 'heparin-ufh') {
        const r = F.protamineDose({ heparinUnits: a.heparinUnits });
        return r == null ? r : { ...r, heparinUnits: a.heparinUnits };
      }
      const r = F.anticoagReversalDose({ weightKg: a.weightKg, inr: a.inr, agent: a.agent });
      return r == null ? r : { ...r, weightKg: a.weightKg, inr: a.inr };
    },
    fields: [
      { dom: 'ar-agent', arg: 'agent', kind: 'enum', values: ['warfarin', 'dabigatran', 'apixaban-rivaroxaban', 'heparin-ufh'], required: true, label: 'Anticoagulant' },
      { dom: 'ar-w', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'ar-inr', arg: 'inr', kind: 'number', required: true, label: 'INR (warfarin)', to: (v) => v || 0 },
      { dom: 'ar-heparin', arg: 'heparinUnits', kind: 'number', required: false, label: 'Heparin dose in last 2-3 h (units, UFH branch)' },
    ],
  },
  {
    id: 'infusion-time-remaining',
    summary: 'Infusion timing: time to empty a bag at the current rate, and, in the same call, the rate needed to make a bag last a target number of hours.',
    // The renderer runs both directions when the fields are present; the wrapper
    // merges the two pure results.
    compute: (a) => {
      const out = { volumeMl: a.volumeMl, currentRateMlHr: a.rateMlHr, targetHours: a.hours };
      let any = false;
      if (a.volumeMl > 0 && a.rateMlHr > 0) {
        const t = F.infusionTimeRemaining({ volumeMl: a.volumeMl, rateMlHr: a.rateMlHr });
        if (t) {
          Object.assign(out, t);
          // Split the decimal hours into the h/m the tile displays.
          out.timeToEmpty = { hours: Math.floor(t.hoursToEmpty), minutes: Math.round((t.hoursToEmpty - Math.floor(t.hoursToEmpty)) * 60) };
          any = true;
        }
      }
      if (a.volumeMl > 0 && a.hours > 0) { Object.assign(out, F.infusionRateToLast({ volumeMl: a.volumeMl, hours: a.hours })); any = true; }
      return any ? out : null;
    },
    fields: [
      { dom: 'itr-vol', arg: 'volumeMl', kind: 'number', required: true, label: 'Volume remaining', unit: 'mL' },
      { dom: 'itr-rate', arg: 'rateMlHr', kind: 'number', required: true, label: 'Current rate', unit: 'mL/hr' },
      { dom: 'itr-hrs', arg: 'hours', kind: 'number', required: true, label: 'Target duration', unit: 'hours' },
    ],
  },
  {
    id: 'enteral-free-water',
    summary: 'ASPEN 2017 enteral free-water math: free water in formula = daily volume x free-water fraction; additional flush to goal, split per q6h shift.',
    compute: F.enteralFreeWater,
    fields: [
      { dom: 'efw-vol', arg: 'dailyVolumeMl', kind: 'number', required: true, label: 'Daily formula volume', unit: 'mL/day' },
      { dom: 'efw-fw', arg: 'freeWaterPct', kind: 'number', required: true, label: 'Formula free-water fraction', unit: '%' },
      { dom: 'efw-goal', arg: 'goalMl', kind: 'number', required: true, label: 'Daily free-water goal', unit: 'mL' },
    ],
  },
  {
    id: 'apap-24h-max',
    summary: 'Acetaminophen 24-hour ceiling check: sums up to three source products (dose x doses/day each) and compares the total against the selected daily ceiling (4000 / 3000 / 2000 mg).',
    // Sum the per-source totals (only counting rows where both dose and
    // frequency are positive), then run the ceiling check.
    compute: (a) => {
      let totalMg = 0;
      for (const [dose, freq] of [[a.doseMg1, a.dosesPerDay1], [a.doseMg2, a.dosesPerDay2], [a.doseMg3, a.dosesPerDay3]]) {
        if (dose > 0 && freq > 0) {
          const t = F.apapSourceTotal({ doseMg: dose, dosesPerDay: freq });
          if (t && t.totalMg > 0) totalMg += t.totalMg;
        }
      }
      const check = F.apapCeilingCheck({ totalMg, ceilingMg: a.ceilingMg });
      return check == null ? null : { totalMg, ceilingMg: a.ceilingMg, windowHours: 24, ...check };
    },
    fields: [
      { dom: 'apap-d1', arg: 'doseMg1', kind: 'number', required: true, label: 'Source 1 dose', unit: 'mg' },
      { dom: 'apap-n1', arg: 'dosesPerDay1', kind: 'number', required: true, label: 'Source 1 doses/day' },
      { dom: 'apap-d2', arg: 'doseMg2', kind: 'number', required: true, label: 'Source 2 dose', unit: 'mg' },
      { dom: 'apap-n2', arg: 'dosesPerDay2', kind: 'number', required: true, label: 'Source 2 doses/day' },
      { dom: 'apap-d3', arg: 'doseMg3', kind: 'number', required: true, label: 'Source 3 dose', unit: 'mg' },
      { dom: 'apap-n3', arg: 'dosesPerDay3', kind: 'number', required: true, label: 'Source 3 doses/day' },
      { dom: 'apap-ceiling', arg: 'ceilingMg', kind: 'enum', values: ['4000', '3000', '2000'], required: true, label: 'Daily ceiling', unit: 'mg', to: Number },
    ],
  },
  {
    id: 'icu-nutrition-target',
    summary: 'ICU nutrition targets (ASPEN/SCCM 2016): daily energy (kcal/kg range) and protein (g/kg range) goals at the patient weight.',
    // The two range selects each expand into a low/high numeric pair.
    compute: (a) => {
      const r = F.icuNutritionTarget({
        weightKg: a.weightKg,
        kcalLow: a.kcalRange ? Number(a.kcalRange.split('-')[0]) : undefined,
        kcalHigh: a.kcalRange ? Number(a.kcalRange.split('-')[1]) : undefined,
        proteinLow: a.proteinRange ? Number(a.proteinRange.split('-')[0]) : undefined,
        proteinHigh: a.proteinRange ? Number(a.proteinRange.split('-')[1]) : undefined,
      });
      return r == null ? r : { ...r, weightKg: a.weightKg };
    },
    fields: [
      { dom: 'int-w', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'int-kcal', arg: 'kcalRange', kind: 'enum', values: ['25-30', '20-25'], required: true, label: 'Energy target', unit: 'kcal/kg/day' },
      { dom: 'int-pro', arg: 'proteinRange', kind: 'enum', values: ['1.2-2.0', '2.0-2.5'], required: true, label: 'Protein target', unit: 'g/kg/day' },
    ],
  },
  {
    id: 'vte-prophylaxis-dose',
    summary: 'Enoxaparin dosing per US PI and CHEST 2012: prophylaxis or treatment (1 mg/kg q12h or 1.5 mg/kg q24h) with the CrCl <30 mL/min renal reduction.',
    compute: F.enoxaparinDose,
    fields: [
      { dom: 'vte-w', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'vte-crcl', arg: 'crcl', kind: 'number', required: true, label: 'Creatinine clearance', unit: 'mL/min' },
      { dom: 'vte-ind', arg: 'indication', kind: 'enum', values: ['prophylaxis', 'treatment'], required: true, label: 'Indication' },
      { dom: 'vte-reg', arg: 'regimen', kind: 'enum', values: ['q12', 'daily'], required: true, label: 'Treatment regimen' },
    ],
  },
  {
    id: 'norepi-equiv',
    summary: 'Kotani 2023 norepinephrine-equivalent (NEE) score: total mcg/kg/min equivalent from NE, epinephrine, dopamine, phenylephrine, vasopressin (units/min), and angiotensin II (ng/kg/min).',
    compute: F.norepinephrineEquivalent,
    fields: [
      { dom: 'nee-ne', arg: 'norepinephrine', kind: 'number', required: true, label: 'Norepinephrine', unit: 'mcg/kg/min', to: (v) => v || 0 },
      { dom: 'nee-epi', arg: 'epinephrine', kind: 'number', required: true, label: 'Epinephrine', unit: 'mcg/kg/min', to: (v) => v || 0 },
      { dom: 'nee-dopa', arg: 'dopamine', kind: 'number', required: true, label: 'Dopamine', unit: 'mcg/kg/min', to: (v) => v || 0 },
      { dom: 'nee-phe', arg: 'phenylephrine', kind: 'number', required: true, label: 'Phenylephrine', unit: 'mcg/kg/min', to: (v) => v || 0 },
      { dom: 'nee-vaso', arg: 'vasopressin', kind: 'number', required: true, label: 'Vasopressin', unit: 'units/min', to: (v) => v || 0 },
      { dom: 'nee-at2', arg: 'angiotensin2', kind: 'number', required: true, label: 'Angiotensin II', unit: 'ng/kg/min', to: (v) => v || 0 },
    ],
  },
  {
    id: 'o2-cylinder-duration',
    summary: 'Oxygen cylinder duration: usable volume above the residual pressure and the time to residual at the set flow, using the tank factor for the cylinder size (E/D/M/G/H).',
    // Map the cylinder-size letter through the lib's own tank-factor table.
    compute: (a) => {
      const residualPsi = a.residualPsi == null ? 200 : a.residualPsi;
      const r = F.o2CylinderDuration({
        factorLPsi: O2_CYLINDER_FACTORS[a.size] != null ? O2_CYLINDER_FACTORS[a.size] : O2_CYLINDER_FACTORS.E,
        gaugePsi: a.gaugePsi,
        flowLpm: a.flowLpm > 0 ? a.flowLpm : 0,
        residualPsi,
        targetMinutes: a.targetMinutes > 0 ? a.targetMinutes : 0,
      });
      if (r == null) return r;
      const m = r.minutesRemaining;
      const timeToResidual = m == null ? null : { hours: Math.floor(m / 60), minutes: m % 60, totalMinutes: m };
      return { ...r, residualPsi, timeToResidual };
    },
    fields: [
      { dom: 'o2-size', arg: 'size', kind: 'enum', values: ['E', 'D', 'M', 'G', 'H'], required: true, label: 'Cylinder size' },
      { dom: 'o2-psi', arg: 'gaugePsi', kind: 'number', required: true, label: 'Gauge pressure', unit: 'psi' },
      { dom: 'o2-flow', arg: 'flowLpm', kind: 'number', required: true, label: 'Flow rate', unit: 'L/min' },
      { dom: 'o2-res', arg: 'residualPsi', kind: 'number', required: true, label: 'Residual pressure (default 200)', unit: 'psi' },
      { dom: 'o2-target', arg: 'targetMinutes', kind: 'number', required: false, label: 'Target duration (optional)', unit: 'minutes' },
    ],
  },
  {
    id: 'neonatal-feeding-volume',
    summary: 'Neonatal enteral feeding volumes: total daily mL/day = weight kg x target mL/kg/day and per-feed mL for the chosen feeding frequency (term newborn typically 150 mL/kg/day per AAP Pediatric Nutrition).',
    compute: (a) => {
      const r = F.neonatalFeedingVolume(a);
      if (r == null) return r;
      const intervalHours = a.feedsPerDay > 0 ? 24 / a.feedsPerDay : null;
      return { ...r, weightKg: a.weightKg, mlPerKgDay: a.mlPerKgDay, intervalHours };
    },
    fields: [
      { dom: 'nfv-w', arg: 'weightKg', kind: 'number', required: true, label: 'Weight (kg)', unit: 'kg' },
      { dom: 'nfv-mlkg', arg: 'mlPerKgDay', kind: 'number', required: true, label: 'Target volume (mL/kg/day, term ~150)', unit: 'mL/kg/day' },
      { dom: 'nfv-freq', arg: 'feedsPerDay', kind: 'enum', values: ['8', '12', '6'], required: true, label: 'Feeding frequency', to: Number },
    ],
  },
  {
    id: 'oxytocin-titration',
    summary: 'Oxytocin infusion conversion aid: for a chosen bag concentration (mU/mL) converts an ordered dose in mU/min to the pump rate in mL/hr and, in the same call, a pump rate back to the delivered dose (ACOG induction titration context).',
    compute: (a) => {
      const r = F.oxytocinConvert(a);
      return r == null ? r : { ...r, concentrationMilliunitsPerMl: a.milliunitsPerMl };
    },
    fields: [
      { dom: 'oxy-conc', arg: 'milliunitsPerMl', kind: 'enum', values: ['60', '30', '20', '10'], required: true, label: 'Bag concentration', to: Number },
      { dom: 'oxy-dose', arg: 'doseMilliunitsMin', kind: 'number', required: true, label: 'Ordered dose (mU/min)', unit: 'mU/min', to: (v) => v || 0 },
      { dom: 'oxy-rate', arg: 'rateMlHr', kind: 'number', required: true, label: 'Pump rate (mL/hr)', unit: 'mL/hr', to: (v) => v || 0 },
    ],
  },
  {
    id: 'minute-ventilation',
    summary: 'Minute ventilation and gas-exchange targets: minute ventilation (V̇E, L/min) = respiratory rate x tidal volume; with ideal body weight it also gives alveolar ventilation (subtracting ~2.2 mL/kg dead space), and with a current and target PaCO2 the rate to reach the target (rate x current/target PaCO2). A planning estimate, not a ventilator-mode order.',
    compute: F.minuteVentilation,
    fields: [
      { dom: 'mv-rr', arg: 'respiratoryRate', kind: 'number', required: true, label: 'Respiratory rate', unit: '/min' },
      { dom: 'mv-vt', arg: 'tidalVolumeMl', kind: 'number', required: true, label: 'Tidal volume', unit: 'mL' },
      { dom: 'mv-ibw', arg: 'ibwKg', kind: 'number', label: 'Ideal body weight (optional, for alveolar ventilation)', unit: 'kg' },
      { dom: 'mv-paco2', arg: 'currentPaco2', kind: 'number', label: 'Current PaCO2 (optional)', unit: 'mmHg' },
      { dom: 'mv-target', arg: 'targetPaco2', kind: 'number', label: 'Target PaCO2 (optional)', unit: 'mmHg' },
    ],
  },
];
