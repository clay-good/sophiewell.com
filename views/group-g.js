// Group G: Clinical Scoring and Reference (48-60).

import { el, clear } from '../lib/dom.js';
import { loadFile } from '../lib/data.js';
import * as C from '../lib/clinical.js';
import * as S4 from '../lib/scoring-v4.js';
import { renderScreener } from '../lib/screener.js';

function rangeField(label, id, min, max, value) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: `${label} (${min}-${max})` }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'range', min: String(min), max: String(max), value: String(value || min) });
  const out = el('output', { id: `${id}-v`, text: String(value || min) });
  inp.addEventListener('input', () => { out.textContent = inp.value; });
  wrap.appendChild(inp);
  wrap.appendChild(document.createTextNode(' '));
  wrap.appendChild(out);
  return wrap;
}
function checkbox(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(document.createTextNode(' '));
  wrap.appendChild(el('label', { for: id, text: label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function nv(id) { return Number(document.getElementById(id).value); }
function checked(id) { return document.getElementById(id).checked; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }

export const renderers = {
  gcs(root) {
    root.appendChild(rangeField('Eye opening', 'eye', 1, 4, 4));
    root.appendChild(rangeField('Best verbal response', 'verbal', 1, 5, 5));
    root.appendChild(rangeField('Best motor response', 'motor', 1, 6, 6));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.gcs({ eye: nv('eye'), verbal: nv('verbal'), motor: nv('motor') });
      o.appendChild(el('p', { text: `GCS total: ${r.total} (${r.severity})` }));
    });
    ['eye', 'verbal', 'motor'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  apgar(root) {
    for (const k of ['appearance', 'pulse', 'grimace', 'activity', 'respiration']) {
      root.appendChild(rangeField(k.charAt(0).toUpperCase() + k.slice(1), k, 0, 2, 2));
    }
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.apgar({
        appearance: nv('appearance'), pulse: nv('pulse'), grimace: nv('grimace'),
        activity: nv('activity'), respiration: nv('respiration'),
      });
      o.appendChild(el('p', { text: `APGAR: ${r.total} (${r.category})` }));
    });
    ['appearance', 'pulse', 'grimace', 'activity', 'respiration'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  'peds-vitals'(root) {
    const o = out(); root.appendChild(o);
    loadFile('clinical', 'pediatric-vitals.json').then((data) => {
      const sel = el('select', { id: 'pv' });
      for (const b of data.ageBands) sel.appendChild(el('option', { value: b.band, text: b.band }));
      root.insertBefore(el('p', {}, [el('label', { for: 'pv', text: 'Age band' }), el('br'), sel]), o);
      const run = () => {
        clear(o);
        const b = data.ageBands.find((x) => x.band === sel.value);
        o.appendChild(el('ul', {}, [
          el('li', { text: `Heart rate (bpm): ${b.hr}` }),
          el('li', { text: `Respiratory rate (breaths/min): ${b.rr}` }),
          el('li', { text: `Systolic BP (mmHg): ${b.sbp}` }),
        ]));
        o.appendChild(el('p', { class: 'muted', text: data.citation }));
      };
      sel.addEventListener('change', run); run();
    });
  },

  'lab-ranges'(root) {
    const o = out(); root.appendChild(o);
    loadFile('clinical', 'lab-ranges.json').then((data) => {
      const inp = el('input', { id: 'q', type: 'search', placeholder: 'filter, e.g. sodium' });
      root.insertBefore(el('p', {}, [el('label', { for: 'q', text: 'Filter' }), el('br'), inp]), o);
      const run = () => {
        clear(o);
        const q = (inp.value || '').toLowerCase();
        const matches = data.ranges.filter((r) => !q || r.test.toLowerCase().includes(q));
        const tbl = el('table', { class: 'lookup-table' });
        tbl.appendChild(el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Test' }), el('th', { scope: 'col', text: 'Units' }), el('th', { scope: 'col', text: 'Low' }), el('th', { scope: 'col', text: 'High' })])]));
        const tbody = el('tbody');
        for (const r of matches) tbody.appendChild(el('tr', {}, [el('td', { text: r.test }), el('td', { text: r.units }), el('td', { text: String(r.low) }), el('td', { text: String(r.high) })]));
        tbl.appendChild(tbody); o.appendChild(tbl);
        o.appendChild(el('p', { class: 'muted', text: data.citation }));
      };
      inp.addEventListener('input', run); run();
    });
  },

  abg(root) {
    const f = (label, id, ph) => {
      const w = el('p', {}, [el('label', { for: id, text: label }), el('br'),
        el('input', { id, type: 'number', step: 'any', placeholder: ph })]);
      return w;
    };
    root.appendChild(f('pH', 'pH', '7.40'));
    root.appendChild(f('PaCO2 (mmHg)', 'paco2', '40'));
    root.appendChild(f('HCO3 (mEq/L)', 'hco3', '24'));
    root.appendChild(f('PaO2 (mmHg, optional)', 'pao2', '90'));
    root.appendChild(f('FiO2 (0-1, optional)', 'fio2', '0.21'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.abgInterpret({
        pH: nv('pH'), paco2: nv('paco2'), hco3: nv('hco3'),
        pao2: nv('pao2'), fio2: nv('fio2'),
      });
      const items = [el('li', { text: `Primary disorder: ${r.primary}` })];
      if (r.compensation) items.push(el('li', { text: r.compensation }));
      if (r.aaGradient != null) items.push(el('li', { text: `A-a gradient: ${r.aaGradient} mmHg` }));
      if (r.pfRatio != null) items.push(el('li', { text: `P/F ratio: ${r.pfRatio}` }));
      o.appendChild(el('ul', {}, items));
    });
    ['pH', 'paco2', 'hco3', 'pao2', 'fio2'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'wells-pe'(root) {
    const items = [
      ['clinicalDvtSigns', 'Clinical signs of DVT (3)'],
      ['peLikely', 'PE is most likely diagnosis (3)'],
      ['hrOver100', 'Heart rate > 100 (1.5)'],
      ['immobilizationOrSurgery', 'Immobilization or surgery in past 4 weeks (1.5)'],
      ['priorPeOrDvt', 'Prior PE or DVT (1.5)'],
      ['hemoptysis', 'Hemoptysis (1)'],
      ['malignancy', 'Active malignancy (1)'],
    ];
    for (const [id, label] of items) root.appendChild(checkbox(label, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const ans = {}; for (const [id] of items) ans[id] = checked(id);
      const r = C.wellsPe(ans);
      o.appendChild(el('p', { text: `Wells PE total: ${r.total} (${r.category})` }));
    });
    items.forEach(([id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  'wells-dvt'(root) {
    const items = [
      ['activeCancer', 'Active cancer (1)'], ['paralysis', 'Paralysis or recent immobilization of leg (1)'],
      ['recentBedrest', 'Bedridden 3+ days or major surgery in 12 weeks (1)'],
      ['tendernessAlongVeins', 'Localized tenderness along deep vein system (1)'],
      ['entireLegSwollen', 'Entire leg swollen (1)'],
      ['calfSwellingGt3cm', 'Calf swelling > 3 cm vs other leg (1)'],
      ['pittingEdema', 'Pitting edema confined to symptomatic leg (1)'],
      ['collateralVeins', 'Collateral superficial veins (1)'],
      ['priorDvt', 'Previously documented DVT (1)'],
      ['alternativeDxAsLikely', 'Alternative diagnosis as likely or more likely than DVT (-2)'],
    ];
    for (const [id, label] of items) root.appendChild(checkbox(label, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const ans = {}; for (const [id] of items) ans[id] = checked(id);
      const r = C.wellsDvt(ans);
      o.appendChild(el('p', { text: `Wells DVT total: ${r.total} (${r.category})` }));
    });
    items.forEach(([id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  chads(root) {
    const items = [
      ['chf', 'Congestive heart failure (1)'], ['hypertension', 'Hypertension (1)'],
      ['ageGte75', 'Age >= 75 (2)'], ['diabetes', 'Diabetes (1)'],
      ['strokeOrTia', 'Prior stroke or TIA (2)'],
      ['vascularDisease', 'Vascular disease (1)'],
      ['ageGte65', 'Age 65-74 (1)'], ['female', 'Female sex (1)'],
    ];
    for (const [id, label] of items) root.appendChild(checkbox(label, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const ans = {}; for (const [id] of items) ans[id] = checked(id);
      const r = C.chadsVasc(ans);
      o.appendChild(el('p', { text: `CHA2DS2-VASc total: ${r.total}` }));
    });
    items.forEach(([id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  hasbled(root) {
    const items = [
      ['hypertension', 'Hypertension (uncontrolled, SBP >160) (1)'],
      ['abnormalRenal', 'Abnormal renal function (1)'],
      ['abnormalLiver', 'Abnormal liver function (1)'],
      ['stroke', 'Prior stroke (1)'],
      ['bleedingHistory', 'Bleeding history or predisposition (1)'],
      ['labileInr', 'Labile INR (1)'],
      ['ageGt65', 'Age > 65 (1)'],
      ['drugs', 'Drugs predisposing to bleeding (e.g. NSAIDs) (1)'],
      ['alcohol', 'Alcohol >= 8 drinks/week (1)'],
    ];
    for (const [id, label] of items) root.appendChild(checkbox(label, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const ans = {}; for (const [id] of items) ans[id] = checked(id);
      const r = C.hasBled(ans);
      o.appendChild(el('p', { text: `HAS-BLED total: ${r.total} (${r.risk} risk)` }));
    });
    items.forEach(([id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  nihss(root) {
    for (const item of C.NIHSS_ITEMS) root.appendChild(rangeField(`${item.id}: ${item.name}`, item.id, 0, item.max, 0));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const ans = {};
      for (const item of C.NIHSS_ITEMS) ans[item.id] = nv(item.id);
      const r = C.nihss(ans);
      o.appendChild(el('p', { text: `NIHSS total: ${r.total} (${r.severity})` }));
    });
    C.NIHSS_ITEMS.forEach((item) => document.getElementById(item.id).addEventListener('input', run));
    run();
  },

  asa(root) {
    const o = out(); root.appendChild(o);
    loadFile('clinical', 'asa-status.json').then((data) => {
      o.appendChild(el('p', { class: 'muted', text: data.attribution }));
      const ul = el('ul');
      for (const c of data.classes) ul.appendChild(el('li', {}, [el('strong', { text: `Class ${c.class}: ` }), document.createTextNode(c.summary)]));
      o.appendChild(ul);
    });
  },

  mallampati(root) {
    const o = out(); root.appendChild(o);
    loadFile('clinical', 'mallampati.json').then((data) => {
      o.appendChild(el('p', { class: 'muted', text: data.citation }));
      const ul = el('ul');
      for (const c of data.classes) ul.appendChild(el('li', {}, [el('strong', { text: `Class ${c.class}: ` }), document.createTextNode(c.summary)]));
      o.appendChild(ul);
    });
  },

  beers(root) {
    const o = out(); root.appendChild(o);
    loadFile('clinical', 'beers.json').then((data) => {
      const inp = el('input', { id: 'q', type: 'search', placeholder: 'filter by drug or condition' });
      root.insertBefore(el('p', {}, [el('label', { for: 'q', text: 'Filter' }), el('br'), inp]), o);
      const run = () => {
        clear(o);
        o.appendChild(el('p', { class: 'muted', text: data.attribution }));
        const q = (inp.value || '').toLowerCase();
        const tbl = el('table', { class: 'lookup-table' });
        tbl.appendChild(el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Drug' }), el('th', { scope: 'col', text: 'Condition / population' }), el('th', { scope: 'col', text: 'Note (project author)' })])]));
        const tbody = el('tbody');
        for (const p of data.pairs) {
          if (!q || p.drug.toLowerCase().includes(q) || p.condition.toLowerCase().includes(q)) {
            tbody.appendChild(el('tr', {}, [el('td', { text: p.drug }), el('td', { text: p.condition }), el('td', { text: p.note })]));
          }
        }
        tbl.appendChild(tbody); o.appendChild(tbl);
      };
      inp.addEventListener('input', run); run();
    });
  },

  // --- spec-v4 §5: Group G extensions waves 1-2 (utilities 136-145) ----

  timi(root) {
    const items = [
      ['Age >= 65', 'tm-age'], ['>=3 CAD risk factors', 'tm-rf'],
      ['Known CAD (>=50% stenosis)', 'tm-cad'], ['ASA in past 7 days', 'tm-asa'],
      ['Severe angina (>=2 episodes 24h)', 'tm-ang'], ['ST deviation >=0.5mm', 'tm-st'],
      ['Elevated cardiac markers', 'tm-mark'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.timi({
        age65: checked('tm-age'), threeRiskFactors: checked('tm-rf'),
        knownCad50pct: checked('tm-cad'), asaPast7Days: checked('tm-asa'),
        severeAngina: checked('tm-ang'), stDeviation: checked('tm-st'),
        elevatedMarkers: checked('tm-mark'),
      });
      o.appendChild(el('h2', { text: `TIMI ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  grace(root) {
    const fields = [
      ['Age', 'gr-age', 65], ['Heart rate', 'gr-hr', 80], ['SBP (mmHg)', 'gr-sbp', 130],
      ['Creatinine (mg/dL)', 'gr-cr', 1.0],
    ];
    for (const [l, id, v] of fields) {
      const w = el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', step: 'any', value: String(v) }),
      ]);
      root.appendChild(w);
    }
    root.appendChild(el('p', {}, [
      el('label', { for: 'gr-killip', text: 'Killip class (1-4)' }), el('br'),
      el('select', { id: 'gr-killip' }, [1, 2, 3, 4].map((n) => el('option', { value: String(n), text: String(n) }))),
    ]));
    root.appendChild(checkbox('Cardiac arrest at admission', 'gr-arrest'));
    root.appendChild(checkbox('ST-segment deviation', 'gr-st'));
    root.appendChild(checkbox('Abnormal cardiac enzymes', 'gr-enz'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.grace({
        age: nv('gr-age'), heartRate: nv('gr-hr'), sbp: nv('gr-sbp'),
        creatinineMgDl: nv('gr-cr'), killipClass: nv('gr-killip'),
        cardiacArrestAdmission: checked('gr-arrest'),
        stDeviation: checked('gr-st'), abnormalEnzymes: checked('gr-enz'),
      });
      o.appendChild(el('h2', { text: `GRACE ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    ['gr-age', 'gr-hr', 'gr-sbp', 'gr-cr', 'gr-killip', 'gr-arrest', 'gr-st', 'gr-enz']
      .forEach((id) => document.getElementById(id).addEventListener(/^gr-(killip|arrest|st|enz)$/.test(id) ? 'change' : 'input', run));
    run();
  },

  heart(root) {
    const components = [
      ['History (0 slightly suspicious / 1 moderately / 2 highly suspicious)', 'h-hist'],
      ['EKG (0 normal / 1 nonspecific / 2 significant)', 'h-ekg'],
      ['Age (0 <45 / 1 45-64 / 2 >=65)', 'h-age'],
      ['Risk factors (0 none / 1 one or two / 2 >=3)', 'h-rf'],
      ['Troponin (0 normal / 1 1-3x ULN / 2 >3x ULN)', 'h-trop'],
    ];
    for (const [l, id] of components) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('select', { id }, [0, 1, 2].map((n) => el('option', { value: String(n), text: String(n) }))),
      ]));
    }
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.heart({
        history: nv('h-hist'), ekg: nv('h-ekg'), age: nv('h-age'),
        riskFactors: nv('h-rf'), troponin: nv('h-trop'),
      });
      o.appendChild(el('h2', { text: `HEART ${r.score}` })); o.appendChild(el('p', { text: r.band }));
    });
    components.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  perc(root) {
    const items = [
      ['Age >= 50', 'pc-age'], ['HR >= 100', 'pc-hr'], ['SaO2 < 95%', 'pc-sao2'],
      ['Hemoptysis', 'pc-hemo'], ['Estrogen use', 'pc-estrogen'],
      ['Prior VTE', 'pc-vte'], ['Recent surgery / trauma', 'pc-surg'],
      ['Unilateral leg swelling', 'pc-leg'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.perc({
        age50: checked('pc-age'), hr100: checked('pc-hr'), sao2lt95: checked('pc-sao2'),
        hemoptysis: checked('pc-hemo'), estrogen: checked('pc-estrogen'),
        priorVte: checked('pc-vte'), recentSurgery: checked('pc-surg'),
        unilateralLegSwelling: checked('pc-leg'),
      });
      o.appendChild(el('h2', { text: r.score === 0 ? 'PERC negative (0 features)' : `PERC ${r.score} positive features` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  'wells-pe-geneva'(root) {
    root.appendChild(el('h3', { text: 'Wells PE' }));
    const wp = [
      ['Clinical signs of DVT (3)', 'wp-dvt'], ['Alternative dx less likely (3)', 'wp-alt'],
      ['HR > 100 (1.5)', 'wp-hr'], ['Immobilization or surgery <4wk (1.5)', 'wp-immo'],
      ['Prior VTE (1.5)', 'wp-vte'], ['Hemoptysis (1)', 'wp-hemo'], ['Malignancy (1)', 'wp-mal'],
    ];
    for (const [l, id] of wp) root.appendChild(checkbox(l, id));
    root.appendChild(el('h3', { text: 'Revised Geneva' }));
    const gv = [
      ['Age > 65 (1)', 'gv-age'], ['Prior VTE (3)', 'gv-vte'],
      ['Surgery / fracture <1mo (2)', 'gv-surg'], ['Active malignancy (2)', 'gv-mal'],
      ['Unilateral leg pain (3)', 'gv-leg'], ['Hemoptysis (2)', 'gv-hemo'],
    ];
    for (const [l, id] of gv) root.appendChild(checkbox(l, id));
    root.appendChild(el('p', {}, [
      el('label', { for: 'gv-hr', text: 'HR' }), el('br'),
      el('input', { id: 'gv-hr', type: 'number', step: 'any', value: '70' }),
    ]));
    root.appendChild(checkbox('Pain on lower-limb deep palpation + unilateral edema (4)', 'gv-exam'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const w = S4.wellsPe({
        dvtSigns: checked('wp-dvt'), alternativeDxLessLikely: checked('wp-alt'),
        hr100: checked('wp-hr'), immobilization: checked('wp-immo'),
        priorVte: checked('wp-vte'), hemoptysis: checked('wp-hemo'),
        malignancy: checked('wp-mal'),
      });
      const g = S4.geneva({
        age65: checked('gv-age'), priorVte: checked('gv-vte'),
        recentSurgery: checked('gv-surg'), activeMalignancy: checked('gv-mal'),
        unilateralLegPain: checked('gv-leg'), hemoptysis: checked('gv-hemo'),
        hr: nv('gv-hr'), lowerLimbExam: checked('gv-exam'),
      });
      o.appendChild(el('h2', { text: `Wells PE: ${w.score} - ${w.band}` }));
      o.appendChild(el('p', { text: `Geneva: ${g.score} - ${g.band}` }));
    });
    [...wp, ...gv].forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    document.getElementById('gv-hr').addEventListener('input', run);
    document.getElementById('gv-exam').addEventListener('change', run);
    run();
  },

  'curb-65'(root) {
    const items = [
      ['Confusion (new)', 'cu-conf'], ['BUN > 20 mg/dL', 'cu-bun'],
      ['RR >= 30/min', 'cu-rr'], ['SBP < 90 or DBP <= 60', 'cu-bp'],
      ['Age >= 65', 'cu-age'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.curb65({
        confusion: checked('cu-conf'), bun20: checked('cu-bun'),
        rr30: checked('cu-rr'), sbp90OrDbp60: checked('cu-bp'), age65: checked('cu-age'),
      });
      o.appendChild(el('h2', { text: `CURB-65: ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  psi(root) {
    const numFields = [
      ['Age', 'ps-age', 65], ['Temp (°C, optional)', 'ps-t', ''],
      ['pH (optional)', 'ps-ph', ''], ['BUN (mg/dL, optional)', 'ps-bun', ''],
      ['Sodium (optional)', 'ps-na', ''], ['Glucose (optional)', 'ps-g', ''],
      ['Hct (%, optional)', 'ps-hct', ''], ['PaO2 (optional)', 'ps-pao2', ''],
    ];
    for (const [l, id, v] of numFields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', step: 'any', value: String(v) }),
      ]));
    }
    root.appendChild(el('p', {}, [
      el('label', { for: 'ps-sex', text: 'Sex' }), el('br'),
      el('select', { id: 'ps-sex' }, [el('option', { value: 'M', text: 'M' }), el('option', { value: 'F', text: 'F' })]),
    ]));
    const flagItems = [
      ['Nursing home resident', 'ps-nh'], ['Neoplasm', 'ps-neo'], ['Liver disease', 'ps-liv'],
      ['CHF', 'ps-chf'], ['Cerebrovascular disease', 'ps-cva'], ['Renal disease', 'ps-ren'],
      ['Altered mental status', 'ps-am'], ['RR >= 30', 'ps-rr'], ['SBP < 90', 'ps-sbp'],
      ['HR >= 125', 'ps-hr'], ['Pleural effusion', 'ps-pl'],
    ];
    for (const [l, id] of flagItems) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const numOpt = (id) => { const v = document.getElementById(id).value; return v === '' ? null : Number(v); };
    const run = () => safe(o, () => {
      const r = S4.psi({
        age: nv('ps-age'), sex: document.getElementById('ps-sex').value,
        nursingHome: checked('ps-nh'), neoplasm: checked('ps-neo'),
        liverDisease: checked('ps-liv'), chf: checked('ps-chf'),
        cerebrovascular: checked('ps-cva'), renalDisease: checked('ps-ren'),
        alteredMental: checked('ps-am'), rr30: checked('ps-rr'), sbp90: checked('ps-sbp'),
        temp: numOpt('ps-t'), hr125: checked('ps-hr'),
        ph: numOpt('ps-ph'), bun: numOpt('ps-bun'),
        sodium: numOpt('ps-na'), glucose: numOpt('ps-g'),
        hct: numOpt('ps-hct'), pao2: numOpt('ps-pao2'),
        pleuralEffusion: checked('ps-pl'),
      });
      o.appendChild(el('h2', { text: `PSI ${r.score} - ${r.band}` }));
    });
    document.querySelectorAll('input, select').forEach((n) => n.addEventListener(n.type === 'checkbox' || n.tagName === 'SELECT' ? 'change' : 'input', run));
    run();
  },

  'qsofa-sofa'(root) {
    root.appendChild(el('h3', { text: 'qSOFA' }));
    const q = [
      ['RR >= 22/min', 'q-rr'], ['Altered mental status', 'q-am'], ['SBP <= 100', 'q-sbp'],
    ];
    for (const [l, id] of q) root.appendChild(checkbox(l, id));
    root.appendChild(el('h3', { text: 'SOFA (each system 0-4)' }));
    const sf = [
      ['Respiration', 's-resp'], ['Coagulation', 's-coag'], ['Liver', 's-liv'],
      ['Cardiovascular', 's-cv'], ['CNS', 's-cns'], ['Renal', 's-ren'],
    ];
    for (const [l, id] of sf) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('select', { id }, [0, 1, 2, 3, 4].map((n) => el('option', { value: String(n), text: String(n) }))),
      ]));
    }
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const a = S4.qsofa({ rr22: checked('q-rr'), alteredMental: checked('q-am'), sbp100: checked('q-sbp') });
      const b = S4.sofa(Object.fromEntries(sf.map(([, id]) => [
        id === 's-resp' ? 'respiration' : id === 's-coag' ? 'coagulation' : id === 's-liv' ? 'liver' :
        id === 's-cv' ? 'cardiovascular' : id === 's-cns' ? 'cns' : 'renal',
        nv(id),
      ])));
      o.appendChild(el('h2', { text: `qSOFA ${a.score} - ${a.band}` }));
      o.appendChild(el('p', { text: `SOFA ${b.score} - ${b.band}` }));
    });
    [...q, ...sf].forEach(([, id]) => document.getElementById(id).addEventListener(id.startsWith('q-') ? 'change' : 'change', run));
    run();
  },

  'meld-childpugh'(root) {
    root.appendChild(el('h3', { text: 'MELD-3.0' }));
    const numFields = [
      ['Bilirubin (mg/dL)', 'm-bili', 1.0], ['INR', 'm-inr', 1.0],
      ['Creatinine (mg/dL)', 'm-cr', 1.0], ['Sodium (mEq/L)', 'm-na', 137],
      ['Albumin (g/dL)', 'm-alb', 3.5],
    ];
    for (const [l, id, v] of numFields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', step: 'any', value: String(v) }),
      ]));
    }
    root.appendChild(el('p', {}, [
      el('label', { for: 'm-sex', text: 'Sex' }), el('br'),
      el('select', { id: 'm-sex' }, [el('option', { value: 'M', text: 'M' }), el('option', { value: 'F', text: 'F' })]),
    ]));
    root.appendChild(checkbox('Hemodialysis x2 in past week', 'm-dial'));
    root.appendChild(el('h3', { text: 'Child-Pugh' }));
    root.appendChild(el('p', {}, [
      el('label', { for: 'cp-asc', text: 'Ascites' }), el('br'),
      el('select', { id: 'cp-asc' }, [
        el('option', { value: 'none', text: 'None' }),
        el('option', { value: 'mild', text: 'Mild' }),
        el('option', { value: 'severe', text: 'Moderate-severe' }),
      ]),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'cp-enc', text: 'Encephalopathy' }), el('br'),
      el('select', { id: 'cp-enc' }, [
        el('option', { value: 'none', text: 'None' }),
        el('option', { value: 'grade1-2', text: 'Grade 1-2' }),
        el('option', { value: 'grade3-4', text: 'Grade 3-4' }),
      ]),
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const m = S4.meld30({
        bilirubin: nv('m-bili'), inr: nv('m-inr'), creatinine: nv('m-cr'),
        sodium: nv('m-na'), albumin: nv('m-alb'),
        sex: document.getElementById('m-sex').value, hadDialysisTwiceLastWeek: checked('m-dial'),
      });
      const cp = S4.childPugh({
        bilirubin: nv('m-bili'), albumin: nv('m-alb'), inr: nv('m-inr'),
        ascites: document.getElementById('cp-asc').value,
        encephalopathy: document.getElementById('cp-enc').value,
      });
      o.appendChild(el('h2', { text: `MELD-3.0: ${m.score} - ${m.band}` }));
      o.appendChild(el('p', { text: `Child-Pugh: ${cp.score} - ${cp.band}` }));
    });
    document.querySelectorAll('input, select').forEach((n) => n.addEventListener(n.type === 'checkbox' || n.tagName === 'SELECT' ? 'change' : 'input', run));
    run();
  },

  'ranson-bisap'(root) {
    root.appendChild(el('h3', { text: 'Ranson admission criteria' }));
    const ad = [
      ['Age > 55', 'r-age'], ['WBC > 16k', 'r-wbc'], ['Glucose > 200 mg/dL', 'r-glu'],
      ['LDH > 350 IU/L', 'r-ldh'], ['AST > 250 IU/L', 'r-ast'],
    ];
    for (const [l, id] of ad) root.appendChild(checkbox(l, id));
    root.appendChild(el('h3', { text: 'Ranson 48-hour criteria' }));
    const fh = [
      ['Hct drop > 10%', 'r-hct'], ['BUN rise > 5 mg/dL', 'r-bun'],
      ['Calcium < 8 mg/dL', 'r-calc'], ['PaO2 < 60 mmHg', 'r-pao2'],
      ['Base deficit > 4 mEq/L', 'r-base'], ['Fluid sequestration > 6 L', 'r-fluid'],
    ];
    for (const [l, id] of fh) root.appendChild(checkbox(l, id));
    root.appendChild(el('h3', { text: 'BISAP' }));
    const b = [
      ['BUN > 25', 'b-bun'], ['Altered mental status', 'b-am'],
      ['SIRS', 'b-sirs'], ['Age > 60', 'b-age'], ['Pleural effusion', 'b-pl'],
    ];
    for (const [l, id] of b) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.ranson({
        admission: Object.fromEntries(ad.map(([, id]) => [id, checked(id)])),
        fortyEightHour: Object.fromEntries(fh.map(([, id]) => [id, checked(id)])),
      });
      const bs = S4.bisap({
        bun25: checked('b-bun'), alteredMental: checked('b-am'),
        sirs: checked('b-sirs'), age60: checked('b-age'), pleuralEffusion: checked('b-pl'),
      });
      o.appendChild(el('h2', { text: `Ranson ${r.score} - ${r.band}` }));
      o.appendChild(el('p', { text: `BISAP ${bs.score} - ${bs.band}` }));
    });
    [...ad, ...fh, ...b].forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // --- spec-v4 §5: Group G extensions waves 3-4 (utilities 146-156) ----

  centor(root) {
    const items = [
      ['Tonsillar exudate', 'ce-exud'], ['Tender anterior cervical adenopathy', 'ce-aden'],
      ['Fever (history of >38C)', 'ce-fever'], ['Absence of cough', 'ce-cough'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    root.appendChild(el('p', {}, [
      el('label', { for: 'ce-age', text: 'Age (years, McIsaac modifier)' }), el('br'),
      el('input', { id: 'ce-age', type: 'number', step: '1', value: '30' }),
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const args = {
        tonsillarExudate: checked('ce-exud'), tenderAnteriorAdenopathy: checked('ce-aden'),
        feverHistory: checked('ce-fever'), absenceOfCough: checked('ce-cough'),
      };
      const c = S4.centor(args);
      const m = S4.mcisaac({ ...args, ageYears: nv('ce-age') });
      o.appendChild(el('h2', { text: `Centor: ${c.score} - ${c.band}` }));
      o.appendChild(el('p', { text: `McIsaac (age ${nv('ce-age')}): ${m.score} (modifier ${m.ageModifier >= 0 ? '+' : ''}${m.ageModifier}) - ${m.band}` }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    document.getElementById('ce-age').addEventListener('input', run);
    run();
  },

  'wells-dvt-caprini'(root) {
    root.appendChild(el('h3', { text: 'Wells DVT' }));
    const dvtItems = [
      ['Active cancer', 'wd-cancer'], ['Paralysis / recent immobilization', 'wd-paralysis'],
      ['Recently bedridden >3d or surgery <12wk', 'wd-bedrest'], ['Localized tenderness along deep veins', 'wd-tender'],
      ['Entire leg swollen', 'wd-leg'], ['Calf swelling >3 cm', 'wd-calf'],
      ['Pitting edema (greater in symptomatic leg)', 'wd-edema'], ['Collateral superficial veins', 'wd-collat'],
      ['Previously documented DVT', 'wd-prior'], ['Alternative diagnosis as likely or more likely (-2)', 'wd-alt'],
    ];
    for (const [l, id] of dvtItems) root.appendChild(checkbox(l, id));
    root.appendChild(el('h3', { text: 'Caprini items (enter total points)' }));
    root.appendChild(el('p', {}, [
      el('label', { for: 'cap-pts', text: 'Caprini total points' }), el('br'),
      el('input', { id: 'cap-pts', type: 'number', step: '1', value: '0' }),
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      // Wells DVT: most boxes 1 pt; "alternative dx" subtracts 2.
      let s = 0;
      const ones = ['wd-cancer','wd-paralysis','wd-bedrest','wd-tender','wd-leg','wd-calf','wd-edema','wd-collat','wd-prior'];
      for (const id of ones) if (checked(id)) s += 1;
      if (checked('wd-alt')) s -= 2;
      const dvtBand = s >= 3 ? 'High' : s >= 1 ? 'Moderate' : 'Low';
      const cap = S4.caprini({ items: [{ points: nv('cap-pts') }] });
      o.appendChild(el('h2', { text: `Wells DVT: ${s} - ${dvtBand} probability` }));
      o.appendChild(el('p', { text: `Caprini total: ${cap.score} - ${cap.band}` }));
      o.appendChild(el('p', { class: 'muted', text: 'Caprini supports many weighted items; enter total here. Full per-item form may be added later.' }));
    });
    dvtItems.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    document.getElementById('cap-pts').addEventListener('input', run);
    run();
  },

  bishop(root) {
    root.appendChild(el('p', {}, [el('label', { for: 'bp-d', text: 'Dilation (cm)' }), el('br'),
      el('input', { id: 'bp-d', type: 'number', step: 'any', value: '0' })]));
    root.appendChild(el('p', {}, [el('label', { for: 'bp-e', text: 'Effacement (%)' }), el('br'),
      el('input', { id: 'bp-e', type: 'number', step: 'any', value: '0' })]));
    root.appendChild(el('p', {}, [el('label', { for: 'bp-s', text: 'Station (-3 to +2)' }), el('br'),
      el('input', { id: 'bp-s', type: 'number', step: '1', value: '-3' })]));
    root.appendChild(el('p', {}, [el('label', { for: 'bp-c', text: 'Consistency' }), el('br'),
      el('select', { id: 'bp-c' }, [
        el('option', { value: 'firm', text: 'Firm' }),
        el('option', { value: 'medium', text: 'Medium' }),
        el('option', { value: 'soft', text: 'Soft' }),
      ])]));
    root.appendChild(el('p', {}, [el('label', { for: 'bp-p', text: 'Position' }), el('br'),
      el('select', { id: 'bp-p' }, [
        el('option', { value: 'posterior', text: 'Posterior' }),
        el('option', { value: 'mid', text: 'Mid' }),
        el('option', { value: 'anterior', text: 'Anterior' }),
      ])]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.bishop({
        dilation: nv('bp-d'), effacement: nv('bp-e'), station: nv('bp-s'),
        consistency: document.getElementById('bp-c').value,
        position: document.getElementById('bp-p').value,
      });
      o.appendChild(el('h2', { text: `Bishop: ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    ['bp-d','bp-e','bp-s','bp-c','bp-p'].forEach((id) => document.getElementById(id).addEventListener(id.startsWith('bp-c') || id.startsWith('bp-p') ? 'change' : 'input', run));
    run();
  },

  'alvarado-pas'(root) {
    root.appendChild(el('h3', { text: 'Alvarado (MANTRELS)' }));
    const av = [
      ['M - Migration of pain to RLQ', 'a-mig'],
      ['A - Anorexia', 'a-anx'],
      ['N - Nausea / vomiting', 'a-nau'],
      ['T - RLQ Tenderness (+2)', 'a-rlq'],
      ['R - Rebound tenderness', 'a-reb'],
      ['E - Elevated temperature', 'a-temp'],
      ['L - Leukocytosis (+2)', 'a-wbc'],
      ['S - Shift to left', 'a-shift'],
    ];
    for (const [l, id] of av) root.appendChild(checkbox(l, id));
    root.appendChild(el('h3', { text: 'Pediatric Appendicitis Score' }));
    const ps = [
      ['Cough/hop/percussion tenderness (+2)', 'p-cough'], ['RLQ tenderness (+2)', 'p-rlq'],
      ['Migration', 'p-mig'], ['Anorexia', 'p-anx'], ['Fever', 'p-fev'],
      ['Nausea', 'p-nau'], ['Leukocytosis', 'p-wbc'], ['Left shift', 'p-shift'],
    ];
    for (const [l, id] of ps) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const a = S4.alvarado({
        migration: checked('a-mig'), anorexia: checked('a-anx'), nausea: checked('a-nau'),
        rlqTenderness: checked('a-rlq'), reboundTenderness: checked('a-reb'),
        elevatedTemp: checked('a-temp'), leukocytosis: checked('a-wbc'), leftShift: checked('a-shift'),
      });
      const p = S4.pediatricAppendicitis({
        coughHopTenderness: checked('p-cough'), rlqTenderness: checked('p-rlq'),
        migration: checked('p-mig'), anorexia: checked('p-anx'),
        fever: checked('p-fev'), nausea: checked('p-nau'),
        leukocytosis: checked('p-wbc'), leftShift: checked('p-shift'),
      });
      o.appendChild(el('h2', { text: `Alvarado: ${a.score} - ${a.band}` }));
      o.appendChild(el('p', { text: `PAS: ${p.score} - ${p.band}` }));
    });
    [...av, ...ps].forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  mrs(root) {
    const list = el('ol', { class: 'mrs-list', start: '0' });
    for (const r of S4.MRS_DESCRIPTIONS) {
      list.appendChild(el('li', {}, [
        el('strong', { text: `${r.score}: ` }),
        document.createTextNode(r.label),
      ]));
    }
    root.appendChild(el('h2', { text: 'Modified Rankin Scale (mRS) - reference' }));
    root.appendChild(list);
    root.appendChild(el('p', { class: 'muted', text: 'Reference instrument; calculation is investigator-rated, not auto-computed.' }));
  },

  phq9(root) { renderScreener(root, S4.PHQ9_CONFIG); },
  gad7(root) { renderScreener(root, S4.GAD7_CONFIG); },
  auditc(root) { renderScreener(root, S4.AUDITC_CONFIG); },
  cage(root) { renderScreener(root, S4.CAGE_CONFIG); },
  epds(root) { renderScreener(root, S4.EPDS_CONFIG); },
  'mini-cog'(root) {
    root.appendChild(el('p', {}, [
      el('label', { for: 'mc-w', text: 'Words recalled (0-3)' }), el('br'),
      el('input', { id: 'mc-w', type: 'number', step: '1', min: '0', max: '3', value: '0' }),
    ]));
    root.appendChild(checkbox('Clock draw is normal', 'mc-clock'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.miniCog({ wordsRecalled: nv('mc-w'), clockNormal: checked('mc-clock') });
      o.appendChild(el('h2', { text: `Mini-Cog: ${r.score}/5` }));
      o.appendChild(el('p', { text: r.band }));
    });
    document.getElementById('mc-w').addEventListener('input', run);
    document.getElementById('mc-clock').addEventListener('change', run);
    run();
  },

  // --- spec-v4 §5: Group G extensions waves 5-6 (utilities 157-160) ----

  ciwa(root) {
    const items7 = [
      ['Nausea / vomiting (0-7)', 'cw-nau'], ['Tremor (0-7)', 'cw-tre'],
      ['Paroxysmal sweats (0-7)', 'cw-swt'], ['Anxiety (0-7)', 'cw-anx'],
      ['Agitation (0-7)', 'cw-agi'], ['Tactile disturbances (0-7)', 'cw-tac'],
      ['Auditory disturbances (0-7)', 'cw-aud'], ['Visual disturbances (0-7)', 'cw-vis'],
      ['Headache (0-7)', 'cw-hea'],
    ];
    for (const [l, id] of items7) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', min: '0', max: '7', step: '1', value: '0' }),
      ]));
    }
    root.appendChild(el('p', {}, [
      el('label', { for: 'cw-ori', text: 'Orientation / clouding of sensorium (0-4)' }), el('br'),
      el('input', { id: 'cw-ori', type: 'number', min: '0', max: '4', step: '1', value: '0' }),
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.ciwaAr({
        nausea: nv('cw-nau'), tremor: nv('cw-tre'), sweats: nv('cw-swt'),
        anxiety: nv('cw-anx'), agitation: nv('cw-agi'), tactile: nv('cw-tac'),
        auditory: nv('cw-aud'), visual: nv('cw-vis'), headache: nv('cw-hea'),
        orientation: nv('cw-ori'),
      });
      o.appendChild(el('h2', { text: `CIWA-Ar: ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
      o.appendChild(el('p', { class: 'muted', text: 'Screening / monitoring tool. Local protocols govern symptom-triggered medication.' }));
    });
    [...items7.map(([, id]) => id), 'cw-ori'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  cows(root) {
    const items = [
      ['Resting pulse (0/1/2/4)', 'co-pul'], ['Sweating (0-4)', 'co-swt'],
      ['Restlessness (0/1/3/5)', 'co-rest'], ['Pupil size (0/1/2/5)', 'co-pup'],
      ['Bone / joint aches (0/1/2/4)', 'co-jt'], ['Runny nose / tearing (0-4)', 'co-rn'],
      ['GI upset (0/1/2/3/5)', 'co-gi'], ['Tremor (0-4)', 'co-tre'],
      ['Yawning (0-4)', 'co-yaw'], ['Anxiety / irritability (0/1/2/4)', 'co-anx'],
      ['Gooseflesh skin (0/3/5)', 'co-goose'],
    ];
    for (const [l, id] of items) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', min: '0', max: '5', step: '1', value: '0' }),
      ]));
    }
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.cows({
        pulse: nv('co-pul'), sweating: nv('co-swt'), restlessness: nv('co-rest'),
        pupil: nv('co-pup'), jointAches: nv('co-jt'), runnyNose: nv('co-rn'),
        gi: nv('co-gi'), tremor: nv('co-tre'), yawning: nv('co-yaw'),
        anxiety: nv('co-anx'), gooseflesh: nv('co-goose'),
      });
      o.appendChild(el('h2', { text: `COWS: ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  ascvd(root) {
    root.appendChild(el('p', { class: 'notice', text:
      'PCE retains race-stratified equations (white vs African-American). PREVENT 2023 (next tile) is the AHA/ACC race-free successor.' }));
    const num = (l, id, v) => root.appendChild(el('p', {}, [
      el('label', { for: id, text: l }), el('br'),
      el('input', { id, type: 'number', step: 'any', value: String(v) }),
    ]));
    num('Age (40-79)', 'as-age', 55);
    num('Total cholesterol (mg/dL)', 'as-tc', 213);
    num('HDL (mg/dL)', 'as-hdl', 50);
    num('SBP (mmHg)', 'as-sbp', 120);
    root.appendChild(el('p', {}, [
      el('label', { for: 'as-sex', text: 'Sex' }), el('br'),
      el('select', { id: 'as-sex' }, [el('option', { value: 'M', text: 'M' }), el('option', { value: 'F', text: 'F' })]),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'as-race', text: 'Race (PCE-only)' }), el('br'),
      el('select', { id: 'as-race' }, [
        el('option', { value: 'white', text: 'White / Other' }),
        el('option', { value: 'AA', text: 'African-American' }),
      ]),
    ]));
    root.appendChild(checkbox('On treatment for HTN', 'as-trt'));
    root.appendChild(checkbox('Smoker', 'as-smk'));
    root.appendChild(checkbox('Diabetes', 'as-dm'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.ascvdPce({
        age: nv('as-age'), totalChol: nv('as-tc'), hdl: nv('as-hdl'),
        sbp: nv('as-sbp'), sex: document.getElementById('as-sex').value,
        race: document.getElementById('as-race').value,
        treatedSbp: checked('as-trt'), smoker: checked('as-smk'), diabetes: checked('as-dm'),
      });
      if (r.score == null) { o.appendChild(el('p', { text: r.band })); return; }
      o.appendChild(el('h2', { text: `10-year ASCVD risk: ${r.pct.toFixed(1)}% (${r.equation})` }));
      o.appendChild(el('p', { text: r.band }));
    });
    document.querySelectorAll('input, select').forEach((n) => n.addEventListener(n.type === 'checkbox' || n.tagName === 'SELECT' ? 'change' : 'input', run));
    run();
  },

  prevent(root) {
    root.appendChild(el('p', { class: 'notice', text:
      'PREVENT 2023 is race-FREE; this tile takes no race input. Compare with the prior tile (ASCVD PCE) which retains race-stratified equations.' }));
    const num = (l, id, v) => root.appendChild(el('p', {}, [
      el('label', { for: id, text: l }), el('br'),
      el('input', { id, type: 'number', step: 'any', value: String(v) }),
    ]));
    num('Age (30-79)', 'pv-age', 55);
    num('Total cholesterol (mg/dL)', 'pv-tc', 200);
    num('HDL (mg/dL)', 'pv-hdl', 50);
    num('SBP (mmHg)', 'pv-sbp', 120);
    num('BMI (kg/m^2)', 'pv-bmi', 25);
    num('eGFR (mL/min/1.73m^2)', 'pv-egfr', 90);
    root.appendChild(el('p', {}, [
      el('label', { for: 'pv-sex', text: 'Sex' }), el('br'),
      el('select', { id: 'pv-sex' }, [el('option', { value: 'M', text: 'M' }), el('option', { value: 'F', text: 'F' })]),
    ]));
    root.appendChild(checkbox('On treatment for HTN', 'pv-trt'));
    root.appendChild(checkbox('Smoker', 'pv-smk'));
    root.appendChild(checkbox('Diabetes', 'pv-dm'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.prevent10yr({
        age: nv('pv-age'), totalChol: nv('pv-tc'), hdl: nv('pv-hdl'),
        sbp: nv('pv-sbp'), bmi: nv('pv-bmi'), egfr: nv('pv-egfr'),
        sex: document.getElementById('pv-sex').value,
        treatedSbp: checked('pv-trt'), smoker: checked('pv-smk'), diabetes: checked('pv-dm'),
      });
      if (r.score == null) { o.appendChild(el('p', { text: r.band })); return; }
      o.appendChild(el('h2', { text: `10-year total CVD risk: ${r.pct.toFixed(1)}% (PREVENT 2023)` }));
      o.appendChild(el('p', { text: r.band }));
    });
    document.querySelectorAll('input, select').forEach((n) => n.addEventListener(n.type === 'checkbox' || n.tagName === 'SELECT' ? 'change' : 'input', run));
    run();
  },
};
