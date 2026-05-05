// Group E: Clinical Math and Conversions (27-40).
// Each utility is a small form that calls a pure function from lib/clinical.js.
// All numeric inputs use type=number step=any. The clinical inline notice is
// rendered by the router for any utility flagged clinical.

import { el, clear } from '../lib/dom.js';
import * as C from '../lib/clinical.js';
import * as V4 from '../lib/clinical-v4.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: opts.type || 'number', autocomplete: 'off' });
  if (inp.type === 'number') inp.setAttribute('step', 'any');
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  if (opts.value != null) inp.value = String(opts.value);
  wrap.appendChild(inp);
  return wrap;
}

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}

function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function num(id) { return Number(document.getElementById(id).value); }

function safe(out, fn) {
  clear(out);
  try { fn(); } catch (err) { out.appendChild(el('p', { class: 'muted', text: err.message })); }
}

export const renderers = {
  'unit-converter'(root) {
    root.appendChild(selectField('Quantity', 'kind', [
      { value: 'weight', text: 'Weight (kg, g, mg, lb, oz)' },
      { value: 'volume', text: 'Volume (mL, L, fl_oz, cup)' },
      { value: 'temperature', text: 'Temperature (C, F, K)' },
    ]));
    root.appendChild(field('Value', 'val'));
    root.appendChild(field('From unit', 'from', { type: 'text', placeholder: 'kg' }));
    root.appendChild(field('To unit', 'to', { type: 'text', placeholder: 'lb' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const kind = document.getElementById('kind').value;
      const v = num('val'); const from = document.getElementById('from').value.trim(); const to = document.getElementById('to').value.trim();
      if (!from || !to) return;
      const r = C.convert(v, from, to, kind);
      o.appendChild(el('p', { text: `${v} ${from} = ${r} ${to}` }));
    });
    ['kind', 'val', 'from', 'to'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  bmi(root) {
    root.appendChild(field('Weight (kg)', 'w'));
    root.appendChild(field('Height (m)', 'h'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.bmi({ weightKg: num('w'), heightM: num('h') });
      o.appendChild(el('p', { text: `BMI: ${r.bmi} kg/m^2 (${r.category})` }));
    });
    ['w', 'h'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  bsa(root) {
    root.appendChild(field('Weight (kg)', 'w'));
    root.appendChild(field('Height (cm)', 'h'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const w = num('w'), h = num('h');
      o.appendChild(el('ul', {}, [
        el('li', { text: `Du Bois: ${C.bsaDuBois({ weightKg: w, heightCm: h })} m^2` }),
        el('li', { text: `Mosteller: ${C.bsaMosteller({ weightKg: w, heightCm: h })} m^2` }),
      ]));
    });
    ['w', 'h'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  map(root) {
    root.appendChild(field('Systolic BP (mmHg)', 's'));
    root.appendChild(field('Diastolic BP (mmHg)', 'd'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      o.appendChild(el('p', { text: `MAP: ${C.map({ sbp: num('s'), dbp: num('d') })} mmHg` }));
    });
    ['s', 'd'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'anion-gap'(root) {
    root.appendChild(field('Sodium (mEq/L)', 'na'));
    root.appendChild(field('Chloride (mEq/L)', 'cl'));
    root.appendChild(field('Bicarbonate (mEq/L)', 'hco3'));
    root.appendChild(field('Albumin (g/dL, optional)', 'alb'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const alb = document.getElementById('alb').value;
      const r = C.anionGap({ sodium: num('na'), chloride: num('cl'), bicarbonate: num('hco3'), albuminGdl: alb === '' ? null : Number(alb) });
      const items = [el('li', { text: `Anion gap: ${r.anionGap}` })];
      if (r.correctedAnionGap != null) items.push(el('li', { text: `Albumin-corrected: ${r.correctedAnionGap}` }));
      o.appendChild(el('ul', {}, items));
    });
    ['na', 'cl', 'hco3', 'alb'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'corrected-calcium'(root) {
    root.appendChild(field('Measured calcium (mg/dL)', 'ca'));
    root.appendChild(field('Albumin (g/dL)', 'alb'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      o.appendChild(el('p', { text: `Corrected calcium: ${C.correctedCalcium({ measuredCa: num('ca'), albuminGdl: num('alb') })} mg/dL` }));
    });
    ['ca', 'alb'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'corrected-sodium'(root) {
    root.appendChild(field('Measured sodium (mEq/L)', 'na'));
    root.appendChild(field('Glucose (mg/dL)', 'g'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.correctedSodium({ measuredNa: num('na'), glucose: num('g') });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Corrected Na (factor 1.6): ${r.naBy1_6} mEq/L` }),
        el('li', { text: `Corrected Na (factor 2.4): ${r.naBy2_4} mEq/L` }),
      ]));
      o.appendChild(el('p', { class: 'muted', text: 'Both correction factors are reported per the literature (Katz 1973; Hillier 1999).' }));
    });
    ['na', 'g'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'aa-gradient'(root) {
    root.appendChild(field('FiO2 (0-1, e.g. 0.21)', 'fio2'));
    root.appendChild(field('PaCO2 (mmHg)', 'paco2'));
    root.appendChild(field('PaO2 (mmHg)', 'pao2'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.aaGradient({ fio2: num('fio2'), paco2: num('paco2'), pao2: num('pao2') });
      o.appendChild(el('ul', {}, [
        el('li', { text: `PAO2: ${r.PAO2} mmHg` }),
        el('li', { text: `A-a gradient: ${r.aaGradient} mmHg` }),
      ]));
    });
    ['fio2', 'paco2', 'pao2'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  egfr(root) {
    root.appendChild(field('Serum creatinine (mg/dL)', 'scr'));
    root.appendChild(field('Age (years)', 'age'));
    root.appendChild(selectField('Sex', 'sex', [{ value: 'M', text: 'Male' }, { value: 'F', text: 'Female' }]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const v = C.egfrCkdEpi2021({ scr: num('scr'), age: num('age'), sex: document.getElementById('sex').value });
      o.appendChild(el('p', { text: `eGFR: ${v} mL/min/1.73 m^2 (CKD-EPI 2021 race-free)` }));
    });
    ['scr', 'age', 'sex'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'cockcroft-gault'(root) {
    root.appendChild(field('Age (years)', 'age'));
    root.appendChild(field('Weight (kg)', 'w'));
    root.appendChild(field('Serum creatinine (mg/dL)', 'scr'));
    root.appendChild(selectField('Sex', 'sex', [{ value: 'M', text: 'Male' }, { value: 'F', text: 'Female' }]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const v = C.cockcroftGault({ age: num('age'), weightKg: num('w'), scr: num('scr'), sex: document.getElementById('sex').value });
      o.appendChild(el('p', { text: `Creatinine clearance: ${v} mL/min` }));
    });
    ['age', 'w', 'scr', 'sex'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'pack-years'(root) {
    root.appendChild(field('Packs per day', 'p'));
    root.appendChild(field('Years smoked', 'y'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      o.appendChild(el('p', { text: `Pack-years: ${C.packYears({ packsPerDay: num('p'), years: num('y') })}` }));
    });
    ['p', 'y'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'due-date'(root) {
    root.appendChild(field('Last menstrual period (YYYY-MM-DD)', 'lmp', { type: 'text', placeholder: '2025-01-01' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.naegele({ lmpIso: document.getElementById('lmp').value });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Estimated due date: ${r.dueDate}` }),
        el('li', { text: `Current gestational age: ${r.gestationalWeeks} weeks ${r.gestationalDays} days` }),
      ]));
    });
    document.getElementById('lmp').addEventListener('input', run);
  },

  qtc(root) {
    root.appendChild(field('QT interval (ms)', 'qt'));
    root.appendChild(field('Heart rate (bpm)', 'hr'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.qtc({ qtMs: num('qt'), hrBpm: num('hr') });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Bazett: ${r.bazett} ms` }),
        el('li', { text: `Fridericia: ${r.fridericia} ms` }),
        el('li', { text: `Framingham: ${r.framingham} ms` }),
        el('li', { text: `Hodges: ${r.hodges} ms` }),
      ]));
    });
    ['qt', 'hr'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'pf-ratio'(root) {
    root.appendChild(field('PaO2 (mmHg)', 'pao2'));
    root.appendChild(field('FiO2 (0-1)', 'fio2'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.pfRatio({ pao2: num('pao2'), fio2: num('fio2') });
      o.appendChild(el('p', { text: `P/F ratio: ${r.ratio} (${r.category})` }));
    });
    ['pao2', 'fio2'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // --- spec-v4 §5: Group E extensions (utilities 117-128) -------------

  'anion-gap-dd'(root) {
    root.appendChild(field('Sodium (mEq/L)', 'na'));
    root.appendChild(field('Chloride (mEq/L)', 'cl'));
    root.appendChild(field('HCO3 (mEq/L)', 'hco3'));
    root.appendChild(field('Albumin (g/dL, optional)', 'alb'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const ag = C.anionGap({ sodium: num('na'), chloride: num('cl'), bicarbonate: num('hco3'), albuminGdl: num('alb') || undefined });
      const baseAg = ag.correctedAnionGap != null ? ag.correctedAnionGap : ag.anionGap;
      const dd = V4.deltaDelta({ anionGap: baseAg, hco3: num('hco3') });
      o.appendChild(el('h2', { text: `AG ${ag.anionGap}${ag.correctedAnionGap != null ? `; albumin-corrected AG ${ag.correctedAnionGap}` : ''}` }));
      o.appendChild(el('ul', {}, [
        el('li', { text: `delta-AG = ${dd.deltaAg}` }),
        el('li', { text: `delta-HCO3 = ${dd.deltaHco3}` }),
        el('li', { text: `delta/delta ratio = ${dd.ratio == null ? 'n/a' : dd.ratio.toFixed(2)}` }),
        el('li', { text: dd.interpretation }),
      ]));
    });
    ['na', 'cl', 'hco3', 'alb'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'corrected-ca-na'(root) {
    root.appendChild(el('h3', { text: 'Corrected Calcium' }));
    root.appendChild(field('Measured Ca (mg/dL)', 'ca'));
    root.appendChild(field('Albumin (g/dL)', 'cca-alb'));
    root.appendChild(el('h3', { text: 'Corrected Sodium (Katz)' }));
    root.appendChild(field('Measured Na (mEq/L)', 'csna-na'));
    root.appendChild(field('Glucose (mg/dL)', 'glu'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const lines = [];
      const ca = num('ca'), alb = num('cca-alb');
      if (ca && alb) {
        const cc = C.correctedCalcium({ measuredCa: ca, albuminGdl: alb });
        lines.push(el('li', { text: `Corrected Ca: ${cc.toFixed(2)} mg/dL` }));
      }
      const na = num('csna-na'), glu = num('glu');
      if (na && glu) {
        const cs = C.correctedSodium({ measuredNa: na, glucose: glu });
        lines.push(el('li', { text: `Corrected Na (Katz 1.6): ${cs.naBy1_6.toFixed(1)}; Hillier 2.4: ${cs.naBy2_4.toFixed(1)}` }));
      }
      o.appendChild(el('ul', {}, lines));
    });
    ['ca', 'cca-alb', 'csna-na', 'glu'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'osmolal-gap'(root) {
    root.appendChild(field('Measured serum osmolality (mOsm/kg)', 'measured'));
    root.appendChild(field('Sodium (mEq/L)', 'og-na'));
    root.appendChild(field('Glucose (mg/dL)', 'og-glu'));
    root.appendChild(field('BUN (mg/dL)', 'og-bun'));
    root.appendChild(field('EtOH (mg/dL, optional)', 'og-etoh'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = V4.osmolalGap({ measuredOsm: num('measured'), sodium: num('og-na'), glucoseMgDl: num('og-glu'), bunMgDl: num('og-bun'), etohMgDl: num('og-etoh') || 0 });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Calculated osm: ${r.calculatedOsm.toFixed(1)}` }),
        el('li', { text: `Osmolal gap: ${r.gap.toFixed(1)} (>10 raises suspicion of toxic alcohols)` }),
      ]));
    });
    ['measured', 'og-na', 'og-glu', 'og-bun', 'og-etoh'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'aa-pf-suite'(root) {
    root.appendChild(field('FiO2 (0-1)', 'sf-fio2', { value: 0.21 }));
    root.appendChild(field('PaO2 (mmHg)', 'sf-pao2'));
    root.appendChild(field('PaCO2 (mmHg)', 'sf-paco2'));
    root.appendChild(field('Age (years, for expected A-a)', 'sf-age'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const aa = C.aaGradient({ fio2: num('sf-fio2'), paco2: num('sf-paco2'), pao2: num('sf-pao2') });
      const pf = C.pfRatio({ pao2: num('sf-pao2'), fio2: num('sf-fio2') });
      const expectedAa = num('sf-age') ? num('sf-age') / 4 + 4 : null;
      o.appendChild(el('ul', {}, [
        el('li', { text: `A-a gradient: ${aa.aaGradient.toFixed(1)} mmHg (PAO2 ${aa.PAO2.toFixed(1)})` }),
        expectedAa ? el('li', { text: `Expected A-a by age: ${expectedAa.toFixed(1)}` }) : null,
        el('li', { text: `P/F ratio: ${pf.ratio} - ${pf.category}` }),
      ].filter(Boolean)));
    });
    ['sf-fio2', 'sf-pao2', 'sf-paco2', 'sf-age'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'winters'(root) {
    root.appendChild(field('HCO3 (mEq/L)', 'wf-hco3'));
    root.appendChild(field('Measured PaCO2 (mmHg, optional)', 'wf-paco2'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = V4.wintersFormula({ hco3: num('wf-hco3'), measuredPaco2: num('wf-paco2') || NaN });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Expected PaCO2: ${r.expectedPaco2Low.toFixed(1)} to ${r.expectedPaco2High.toFixed(1)} mmHg` }),
        r.secondaryDisorder ? el('li', { text: r.secondaryDisorder }) : null,
      ].filter(Boolean)));
    });
    ['wf-hco3', 'wf-paco2'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'shock-index'(root) {
    root.appendChild(field('SBP (mmHg)', 'si-sbp'));
    root.appendChild(field('DBP (mmHg)', 'si-dbp'));
    root.appendChild(field('Heart rate (bpm)', 'si-hr'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const sbp = num('si-sbp'), dbp = num('si-dbp'), hr = num('si-hr');
      const mapV = C.map({ sbp, dbp });
      o.appendChild(el('ul', {}, [
        el('li', { text: `MAP: ${mapV.toFixed(1)} mmHg` }),
        el('li', { text: `Pulse pressure: ${V4.pulsePressure({ sbp, dbp })} mmHg` }),
        el('li', { text: `Shock index (HR/SBP): ${V4.shockIndex({ hr, sbp })?.toFixed(2)}` }),
        el('li', { text: `Modified shock index (HR/MAP): ${V4.modifiedShockIndex({ hr, sbp, dbp })?.toFixed(2)}` }),
      ]));
    });
    ['si-sbp', 'si-dbp', 'si-hr'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'bw-bsa-suite'(root) {
    root.appendChild(field('Height (inches)', 'bw-hin'));
    root.appendChild(field('Weight (kg)', 'bw-kg'));
    root.appendChild(selectField('Sex', 'bw-sex', [{ value: 'M', text: 'Male' }, { value: 'F', text: 'Female' }]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const sex = document.getElementById('bw-sex').value;
      const ibw = V4.ibwDevine({ heightInches: num('bw-hin'), sex });
      const adj = V4.adjBW({ ibw, actualKg: num('bw-kg') });
      const heightCm = num('bw-hin') * 2.54;
      const bsaM = C.bsaMosteller({ weightKg: num('bw-kg'), heightCm });
      const bsaD = C.bsaDuBois({ weightKg: num('bw-kg'), heightCm });
      o.appendChild(el('ul', {}, [
        el('li', { text: `IBW (Devine): ${ibw.toFixed(1)} kg` }),
        el('li', { text: `AdjBW (40% rule): ${adj.toFixed(1)} kg` }),
        el('li', { text: `BSA Mosteller: ${bsaM.toFixed(2)} m^2` }),
        el('li', { text: `BSA Du Bois: ${bsaD.toFixed(2)} m^2` }),
      ]));
    });
    ['bw-hin', 'bw-kg', 'bw-sex'].forEach((id) => document.getElementById(id).addEventListener(id === 'bw-sex' ? 'change' : 'input', run));
  },

  'egfr-suite'(root) {
    root.appendChild(field('Serum creatinine (mg/dL)', 'es-scr'));
    root.appendChild(field('Age (years)', 'es-age'));
    root.appendChild(field('Weight (kg, for Cockcroft-Gault)', 'es-w'));
    root.appendChild(selectField('Sex', 'es-sex', [{ value: 'M', text: 'Male' }, { value: 'F', text: 'Female' }]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const scr = num('es-scr'), age = num('es-age'), w = num('es-w');
      const sex = document.getElementById('es-sex').value;
      const ckdEpi = C.egfrCkdEpi2021({ scr, age, sex });
      const cg = C.cockcroftGault({ age, weightKg: w, scr, sex });
      const mdrd = V4.egfrMdrd({ scr, age, sex });
      o.appendChild(el('ul', {}, [
        el('li', { text: `CKD-EPI 2021 (race-free): ${ckdEpi.toFixed(1)} mL/min/1.73m^2` }),
        el('li', { text: `MDRD (race-free): ${mdrd.toFixed(1)} mL/min/1.73m^2` }),
        el('li', { text: `Cockcroft-Gault: ${cg.toFixed(1)} mL/min` }),
      ]));
      o.appendChild(el('p', { class: 'muted', text: '2021 race-free shift: NIH/NKF removed the race coefficient from CKD-EPI in 2021. Many labs use CKD-EPI; nephrology references increasingly use MDRD race-free for legacy comparison.' }));
    });
    ['es-scr', 'es-age', 'es-w', 'es-sex'].forEach((id) => document.getElementById(id).addEventListener(id === 'es-sex' ? 'change' : 'input', run));
  },

  'fena-feurea'(root) {
    root.appendChild(el('h3', { text: 'FENa' }));
    root.appendChild(field('Urine Na (mEq/L)', 'fn-una'));
    root.appendChild(field('Plasma Na (mEq/L)', 'fn-pna'));
    root.appendChild(field('Urine Cr (mg/dL)', 'fn-ucr'));
    root.appendChild(field('Plasma Cr (mg/dL)', 'fn-pcr'));
    root.appendChild(el('h3', { text: 'FEUrea' }));
    root.appendChild(field('Urine urea (mg/dL)', 'fu-uu'));
    root.appendChild(field('Plasma urea (BUN, mg/dL)', 'fu-pu'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const fena = V4.feNa({ urineNa: num('fn-una'), plasmaNa: num('fn-pna'), urineCr: num('fn-ucr'), plasmaCr: num('fn-pcr') });
      const feurea = V4.feUrea({ urineUrea: num('fu-uu'), plasmaUrea: num('fu-pu'), urineCr: num('fn-ucr'), plasmaCr: num('fn-pcr') });
      o.appendChild(el('ul', {}, [
        el('li', { text: `FENa: ${fena == null ? '(incomplete inputs)' : fena.toFixed(2) + '%'} (<1% prerenal, >2% ATN)` }),
        el('li', { text: `FEUrea: ${feurea == null ? '(incomplete inputs)' : feurea.toFixed(2) + '%'} (<35% prerenal, useful when on diuretics)` }),
      ]));
    });
    ['fn-una', 'fn-pna', 'fn-ucr', 'fn-pcr', 'fu-uu', 'fu-pu'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'maint-fluids'(root) {
    root.appendChild(field('Weight (kg)', 'mf-w'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = V4.maintenanceFluids({ weightKg: num('mf-w') });
      o.appendChild(el('p', { text: `Maintenance: ${r.toFixed(1)} mL/hr (4 mL/kg/hr first 10 kg + 2 next 10 kg + 1 over 20 kg)` }));
    });
    document.getElementById('mf-w').addEventListener('input', run);
  },

  'qtc-suite'(root) {
    root.appendChild(field('QT (ms)', 'qs-qt'));
    root.appendChild(field('Heart rate (bpm)', 'qs-hr'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = V4.qtcAll({ qtMs: num('qs-qt'), hrBpm: num('qs-hr') });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Bazett: ${r.bazett.toFixed(0)} ms` }),
        el('li', { text: `Fridericia: ${r.fridericia.toFixed(0)} ms` }),
        el('li', { text: `Framingham: ${r.framingham.toFixed(0)} ms` }),
        el('li', { text: `Hodges: ${r.hodges.toFixed(0)} ms` }),
      ]));
    });
    ['qs-qt', 'qs-hr'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'preg-dating'(root) {
    root.appendChild(field('LMP date (YYYY-MM-DD, optional)', 'pd-lmp', { type: 'text' }));
    root.appendChild(field('Ultrasound CRL (mm, optional)', 'pd-crl'));
    root.appendChild(field('Ultrasound date (YYYY-MM-DD, optional)', 'pd-us', { type: 'text' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const lmp = document.getElementById('pd-lmp').value.trim();
      const crl = num('pd-crl');
      const us = document.getElementById('pd-us').value.trim();
      const lines = [];
      let lmpRes = null, usRes = null;
      if (lmp) {
        lmpRes = V4.eddFromLmp({ lmpIso: lmp });
        lines.push(el('li', { text: `LMP-derived EDD: ${lmpRes.edd}; current GA ${lmpRes.gaWeeks}w ${lmpRes.gaRemainderDays}d` }));
      }
      if (crl > 0) {
        usRes = V4.gaFromCrl({ crlMm: crl, ultrasoundDateIso: us || undefined });
        lines.push(el('li', { text: `CRL-derived GA at ultrasound: ${usRes.gaWeeks}w ${usRes.gaRemainderDays}d; implied EDD ${usRes.edd}` }));
      }
      if (lmpRes && usRes) {
        const d = V4.pregnancyDiscordance({ lmpGaDays: lmpRes.gaDays, usGaDays: usRes.gaDays });
        lines.push(el('li', { text: `Discordance: ${d.differenceDays} days (T${d.trimester} threshold ${d.redateThreshold}). ${d.discordant ? 'Consider redating to ultrasound.' : 'Within accepted limit.'}` }));
      }
      o.appendChild(el('ul', {}, lines));
    });
    ['pd-lmp', 'pd-crl', 'pd-us'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },
};
