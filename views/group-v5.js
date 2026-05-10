// spec-v5 §4: renderers for the seventeen new tools.
// One file by design — these tools span existing topical groups but
// share the same input/render pattern, and a single module keeps the
// v5 surface easy to audit.

import { el, clear } from '../lib/dom.js';
import * as V5 from '../lib/clinical-v5.js';
import * as Code from '../lib/coding-v5.js';
import { breachNotificationDeadlines } from '../lib/regulatory.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: opts.type || 'number', autocomplete: 'off' });
  if (inp.type === 'number') inp.setAttribute('step', opts.step || 'any');
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
function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(document.createTextNode(' '));
  wrap.appendChild(el('label', { for: id, text: label }));
  return wrap;
}
function textareaField(label, id, rows = 3, placeholder = '') {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const ta = el('textarea', { id, rows: String(rows), autocomplete: 'off' });
  if (placeholder) ta.setAttribute('placeholder', placeholder);
  wrap.appendChild(ta);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function num(id) { return Number(document.getElementById(id).value); }
function str(id) { return document.getElementById(id).value; }
function bool(id) { return !!document.getElementById(id).checked; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}

const SEX_OPTS = [{ value: 'M', text: 'Male' }, { value: 'F', text: 'Female' }];

export const renderers = {
  // ----- T1: Sodium correction --------------------------------------------
  'sodium-correction'(root) {
    root.appendChild(field('Weight (kg)', 'w'));
    root.appendChild(selectField('Sex', 'sex', SEX_OPTS));
    root.appendChild(field('Age (years, optional)', 'age'));
    root.appendChild(field('Current serum Na (mEq/L)', 'na'));
    root.appendChild(selectField('Infusate', 'infusate', [
      { value: '3pct-saline',  text: '3% saline (513 mEq/L)' },
      { value: '0.9-saline',   text: '0.9% NS (154 mEq/L)' },
      { value: '0.45-saline',  text: '0.45% NS (77 mEq/L)' },
      { value: 'lr',           text: 'Lactated Ringer\'s (130 mEq/L)' },
      { value: 'd5w',          text: 'D5W (0 mEq/L)' },
    ]));
    root.appendChild(field('Target change in 24 h (mEq/L)', 'tgt', { value: 8 }));
    root.appendChild(selectField('Acuity', 'acuity', [
      { value: 'chronic', text: 'Chronic / unknown onset (ceiling 8 mEq/L/24h)' },
      { value: 'acute',   text: 'Acute (onset < 48 h documented; ceiling 10 mEq/L/24h)' },
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const ageRaw = str('age');
      const r = V5.sodiumCorrection({
        weightKg: num('w'), sex: str('sex'),
        age: ageRaw === '' ? null : Number(ageRaw),
        currentNa: num('na'), infusate: str('infusate'),
        targetChangePer24h: num('tgt'),
        acuity: str('acuity'),
      });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Total body water: ${r.tbwLiters} L` }),
        el('li', { text: `Direction: ${r.direction}` }),
        r.totalSodiumDeficitMeq != null ? el('li', { text: `Total Na ${r.totalSodiumDeficitMeq >= 0 ? 'deficit' : 'excess'} vs 140: ${Math.abs(r.totalSodiumDeficitMeq)} mEq` }) : null,
        el('li', { text: `ΔNa per liter infusate: ${r.changePerLiterInfusate} mEq/L` }),
        r.volumeLiters != null ? el('li', { text: `Volume to reach target: ${r.volumeLiters} L over 24 h` }) : null,
        r.rateMlPerHour != null ? el('li', { text: `Infusion rate: ${r.rateMlPerHour} mL/h` }) : null,
        r.directionNote ? el('li', { class: 'warn', text: r.directionNote }) : null,
        el('li', { text: r.safetyNote }),
      ]));
    });
    ['w', 'sex', 'age', 'na', 'infusate', 'tgt', 'acuity'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // ----- T2: Free water deficit -------------------------------------------
  'free-water-deficit'(root) {
    root.appendChild(field('Weight (kg)', 'w'));
    root.appendChild(selectField('Sex', 'sex', SEX_OPTS));
    root.appendChild(field('Age (years, optional)', 'age'));
    root.appendChild(field('Current serum Na (mEq/L)', 'na'));
    root.appendChild(field('Target Na (mEq/L)', 'tgt', { value: 145 }));
    root.appendChild(field('Replace over (hours)', 'hrs', { value: 48 }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const ageRaw = str('age');
      const r = V5.freeWaterDeficit({
        weightKg: num('w'), sex: str('sex'),
        age: ageRaw === '' ? null : Number(ageRaw),
        currentNa: num('na'), targetNa: num('tgt'),
        replaceOverHours: num('hrs'),
      });
      o.appendChild(el('ul', {}, [
        el('li', { text: `TBW: ${r.tbwLiters} L` }),
        el('li', { text: `Free water deficit: ${r.deficitLiters} L` }),
        el('li', { text: `Replacement rate: ${r.replacementRateMlPerHour} mL/h` }),
        el('li', { text: `Implied Na drop: ${r.impliedNaDropPer24h} mEq/L/24h` }),
        el('li', { text: r.safetyNote }),
      ]));
    });
    ['w', 'sex', 'age', 'na', 'tgt', 'hrs'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // ----- T3: Iron deficit (Ganzoni) ---------------------------------------
  'iron-ganzoni'(root) {
    root.appendChild(field('Weight (kg)', 'w'));
    root.appendChild(field('Current Hb (g/dL)', 'hb'));
    root.appendChild(field('Target Hb (g/dL)', 'tgt', { value: 15 }));
    root.appendChild(field('Iron stores override (mg, optional)', 'stores'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const sRaw = str('stores');
      const r = V5.ironDeficitGanzoni({
        weightKg: num('w'), currentHb: num('hb'), targetHb: num('tgt'),
        ironStoresMg: sRaw === '' ? null : Number(sRaw),
      });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Iron stores used: ${r.ironStoresMg} mg` }),
        el('li', { text: `Total iron deficit: ${r.totalDeficitMg} mg` }),
      ]));
    });
    ['w', 'hb', 'tgt', 'stores'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // ----- T4: PBW + ARDSnet Vt --------------------------------------------
  'pbw-ardsnet'(root) {
    root.appendChild(field('Height (cm)', 'h'));
    root.appendChild(selectField('Sex', 'sex', SEX_OPTS));
    root.appendChild(field('Target Vt (mL/kg PBW)', 'mlkg', { value: 6 }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = V5.pbwArdsnet({ heightCm: num('h'), sex: str('sex'), mlPerKg: num('mlkg') });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Predicted body weight: ${r.pbwKg} kg` }),
        el('li', { text: `Target Vt: ${r.vtTargetMl} mL` }),
        el('li', { text: `ARDSnet range (4-8 mL/kg): ${r.vtRangeMl.low} - ${r.vtRangeMl.high} mL` }),
      ]));
    });
    ['h', 'sex', 'mlkg'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // ----- T5: RSBI ---------------------------------------------------------
  rsbi(root) {
    root.appendChild(field('Respiratory rate (breaths/min)', 'rr'));
    root.appendChild(field('Tidal volume (mL)', 'vt'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = V5.rsbi({ respiratoryRate: num('rr'), tidalVolumeMl: num('vt') });
      o.appendChild(el('ul', {}, [
        el('li', { text: `RSBI: ${r.rsbi}` }),
        el('li', { text: r.interpretation }),
      ]));
    });
    ['rr', 'vt'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // ----- T6: Light's criteria --------------------------------------------
  lights(root) {
    root.appendChild(field('Pleural protein (g/dL)', 'pp'));
    root.appendChild(field('Serum protein (g/dL)', 'sp'));
    root.appendChild(field('Pleural LDH (U/L)', 'pl'));
    root.appendChild(field('Serum LDH (U/L)', 'sl'));
    root.appendChild(field('Serum LDH ULN (U/L)', 'uln', { value: 222 }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = V5.lightsCriteria({
        pleuralProtein: num('pp'), serumProtein: num('sp'),
        pleuralLdh: num('pl'), serumLdh: num('sl'), serumLdhUln: num('uln'),
      });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Protein ratio: ${r.proteinRatio} (>0.5 ${r.criterionProtein ? '✓' : '✗'})` }),
        el('li', { text: `LDH ratio: ${r.ldhRatio} (>0.6 ${r.criterionLdhRatio ? '✓' : '✗'})` }),
        el('li', { text: `Pleural LDH vs ULN: ${r.ldhVsUlnRatio} (>2/3 ${r.criterionLdhVsUln ? '✓' : '✗'})` }),
        el('li', { text: `Classification: ${r.classification}` }),
      ]));
    });
    ['pp', 'sp', 'pl', 'sl', 'uln'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // ----- T7: Mentzer index -----------------------------------------------
  mentzer(root) {
    root.appendChild(field('MCV (fL)', 'mcv'));
    root.appendChild(field('RBC count (×10^12/L = millions/μL)', 'rbc'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = V5.mentzerIndex({ mcvFl: num('mcv'), rbcMillionsPerUl: num('rbc') });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Mentzer index: ${r.index}` }),
        el('li', { text: r.interpretation }),
      ]));
    });
    ['mcv', 'rbc'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // ----- T8: SAAG --------------------------------------------------------
  saag(root) {
    root.appendChild(field('Serum albumin (g/dL)', 'sa'));
    root.appendChild(field('Ascites albumin (g/dL)', 'aa'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = V5.saag({ serumAlbumin: num('sa'), ascitesAlbumin: num('aa') });
      o.appendChild(el('ul', {}, [
        el('li', { text: `SAAG: ${r.saag} g/dL` }),
        el('li', { text: `Classification: ${r.classification}` }),
      ]));
    });
    ['sa', 'aa'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // ----- T9: R-factor (DILI pattern) -------------------------------------
  'r-factor'(root) {
    root.appendChild(field('ALT (U/L)', 'alt'));
    root.appendChild(field('ALT ULN (U/L)', 'altu', { value: 40 }));
    root.appendChild(field('ALP (U/L)', 'alp'));
    root.appendChild(field('ALP ULN (U/L)', 'alpu', { value: 120 }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = V5.rFactorLiver({ alt: num('alt'), altUln: num('altu'), alp: num('alp'), alpUln: num('alpu') });
      o.appendChild(el('ul', {}, [
        el('li', { text: `R: ${r.rFactor}` }),
        el('li', { text: `Pattern: ${r.pattern}` }),
      ]));
    });
    ['alt', 'altu', 'alp', 'alpu'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // ----- T10: KDIGO AKI staging ------------------------------------------
  'kdigo-aki'(root) {
    root.appendChild(field('Baseline serum creatinine (mg/dL)', 'base'));
    root.appendChild(field('Current serum creatinine (mg/dL)', 'cur'));
    root.appendChild(field('Rise in last 48 h (mg/dL, optional)', 'rise'));
    root.appendChild(field('Urine output (mL/kg/h, optional)', 'uo'));
    root.appendChild(field('UO duration (hours, optional)', 'uoh'));
    root.appendChild(field('Anuria duration (hours, default 0)', 'anuria', { value: 0 }));
    root.appendChild(checkField('RRT initiated', 'rrt'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const riseRaw = str('rise'); const uoRaw = str('uo'); const uohRaw = str('uoh');
      const r = V5.kdigoAki({
        baselineCr: num('base'), currentCr: num('cur'),
        riseInLast48h: riseRaw === '' ? null : Number(riseRaw),
        uoMlPerKgPerHour: uoRaw === '' ? null : Number(uoRaw),
        uoDurationHours: uohRaw === '' ? null : Number(uohRaw),
        anuriaHours: num('anuria'),
        rrtInitiated: bool('rrt'),
      });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Creatinine ratio: ${r.creatinineRatio}× baseline` }),
        el('li', { text: `Creatinine sub-stage: ${r.creatinineStage}` }),
        el('li', { text: `Urine output sub-stage: ${r.urineOutputStage}` }),
        el('li', { text: r.interpretation }),
      ]));
    });
    ['base', 'cur', 'rise', 'uo', 'uoh', 'anuria', 'rrt'].forEach((id) => {
      const node = document.getElementById(id);
      node.addEventListener(node.type === 'checkbox' ? 'change' : 'input', run);
    });
  },

  // ----- T11: Modified Sgarbossa -----------------------------------------
  sgarbossa(root) {
    root.appendChild(checkField('Concordant ST elevation ≥ 1 mm in any lead', 'a'));
    root.appendChild(checkField('Concordant ST depression ≥ 1 mm in V1, V2, or V3', 'b'));
    root.appendChild(checkField('ST/S ratio ≤ -0.25 in any lead with discordant ST elevation ≥ 1 mm', 'c'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = V5.modifiedSgarbossa({
        concordantElevation: bool('a'),
        concordantDepressionV1V3: bool('b'),
        stToSRatioBelowMinus025: bool('c'),
      });
      o.appendChild(el('p', { text: `Result: ${r.positive ? 'Positive' : 'Negative'}` }));
      o.appendChild(el('p', { text: r.interpretation }));
    });
    ['a', 'b', 'c'].forEach((id) => document.getElementById(id).addEventListener('change', run));
  },

  // ----- T12: RCRI -------------------------------------------------------
  rcri(root) {
    const factors = [
      ['highRiskSurgery',         'High-risk surgery (suprainguinal vascular, intraperitoneal, intrathoracic)'],
      ['ischemicHeartDisease',    'Ischemic heart disease'],
      ['congestiveHeartFailure',  'History of congestive heart failure'],
      ['cerebrovascularDisease',  'History of cerebrovascular disease (TIA / CVA)'],
      ['insulinDependentDm',      'Insulin-dependent diabetes mellitus'],
      ['creatinineOver2',         'Preoperative creatinine > 2.0 mg/dL'],
    ];
    for (const [id, label] of factors) root.appendChild(checkField(label, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const input = {};
      for (const [id] of factors) input[id] = bool(id);
      const r = V5.rcri(input);
      o.appendChild(el('ul', {}, [
        el('li', { text: `Factors present: ${r.count}` }),
        el('li', { text: `Major adverse cardiac event risk: ${r.majorCardiacEventRiskPct}%` }),
      ]));
    });
    factors.forEach(([id]) => document.getElementById(id).addEventListener('change', run));
  },

  // ----- T13: PEWS -------------------------------------------------------
  pews(root) {
    const subOpts = (id) => selectField(`${id} subscale (0-3)`, id, [0, 1, 2, 3].map((n) => ({ value: String(n), text: String(n) })));
    root.appendChild(subOpts('Behavior'));
    root.appendChild(subOpts('Cardiovascular'));
    root.appendChild(subOpts('Respiratory'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = V5.pews({
        behaviorScore: Number(str('Behavior')),
        cardiovascularScore: Number(str('Cardiovascular')),
        respiratoryScore: Number(str('Respiratory')),
      });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Total: ${r.total}` }),
        el('li', { text: r.band }),
      ]));
    });
    ['Behavior', 'Cardiovascular', 'Respiratory'].forEach((id) => document.getElementById(id).addEventListener('change', run));
  },

  // ----- T14: E/M time selector ------------------------------------------
  'em-time'(root) {
    root.appendChild(selectField('Encounter type', 'enc', [
      { value: 'new',         text: 'New patient (99202-99205)' },
      { value: 'established', text: 'Established patient (99211-99215)' },
    ]));
    root.appendChild(field('Total time on date of encounter (minutes)', 't'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = Code.emTimeSelector({ totalMinutes: num('t'), encounterType: str('enc') });
      if (r.code) {
        o.appendChild(el('p', { text: `Code: ${r.code} (${r.minutes} min, ${r.encounterType} patient)` }));
        if (r.prolongedUnits > 0) {
          o.appendChild(el('p', { text: `+ ${r.prolongedUnits} × 99417 (prolonged service, 15-min units)` }));
        }
      } else {
        o.appendChild(el('p', { text: r.note || 'No code matches.' }));
      }
      o.appendChild(el('p', { class: 'muted', text: 'Time bands per AMA 2021 office/outpatient E/M guidelines. Code descriptors are owned by the AMA and not bundled.' }));
    });
    ['enc', 't'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // ----- T15: NDC converter ----------------------------------------------
  'ndc-convert'(root) {
    root.appendChild(field('NDC (e.g. 1234-5678-90 or 12345-678-90)', 'n', { type: 'text', placeholder: '12345-6789-01' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const v = str('n').trim();
      if (!v) return;
      const r = Code.ndcConvert(v);
      const items = [
        el('li', { text: `Source format: ${r.source}` }),
        el('li', { text: `Billing 11-digit (5-4-2): ${r.billing11}` }),
      ];
      if (r.fda10) {
        items.push(el('li', { text: `FDA 10-digit: ${r.fda10}` }));
      } else if (r.fda10Candidates && r.fda10Candidates.length > 1) {
        items.push(el('li', { text: `FDA 10-digit candidates (ambiguous; verify against the labeler's drug-listing record):` }));
        const sub = el('ul');
        for (const c of r.fda10Candidates) sub.appendChild(el('li', { text: `${c.value} (${c.form})` }));
        items.push(sub);
      } else if (r.fda10Candidates && r.fda10Candidates.length === 0) {
        items.push(el('li', { class: 'muted', text: 'No 10-digit form derivable: no segment carries a leading zero.' }));
      }
      o.appendChild(el('ul', {}, items));
    });
    document.getElementById('n').addEventListener('input', run);
  },

  // ----- T16: AVPU <-> GCS quick reference -------------------------------
  'avpu-gcs'(root) {
    root.appendChild(selectField('AVPU level', 'lvl', [
      { value: 'A', text: 'A — Alert' },
      { value: 'V', text: 'V — Responds to Verbal' },
      { value: 'P', text: 'P — Responds to Pain' },
      { value: 'U', text: 'U — Unresponsive' },
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = V5.avpuToGcs(str('lvl'));
      o.appendChild(el('ul', {}, [
        el('li', { text: `AVPU: ${r.level}` }),
        el('li', { text: `Typical GCS: ${r.typical}` }),
        el('li', { text: `Range: ${r.range[0]}-${r.range[1]}` }),
        el('li', { text: r.note }),
      ]));
      o.appendChild(el('p', { class: 'muted', text: 'AVPU does not finely map to GCS; ranges are approximations.' }));
    });
    document.getElementById('lvl').addEventListener('change', run);
    run();
  },

  // ----- T17: SBAR template ---------------------------------------------
  'sbar-template'(root) {
    root.appendChild(textareaField('S — Situation (who, where, why now)', 's', 3,
      'e.g. Mrs. Chen in 412B, post-op day 1, complaining of chest pressure.'));
    root.appendChild(textareaField('B — Background (relevant history)', 'b', 3,
      'e.g. 68F, CABG yesterday, hx HTN/DM, on aspirin/atorvastatin.'));
    root.appendChild(textareaField('A — Assessment (what you think is happening)', 'a', 3,
      'e.g. Vitals stable but new ST changes on telemetry; concerned for ischemia.'));
    root.appendChild(textareaField('R — Recommendation (what you need)', 'r', 3,
      'e.g. Request bedside evaluation, repeat ECG, troponin.'));
    const o = out(); root.appendChild(o);
    const build = () => {
      const lines = [
        ['Situation',     str('s')],
        ['Background',    str('b')],
        ['Assessment',    str('a')],
        ['Recommendation', str('r')],
      ];
      return lines.map(([h, body]) => `${h}:\n${body || '(blank)'}`).join('\n\n');
    };
    const run = () => safe(o, () => {
      const text = build();
      const pre = el('pre', { class: 'sbar-output' });
      pre.textContent = text;
      o.appendChild(pre);
      const copy = el('button', { type: 'button', class: 'copy-btn' });
      copy.textContent = 'Copy SBAR to clipboard';
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(text); copy.textContent = 'Copied'; setTimeout(() => { copy.textContent = 'Copy SBAR to clipboard'; }, 1500); }
        catch (_e) { copy.textContent = 'Copy failed'; }
      });
      o.appendChild(copy);
    });
    ['s', 'b', 'a', 'r'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // ----- T18: Albumin-corrected anion gap (Figge) -------------------------
  'corrected-anion-gap'(root) {
    root.appendChild(field('Sodium (mEq/L)', 'na', { value: 140 }));
    root.appendChild(field('Chloride (mEq/L)', 'cl', { value: 104 }));
    root.appendChild(field('Bicarbonate / HCO3 (mEq/L)', 'hco3', { value: 24 }));
    root.appendChild(field('Albumin (g/dL)', 'alb', { value: 4.0 }));
    root.appendChild(checkField('Include potassium in AG (some labs do)', 'usek'));
    root.appendChild(field('Potassium (mEq/L, only if box checked)', 'k'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const usek = bool('usek');
      const kRaw = str('k');
      const r = V5.correctedAnionGap({
        na: num('na'), cl: num('cl'), hco3: num('hco3'), albuminGdl: num('alb'),
        includePotassium: usek,
        k: usek ? (kRaw === '' ? null : Number(kRaw)) : null,
      });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Measured AG: ${r.measuredAg} mEq/L` }),
        el('li', { text: `Corrected AG: ${r.correctedAg} mEq/L` }),
        el('li', { text: `Reference: ${r.referenceLow}-${r.referenceHigh} mEq/L` }),
        el('li', { text: r.band }),
        el('li', { class: 'muted', text: r.formulaNote }),
      ]));
    });
    ['na', 'cl', 'hco3', 'alb', 'usek', 'k'].forEach((id) => {
      const node = document.getElementById(id);
      node.addEventListener('input', run);
      node.addEventListener('change', run);
    });
    run();
  },

  // ----- T20: ABCD2 TIA stroke risk score (Johnston Lancet 2007) ----------
  'abcd2'(root) {
    root.appendChild(field('Age (years)', 'age'));
    root.appendChild(field('Systolic BP (mmHg)', 'sbp'));
    root.appendChild(field('Diastolic BP (mmHg)', 'dbp'));
    root.appendChild(selectField('Clinical features', 'clin', [
      { value: 'weakness', text: 'Unilateral weakness (+2)' },
      { value: 'speech',   text: 'Speech disturbance without weakness (+1)' },
      { value: 'other',    text: 'Other (0)' },
    ]));
    root.appendChild(field('Symptom duration (minutes)', 'dur'));
    root.appendChild(checkField('Diabetes (+1)', 'diab'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = V5.abcd2({
        age: num('age'), sbp: num('sbp'), dbp: num('dbp'),
        clinicalFeatures: str('clin'),
        durationMinutes: num('dur'),
        diabetes: bool('diab'),
      });
      o.appendChild(el('ul', {}, [
        el('li', { text: r.interpretation }),
        el('li', { text: `Components: A=${r.components.age} B=${r.components.bp} C=${r.components.clinical} D(time)=${r.components.duration} D(diabetes)=${r.components.diabetes}` }),
        el('li', { class: 'muted', text: `Score bands: 0-3 Low (~1.0%) | 4-5 Moderate (~4.1%) | 6-7 High (~8.1%). ${r.citation}` }),
      ]));
    });
    ['age', 'sbp', 'dbp', 'clin', 'dur', 'diab'].forEach((id) => {
      const node = document.getElementById(id);
      node.addEventListener('input', run);
      node.addEventListener('change', run);
    });
  },

  // ----- T19: HIPAA breach 60-day clock (45 CFR 164.404) ------------------
  'breach-clock'(root) {
    root.appendChild(field('Discovery date (YYYY-MM-DD)', 'd', { type: 'text', placeholder: '2026-03-15' }));
    root.appendChild(field('Affected individuals', 'n', { value: 1 }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = breachNotificationDeadlines({
        discoveryDate: str('d'),
        affectedIndividuals: Math.floor(Number(str('n'))),
      });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Discovery: ${r.discoveryDate}` }),
        el('li', { text: `Affected: ${r.affectedIndividuals} (${r.threshold})` }),
        el('li', { text: `Individual notice deadline: ${r.individualNoticeDeadline}` }),
        r.mediaNoticeDeadline ? el('li', { text: `Media notice deadline: ${r.mediaNoticeDeadline}` }) : null,
        el('li', { text: `HHS notice deadline: ${r.hhsNoticeDeadline}` }),
      ]));
      const recipients = el('ul', {}, r.recipients.map((s) => el('li', { text: s })));
      o.appendChild(el('h3', { text: 'Recipients' }));
      o.appendChild(recipients);
      o.appendChild(el('p', { class: 'muted', text: r.note }));
    });
    ['d', 'n'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },
};
