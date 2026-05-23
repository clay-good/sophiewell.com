// Group G: Clinical Scoring and Reference (48-60).

import { el, clear } from '../lib/dom.js';
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

  // peds-vitals removed in spec-v29 wave 29-2 (Group G non-scores): static reference table.
  // lab-ranges removed in spec-v29 wave 29-2 (Group K/O): static table.

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

  // asa, mallampati, beers removed in spec-v29 wave 29-2 (Group G non-scores): static reference tables.

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

  // mrs removed in spec-v29 wave 29-2 (Group G non-scores): static reference table.

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

  // spec-v12 §3.1.1: NEWS2 (Royal College of Physicians, 2017).
  news2(root) {
    const numFields = [
      ['Respiratory rate (breaths/min)', 'n2-rr', '14'],
      ['SpO2 (%)', 'n2-spo2', '98'],
      ['Systolic BP (mmHg)', 'n2-sbp', '124'],
      ['Pulse (beats/min)', 'n2-pulse', '78'],
      ['Temperature (°C)', 'n2-temp', '37.0'],
    ];
    for (const [l, id, v] of numFields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', step: 'any', value: String(v) }),
      ]));
    }
    root.appendChild(checkbox('Use Scale 2 (hypercapnic / chronic Type II respiratory failure) per RCP 2017 §3.4', 'n2-scale2'));
    root.appendChild(checkbox('On supplemental oxygen', 'n2-o2'));
    root.appendChild(el('p', {}, [
      el('label', { for: 'n2-acvpu', text: 'Consciousness (ACVPU)' }), el('br'),
      el('select', { id: 'n2-acvpu' }, [
        el('option', { value: 'A', text: 'A - Alert' }),
        el('option', { value: 'C', text: 'C - new Confusion' }),
        el('option', { value: 'V', text: 'V - responds to Voice' }),
        el('option', { value: 'P', text: 'P - responds to Pain' }),
        el('option', { value: 'U', text: 'U - Unresponsive' }),
      ]),
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.news2({
        rr: nv('n2-rr'), spo2: nv('n2-spo2'),
        scale2: checked('n2-scale2'), onO2: checked('n2-o2'),
        sbp: nv('n2-sbp'), pulse: nv('n2-pulse'),
        acvpu: document.getElementById('n2-acvpu').value,
        temp: nv('n2-temp'),
      });
      o.appendChild(el('h2', { text: `NEWS2 ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
      const p = r.parts;
      o.appendChild(el('p', { class: 'muted',
        text: `Per-parameter: RR ${p.rr}, SpO2 ${p.spo2}, supplemental O2 ${p.supplementalO2}, SBP ${p.sbp}, pulse ${p.pulse}, consciousness ${p.consciousness}, temperature ${p.temp}.` }));
    });
    document.querySelectorAll('input, select').forEach((n) => n.addEventListener(n.type === 'checkbox' || n.tagName === 'SELECT' ? 'change' : 'input', run));
    run();
  },

  // spec-v12 §3.2.1: PESI (Aujesky et al. AJRCCM 2005).
  pesi(root) {
    root.appendChild(el('p', {}, [
      el('label', { for: 'pe-age', text: 'Age (years)' }), el('br'),
      el('input', { id: 'pe-age', type: 'number', step: '1', min: '0', value: '50' }),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'pe-sex', text: 'Sex' }), el('br'),
      el('select', { id: 'pe-sex' }, [
        el('option', { value: 'F', text: 'F' }),
        el('option', { value: 'M', text: 'M' }),
      ]),
    ]));
    const items = [
      ['History of cancer', 'pe-ca'],
      ['History of heart failure', 'pe-hf'],
      ['History of chronic lung disease', 'pe-cld'],
      ['Pulse >= 110', 'pe-hr'],
      ['SBP < 100', 'pe-sbp'],
      ['Respiratory rate >= 30', 'pe-rr'],
      ['Temperature < 36 °C', 'pe-tmp'],
      ['Altered mental status', 'pe-ams'],
      ['SaO2 < 90% on room air', 'pe-sao2'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.pesi({
        age: nv('pe-age'),
        sex: document.getElementById('pe-sex').value,
        cancer: checked('pe-ca'),
        heartFailure: checked('pe-hf'),
        chronicLungDisease: checked('pe-cld'),
        hr110: checked('pe-hr'),
        sbp100: checked('pe-sbp'),
        rr30: checked('pe-rr'),
        tempLt36: checked('pe-tmp'),
        alteredMental: checked('pe-ams'),
        sao2Lt90: checked('pe-sao2'),
      });
      o.appendChild(el('h2', { text: `PESI ${r.score} - Class ${r.class}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    document.querySelectorAll('input, select').forEach((n) => n.addEventListener(n.type === 'checkbox' || n.tagName === 'SELECT' ? 'change' : 'input', run));
    run();
  },

  // spec-v12 §3.2.2: sPESI (Jimenez et al. Arch Intern Med 2010).
  spesi(root) {
    const items = [
      ['Age > 80', 'sp-age80'],
      ['History of cancer', 'sp-ca'],
      ['Chronic cardiopulmonary disease', 'sp-ccp'],
      ['Pulse >= 110', 'sp-hr'],
      ['SBP < 100', 'sp-sbp'],
      ['SaO2 < 90%', 'sp-sao2'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.spesi({
        ageOver80: checked('sp-age80'),
        cancer: checked('sp-ca'),
        chronicCardiopulmonary: checked('sp-ccp'),
        hr110: checked('sp-hr'),
        sbp100: checked('sp-sbp'),
        sao2Lt90: checked('sp-sao2'),
      });
      o.appendChild(el('h2', { text: `sPESI ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v12 §3.2.3: Padua Prediction Score (Barbar et al. JTH 2010).
  padua(root) {
    const items = [
      ['Active cancer (3 pts)', 'pa-ca'],
      ['Prior VTE (3 pts)', 'pa-vte'],
      ['Reduced mobility (3 pts)', 'pa-mob'],
      ['Known thrombophilia (3 pts)', 'pa-thr'],
      ['Recent (<=1 month) trauma or surgery (2 pts)', 'pa-trauma'],
      ['Age >= 70 (1 pt)', 'pa-age'],
      ['Heart and/or respiratory failure (1 pt)', 'pa-hf'],
      ['Acute MI or ischemic stroke (1 pt)', 'pa-mi'],
      ['Acute infection / rheumatologic disorder (1 pt)', 'pa-inf'],
      ['BMI >= 30 (1 pt)', 'pa-bmi'],
      ['Ongoing hormonal treatment (1 pt)', 'pa-horm'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.padua({
        activeCancer: checked('pa-ca'),
        priorVte: checked('pa-vte'),
        reducedMobility: checked('pa-mob'),
        thrombophilia: checked('pa-thr'),
        recentTrauma: checked('pa-trauma'),
        ageOver70: checked('pa-age'),
        heartOrRespFailure: checked('pa-hf'),
        miOrStroke: checked('pa-mi'),
        acuteInfectionOrRheum: checked('pa-inf'),
        bmi30: checked('pa-bmi'),
        hormonalTreatment: checked('pa-horm'),
      });
      o.appendChild(el('h2', { text: `Padua ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v12 §3.1.2: MEWS (Subbe et al. QJM 2001).
  mews(root) {
    const numFields = [
      ['Systolic BP (mmHg)', 'me-sbp', '120'],
      ['Pulse (beats/min)', 'me-pulse', '78'],
      ['Respiratory rate (breaths/min)', 'me-rr', '14'],
      ['Temperature (°C)', 'me-temp', '37.0'],
    ];
    for (const [l, id, v] of numFields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', step: 'any', value: String(v) }),
      ]));
    }
    root.appendChild(el('p', {}, [
      el('label', { for: 'me-avpu', text: 'Consciousness (AVPU)' }), el('br'),
      el('select', { id: 'me-avpu' }, [
        el('option', { value: 'A', text: 'A - Alert' }),
        el('option', { value: 'V', text: 'V - responds to Voice' }),
        el('option', { value: 'P', text: 'P - responds to Pain' }),
        el('option', { value: 'U', text: 'U - Unresponsive' }),
      ]),
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.mews({
        sbp: nv('me-sbp'), pulse: nv('me-pulse'),
        rr: nv('me-rr'), temp: nv('me-temp'),
        avpu: document.getElementById('me-avpu').value,
      });
      o.appendChild(el('h2', { text: `MEWS ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
      const p = r.parts;
      o.appendChild(el('p', { class: 'muted',
        text: `Per-parameter: SBP ${p.sbp}, pulse ${p.pulse}, RR ${p.rr}, temperature ${p.temp}, AVPU ${p.avpu}.` }));
    });
    document.querySelectorAll('input, select').forEach((n) => n.addEventListener(n.type === 'checkbox' || n.tagName === 'SELECT' ? 'change' : 'input', run));
    run();
  },

  // spec-v12 §3.3.1: Glasgow-Blatchford (Blatchford 2000).
  gbs(root) {
    const numFields = [
      ['BUN (mg/dL)', 'gb-bun', '14'],
      ['Hemoglobin (g/dL)', 'gb-hgb', '15'],
      ['Systolic BP (mmHg)', 'gb-sbp', '120'],
    ];
    for (const [l, id, v] of numFields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', step: 'any', value: String(v) }),
      ]));
    }
    root.appendChild(el('p', {}, [
      el('label', { for: 'gb-sex', text: 'Sex (Blatchford 2000 Table 1 weights hemoglobin separately)' }), el('br'),
      el('select', { id: 'gb-sex' }, [
        el('option', { value: 'M', text: 'M' }),
        el('option', { value: 'F', text: 'F' }),
      ]),
    ]));
    const items = [
      ['Pulse >= 100', 'gb-pulse'],
      ['Melena', 'gb-mel'],
      ['Recent syncope', 'gb-syn'],
      ['Hepatic disease', 'gb-hep'],
      ['Cardiac failure', 'gb-cf'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.gbs({
        bunMgDl: nv('gb-bun'),
        hgbGdl: nv('gb-hgb'),
        sex: document.getElementById('gb-sex').value,
        sbp: nv('gb-sbp'),
        pulse100: checked('gb-pulse'),
        melena: checked('gb-mel'),
        syncope: checked('gb-syn'),
        hepaticDisease: checked('gb-hep'),
        cardiacFailure: checked('gb-cf'),
      });
      o.appendChild(el('h2', { text: `GBS ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
      const p = r.parts;
      o.appendChild(el('p', { class: 'muted',
        text: `Per-parameter: BUN ${p.bun}, hemoglobin ${p.hgb}, SBP ${p.sbp}, pulse ${p.pulse}, melena ${p.melena}, syncope ${p.syncope}, hepatic disease ${p.hepaticDisease}, cardiac failure ${p.cardiacFailure}.` }));
    });
    document.querySelectorAll('input, select').forEach((n) => n.addEventListener(n.type === 'checkbox' || n.tagName === 'SELECT' ? 'change' : 'input', run));
    run();
  },

  // spec-v12 §3.3.2: Rockall (Rockall 1996).
  rockall(root) {
    const selects = [
      ['Age band', 'rk-age', [['0', '<60'], ['1', '60-79'], ['2', '>=80']]],
      ['Shock', 'rk-shock', [['0', 'None'], ['1', 'Tachycardia (HR>=100, SBP>=100)'], ['2', 'Hypotension (SBP<100)']]],
      ['Comorbidity', 'rk-co', [['0', 'None'], ['2', 'CHF / IHD / major morbidity'], ['3', 'Renal or hepatic failure, or metastatic CA']]],
      ['Endoscopic diagnosis (post-endoscopy only)', 'rk-dx', [['0', 'Mallory-Weiss or no lesion'], ['1', 'All other diagnoses'], ['2', 'Upper GI malignancy']]],
      ['Stigmata of recent hemorrhage (post-endoscopy only)', 'rk-stig', [['0', 'Clean base or dark spot'], ['2', 'Blood, adherent clot, or visible/spurting vessel']]],
    ];
    for (const [l, id, opts] of selects) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('select', { id }, opts.map(([v, t]) => el('option', { value: v, text: t }))),
      ]));
    }
    root.appendChild(checkbox('Use pre-endoscopy variant (Vreeburg 1999 / NICE CG141; omits endoscopic dx and stigmata)', 'rk-pre'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.rockall({
        ageBand: nv('rk-age'),
        shock: nv('rk-shock'),
        comorbidity: nv('rk-co'),
        endoscopicDx: nv('rk-dx'),
        stigmata: nv('rk-stig'),
        preEndoscopy: checked('rk-pre'),
      });
      o.appendChild(el('h2', { text: `${r.preEndoscopy ? 'Pre-endoscopy' : 'Complete'} Rockall: ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    document.querySelectorAll('input, select').forEach((n) => n.addEventListener(n.type === 'checkbox' || n.tagName === 'SELECT' ? 'change' : 'input', run));
    run();
  },

  // spec-v12 §3.3.3: AIMS65 (Saltzman 2011).
  aims65(root) {
    const items = [
      ['Albumin < 3.0 g/dL (A)', 'am-alb'],
      ['INR > 1.5 (I)', 'am-inr'],
      ['Altered mental status (M)', 'am-am'],
      ['SBP <= 90 mmHg (S)', 'am-sbp'],
      ['Age > 65 (65)', 'am-age'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.aims65({
        albuminLt3: checked('am-alb'),
        inrGt15: checked('am-inr'),
        alteredMental: checked('am-am'),
        sbpLe90: checked('am-sbp'),
        ageGt65: checked('am-age'),
      });
      o.appendChild(el('h2', { text: `AIMS65 ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v12 §3.3.4: Oakland Score (Oakland 2017).
  oakland(root) {
    const numFields = [
      ['Age (years)', 'ok-age', '50'],
      ['Pulse (beats/min)', 'ok-hr', '78'],
      ['Systolic BP (mmHg)', 'ok-sbp', '130'],
      ['Hemoglobin (g/dL)', 'ok-hgb', '14'],
    ];
    for (const [l, id, v] of numFields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', step: 'any', value: String(v) }),
      ]));
    }
    root.appendChild(el('p', {}, [
      el('label', { for: 'ok-sex', text: 'Sex' }), el('br'),
      el('select', { id: 'ok-sex' }, [
        el('option', { value: 'F', text: 'F' }),
        el('option', { value: 'M', text: 'M' }),
      ]),
    ]));
    root.appendChild(checkbox('Previous LGIB admission', 'ok-prior'));
    root.appendChild(checkbox('Blood on digital rectal examination', 'ok-dre'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.oakland({
        age: nv('ok-age'),
        sex: document.getElementById('ok-sex').value,
        priorLgibAdmission: checked('ok-prior'),
        dreBlood: checked('ok-dre'),
        hr: nv('ok-hr'),
        sbp: nv('ok-sbp'),
        hgbGdl: nv('ok-hgb'),
      });
      o.appendChild(el('h2', { text: `Oakland ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
      const p = r.parts;
      o.appendChild(el('p', { class: 'muted',
        text: `Per-parameter: age ${p.age}, sex ${p.sex}, prior LGIB ${p.priorLgibAdmission}, DRE blood ${p.dreBlood}, HR ${p.hr}, SBP ${p.sbp}, hemoglobin ${p.hgb}.` }));
    });
    document.querySelectorAll('input, select').forEach((n) => n.addEventListener(n.type === 'checkbox' || n.tagName === 'SELECT' ? 'change' : 'input', run));
    run();
  },

  // spec-v12 §3.4.3 wave 12-4: Maddrey DF + Lille Model (alcoholic hepatitis).
  'maddrey-lille'(root) {
    root.appendChild(el('h3', { text: 'Maddrey Discriminant Function (Maddrey 1978)' }));
    const dfFields = [
      ['Patient PT (sec)', 'ml-pt', '20'],
      ['Control PT (sec)', 'ml-ctrl', '12'],
      ['Bilirubin (mg/dL)', 'ml-bili', '10'],
    ];
    for (const [l, id, v] of dfFields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', step: 'any', value: String(v) }),
      ]));
    }
    root.appendChild(el('h3', { text: 'Lille Model (Louvet 2007; interpret only after >= 7 days of steroids in a DF >= 32 patient)' }));
    const lilleFields = [
      ['Age (years)', 'ml-age', '50'],
      ['Albumin (g/dL)', 'ml-alb', '3.0'],
      ['Creatinine (mg/dL)', 'ml-cr', '0.9'],
      ['Bilirubin day 0 (mg/dL)', 'ml-b0', '10'],
      ['Bilirubin day 7 (mg/dL)', 'ml-b7', '6'],
      ['Prothrombin time (sec)', 'ml-ptl', '20'],
    ];
    for (const [l, id, v] of lilleFields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', step: 'any', value: String(v) }),
      ]));
    }
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const df = S4.maddreyDf({
        patientPtSec: nv('ml-pt'),
        controlPtSec: nv('ml-ctrl'),
        bilirubinMgDl: nv('ml-bili'),
      });
      o.appendChild(el('h2', { text: `Maddrey DF: ${df.df.toFixed(1)}` }));
      o.appendChild(el('p', { text: df.band }));
      const li = S4.lille({
        ageYears: nv('ml-age'),
        albuminGDl: nv('ml-alb'),
        creatinineMgDl: nv('ml-cr'),
        bilirubinDay0MgDl: nv('ml-b0'),
        bilirubinDay7MgDl: nv('ml-b7'),
        ptSec: nv('ml-ptl'),
      });
      o.appendChild(el('h2', { text: `Lille Model: ${li.score.toFixed(3)}` }));
      o.appendChild(el('p', { text: li.band }));
      o.appendChild(el('p', { class: 'muted', text: 'Lille is only interpretable in the context of corticosteroid therapy initiated for severe alcoholic hepatitis (Maddrey DF >= 32) per Louvet 2007.' }));
    });
    document.querySelectorAll('input').forEach((n) => n.addEventListener('input', run));
    run();
  },

  // spec-v12 §3.5.1 wave 12-5: Canadian CT Head Rule (Stiell 2001).
  cthr(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Apply only to GCS 13-15 blunt head injury with witnessed LOC, definite amnesia, or witnessed disorientation (Stiell 2001 §Methods).' }));
    root.appendChild(el('h3', { text: 'High-risk criteria (neurosurgical-intervention concern)' }));
    const high = [
      ['GCS < 15 at 2 hours post-injury', 'ct-h1'],
      ['Suspected open or depressed skull fracture', 'ct-h2'],
      ['Any sign of basal skull fracture', 'ct-h3'],
      ['Vomiting >= 2 episodes', 'ct-h4'],
      ['Age >= 65', 'ct-h5'],
    ];
    for (const [l, id] of high) root.appendChild(checkbox(l, id));
    root.appendChild(el('h3', { text: 'Medium-risk criteria (clinically important brain injury concern)' }));
    const medium = [
      ['Retrograde amnesia >= 30 minutes', 'ct-m1'],
      ['Dangerous mechanism (pedestrian struck, ejection, fall > 3 feet / 5 stairs)', 'ct-m2'],
    ];
    for (const [l, id] of medium) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const anyHigh = high.some(([, id]) => checked(id));
      const anyMedium = medium.some(([, id]) => checked(id));
      const r = S4.cthr({ highRisk: anyHigh, mediumRisk: anyMedium });
      o.appendChild(el('h2', { text: r.ctRecommended ? 'CT recommended' : 'CT not required' }));
      o.appendChild(el('p', { text: r.band }));
    });
    [...high, ...medium].forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v12 §3.5.2 wave 12-5: Canadian C-Spine Rule (Stiell 2001).
  ccsr(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Apply only to alert (GCS 15) stable trauma patients with neck pain or visible injury above the clavicles, non-ambulatory, or with dangerous mechanism (Stiell 2001 §Methods). Ships side by side with the existing NEXUS + Canadian C-Spine tile.' }));
    root.appendChild(el('h3', { text: 'Step 1: any high-risk factor? (yes -> image)' }));
    const high = [
      ['Age >= 65', 'cs-h1'],
      ['Dangerous mechanism (fall >= 1 m / 5 stairs, axial load, MVC >100 kph or rollover/ejection, motorized recreational vehicle, bicycle collision)', 'cs-h2'],
      ['Paresthesias in extremities', 'cs-h3'],
    ];
    for (const [l, id] of high) root.appendChild(checkbox(l, id));
    root.appendChild(el('h3', { text: 'Step 2: any low-risk factor that allows safe range-of-motion assessment?' }));
    const low = [
      ['Simple rear-end MVC', 'cs-l1'],
      ['Sitting position in ED', 'cs-l2'],
      ['Ambulatory at any time', 'cs-l3'],
      ['Delayed onset of neck pain', 'cs-l4'],
      ['Absence of midline c-spine tenderness', 'cs-l5'],
    ];
    for (const [l, id] of low) root.appendChild(checkbox(l, id));
    root.appendChild(el('h3', { text: 'Step 3: range of motion' }));
    root.appendChild(checkbox('Able to actively rotate neck 45 degrees left and right', 'cs-rot'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const anyHigh = high.some(([, id]) => checked(id));
      const anyLow = low.some(([, id]) => checked(id));
      const canRotate = checked('cs-rot');
      const r = S4.ccsr({ highRisk: anyHigh, lowRisk: anyLow, canRotate45: canRotate });
      o.appendChild(el('h2', { text: r.imagingRecommended ? 'Imaging recommended' : 'Imaging not required' }));
      o.appendChild(el('p', { text: r.band }));
    });
    [...high, ...low, ['', 'cs-rot']].forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v12 §3.5.3 wave 12-5: PECARN Pediatric Head Injury Rule (Kuppermann 2009).
  'pecarn-head'(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Two branches by age. Apply to children <18 with GCS 14-15 within 24 hours of blunt head trauma (Kuppermann 2009 §Methods).' }));
    root.appendChild(el('p', {}, [
      el('label', { for: 'ph-age', text: 'Age (years)' }), el('br'),
      el('input', { id: 'ph-age', type: 'number', step: 'any', value: '5' }),
    ]));
    root.appendChild(el('h3', { text: 'High-risk predictors (any present -> high risk; CT recommended)' }));
    const high = [
      ['GCS = 15 (uncheck if GCS 14 or other AMS)', 'ph-gcs15'],
      ['Palpable skull fracture (age <2 only)', 'ph-skfx'],
      ['Signs of basal skull fracture (age >=2)', 'ph-basal'],
      ['Other signs of altered mental status (agitation, somnolence, repetitive questioning, slow response)', 'ph-ams'],
    ];
    for (const [l, id] of high) {
      const cb = checkbox(l, id);
      if (id === 'ph-gcs15') cb.querySelector('input').checked = true;
      root.appendChild(cb);
    }
    root.appendChild(el('h3', { text: 'Intermediate-risk predictors' }));
    const med = [
      ['LOC >= 5 seconds (age <2) / any LOC (age >=2)', 'ph-loc'],
      ['Vomiting (age >=2 only)', 'ph-vom'],
      ['Severe mechanism (MVC with ejection / death / rollover; pedestrian/bicycle w/o helmet vs motorized vehicle; fall >0.9 m (<2) / >1.5 m (>=2); head struck by high-impact object)', 'ph-mech'],
      ['Occipital, parietal, or temporal scalp hematoma (age <2 only; non-frontal)', 'ph-opt'],
      ['Not acting normally per parent (age <2 only)', 'ph-acting'],
      ['Severe headache (age >=2 only)', 'ph-hd'],
    ];
    for (const [l, id] of med) {
      const cb = checkbox(l, id);
      if (id === 'ph-acting') cb.querySelector('input').checked = true;
      root.appendChild(cb);
    }
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.pecarnHead({
        ageYears: nv('ph-age'),
        gcs15: checked('ph-gcs15'),
        palpableSkullFx: checked('ph-skfx'),
        basalSkullFxSigns: checked('ph-basal'),
        ams: checked('ph-ams'),
        locSec: checked('ph-loc') ? 5 : 0,
        vomiting: checked('ph-vom'),
        severeMechanism: checked('ph-mech'),
        occipitalParietalTemporalHematoma: checked('ph-opt'),
        notActingNormally: !checked('ph-acting'),
        severeHeadache: checked('ph-hd'),
      });
      o.appendChild(el('h2', { text: `PECARN risk tier: ${r.tier}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    document.querySelectorAll('input').forEach((n) => n.addEventListener(n.type === 'checkbox' ? 'change' : 'input', run));
    run();
  },

  // spec-v12 §3.5.4 wave 12-5: Ottawa Ankle Rules (Stiell 1992).
  'ottawa-ankle'(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Rule for patients >= 18 with ankle or midfoot injury within 10 days. Pediatric Plint 1999 variant deferred to a future spec.' }));
    root.appendChild(el('h3', { text: 'Malleolar zone' }));
    root.appendChild(checkbox('Pain in malleolar zone', 'oa-mp'));
    const ankle = [
      ['Tenderness at posterior edge or tip of lateral malleolus (distal 6 cm)', 'oa-lat'],
      ['Tenderness at posterior edge or tip of medial malleolus (distal 6 cm)', 'oa-med'],
      ['Inability to bear weight 4 steps immediately and in the ED', 'oa-abw'],
    ];
    for (const [l, id] of ankle) root.appendChild(checkbox(l, id));
    root.appendChild(el('h3', { text: 'Midfoot zone' }));
    root.appendChild(checkbox('Pain in midfoot zone', 'oa-fp'));
    const foot = [
      ['Tenderness at base of 5th metatarsal', 'oa-fmt'],
      ['Tenderness at navicular', 'oa-nav'],
      ['Inability to bear weight 4 steps immediately and in the ED', 'oa-fbw'],
    ];
    for (const [l, id] of foot) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.ottawaAnkle({
        malleolarPain: checked('oa-mp'),
        lateralMalleolusTender: checked('oa-lat'),
        medialMalleolusTender: checked('oa-med'),
        ankleCannotBearWeight: checked('oa-abw'),
        midfootPain: checked('oa-fp'),
        fifthMetatarsalTender: checked('oa-fmt'),
        navicularTender: checked('oa-nav'),
        footCannotBearWeight: checked('oa-fbw'),
      });
      o.appendChild(el('h2', { text: r.ankleXray || r.footXray ? 'Imaging indicated' : 'No imaging indicated' }));
      o.appendChild(el('p', { text: r.band }));
    });
    document.querySelectorAll('input').forEach((n) => n.addEventListener('change', run));
    run();
  },

  // spec-v12 §3.5.5 wave 12-5: Ottawa SAH Rule (Perry 2013).
  'ottawa-sah'(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Apply only to alert patients >= 15 with new severe non-traumatic headache peaking within 1 hour. Exclusions per Perry 2013 §Methods are surfaced first.' }));
    root.appendChild(el('h3', { text: 'Exclusion check' }));
    root.appendChild(checkbox('Any exclusion present (new neurologic deficit, prior aneurysm / SAH / brain tumor, recurrent identical-pattern headaches, or age <15)', 'os-excl'));
    root.appendChild(el('h3', { text: 'Six clinical criteria (any positive -> cannot rule out SAH)' }));
    const items = [
      ['Age >= 40', 'os-age'],
      ['Neck pain or stiffness', 'os-neck'],
      ['Witnessed loss of consciousness', 'os-loc'],
      ['Onset during exertion', 'os-ex'],
      ['Thunderclap headache (peak intensity within 1 second)', 'os-tc'],
      ['Limited neck flexion on exam', 'os-flex'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.ottawaSah({
        exclusionCriteriaPresent: checked('os-excl'),
        ageGe40: checked('os-age'),
        neckPainOrStiffness: checked('os-neck'),
        witnessedLoc: checked('os-loc'),
        onsetDuringExertion: checked('os-ex'),
        thunderclapHeadache: checked('os-tc'),
        limitedNeckFlexion: checked('os-flex'),
      });
      o.appendChild(el('h2', { text: r.applicable === false ? 'Rule does not apply' : r.cannotRuleOut ? 'Cannot rule out SAH' : 'Rule out SAH' }));
      o.appendChild(el('p', { text: r.band }));
    });
    document.querySelectorAll('input').forEach((n) => n.addEventListener('change', run));
    run();
  },

  // spec-v12 §3.6.1 wave 12-6: HOSPITAL Score (Donze 2013).
  'hospital-score'(root) {
    const items = [
      ['Hemoglobin < 12 g/dL at discharge (1)', 'hs-hgb'],
      ['Discharge from oncology service (2)', 'hs-onc'],
      ['Sodium < 135 mEq/L at discharge (1)', 'hs-na'],
      ['Any procedure during the hospitalization (1)', 'hs-proc'],
      ['Index admission was urgent / emergent (1)', 'hs-urg'],
      ['Length of stay >= 5 days (2)', 'hs-los'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    root.appendChild(el('p', {}, [
      el('label', { for: 'hs-prior', text: 'Number of admissions in the past 12 months (0=0; 1-2=0; 3-4=2; >=5=5)' }), el('br'),
      el('input', { id: 'hs-prior', type: 'number', step: '1', min: '0', value: '0' }),
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.hospitalScore({
        hgbLt12: checked('hs-hgb'),
        oncologyDischarge: checked('hs-onc'),
        sodiumLt135: checked('hs-na'),
        anyProcedure: checked('hs-proc'),
        urgentAdmission: checked('hs-urg'),
        priorAdmissions12mo: nv('hs-prior'),
        losGe5: checked('hs-los'),
      });
      o.appendChild(el('h2', { text: `HOSPITAL ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
      const p = r.parts;
      o.appendChild(el('p', { class: 'muted',
        text: `Per-parameter: hgb ${p.hgbLt12}, onc ${p.oncologyDischarge}, Na ${p.sodiumLt135}, procedure ${p.anyProcedure}, urgent ${p.urgentAdmission}, prior admissions ${p.priorAdmissions}, LOS ${p.losGe5}.` }));
    });
    document.querySelectorAll('input').forEach((n) => n.addEventListener(n.type === 'checkbox' ? 'change' : 'input', run));
    run();
  },

  // spec-v12 §3.6.2 wave 12-6: LACE Index (van Walraven 2010).
  lace(root) {
    root.appendChild(el('p', {}, [
      el('label', { for: 'lc-los', text: 'Length of stay (days; bands per van Walraven 2010 Table 3)' }), el('br'),
      el('input', { id: 'lc-los', type: 'number', step: '1', min: '0', value: '3' }),
    ]));
    root.appendChild(checkbox('Acute (emergent) admission (3 points)', 'lc-acute'));
    root.appendChild(el('p', {}, [
      el('label', { for: 'lc-charlson', text: 'Charlson Comorbidity Index (auto-bands 0=0, 1=1, 2=2, 3=3, >=4=5)' }), el('br'),
      el('input', { id: 'lc-charlson', type: 'number', step: '1', min: '0', value: '0' }),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'lc-ed', text: 'ED visits in the prior 6 months (capped at 4 points)' }), el('br'),
      el('input', { id: 'lc-ed', type: 'number', step: '1', min: '0', value: '0' }),
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.lace({
        losDays: nv('lc-los'),
        acuteAdmission: checked('lc-acute'),
        charlsonScore: nv('lc-charlson'),
        edVisits6mo: nv('lc-ed'),
      });
      o.appendChild(el('h2', { text: `LACE ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
      const p = r.parts;
      o.appendChild(el('p', { class: 'muted',
        text: `Per-parameter: LOS ${p.los}, acute ${p.acute}, Charlson ${p.charlson}, ED ${p.ed}.` }));
    });
    document.querySelectorAll('input').forEach((n) => n.addEventListener(n.type === 'checkbox' ? 'change' : 'input', run));
    run();
  },

  // spec-v12 §3.7.1 wave 12-7: Charlson Comorbidity Index.
  charlson(root) {
    root.appendChild(el('p', {}, [
      el('label', { for: 'ch-age', text: 'Age (years; 1 point per decade >=50, capped at 4)' }), el('br'),
      el('input', { id: 'ch-age', type: 'number', step: '1', min: '0', value: '55' }),
    ]));
    root.appendChild(el('h3', { text: '1-point comorbidities (Charlson 1987 Table 3)' }));
    const w1 = [
      ['Myocardial infarction', 'ch-mi'],
      ['Congestive heart failure', 'ch-chf'],
      ['Peripheral vascular disease', 'ch-pvd'],
      ['Cerebrovascular disease', 'ch-cvd'],
      ['Dementia', 'ch-dementia'],
      ['Chronic pulmonary disease (COPD)', 'ch-copd'],
      ['Connective tissue disease', 'ch-ct'],
      ['Peptic ulcer disease', 'ch-pud'],
      ['Mild liver disease', 'ch-mild-liver'],
      ['Diabetes (uncomplicated)', 'ch-dm'],
    ];
    for (const [l, id] of w1) root.appendChild(checkbox(l, id));
    root.appendChild(el('h3', { text: '2-point comorbidities' }));
    const w2 = [
      ['Hemiplegia', 'ch-hemi'],
      ['Moderate or severe renal disease', 'ch-renal'],
      ['Diabetes with end-organ damage', 'ch-dm-end'],
      ['Any tumor (within 5 years)', 'ch-tumor'],
      ['Leukemia', 'ch-leuk'],
      ['Lymphoma', 'ch-lymph'],
    ];
    for (const [l, id] of w2) root.appendChild(checkbox(l, id));
    root.appendChild(el('h3', { text: '3-point comorbidities' }));
    root.appendChild(checkbox('Moderate or severe liver disease', 'ch-mod-liver'));
    root.appendChild(el('h3', { text: '6-point comorbidities' }));
    root.appendChild(checkbox('Metastatic solid tumor', 'ch-mets'));
    root.appendChild(checkbox('AIDS', 'ch-aids'));
    const o = out(); root.appendChild(o);
    const map = {
      mi: 'ch-mi', chf: 'ch-chf', pvd: 'ch-pvd', cvd: 'ch-cvd',
      dementia: 'ch-dementia', copd: 'ch-copd', connectiveTissue: 'ch-ct',
      pud: 'ch-pud', mildLiver: 'ch-mild-liver', diabetesUncomplicated: 'ch-dm',
      hemiplegia: 'ch-hemi', modSevereRenal: 'ch-renal',
      diabetesEndOrgan: 'ch-dm-end', anyTumor: 'ch-tumor',
      leukemia: 'ch-leuk', lymphoma: 'ch-lymph',
      modSevereLiver: 'ch-mod-liver',
      metastaticSolidTumor: 'ch-mets', aids: 'ch-aids',
    };
    const run = () => safe(o, () => {
      const items = {};
      for (const [k, id] of Object.entries(map)) items[k] = checked(id);
      const r = S4.charlson({ items, ageYears: nv('ch-age') });
      o.appendChild(el('h2', { text: `Charlson (age-adjusted) ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
      o.appendChild(el('p', { class: 'muted',
        text: `Comorbidity component: ${r.comorbidity}; age adjustment: ${r.ageAdj}.` }));
    });
    document.querySelectorAll('input').forEach((n) => n.addEventListener(n.type === 'checkbox' ? 'change' : 'input', run));
    run();
  },

  // spec-v12 §3.7.2 wave 12-7: Clinical Frailty Scale (Rockwood 2005).
  cfs(root) {
    const descriptors = [
      ['1', '1 - Very fit'],
      ['2', '2 - Well'],
      ['3', '3 - Managing well'],
      ['4', '4 - Living with very mild frailty'],
      ['5', '5 - Living with mild frailty'],
      ['6', '6 - Living with moderate frailty'],
      ['7', '7 - Living with severe frailty'],
      ['8', '8 - Living with very severe frailty'],
      ['9', '9 - Terminally ill'],
    ];
    root.appendChild(el('p', {}, [
      el('label', { for: 'cf-level', text: 'CFS level (Rockwood 2005 / Dalhousie 2020 v2 wording)' }), el('br'),
      el('select', { id: 'cf-level' }, descriptors.map(([v, t]) => el('option', { value: v, text: t }))),
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.cfs({ level: nv('cf-level') });
      o.appendChild(el('h2', { text: `CFS ${r.level}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    document.getElementById('cf-level').addEventListener('change', run);
    run();
  },

  // spec-v12 §3.7.3 wave 12-7: ECOG + Karnofsky (Oken 1982 / Karnofsky 1949).
  'ecog-karnofsky'(root) {
    const ecogOpts = [
      ['0', '0 - Fully active'],
      ['1', '1 - Restricted in strenuous activity'],
      ['2', '2 - Ambulatory; unable to work; up >50% of day'],
      ['3', '3 - Limited self-care; bed or chair >50% of day'],
      ['4', '4 - Completely disabled'],
      ['5', '5 - Dead'],
    ];
    const kpsOpts = [];
    for (let v = 100; v >= 0; v -= 10) kpsOpts.push([String(v), `${v} - KPS ${v}`]);
    root.appendChild(el('p', {}, [
      el('label', { for: 'ek-ecog', text: 'ECOG performance status (Oken 1982)' }), el('br'),
      el('select', { id: 'ek-ecog' }, ecogOpts.map(([v, t]) => el('option', { value: v, text: t }))),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'ek-kps', text: 'Karnofsky Performance Status (Karnofsky 1949; auto-suggested via Buccheri 1996 crosswalk; user may override)' }), el('br'),
      el('select', { id: 'ek-kps' }, kpsOpts.map(([v, t]) => el('option', { value: v, text: t }))),
    ]));
    const o = out(); root.appendChild(o);
    let lastEcog = null;
    const run = () => safe(o, () => {
      const ecogSel = document.getElementById('ek-ecog');
      const kpsSel = document.getElementById('ek-kps');
      const ecogVal = ecogSel.value;
      if (ecogVal !== lastEcog) {
        const suggested = S4.ecogKarnofsky({ ecog: ecogVal, kps: 100 }).suggestedKps;
        if (suggested != null) kpsSel.value = String(suggested);
        lastEcog = ecogVal;
      }
      const r = S4.ecogKarnofsky({ ecog: ecogVal, kps: kpsSel.value });
      o.appendChild(el('h2', { text: `ECOG ${r.ecog} / KPS ${r.kps}` }));
      o.appendChild(el('p', { text: `ECOG: ${r.ecogDescriptor}` }));
      o.appendChild(el('p', { text: `KPS: ${r.kpsDescriptor}` }));
    });
    document.getElementById('ek-ecog').addEventListener('change', run);
    document.getElementById('ek-kps').addEventListener('change', run);
    run();
  },

  // spec-v12 §3.8.1 wave 12-8: Killip Classification (Killip 1967).
  killip(root) {
    const opts = [
      ['1', 'I - No signs of heart failure'],
      ['2', 'II - Rales / S3 gallop / elevated JVP'],
      ['3', 'III - Acute pulmonary edema'],
      ['4', 'IV - Cardiogenic shock (hypotension, oliguria, cold extremities)'],
    ];
    root.appendChild(el('p', {}, [
      el('label', { for: 'kp-class', text: 'Killip class (Killip & Kimball 1967)' }), el('br'),
      el('select', { id: 'kp-class' }, opts.map(([v, t]) => el('option', { value: v, text: t }))),
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.killip({ klass: nv('kp-class') });
      o.appendChild(el('h2', { text: r.descriptor }));
      o.appendChild(el('p', { text: r.band }));
      o.appendChild(el('p', { class: 'muted', text: 'Contemporary reperfusion-era mortality (GUSTO-I; Lee 1995): Killip I ~5%, II ~14%, III ~32%, IV ~58%. Killip class is also a GRACE input.' }));
    });
    document.getElementById('kp-class').addEventListener('change', run);
    run();
  },

  // spec-v12 §3.9.1 wave 12-8: SIRS Criteria (Bone 1992).
  sirs(root) {
    const items = [
      ['Temperature >38 deg C or <36 deg C', 'sr-temp'],
      ['Heart rate >90 bpm', 'sr-hr'],
      ['Respiratory rate >20 / min OR PaCO2 <32 mmHg', 'sr-resp'],
      ['WBC >12 or <4 (x10^9/L) OR >10% bands', 'sr-wbc'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.sirs({
        tempAbnormal: checked('sr-temp'),
        hrGt90: checked('sr-hr'),
        rrOrPaco2: checked('sr-resp'),
        wbcOrBands: checked('sr-wbc'),
      });
      o.appendChild(el('h2', { text: `SIRS criteria met: ${r.count} of 4` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v13 §3.1.3 wave 13-1: MODS (Marshall 1995).
  mods(root) {
    const numFields = [
      ['PaO2 / FiO2 (mmHg / decimal)', 'mods-pf', 350],
      ['Serum creatinine (mg/dL)', 'mods-cr', 1.0],
      ['Total bilirubin (mg/dL)', 'mods-bili', 1.0],
      ['Pressure-adjusted heart rate, PAR = HR x CVP / MAP', 'mods-par', 8],
      ['Platelets (x10^9 / L)', 'mods-plt', 200],
      ['GCS', 'mods-gcs', 15],
    ];
    for (const [l, id, v] of numFields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', step: 'any', value: String(v) }),
      ]));
    }
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.mods({
        pfRatio: nv('mods-pf'),
        creatinineMgDl: nv('mods-cr'),
        bilirubinMgDl: nv('mods-bili'),
        par: nv('mods-par'),
        plateletsK: nv('mods-plt'),
        gcs: nv('mods-gcs'),
      });
      o.appendChild(el('h2', { text: `MODS ${r.score} of 24` }));
      o.appendChild(el('p', { text: r.band }));
      o.appendChild(el('p', { text: `Per-organ subscores: respiratory ${r.parts.respiratory}, renal ${r.parts.renal}, hepatic ${r.parts.hepatic}, cardiovascular ${r.parts.cardiovascular}, hematologic ${r.parts.hematologic}, neurologic ${r.parts.neurologic}.` }));
    });
    numFields.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v13 §3.2.1 wave 13-2: RASS (Sessler 2002).
  rass(root) {
    const opts = [
      ['4', '+4 - Combative'],
      ['3', '+3 - Very agitated'],
      ['2', '+2 - Agitated'],
      ['1', '+1 - Restless'],
      ['0', '0 - Alert and calm'],
      ['-1', '-1 - Drowsy'],
      ['-2', '-2 - Light sedation'],
      ['-3', '-3 - Moderate sedation'],
      ['-4', '-4 - Deep sedation'],
      ['-5', '-5 - Unarousable'],
    ];
    root.appendChild(el('p', {}, [
      el('label', { for: 'rs-level', text: 'RASS level (Sessler 2002)' }), el('br'),
      el('select', { id: 'rs-level' }, opts.map(([v, t]) => el('option', { value: v, text: t }))),
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.rass({ level: nv('rs-level') });
      o.appendChild(el('h2', { text: `RASS ${r.level >= 0 ? '+' + r.level : r.level}` }));
      o.appendChild(el('p', { text: r.descriptor }));
      o.appendChild(el('p', { text: r.band }));
    });
    document.getElementById('rs-level').addEventListener('change', run);
    run();
  },

  // spec-v13 §3.2.2 wave 13-2: SAS / Riker (Riker 1999).
  'sas-riker'(root) {
    const opts = [
      ['1', '1 - Unarousable'],
      ['2', '2 - Very sedated'],
      ['3', '3 - Sedated'],
      ['4', '4 - Calm and cooperative'],
      ['5', '5 - Agitated'],
      ['6', '6 - Very agitated'],
      ['7', '7 - Dangerous agitation'],
    ];
    root.appendChild(el('p', {}, [
      el('label', { for: 'sk-level', text: 'SAS level (Riker 1999)' }), el('br'),
      el('select', { id: 'sk-level' }, opts.map(([v, t]) => el('option', { value: v, text: t }))),
    ]));
    const sel = root.querySelector('#sk-level'); if (sel) sel.value = '4';
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.sasRiker({ level: nv('sk-level') });
      o.appendChild(el('h2', { text: `SAS ${r.level}` }));
      o.appendChild(el('p', { text: r.descriptor }));
      o.appendChild(el('p', { text: r.band }));
    });
    document.getElementById('sk-level').addEventListener('change', run);
    run();
  },

  // spec-v13 §3.2.3 wave 13-2: CAM-ICU (Ely 2001).
  'cam-icu'(root) {
    root.appendChild(checkbox('Feature 1: Acute onset of mental status change OR fluctuating course', 'ci-f1'));
    root.appendChild(checkbox('Feature 2: Inattention (Attention Screening Examination >=2 errors)', 'ci-f2'));
    root.appendChild(checkbox('Feature 3: Altered level of consciousness (current RASS != 0)', 'ci-f3'));
    root.appendChild(checkbox('Feature 4: Disorganized thinking (4-item question set + command)', 'ci-f4'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.camIcu({
        acuteOnsetOrFluctuating: checked('ci-f1'),
        inattention: checked('ci-f2'),
        alteredLoc: checked('ci-f3'),
        disorganizedThinking: checked('ci-f4'),
      });
      o.appendChild(el('h2', { text: r.positive ? 'CAM-ICU positive' : 'CAM-ICU negative' }));
      o.appendChild(el('p', { text: r.band }));
    });
    ['ci-f1', 'ci-f2', 'ci-f3', 'ci-f4'].forEach((id) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v13 §3.2.4 wave 13-2: ICDSC (Bergeron 2001).
  icdsc(root) {
    const items = [
      ['Altered level of consciousness', 'id-a'],
      ['Inattention', 'id-b'],
      ['Disorientation', 'id-c'],
      ['Hallucination, delusion, or psychosis', 'id-d'],
      ['Psychomotor agitation or retardation', 'id-e'],
      ['Inappropriate speech or mood', 'id-f'],
      ['Sleep / wake cycle disturbance', 'id-g'],
      ['Symptom fluctuation', 'id-h'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.icdsc({
        alteredLoc: checked('id-a'),
        inattention: checked('id-b'),
        disorientation: checked('id-c'),
        hallucination: checked('id-d'),
        psychomotor: checked('id-e'),
        inappropriateSpeechOrMood: checked('id-f'),
        sleepWakeDisturbance: checked('id-g'),
        symptomFluctuation: checked('id-h'),
      });
      o.appendChild(el('h2', { text: `ICDSC ${r.score} of 8` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v13 §3.2.5 wave 13-2: 4AT (MacLullich 2019).
  '4at'(root) {
    root.appendChild(checkbox('Alertness abnormal (clearly drowsy or agitated; otherwise leave unchecked) (0 or 4)', 'fa-alert'));
    root.appendChild(el('p', {}, [
      el('label', { for: 'fa-amt', text: 'AMT4 (age, DOB, place, current year) - number of errors (0=normal; 1=one mistake; 2=>=2 mistakes / untestable)' }), el('br'),
      el('select', { id: 'fa-amt' }, [
        el('option', { value: '0', text: '0 errors (0)' }),
        el('option', { value: '1', text: '1 error (1)' }),
        el('option', { value: '2', text: '>=2 errors / untestable (2)' }),
      ]),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'fa-att', text: 'Attention (months of year backwards): 0 = reaches July; 1 = starts but fewer than 7; 2 = untestable' }), el('br'),
      el('select', { id: 'fa-att' }, [
        el('option', { value: '0', text: 'Reaches >=7 months (0)' }),
        el('option', { value: '1', text: 'Starts but <7 (1)' }),
        el('option', { value: '2', text: 'Untestable (2)' }),
      ]),
    ]));
    root.appendChild(checkbox('Acute change or fluctuating course in cognition / mental status (0 or 4)', 'fa-acute'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.fourAt({
        alertnessAbnormal: checked('fa-alert'),
        amt4Errors: nv('fa-amt'),
        attentionScore: nv('fa-att'),
        acuteChange: checked('fa-acute'),
      });
      o.appendChild(el('h2', { text: `4AT ${r.score} of 12` }));
      o.appendChild(el('p', { text: r.band }));
    });
    document.querySelectorAll('input, select').forEach((n) => n.addEventListener(n.type === 'checkbox' || n.tagName === 'SELECT' ? 'change' : 'input', run));
    run();
  },

  // spec-v13 §3.3.1 wave 13-3: CPOT (Gelinas 2006).
  cpot(root) {
    const opts = (id, label, options) => {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: label }), el('br'),
        el('select', { id }, options.map(([v, t]) => el('option', { value: v, text: t }))),
      ]));
    };
    opts('cp-f', 'Facial expression', [
      ['0', '0 - Relaxed, neutral'],
      ['1', '1 - Tense (frowning, brow lowering)'],
      ['2', '2 - Grimacing'],
    ]);
    opts('cp-b', 'Body movements', [
      ['0', '0 - Absence of movements'],
      ['1', '1 - Protection (slow / cautious movements; touching pain site)'],
      ['2', '2 - Restlessness / agitation'],
    ]);
    opts('cp-m', 'Muscle tension (evaluate by passive flexion / extension)', [
      ['0', '0 - Relaxed'],
      ['1', '1 - Tense, rigid'],
      ['2', '2 - Very tense or rigid'],
    ]);
    opts('cp-c', 'Compliance with ventilator (intubated) OR vocalization (extubated)', [
      ['0', '0 - Tolerating / talking in normal tone'],
      ['1', '1 - Coughing but tolerating / sighing, moaning'],
      ['2', '2 - Fighting ventilator / crying out'],
    ]);
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.cpot({
        facial: nv('cp-f'),
        body: nv('cp-b'),
        muscleTension: nv('cp-m'),
        complianceOrVocalization: nv('cp-c'),
      });
      o.appendChild(el('h2', { text: `CPOT ${r.score} of 8` }));
      o.appendChild(el('p', { text: r.band }));
    });
    ['cp-f', 'cp-b', 'cp-m', 'cp-c'].forEach((id) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v13 §3.3.2 wave 13-3: BPS (Payen 2001).
  bps(root) {
    const opts = (id, label, options) => {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: label }), el('br'),
        el('select', { id }, options.map(([v, t]) => el('option', { value: v, text: t }))),
      ]));
    };
    opts('bp-f', 'Facial expression', [
      ['1', '1 - Relaxed'],
      ['2', '2 - Partially tightened (e.g., brow lowering)'],
      ['3', '3 - Fully tightened (e.g., eyelid closing)'],
      ['4', '4 - Grimacing'],
    ]);
    opts('bp-u', 'Upper limb movements', [
      ['1', '1 - No movement'],
      ['2', '2 - Partially bent'],
      ['3', '3 - Fully bent with finger flexion'],
      ['4', '4 - Permanently retracted'],
    ]);
    opts('bp-v', 'Compliance with mechanical ventilation', [
      ['1', '1 - Tolerating movement'],
      ['2', '2 - Coughing but tolerating ventilation most of the time'],
      ['3', '3 - Fighting ventilator'],
      ['4', '4 - Unable to control ventilation'],
    ]);
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.bps({
        facial: nv('bp-f'),
        upperLimb: nv('bp-u'),
        ventilatorCompliance: nv('bp-v'),
      });
      o.appendChild(el('h2', { text: `BPS ${r.score} of 12` }));
      o.appendChild(el('p', { text: r.band }));
    });
    ['bp-f', 'bp-u', 'bp-v'].forEach((id) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v13 §3.4.1 wave 13-4: NUTRIC (Heyland 2011).
  nutric(root) {
    const fields = [
      ['Age (years)', 'nt-age', '55'],
      ['APACHE II', 'nt-apache', '18'],
      ['SOFA', 'nt-sofa', '6'],
      ['Number of comorbidities', 'nt-comorb', '1'],
      ['Days hospital to ICU', 'nt-days', '0'],
      ['IL-6 (pg/mL)', 'nt-il6', '0'],
    ];
    for (const [l, id, v] of fields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', step: 'any', value: String(v) }),
      ]));
    }
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.nutric({
        ageYears: nv('nt-age'), apache2: nv('nt-apache'), sofa: nv('nt-sofa'),
        comorbidities: nv('nt-comorb'), daysHospitalToIcu: nv('nt-days'),
        il6Pg: nv('nt-il6'),
      });
      o.appendChild(el('h2', { text: `NUTRIC ${r.score} of 10` }));
      o.appendChild(el('p', { text: r.band }));
    });
    fields.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v13 §3.4.2 wave 13-4: mNUTRIC (Rahman 2016).
  mnutric(root) {
    const fields = [
      ['Age (years)', 'mn-age', '55'],
      ['APACHE II', 'mn-apache', '18'],
      ['SOFA', 'mn-sofa', '6'],
      ['Number of comorbidities', 'mn-comorb', '1'],
      ['Days hospital to ICU', 'mn-days', '0'],
    ];
    for (const [l, id, v] of fields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', step: 'any', value: String(v) }),
      ]));
    }
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.mnutric({
        ageYears: nv('mn-age'), apache2: nv('mn-apache'), sofa: nv('mn-sofa'),
        comorbidities: nv('mn-comorb'), daysHospitalToIcu: nv('mn-days'),
      });
      o.appendChild(el('h2', { text: `mNUTRIC ${r.score} of 9` }));
      o.appendChild(el('p', { text: r.band }));
    });
    fields.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v13 §3.4.3 wave 13-4: NRS-2002 (Kondrup 2003).
  nrs2002(root) {
    const sel = (id, label, options) => root.appendChild(el('p', {}, [
      el('label', { for: id, text: label }), el('br'),
      el('select', { id }, options.map(([v, t]) => el('option', { value: v, text: t }))),
    ]));
    sel('nr-sev', 'Severity of disease', [
      ['0', '0 - Normal nutritional requirements'],
      ['1', '1 - Mild (e.g., chronic disease with complications)'],
      ['2', '2 - Moderate (e.g., major abdominal surgery, stroke, hematologic malignancy)'],
      ['3', '3 - Severe (e.g., head injury, ICU APACHE >10)'],
    ]);
    sel('nr-nut', 'Nutritional status', [
      ['0', '0 - Normal'],
      ['1', '1 - Wt loss >5% in 3 mo OR intake 50-75% in prior week'],
      ['2', '2 - Wt loss >5% in 2 mo OR BMI 18.5-20.5 with impaired GC OR intake 25-50%'],
      ['3', '3 - Wt loss >5% in 1 mo (>15% in 3 mo) OR BMI <18.5 OR intake <25%'],
    ]);
    root.appendChild(checkbox('Age >= 70 years (+1)', 'nr-age'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.nrs2002({
        severityOfDisease: nv('nr-sev'),
        nutritionalStatus: nv('nr-nut'),
        ageGe70: checked('nr-age'),
      });
      o.appendChild(el('h2', { text: `NRS-2002 ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    ['nr-sev', 'nr-nut', 'nr-age'].forEach((id) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v13 §3.4.4 wave 13-4: MUST (BAPEN 2003).
  'must-nutrition'(root) {
    root.appendChild(el('p', {}, [
      el('label', { for: 'mu-bmi', text: 'BMI (kg/m^2)' }), el('br'),
      el('input', { id: 'mu-bmi', type: 'number', step: 'any', value: '22' }),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'mu-wl', text: 'Unplanned weight loss in past 3-6 months (%)' }), el('br'),
      el('input', { id: 'mu-wl', type: 'number', step: 'any', value: '0' }),
    ]));
    root.appendChild(checkbox('Acutely ill AND no nutritional intake for >5 days (+2)', 'mu-acute'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.mustNutrition({
        bmi: nv('mu-bmi'),
        weightLossPct: nv('mu-wl'),
        acuteDiseaseNoIntakeGt5d: checked('mu-acute'),
      });
      o.appendChild(el('h2', { text: `MUST ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    ['mu-bmi', 'mu-wl', 'mu-acute'].forEach((id) => document.getElementById(id).addEventListener(id === 'mu-acute' ? 'change' : 'input', run));
    run();
  },

  // spec-v13 §3.5.2 wave 13-5: HACOR (Duan 2017).
  hacor(root) {
    const fields = [
      ['Heart rate (bpm)', 'hc-hr', '110'],
      ['Arterial pH', 'hc-ph', '7.40'],
      ['GCS', 'hc-gcs', '15'],
      ['PaO2 (mmHg)', 'hc-pao2', '120'],
      ['FiO2 (decimal, e.g., 0.5)', 'hc-fio2', '0.5'],
      ['Respiratory rate (breaths/min)', 'hc-rr', '25'],
    ];
    for (const [l, id, v] of fields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', step: 'any', value: String(v) }),
      ]));
    }
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.hacor({
        hr: nv('hc-hr'), ph: nv('hc-ph'), gcs: nv('hc-gcs'),
        pao2: nv('hc-pao2'), fio2: nv('hc-fio2'), rr: nv('hc-rr'),
      });
      o.appendChild(el('h2', { text: `HACOR ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
      o.appendChild(el('p', { class: 'muted', text: `Per-parameter: HR ${r.parts.hr}, pH ${r.parts.ph}, GCS ${r.parts.gcs}, PaO2/FiO2 ${r.pfRatio.toFixed(0)} -> ${r.parts.pf}, RR ${r.parts.rr}.` }));
    });
    fields.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v13 §3.5.3 wave 13-5: Berlin ARDS criteria (Ranieri 2012).
  'berlin-ards'(root) {
    root.appendChild(checkbox('Timing: respiratory symptoms onset <=1 week of insult or worsening', 'ba-timing'));
    root.appendChild(checkbox('Chest imaging: bilateral opacities not fully explained by effusions, lobar/lung collapse, or nodules', 'ba-bilat'));
    root.appendChild(checkbox('Origin: not fully explained by cardiac failure or fluid overload (requires objective assessment if no risk factor)', 'ba-not'));
    root.appendChild(checkbox('PEEP / CPAP >= 5 cmH2O', 'ba-peep'));
    root.appendChild(el('p', {}, [
      el('label', { for: 'ba-pao2', text: 'PaO2 (mmHg)' }), el('br'),
      el('input', { id: 'ba-pao2', type: 'number', step: 'any', value: '120' }),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'ba-fio2', text: 'FiO2 (decimal)' }), el('br'),
      el('input', { id: 'ba-fio2', type: 'number', step: 'any', value: '0.5' }),
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.berlinArds({
        timingLe1wk: checked('ba-timing'),
        bilateralOpacities: checked('ba-bilat'),
        notExplainedByCardiacOrOverload: checked('ba-not'),
        peepGe5cmH2O: checked('ba-peep'),
        pao2: nv('ba-pao2'),
        fio2: nv('ba-fio2'),
      });
      o.appendChild(el('h2', { text: r.ards ? `ARDS, ${r.severity || '(severity pending)'}` : 'ARDS criteria not met' }));
      o.appendChild(el('p', { text: r.band }));
      if (r.pfRatio != null) o.appendChild(el('p', { class: 'muted', text: `PaO2/FiO2 = ${r.pfRatio.toFixed(0)}` }));
    });
    document.querySelectorAll('input').forEach((n) => n.addEventListener(n.type === 'checkbox' ? 'change' : 'input', run));
    run();
  },

  // spec-v13 §3.5.4 wave 13-5: Murray LIS (Murray 1988).
  'lis-murray'(root) {
    root.appendChild(el('p', {}, [
      el('label', { for: 'lm-quad', text: 'CXR quadrants with consolidation (0-4)' }), el('br'),
      el('input', { id: 'lm-quad', type: 'number', step: '1', min: '0', max: '4', value: '0' }),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'lm-pao2', text: 'PaO2 (mmHg)' }), el('br'),
      el('input', { id: 'lm-pao2', type: 'number', step: 'any', value: '300' }),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'lm-fio2', text: 'FiO2 (decimal)' }), el('br'),
      el('input', { id: 'lm-fio2', type: 'number', step: 'any', value: '0.4' }),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'lm-peep', text: 'PEEP (cmH2O)' }), el('br'),
      el('input', { id: 'lm-peep', type: 'number', step: 'any', value: '5' }),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'lm-comp', text: 'Compliance (mL/cmH2O)' }), el('br'),
      el('input', { id: 'lm-comp', type: 'number', step: 'any', value: '80' }),
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.lisMurray({
        quadrants: nv('lm-quad'),
        pao2: nv('lm-pao2'),
        fio2: nv('lm-fio2'),
        peep: nv('lm-peep'),
        complianceMlPerCmH2O: nv('lm-comp'),
      });
      o.appendChild(el('h2', { text: `Murray LIS ${r.score.toFixed(2)}` }));
      o.appendChild(el('p', { text: r.band }));
      o.appendChild(el('p', { class: 'muted', text: `Per-component: quadrants ${r.parts.quadrants}, PaO2/FiO2 ${r.pfRatio.toFixed(0)} -> ${r.parts.pf}, PEEP ${r.parts.peep}, compliance ${r.parts.compliance}.` }));
    });
    document.querySelectorAll('input').forEach((n) => n.addEventListener('input', run));
    run();
  },

  // spec-v13 §3.5.5 wave 13-5: LIPS (Gajic 2011).
  lips(root) {
    const items = [
      ['Shock (+2)', 'lp-shock', 'shock'],
      ['Aspiration (+2)', 'lp-asp', 'aspiration'],
      ['Sepsis (+1)', 'lp-sep', 'sepsis'],
      ['Pneumonia (+1.5)', 'lp-pna', 'pneumonia'],
      ['High-risk surgery (+1.5)', 'lp-surg', 'highRiskSurgery'],
      ['High-risk trauma (+2)', 'lp-trauma', 'highRiskTrauma'],
      ['Alcohol abuse (+1)', 'lp-etoh', 'alcoholAbuse'],
      ['Obesity BMI > 30 (+1)', 'lp-obese', 'obesityBmiGt30'],
      ['Hypoalbuminemia (+1)', 'lp-alb', 'hypoalbuminemia'],
      ['Chemotherapy (+1)', 'lp-chemo', 'chemotherapy'],
      ['FiO2 > 0.35 or > 4 L/min (+2)', 'lp-fio2', 'fio2Gt035or4L'],
      ['Tachypnea RR > 30 (+1.5)', 'lp-tach', 'tachypneaRrGt30'],
      ['SpO2 < 95% (+1)', 'lp-spo2', 'spo2Lt95'],
      ['Acidosis pH < 7.35 (+1.5)', 'lp-acid', 'acidosisPhLt735'],
      ['Diabetes mellitus (-1)', 'lp-dm', 'diabetes'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const args = {};
      for (const [, id, key] of items) args[key] = checked(id);
      const r = S4.lips(args);
      o.appendChild(el('h2', { text: `LIPS ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v13 §3.7.1 wave 13-7: SMART-COP (Charles 2008).
  'smart-cop'(root) {
    root.appendChild(el('p', {}, [
      el('label', { for: 'sc-age', text: 'Age (years; used for age-adjusted RR / oxygenation thresholds)' }), el('br'),
      el('input', { id: 'sc-age', type: 'number', step: '1', value: '55' }),
    ]));
    root.appendChild(checkbox('SBP < 90 mmHg (2)', 'sc-sbp'));
    root.appendChild(checkbox('Multilobar infiltrates on CXR (1)', 'sc-multi'));
    root.appendChild(checkbox('Albumin < 3.5 g/dL (1)', 'sc-alb'));
    root.appendChild(el('p', {}, [
      el('label', { for: 'sc-rr', text: 'Respiratory rate (breaths/min; age-adjusted threshold: >=25 if age <=50; >=30 if age >50)' }), el('br'),
      el('input', { id: 'sc-rr', type: 'number', step: '1', value: '20' }),
    ]));
    root.appendChild(checkbox('Heart rate >= 125 bpm (1)', 'sc-hr'));
    root.appendChild(checkbox('Confusion / new-onset (1)', 'sc-conf'));
    root.appendChild(el('h3', { text: 'Oxygenation (any positive triggers 2 points; age-adjusted)' }));
    root.appendChild(el('p', { class: 'muted', text: 'Age <=50: PaO2 <70 OR SpO2 <94% OR P/F <333. Age >50: PaO2 <60 OR SpO2 <90% OR P/F <250.' }));
    root.appendChild(el('p', {}, [
      el('label', { for: 'sc-pao2', text: 'PaO2 (mmHg; blank if unknown)' }), el('br'),
      el('input', { id: 'sc-pao2', type: 'number', step: 'any', value: '90' }),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'sc-spo2', text: 'SpO2 (%; blank if unknown)' }), el('br'),
      el('input', { id: 'sc-spo2', type: 'number', step: 'any', value: '96' }),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'sc-pf', text: 'PaO2/FiO2 (blank if unknown)' }), el('br'),
      el('input', { id: 'sc-pf', type: 'number', step: 'any', value: '400' }),
    ]));
    root.appendChild(checkbox('Arterial pH < 7.35 (2)', 'sc-ph'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.smartCop({
        ageYears: nv('sc-age'),
        sbpLt90: checked('sc-sbp'),
        multilobar: checked('sc-multi'),
        albuminLt35: checked('sc-alb'),
        rr: nv('sc-rr'),
        pao2: nv('sc-pao2'),
        spo2: nv('sc-spo2'),
        pfRatio: nv('sc-pf'),
        hrGe125: checked('sc-hr'),
        confusion: checked('sc-conf'),
        phLt735: checked('sc-ph'),
      });
      o.appendChild(el('h2', { text: `SMART-COP ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
      const p = r.parts;
      o.appendChild(el('p', { class: 'muted', text: `Per-parameter: SBP ${p.sbp}, multilobar ${p.multilobar}, albumin ${p.albumin}, RR ${p.rr}, HR ${p.tachycardia}, confusion ${p.confusion}, oxygenation ${p.oxygenation}, pH ${p.acidosis}.` }));
    });
    document.querySelectorAll('input').forEach((n) => n.addEventListener(n.type === 'checkbox' ? 'change' : 'input', run));
    run();
  },

  // spec-v13 §3.7.2 wave 13-7: CRB-65 (Lim 2003).
  crb65(root) {
    root.appendChild(checkbox('Confusion (new-onset disorientation to person, place, or time) (1)', 'cr-conf'));
    root.appendChild(checkbox('Respiratory rate >= 30 / min (1)', 'cr-rr'));
    root.appendChild(checkbox('SBP < 90 mmHg OR DBP <= 60 mmHg (1)', 'cr-bp'));
    root.appendChild(checkbox('Age >= 65 (1)', 'cr-age'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.crb65({
        confusion: checked('cr-conf'),
        rrGe30: checked('cr-rr'),
        sbpLt90OrDbpLe60: checked('cr-bp'),
        ageGe65: checked('cr-age'),
      });
      o.appendChild(el('h2', { text: `CRB-65 ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    ['cr-conf', 'cr-rr', 'cr-bp', 'cr-age'].forEach((id) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v13 §3.7.3 wave 13-7: ATS/IDSA Severe CAP (Metlay 2019).
  'ats-idsa-cap'(root) {
    root.appendChild(el('h3', { text: 'Major criteria (any one -> severe)' }));
    root.appendChild(checkbox('Septic shock requiring vasopressors', 'ai-major-vp'));
    root.appendChild(checkbox('Respiratory failure requiring mechanical ventilation', 'ai-major-mv'));
    root.appendChild(el('h3', { text: 'Minor criteria (>=3 -> severe)' }));
    const minors = [
      ['Respiratory rate >= 30 / min', 'ai-rr'],
      ['PaO2/FiO2 <= 250', 'ai-pf'],
      ['Multilobar infiltrates', 'ai-multi'],
      ['Confusion / disorientation', 'ai-conf'],
      ['Uremia (BUN >= 20 mg/dL)', 'ai-bun'],
      ['Leukopenia (WBC < 4 x10^9/L) due to infection only', 'ai-leuk'],
      ['Thrombocytopenia (platelets < 100 x10^9/L)', 'ai-plt'],
      ['Hypothermia (core temperature < 36 deg C)', 'ai-hypo'],
      ['Hypotension requiring aggressive fluid resuscitation', 'ai-fluid'],
    ];
    for (const [l, id] of minors) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.atsIdsaCap({
        majorVasopressors: checked('ai-major-vp'),
        majorMechanicalVentilation: checked('ai-major-mv'),
        minorRrGe30: checked('ai-rr'),
        minorPfLe250: checked('ai-pf'),
        minorMultilobar: checked('ai-multi'),
        minorConfusion: checked('ai-conf'),
        minorUremiaBunGe20: checked('ai-bun'),
        minorLeukopeniaWbcLt4: checked('ai-leuk'),
        minorThrombocytopeniaPltLt100: checked('ai-plt'),
        minorHypothermiaLt36: checked('ai-hypo'),
        minorHypotensionAggressiveFluids: checked('ai-fluid'),
      });
      o.appendChild(el('h2', { text: r.severe ? 'Severe CAP' : 'Not severe' }));
      o.appendChild(el('p', { text: r.band }));
    });
    document.querySelectorAll('input').forEach((n) => n.addEventListener('change', run));
    run();
  },

  // spec-v13 §3.7.4 wave 13-7: DRIP Score (Webb 2016).
  drip(root) {
    root.appendChild(el('h3', { text: 'Major risk factors (each +2)' }));
    const majors = [
      ['Antibiotic use in past 60 days', 'dr-abx'],
      ['Long-term care facility residence', 'dr-ltc'],
      ['Tube feeding', 'dr-tube'],
      ['Prior multidrug-resistant isolate', 'dr-mdr'],
    ];
    for (const [l, id] of majors) root.appendChild(checkbox(l, id));
    root.appendChild(el('h3', { text: 'Minor risk factors (each +1)' }));
    const minors = [
      ['Hospitalization in past 60 days', 'dr-hosp'],
      ['Chronic pulmonary disease', 'dr-cpd'],
      ['Poor functional status', 'dr-func'],
      ['Gastric acid suppression', 'dr-ppi'],
      ['Wound care', 'dr-wound'],
      ['MRSA colonization', 'dr-mrsa'],
    ];
    for (const [l, id] of minors) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.drip({
        antibioticsLast60d: checked('dr-abx'),
        longTermCareResidence: checked('dr-ltc'),
        tubeFeeding: checked('dr-tube'),
        priorMdrIsolate: checked('dr-mdr'),
        hospitalizationLast60d: checked('dr-hosp'),
        chronicPulmonary: checked('dr-cpd'),
        poorFunctionalStatus: checked('dr-func'),
        gastricAcidSuppression: checked('dr-ppi'),
        woundCare: checked('dr-wound'),
        mrsaColonization: checked('dr-mrsa'),
      });
      o.appendChild(el('h2', { text: `DRIP ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    document.querySelectorAll('input').forEach((n) => n.addEventListener('change', run));
    run();
  },

  // spec-v14 §3.2.1 wave 14-2: STOP-BANG (Chung 2008, 2012).
  'stop-bang'(root) {
    const items = [
      ['Snore loudly (louder than talking, or loud enough to hear through closed doors)', 'sb-s'],
      ['Tired, fatigued, or sleepy during the daytime', 'sb-t'],
      ['Observed apnea (someone has seen you stop breathing during sleep)', 'sb-o'],
      ['High blood pressure (treated or untreated)', 'sb-p'],
      ['BMI > 35 kg/m^2', 'sb-b'],
      ['Age > 50 years', 'sb-a'],
      ['Neck circumference > 40 cm', 'sb-n'],
      ['Male sex', 'sb-g'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.stopBang({
        snore: checked('sb-s'),
        tired: checked('sb-t'),
        observedApnea: checked('sb-o'),
        highBp: checked('sb-p'),
        bmiGt35: checked('sb-b'),
        ageGt50: checked('sb-a'),
        neckGt40cm: checked('sb-n'),
        male: checked('sb-g'),
      });
      o.appendChild(el('h2', { text: `STOP-BANG ${r.score} of 8` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v14 §3.2.3 wave 14-2: Epworth Sleepiness Scale (Johns 1991).
  epworth(root) {
    const items = [
      ['Sitting and reading', 'ep-read'],
      ['Watching TV', 'ep-tv'],
      ['Sitting inactive in a public place (e.g., a theater or a meeting)', 'ep-pub'],
      ['As a passenger in a car for an hour without a break', 'ep-car'],
      ['Lying down to rest in the afternoon when circumstances permit', 'ep-lying'],
      ['Sitting and talking to someone', 'ep-talk'],
      ['Sitting quietly after a lunch without alcohol', 'ep-lunch'],
      ['In a car, while stopped for a few minutes in traffic', 'ep-traffic'],
    ];
    for (const [l, id] of items) root.appendChild(rangeField(l, id, 0, 3, 0));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.epworth({
        reading: nv('ep-read'),
        tv: nv('ep-tv'),
        publicPlace: nv('ep-pub'),
        carPassenger: nv('ep-car'),
        lyingDown: nv('ep-lying'),
        sittingTalking: nv('ep-talk'),
        afterLunch: nv('ep-lunch'),
        carTraffic: nv('ep-traffic'),
      });
      o.appendChild(el('h2', { text: `Epworth ${r.score} of 24` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v14 §3.3.2 wave 14-3: Apfel PONV (Apfel 1999).
  apfel(root) {
    const items = [
      ['Female sex', 'ap-female'],
      ['Nonsmoker', 'ap-nonsmoker'],
      ['History of PONV or motion sickness', 'ap-hx'],
      ['Use of postoperative opioids', 'ap-opioid'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.apfel({
        female: checked('ap-female'),
        nonsmoker: checked('ap-nonsmoker'),
        historyPonvOrMotionSickness: checked('ap-hx'),
        postopOpioids: checked('ap-opioid'),
      });
      o.appendChild(el('h2', { text: `Apfel ${r.score} of 4` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v14 §3.4.1 wave 14-4: ATRIA Bleeding (Fang 2011).
  'atria-bleeding'(root) {
    const items = [
      ['Anemia (Hb <13 g/dL men, <12 g/dL women) (+3)', 'at-an'],
      ['Severe renal disease (eGFR <30 mL/min or dialysis) (+3)', 'at-rn'],
      ['Age >=75 years (+2)', 'at-ag'],
      ['Prior hemorrhage diagnosis (+1)', 'at-bl'],
      ['Hypertension (+1)', 'at-ht'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.atriaBleeding({
        anemia: checked('at-an'),
        severeRenalDisease: checked('at-rn'),
        ageGte75: checked('at-ag'),
        priorBleeding: checked('at-bl'),
        hypertension: checked('at-ht'),
      });
      o.appendChild(el('h2', { text: `ATRIA ${r.score} of 10` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v14 §3.4.2 wave 14-4: ORBIT Bleeding (O'Brien 2015).
  'orbit-bleeding'(root) {
    const items = [
      ['Hb <13 g/dL men, <12 g/dL women, or Hct <40%/<36% (+2)', 'ob-hb'],
      ['Age >74 years (+1)', 'ob-age'],
      ['Bleeding history (GI, intracranial, or hemorrhagic stroke) (+2)', 'ob-bh'],
      ['Renal insufficiency (eGFR <60 mL/min/1.73 m^2) (+1)', 'ob-ri'],
      ['Treatment with antiplatelet (+1)', 'ob-ap'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.orbitBleeding({
        lowHbOrHct: checked('ob-hb'),
        ageGt74: checked('ob-age'),
        bleedingHistory: checked('ob-bh'),
        renalInsufficiency: checked('ob-ri'),
        antiplatelet: checked('ob-ap'),
      });
      o.appendChild(el('h2', { text: `ORBIT ${r.score} of 7` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v14 §3.4.3 wave 14-4: HEMORR2HAGES (Gage 2006).
  hemorr2hages(root) {
    const items = [
      ['Hepatic or Renal disease (+1)', 'hh-hr'],
      ['Ethanol abuse (+1)', 'hh-et'],
      ['Malignancy (+1)', 'hh-mal'],
      ['Older (age >75 years) (+1)', 'hh-old'],
      ['Reduced platelet count or function (+1)', 'hh-plt'],
      ['Rebleeding (prior bleed) (+2)', 'hh-reb'],
      ['Hypertension (uncontrolled) (+1)', 'hh-htn'],
      ['Anemia (+1)', 'hh-an'],
      ['Genetic factors (CYP2C9 variants) (+1)', 'hh-gen'],
      ['Excessive fall risk (+1)', 'hh-fall'],
      ['Stroke (+1)', 'hh-stk'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.hemorr2hages({
        hepaticOrRenal: checked('hh-hr'),
        ethanolAbuse: checked('hh-et'),
        malignancy: checked('hh-mal'),
        olderGt75: checked('hh-old'),
        reducedPlatelets: checked('hh-plt'),
        rebleeding: checked('hh-reb'),
        uncontrolledHtn: checked('hh-htn'),
        anemia: checked('hh-an'),
        geneticFactors: checked('hh-gen'),
        fallRisk: checked('hh-fall'),
        stroke: checked('hh-stk'),
      });
      o.appendChild(el('h2', { text: `HEMORR2HAGES ${r.score} of 12` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v14 §3.5.1 wave 14-5: IMPROVE Bleeding (Decousus 2011).
  'improve-bleeding'(root) {
    const cb = [
      ['Active gastroduodenal ulcer (+4.5)', 'ib-ulcer'],
      ['Bleeding in 3 months prior to admission (+4)', 'ib-bleed3'],
      ['Platelet count <50 x10^9/L (+4)', 'ib-plt'],
      ['Hepatic failure (INR >1.5) (+2.5)', 'ib-hep'],
      ['ICU/CCU admission (+2.5)', 'ib-icu'],
      ['Central venous catheter (+2)', 'ib-cvc'],
      ['Rheumatic disease (+2)', 'ib-rheum'],
      ['Active cancer (+2)', 'ib-cancer'],
      ['Male sex (+1)', 'ib-male'],
    ];
    root.appendChild(el('p', {}, [
      el('label', { for: 'ib-age', text: 'Age category' }), el('br'),
      el('select', { id: 'ib-age' }, [
        el('option', { value: '<40', text: '<40 (0)' }),
        el('option', { value: '40-84', text: '40-84 (+1.5)' }),
        el('option', { value: '>=85', text: '>=85 (+3.5)' }),
      ]),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'ib-renal', text: 'Renal failure (eGFR)' }), el('br'),
      el('select', { id: 'ib-renal' }, [
        el('option', { value: 'none', text: 'None / eGFR >=60 (0)' }),
        el('option', { value: 'moderate', text: 'Moderate eGFR 30-59 (+1)' }),
        el('option', { value: 'severe', text: 'Severe eGFR <30 (+2.5)' }),
      ]),
    ]));
    for (const [l, id] of cb) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.improveBleeding({
        activeUlcer: checked('ib-ulcer'),
        bleeding3moPrior: checked('ib-bleed3'),
        plateletLt50: checked('ib-plt'),
        age: document.getElementById('ib-age').value,
        hepaticFailure: checked('ib-hep'),
        renalFailure: document.getElementById('ib-renal').value,
        icuAdmission: checked('ib-icu'),
        centralVenousCatheter: checked('ib-cvc'),
        rheumaticDisease: checked('ib-rheum'),
        currentCancer: checked('ib-cancer'),
        male: checked('ib-male'),
      });
      const scoreText = Number.isInteger(r.score) ? String(r.score) : r.score.toFixed(1);
      o.appendChild(el('h2', { text: `IMPROVE-Bleeding ${scoreText}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    ['ib-age', 'ib-renal'].forEach((id) => document.getElementById(id).addEventListener('change', run));
    cb.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v14 §3.5.2 wave 14-5: IMPROVE VTE (Spyropoulos 2011).
  'improve-vte'(root) {
    const items = [
      ['Prior VTE (+3)', 'iv-prior'],
      ['Known thrombophilia (+2)', 'iv-thr'],
      ['Lower-limb paralysis (+2)', 'iv-para'],
      ['Active cancer (+2)', 'iv-cancer'],
      ['Immobilized >=7 days (+1)', 'iv-immob'],
      ['ICU/CCU stay (+1)', 'iv-icu'],
      ['Age >60 years (+1)', 'iv-age60'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.improveVte({
        priorVte: checked('iv-prior'),
        thrombophilia: checked('iv-thr'),
        lowerLimbParalysis: checked('iv-para'),
        currentCancer: checked('iv-cancer'),
        immobilized7d: checked('iv-immob'),
        icuCcuStay: checked('iv-icu'),
        ageGt60: checked('iv-age60'),
      });
      o.appendChild(el('h2', { text: `IMPROVE-VTE ${r.score} of 12` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v14 §3.6.1 wave 14-6: Khorana Cancer-VTE (Khorana 2008).
  khorana(root) {
    root.appendChild(el('p', {}, [
      el('label', { for: 'kh-site', text: 'Site of cancer (Khorana 2008 risk category)' }), el('br'),
      el('select', { id: 'kh-site' }, [
        el('option', { value: 'other', text: 'Other (0)' }),
        el('option', { value: 'high', text: 'High risk: lung, lymphoma, gynecologic, bladder, testicular (+1)' }),
        el('option', { value: 'very-high', text: 'Very high risk: stomach, pancreas (+2)' }),
      ]),
    ]));
    const cb = [
      ['Pre-chemotherapy platelet count >=350 x10^9/L (+1)', 'kh-plt'],
      ['Hemoglobin <10 g/dL or use of erythropoiesis-stimulating agent (+1)', 'kh-hb'],
      ['Pre-chemotherapy WBC count >11 x10^9/L (+1)', 'kh-wbc'],
      ['BMI >=35 kg/m^2 (+1)', 'kh-bmi'],
    ];
    for (const [l, id] of cb) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.khorana({
        cancerSiteRisk: document.getElementById('kh-site').value,
        plateletGte350: checked('kh-plt'),
        hbLt10OrEsa: checked('kh-hb'),
        wbcGt11: checked('kh-wbc'),
        bmiGte35: checked('kh-bmi'),
      });
      o.appendChild(el('h2', { text: `Khorana ${r.score} of 6` }));
      o.appendChild(el('p', { text: r.band }));
    });
    document.getElementById('kh-site').addEventListener('change', run);
    cb.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v14 §3.6.2 wave 14-6: DASH (Tosetto 2012).
  'dash-vte'(root) {
    const items = [
      ['Abnormal post-anticoagulation D-dimer (+2)', 'da-dd'],
      ['Age <50 years at index VTE (+1)', 'da-age'],
      ['Male sex (+1)', 'da-male'],
      ['Hormone use at time of initial VTE (women only) (-2)', 'da-horm'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.dashVte({
        dDimerAbnormal: checked('da-dd'),
        ageLt50: checked('da-age'),
        male: checked('da-male'),
        hormoneUseAtInitialVteInWoman: checked('da-horm'),
      });
      o.appendChild(el('h2', { text: `DASH ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v14 §3.6.3 wave 14-6: HERDOO2 (Rodger 2017).
  herdoo2(root) {
    const items = [
      ['Hyperpigmentation, edema, or redness in either leg (+1)', 'hd-legs'],
      ['D-dimer >=250 ug/L while on anticoagulation (+1)', 'hd-dd'],
      ['BMI >=30 kg/m^2 (+1)', 'hd-bmi'],
      ['Age >=65 years (+1)', 'hd-age'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.herdoo2({
        legSignsPostThrombotic: checked('hd-legs'),
        dDimerGte250OnAnticoag: checked('hd-dd'),
        bmiGte30: checked('hd-bmi'),
        ageGte65: checked('hd-age'),
      });
      o.appendChild(el('h2', { text: `HERDOO2 ${r.score} of 4` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v14 §3.7.1 wave 14-7: 4Ts Score for HIT (Lo 2006).
  'four-ts'(root) {
    const items = [
      ['Thrombocytopenia: >50% fall + nadir >=20 (2); 30-50% fall or nadir 10-19 (1); <30% fall or nadir <10 (0)', '4t-thr'],
      ['Timing of platelet fall: clear onset 5-10 d or <=1 d (with prior heparin in last 30 d) (2); consistent 5-10 d but unclear or >10 d (1); <4 d without recent heparin (0)', '4t-time'],
      ['Thrombosis or other sequelae: new thrombosis, skin necrosis, or acute systemic reaction after IV heparin bolus (2); progressive/recurrent thrombosis or erythematous skin lesion (1); none (0)', '4t-throm'],
      ['oTher causes of thrombocytopenia: none apparent (2); possible (1); definite (0)', '4t-oth'],
    ];
    for (const [l, id] of items) root.appendChild(rangeField(l, id, 0, 2, 0));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.fourTs({
        thrombocytopenia: nv('4t-thr'),
        timingOfFall: nv('4t-time'),
        thrombosis: nv('4t-throm'),
        otherCauses: nv('4t-oth'),
      });
      o.appendChild(el('h2', { text: `4Ts ${r.score} of 8` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v14 §3.7.3 wave 14-7: ISTH Overt DIC (Taylor 2001).
  'isth-dic'(root) {
    root.appendChild(checkbox('Underlying disorder known to be associated with DIC is present (required gate per Taylor 2001)', 'id-gate'));
    root.appendChild(el('p', {}, [
      el('label', { for: 'id-plt', text: 'Platelet count (x10^9/L)' }), el('br'),
      el('select', { id: 'id-plt' }, [
        el('option', { value: '>100', text: '>100 (0)' }),
        el('option', { value: '50-100', text: '50-100 (+1)' }),
        el('option', { value: '<50', text: '<50 (+2)' }),
      ]),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'id-fdp', text: 'Fibrin marker (D-dimer / FDP)' }), el('br'),
      el('select', { id: 'id-fdp' }, [
        el('option', { value: 'none', text: 'No increase (0)' }),
        el('option', { value: 'moderate', text: 'Moderate increase (+2)' }),
        el('option', { value: 'strong', text: 'Strong increase (+3)' }),
      ]),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'id-pt', text: 'Prolonged PT (seconds above ULN)' }), el('br'),
      el('select', { id: 'id-pt' }, [
        el('option', { value: '<3s', text: '<3 s (0)' }),
        el('option', { value: '3-6s', text: '3-6 s (+1)' }),
        el('option', { value: '>6s', text: '>6 s (+2)' }),
      ]),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'id-fib', text: 'Fibrinogen (g/L)' }), el('br'),
      el('select', { id: 'id-fib' }, [
        el('option', { value: '>1', text: '>1 g/L (0)' }),
        el('option', { value: '<=1', text: '<=1 g/L (+1)' }),
      ]),
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.isthDic({
        underlyingDisorderPresent: checked('id-gate'),
        platelet: document.getElementById('id-plt').value,
        fibrinMarker: document.getElementById('id-fdp').value,
        ptProlonged: document.getElementById('id-pt').value,
        fibrinogen: document.getElementById('id-fib').value,
      });
      o.appendChild(el('h2', { text: r.gateNotMet ? 'ISTH DIC (gate not met)' : `ISTH DIC ${r.score} of 8` }));
      o.appendChild(el('p', { text: r.band }));
    });
    ['id-gate', 'id-plt', 'id-fdp', 'id-pt', 'id-fib']
      .forEach((id) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v14 §3.8.1 wave 14-8: DAPT Score (Yeh 2016).
  'dapt-score'(root) {
    root.appendChild(el('p', {}, [
      el('label', { for: 'dp-age', text: 'Age band' }), el('br'),
      el('select', { id: 'dp-age' }, [
        el('option', { value: '<65', text: '<65 (0)' }),
        el('option', { value: '65-74', text: '65-74 (-1)' }),
        el('option', { value: '>=75', text: '>=75 (-2)' }),
      ]),
    ]));
    const cb = [
      ['Congestive heart failure or LVEF <30% (+2)', 'dp-chf'],
      ['Vein graft PCI (+2)', 'dp-vgp'],
      ['MI at presentation (+1)', 'dp-mi'],
      ['Prior MI or prior PCI (+1)', 'dp-prior'],
      ['Diabetes (+1)', 'dp-dm'],
      ['Stent diameter <3 mm (+1)', 'dp-stent'],
      ['Paclitaxel-eluting stent (+1)', 'dp-pac'],
      ['Current smoker (+1)', 'dp-smoke'],
    ];
    for (const [l, id] of cb) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.daptScore({
        ageBand: document.getElementById('dp-age').value,
        chfOrLvefLt30: checked('dp-chf'),
        veinGraftPci: checked('dp-vgp'),
        miAtPresentation: checked('dp-mi'),
        priorMiOrPci: checked('dp-prior'),
        diabetes: checked('dp-dm'),
        stentDiameterLt3mm: checked('dp-stent'),
        paclitaxelStent: checked('dp-pac'),
        currentSmoker: checked('dp-smoke'),
      });
      o.appendChild(el('h2', { text: `DAPT Score ${r.score}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    document.getElementById('dp-age').addEventListener('change', run);
    cb.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v14 §3.2.2 wave 14-2 backfill: Berlin Questionnaire (Netzer 1999).
  'berlin-osa'(root) {
    root.appendChild(el('h3', { text: 'Category 1: snoring (positive if >=2 answers below)' }));
    const cat1 = [
      ['Do you snore?', 'bo-q1'],
      ['Is your snoring louder than talking?', 'bo-q2'],
      ['Do you snore >=3-4 times per week?', 'bo-q3'],
      ['Has your snoring bothered other people?', 'bo-q4'],
      ['Has anyone noticed you stop breathing during sleep >=3-4 times/week?', 'bo-q5'],
    ];
    for (const [l, id] of cat1) root.appendChild(checkbox(l, id));
    root.appendChild(el('h3', { text: 'Category 2: daytime sleepiness (positive if >=2)' }));
    const cat2 = [
      ['Tired or fatigued after sleep >=3-4 times/week?', 'bo-q6'],
      ['Tired/fatigued during waking hours >=3-4 times/week?', 'bo-q7'],
      ['Have you nodded off or fallen asleep while driving?', 'bo-q8'],
    ];
    for (const [l, id] of cat2) root.appendChild(checkbox(l, id));
    root.appendChild(el('h3', { text: 'Category 3: hypertension or obesity (positive if either)' }));
    const cat3 = [
      ['Hypertension (history of high blood pressure)', 'bo-htn'],
      ['BMI > 30 kg/m^2', 'bo-bmi'],
    ];
    for (const [l, id] of cat3) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.berlinOsa({
        q1Snore: checked('bo-q1'),
        q2LouderThanTalking: checked('bo-q2'),
        q3FreqAtLeast3to4PerWeek: checked('bo-q3'),
        q4BotheredOthers: checked('bo-q4'),
        q5ObservedApneaAtLeast3to4PerWeek: checked('bo-q5'),
        q6TiredAfterSleepAtLeast3to4PerWeek: checked('bo-q6'),
        q7TiredDuringDayAtLeast3to4PerWeek: checked('bo-q7'),
        q8NoddedOffWhileDriving: checked('bo-q8'),
        hasHypertension: checked('bo-htn'),
        bmiGt30: checked('bo-bmi'),
      });
      o.appendChild(el('h2', { text: r.highRisk ? 'Berlin: HIGH risk for OSA' : 'Berlin: LOW risk for OSA' }));
      o.appendChild(el('p', { text: r.band }));
      o.appendChild(el('p', { class: 'muted', text: `Categories positive: 1=${r.cat1Positive ? 'yes' : 'no'} (${r.cat1Yes}/5 answers); 2=${r.cat2Positive ? 'yes' : 'no'} (${r.cat2Yes}/3); 3=${r.cat3Positive ? 'yes' : 'no'}.` }));
    });
    [...cat1, ...cat2, ...cat3].forEach(([, id]) =>
      document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v14 §3.3.1 wave 14-3 backfill: LEMON Difficult Airway (Reed 2005).
  lemon(root) {
    const items = [
      ['Look externally: bearded, edentulous, facial trauma, large incisors, large tongue, etc. (+1)', 'le-look'],
      ['Evaluate 3-3-2: incisor opening <3 fingerbreadths (+1)', 'le-incisor'],
      ['Evaluate 3-3-2: hyoid-to-mental distance <3 fingerbreadths (+1)', 'le-hyoid'],
      ['Evaluate 3-3-2: thyroid-to-floor-of-mouth <2 fingerbreadths (+1)', 'le-thyroid'],
      ['Mallampati class >=III (+1)', 'le-mp'],
      ['Obstruction or Obesity (+1)', 'le-obs'],
      ['Neck mobility limited (+1)', 'le-neck'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.lemon({
        lookExternal: checked('le-look'),
        incisorLt3fb: checked('le-incisor'),
        hyoidMentalLt3fb: checked('le-hyoid'),
        thyroidFloorLt2fb: checked('le-thyroid'),
        mallampatiGte3: checked('le-mp'),
        obstruction: checked('le-obs'),
        neckMobilityLimited: checked('le-neck'),
      });
      o.appendChild(el('h2', { text: `LEMON ${r.score} of 8` }));
      o.appendChild(el('p', { text: r.band }));
      o.appendChild(el('p', { class: 'muted', text: `3-3-2 subtotal: ${r.threeThreeTwo} of 3.` }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v14 §3.3.4 wave 14-3 backfill: White-Song Fast-Track (White 1999).
  'white-song'(root) {
    const items = [
      ['LOC (awake & oriented = 2, arousable = 1, responsive only to tactile = 0)', 'ws-loc'],
      ['Physical activity (move all extremities on command = 2, some weakness = 1, unable = 0)', 'ws-act'],
      ['Hemodynamic stability (BP <15% baseline = 2, 15-30% = 1, >30% = 0)', 'ws-hd'],
      ['Respiratory stability (deep breath = 2, tachypnea + good cough = 1, dyspnea + weak cough = 0)', 'ws-resp'],
      ['Oxygen saturation (>90% on room air = 2, supplemental O2 needed = 1, <90% with O2 = 0)', 'ws-o2'],
      ['Postoperative pain (none/mild = 2, moderate-severe controlled with IV analgesics = 1, persistent severe pain = 0)', 'ws-pain'],
      ['Postoperative emetic symptoms (none/mild nausea + no active vomiting = 2, transient vomiting/retching = 1, persistent moderate-severe N/V = 0)', 'ws-eme'],
    ];
    for (const [l, id] of items) root.appendChild(rangeField(l, id, 0, 2, 2));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.whiteSong({
        loc: nv('ws-loc'),
        physicalActivity: nv('ws-act'),
        hemodynamicStability: nv('ws-hd'),
        respiratoryStability: nv('ws-resp'),
        oxygenSaturation: nv('ws-o2'),
        postoperativePain: nv('ws-pain'),
        postoperativeEmesis: nv('ws-eme'),
      });
      o.appendChild(el('h2', { text: `White-Song ${r.score} of 14` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v15 §3.1.1 wave 15-1: Biophysical Profile (Manning 1980).
  bpp(root) {
    const items = [
      ['Fetal breathing movements (>=1 episode >=30 s in 30 min) (+2)', 'bp-fb'],
      ['Fetal movements (>=3 discrete body/limb movements in 30 min) (+2)', 'bp-fm'],
      ['Fetal tone (>=1 episode of active extension w/ return to flexion) (+2)', 'bp-ft'],
      ['Amniotic fluid volume (>=1 pocket >=2 cm in two perpendicular planes) (+2)', 'bp-af'],
      ['Reactive non-stress test (NST) (+2)', 'bp-nst'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.bpp({
        fetalBreathing: checked('bp-fb'),
        fetalMovements: checked('bp-fm'),
        fetalTone: checked('bp-ft'),
        amnioticFluid: checked('bp-af'),
        reactiveNst: checked('bp-nst'),
      });
      o.appendChild(el('h2', { text: `BPP ${r.score} of 10` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v15 §3.1.3 wave 15-1: ACOG Severe-feature Preeclampsia.
  'acog-severe-pre'(root) {
    const items = [
      ['SBP >=160 or DBP >=110 on two occasions >=4 h apart', 'sp-bp'],
      ['Thrombocytopenia (platelets <100 x10^9/L)', 'sp-plt'],
      ['Impaired hepatic function (transaminases >=2x ULN, or persistent severe RUQ/epigastric pain)', 'sp-hep'],
      ['Creatinine >1.1 mg/dL or doubled baseline', 'sp-cr'],
      ['Pulmonary edema', 'sp-pulm'],
      ['New cerebral or visual disturbances', 'sp-neuro'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.acogSeverePre({
        sbpGte160OrDbpGte110: checked('sp-bp'),
        thrombocytopeniaLt100: checked('sp-plt'),
        impairedHepaticFunction: checked('sp-hep'),
        creatinineGt11OrDoubled: checked('sp-cr'),
        pulmonaryEdema: checked('sp-pulm'),
        cerebralOrVisualDisturbances: checked('sp-neuro'),
      });
      o.appendChild(el('h2', { text: r.severe ? 'ACOG: severe preeclampsia' : 'ACOG: no severe features' }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v15 §3.1.4 wave 15-1: HELLP Criteria (Sibai 1990).
  hellp(root) {
    const items = [
      ['Hemolysis (abnormal peripheral smear AND/OR total bili >=1.2 AND/OR LDH >=600)', 'hl-hem'],
      ['Elevated liver enzymes (AST >=70 U/L)', 'hl-ast'],
      ['Low platelets (<100 x10^9/L)', 'hl-plt'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    root.appendChild(el('p', {}, [
      el('label', { for: 'hl-nadir', text: 'Platelet nadir for Mississippi class (x10^9/L, optional)' }), el('br'),
      el('input', { id: 'hl-nadir', type: 'number', step: 'any' }),
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const nadir = document.getElementById('hl-nadir').value;
      const r = S4.hellp({
        hemolysis: checked('hl-hem'),
        astGte70: checked('hl-ast'),
        plateletsLt100: checked('hl-plt'),
        plateletNadirThousands: nadir,
      });
      let label;
      if (r.complete) label = 'HELLP: complete';
      else if (r.partial) label = `HELLP: partial (${r.criteriaMet} of 3)`;
      else label = 'HELLP: no criteria met';
      o.appendChild(el('h2', { text: label }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    document.getElementById('hl-nadir').addEventListener('input', run);
    run();
  },

  // spec-v15 §3.1.5 wave 15-1: Carpenter-Coustan (Carpenter 1982).
  'carpenter-coustan'(root) {
    const fields = [
      ['Fasting glucose (mg/dL)', 'cc-f', 85],
      ['1-hour glucose (mg/dL)', 'cc-1h', 160],
      ['2-hour glucose (mg/dL)', 'cc-2h', 140],
      ['3-hour glucose (mg/dL)', 'cc-3h', 120],
    ];
    for (const [l, id, v] of fields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', step: 'any', value: String(v) }),
      ]));
    }
    root.appendChild(el('p', { class: 'muted', text: 'Cutoffs (mg/dL): fasting 95, 1-h 180, 2-h 155, 3-h 140. GDM if >=2 values exceed.' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.carpenterCoustan({
        fasting: nv('cc-f'),
        oneHour: nv('cc-1h'),
        twoHour: nv('cc-2h'),
        threeHour: nv('cc-3h'),
      });
      o.appendChild(el('h2', { text: `Carpenter-Coustan: ${r.exceeded} of 4 abnormal` }));
      o.appendChild(el('p', { text: r.band }));
    });
    fields.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v15 §3.1.6 wave 15-1: IADPSG GDM (IADPSG 2010).
  iadpsg(root) {
    const fields = [
      ['Fasting glucose (mg/dL)', 'ia-f', 85],
      ['1-hour glucose (mg/dL)', 'ia-1h', 160],
      ['2-hour glucose (mg/dL)', 'ia-2h', 140],
    ];
    for (const [l, id, v] of fields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', step: 'any', value: String(v) }),
      ]));
    }
    root.appendChild(el('p', { class: 'muted', text: 'Cutoffs (mg/dL): fasting 92, 1-h 180, 2-h 153. GDM if >=1 value exceeds.' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.iadpsg({
        fasting: nv('ia-f'),
        oneHour: nv('ia-1h'),
        twoHour: nv('ia-2h'),
      });
      o.appendChild(el('h2', { text: `IADPSG: ${r.exceeded} of 3 abnormal` }));
      o.appendChild(el('p', { text: r.band }));
    });
    fields.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v15 §3.2.1 wave 15-2: Rochester (Jaskiewicz 1994).
  rochester(root) {
    const items = [
      ['Age <=60 days', 'rc-age'],
      ['Term gestation and previously healthy', 'rc-term'],
      ['No focal infection on physical exam', 'rc-focal'],
      ['WBC count 5-15 x10^9/L', 'rc-wbc'],
      ['Bands <=1.5 x10^9/L', 'rc-bands'],
      ['Urine WBC <=10/HPF', 'rc-urine'],
      ['Stool WBC <=5/HPF (if diarrhea)', 'rc-stool'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.rochester({
        ageLte60Days: checked('rc-age'),
        termAndPreviouslyHealthy: checked('rc-term'),
        noFocalInfection: checked('rc-focal'),
        wbc5to15: checked('rc-wbc'),
        bandsLte1Point5: checked('rc-bands'),
        urineWbcLte10PerHpf: checked('rc-urine'),
        stoolWbcLte5PerHpf: checked('rc-stool'),
      });
      o.appendChild(el('h2', { text: r.lowRisk ? 'Rochester: LOW risk' : `Rochester: not low risk (${r.metCount}/${r.totalCount})` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v15 §3.2.2 wave 15-2: Philadelphia (Baker 1993).
  philadelphia(root) {
    const items = [
      ['Age 29-60 days', 'ph-age'],
      ['Well-appearing', 'ph-well'],
      ['WBC <15 x10^9/L', 'ph-wbc'],
      ['Band:neutrophil ratio <0.2', 'ph-bnr'],
      ['UA <10 WBC/HPF and few bacteria', 'ph-ua'],
      ['CSF <8 WBC/mm^3 and Gram stain negative', 'ph-csf'],
      ['Chest x-ray clear (or not obtained)', 'ph-cxr'],
      ['Stool studies normal (or no diarrhea)', 'ph-stool'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.philadelphia({
        age29To60Days: checked('ph-age'),
        wellAppearing: checked('ph-well'),
        wbcLt15: checked('ph-wbc'),
        bandToNeutrophilRatioLt0Point2: checked('ph-bnr'),
        uaLt10WbcAndFewBacteria: checked('ph-ua'),
        csfLt8WbcAndGramStainNeg: checked('ph-csf'),
        cxrClearOrNotObtained: checked('ph-cxr'),
        stoolNormalOrNoDiarrhea: checked('ph-stool'),
      });
      o.appendChild(el('h2', { text: r.lowRisk ? 'Philadelphia: LOW risk' : `Philadelphia: not low risk (${r.metCount}/${r.totalCount})` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v15 §3.2.3 wave 15-2: Boston (Baskin 1992).
  'boston-febrile'(root) {
    const items = [
      ['Age 28-89 days', 'bf-age'],
      ['Well-appearing', 'bf-well'],
      ['No focal source on physical exam', 'bf-focal'],
      ['WBC <20 x10^9/L', 'bf-wbc'],
      ['UA <10 WBC/HPF', 'bf-ua'],
      ['CSF <10 WBC/mm^3', 'bf-csf'],
      ['Chest x-ray clear (or not obtained)', 'bf-cxr'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.bostonFebrile({
        age28To89Days: checked('bf-age'),
        wellAppearing: checked('bf-well'),
        noFocalSourceOnExam: checked('bf-focal'),
        wbcLt20: checked('bf-wbc'),
        uaLt10WbcPerHpf: checked('bf-ua'),
        csfLt10WbcPerMm3: checked('bf-csf'),
        cxrClearOrNotObtained: checked('bf-cxr'),
      });
      o.appendChild(el('h2', { text: r.lowRisk ? 'Boston: outpatient ceftriaxone eligible' : `Boston: not eligible (${r.metCount}/${r.totalCount})` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v15 §3.2.4 wave 15-2: Step-by-Step (Gomez 2016).
  'step-by-step'(root) {
    const items = [
      ['Unwell-appearing (step 1 - if YES, HIGH risk)', 'ss-unwell'],
      ['Age <=21 days (step 2 - if YES, HIGH risk)', 'ss-age'],
      ['Urinalysis abnormal / leukocyturia (step 3 - if YES, HIGH risk)', 'ss-ua'],
      ['Procalcitonin >=0.5 ng/mL (step 4 - if YES, HIGH risk)', 'ss-pct'],
      ['CRP >20 mg/L OR ANC >10 x10^9/L (step 5 - if YES, INTERMEDIATE risk)', 'ss-crp'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.stepByStep({
        unwellAppearance: checked('ss-unwell'),
        ageLte21Days: checked('ss-age'),
        urinalysisAbnormal: checked('ss-ua'),
        procalcitoninGte0Point5: checked('ss-pct'),
        crpGt20OrAncGt10: checked('ss-crp'),
      });
      o.appendChild(el('h2', { text: `Step-by-Step: ${r.risk.toUpperCase()} risk` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v15 §3.2.5 wave 15-2: Yale Observation Scale (McCarthy 1982).
  yos(root) {
    const items = [
      ['Quality of cry (1 strong/normal / 3 whimpering or sobbing / 5 weak/moaning/high-pitched)', 'yo-cry'],
      ['Reaction to parent stimulation (1 cries briefly then stops or content / 3 cries on and off / 5 persistent or hardly responds)', 'yo-react'],
      ['State variation (1 if awake stays awake or asleep wakes quickly / 3 eyes close briefly when awake or wakes with prolonged stimulation / 5 falls to sleep or will not arouse)', 'yo-state'],
      ['Color (1 pink / 3 pale extremities or acrocyanosis / 5 pale or cyanotic or mottled or ashen)', 'yo-color'],
      ['Hydration (1 skin normal eyes normal mucous moist / 3 skin/eyes normal mouth slightly dry / 5 skin doughy or tented eyes sunken mucous dry)', 'yo-hydr'],
      ['Response to social overtures (1 smiles or alert / 3 brief smile or alert briefly / 5 no smile face anxious dull expressionless or not alert)', 'yo-social'],
    ];
    for (const [l, id] of items) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('select', { id }, [1, 3, 5].map((n) => el('option', { value: String(n), text: String(n) }))),
      ]));
    }
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.yos({
        qualityOfCry: nv('yo-cry'),
        reactionToParents: nv('yo-react'),
        stateVariation: nv('yo-state'),
        color: nv('yo-color'),
        hydration: nv('yo-hydr'),
        responseToSocialOvertures: nv('yo-social'),
      });
      o.appendChild(el('h2', { text: `YOS ${r.score} of 30` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v15 §3.3.1 wave 15-3: Westley Croup (Westley 1978).
  westley(root) {
    const selects = [
      ['Level of consciousness', 'wc-loc', [[0, 'Normal (0)'], [5, 'Disoriented (+5)']]],
      ['Cyanosis', 'wc-cyan', [[0, 'None (0)'], [4, 'With agitation (+4)'], [5, 'At rest (+5)']]],
      ['Stridor', 'wc-stri', [[0, 'None (0)'], [1, 'With agitation (+1)'], [2, 'At rest (+2)']]],
      ['Air entry', 'wc-air', [[0, 'Normal (0)'], [1, 'Decreased (+1)'], [2, 'Markedly decreased (+2)']]],
      ['Retractions', 'wc-retr', [[0, 'None (0)'], [1, 'Mild (+1)'], [2, 'Moderate (+2)'], [3, 'Severe (+3)']]],
    ];
    for (const [label, id, opts] of selects) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: label }), el('br'),
        el('select', { id }, opts.map(([v, t]) => el('option', { value: String(v), text: t }))),
      ]));
    }
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.westley({
        loc: nv('wc-loc'), cyanosis: nv('wc-cyan'), stridor: nv('wc-stri'),
        airEntry: nv('wc-air'), retractions: nv('wc-retr'),
      });
      o.appendChild(el('h2', { text: `Westley ${r.score} of 17` }));
      o.appendChild(el('p', { text: r.band }));
    });
    selects.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v15 §3.3.2 wave 15-3: PRAM (Chalut 2000).
  'pram-asthma'(root) {
    const selects = [
      ['Suprasternal retractions', 'pr-supra', [[0, 'Absent (0)'], [2, 'Present (+2)']]],
      ['Scalene muscle use', 'pr-scal', [[0, 'Absent (0)'], [2, 'Present (+2)']]],
      ['Air entry', 'pr-air', [[0, 'Normal (0)'], [1, 'Decreased at base (+1)'], [2, 'Widespread decrease (+2)'], [3, 'Absent/minimal (+3)']]],
      ['Wheezing', 'pr-wheez', [[0, 'Absent (0)'], [1, 'Expiratory only (+1)'], [2, 'Inspiratory and expiratory (+2)'], [3, 'Audible without stethoscope / silent chest (+3)']]],
      ['SpO2 on room air', 'pr-spo2', [[0, '>=95% (0)'], [1, '92-94% (+1)'], [2, '<92% (+2)']]],
    ];
    for (const [label, id, opts] of selects) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: label }), el('br'),
        el('select', { id }, opts.map(([v, t]) => el('option', { value: String(v), text: t }))),
      ]));
    }
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.pramAsthma({
        suprasternal: nv('pr-supra'), scalene: nv('pr-scal'),
        airEntry: nv('pr-air'), wheezing: nv('pr-wheez'), spo2: nv('pr-spo2'),
      });
      o.appendChild(el('h2', { text: `PRAM ${r.score} of 12` }));
      o.appendChild(el('p', { text: r.band }));
    });
    selects.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v15 §3.3.3 wave 15-3: PASS (Gorelick 2004).
  'pass-asthma'(root) {
    const items = [
      ['Wheezing (0 absent / 1 end-expiratory only / 2 inspiratory + expiratory)', 'pa-wh'],
      ['Work of breathing (0 normal / 1 intercostal/subcostal retractions / 2 marked w/ accessory muscles)', 'pa-wob'],
      ['Prolonged expiration (0 normal I:E / 1 mild prolongation / 2 marked prolongation)', 'pa-exp'],
    ];
    for (const [l, id] of items) root.appendChild(rangeField(l, id, 0, 2, 0));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.passAsthma({
        wheezing: nv('pa-wh'),
        workOfBreathing: nv('pa-wob'),
        prolongedExpiration: nv('pa-exp'),
      });
      o.appendChild(el('h2', { text: `PASS ${r.score} of 6` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v15 §3.3.4 wave 15-3: Pediatric GCS (Reilly 1988).
  'peds-gcs'(root) {
    root.appendChild(el('p', {}, [
      el('label', { for: 'pg-age', text: 'Age band (for verbal scale)' }), el('br'),
      el('select', { id: 'pg-age' }, [
        el('option', { value: 'under-2', text: '<2 years' }),
        el('option', { value: '2-5', text: '2-5 years' }),
        el('option', { value: 'older', text: 'Older child (adult scale)' }),
      ]),
    ]));
    root.appendChild(rangeField('Eye opening (1 none, 4 spontaneous)', 'pg-eye', 1, 4, 4));
    root.appendChild(rangeField('Best verbal response (1-5; age-adjusted: see audit log)', 'pg-verb', 1, 5, 5));
    root.appendChild(rangeField('Best motor response (1 none, 6 obeys/spontaneous)', 'pg-mot', 1, 6, 6));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.pedsGcs({
        eye: nv('pg-eye'),
        verbal: nv('pg-verb'),
        motor: nv('pg-mot'),
        ageBand: document.getElementById('pg-age').value,
      });
      o.appendChild(el('h2', { text: `Pediatric GCS ${r.score} of 15` }));
      o.appendChild(el('p', { text: r.band }));
    });
    ['pg-age', 'pg-eye', 'pg-verb', 'pg-mot'].forEach((id) =>
      document.getElementById(id).addEventListener(id === 'pg-age' ? 'change' : 'input', run));
    run();
  },

  // spec-v15 §3.3.5 wave 15-3: Bacterial Meningitis Score (Nigrovic 2007).
  nigrovic(root) {
    const items = [
      ['Positive CSF Gram stain (+2)', 'ni-gram'],
      ['CSF ANC >=1000 cells/mm^3 (+1)', 'ni-csf-anc'],
      ['CSF protein >=80 mg/dL (+1)', 'ni-prot'],
      ['Peripheral ANC >=10,000 cells/mm^3 (+1)', 'ni-anc'],
      ['Seizure at or before presentation (+1)', 'ni-sz'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.nigrovic({
        csfGramStainPositive: checked('ni-gram'),
        csfAncGte1000: checked('ni-csf-anc'),
        csfProteinGte80: checked('ni-prot'),
        peripheralAncGte10000: checked('ni-anc'),
        seizureAtOrBeforePresentation: checked('ni-sz'),
      });
      o.appendChild(el('h2', { text: r.veryLowRisk ? 'Nigrovic: very low risk' : `Nigrovic ${r.score}: not low risk` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v15 §3.4.1 wave 15-4: PECARN IAI (Holmes 2013).
  'pecarn-iai'(root) {
    const items = [
      ['Evidence of abdominal wall trauma or seat-belt sign', 'pi-wall'],
      ['GCS <14', 'pi-gcs'],
      ['Abdominal tenderness on exam', 'pi-tender'],
      ['Vomiting', 'pi-vom'],
      ['Thoracic wall trauma', 'pi-thor'],
      ['Complaint of abdominal pain', 'pi-pain'],
      ['Decreased breath sounds', 'pi-breath'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.pecarnIai({
        abdominalWallTraumaOrSeatBeltSign: checked('pi-wall'),
        gcsLt14: checked('pi-gcs'),
        abdominalTenderness: checked('pi-tender'),
        vomiting: checked('pi-vom'),
        thoracicWallTrauma: checked('pi-thor'),
        abdominalPain: checked('pi-pain'),
        decreasedBreathSounds: checked('pi-breath'),
      });
      o.appendChild(el('h2', { text: r.veryLowRisk ? 'PECARN IAI: very low risk' : `PECARN IAI: ${r.presentCount}/7 risk findings` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v15 §3.4.2 wave 15-4: PECARN C-Spine (Leonard 2019).
  'pecarn-cspine'(root) {
    const items = [
      ['Altered mental status', 'pc-ams'],
      ['Abnormal airway/breathing/circulation', 'pc-abc'],
      ['Focal neurologic deficit', 'pc-neuro'],
      ['Neck pain', 'pc-neck'],
      ['Torticollis', 'pc-tort'],
      ['Substantial torso injury', 'pc-torso'],
      ['Predisposing condition (e.g., Down syndrome, juvenile arthritis)', 'pc-pred'],
      ['High-risk motor vehicle collision', 'pc-mvc'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.pecarnCspine({
        alteredMentalStatus: checked('pc-ams'),
        abnormalAirwayBreathingCirculation: checked('pc-abc'),
        focalNeurologicDeficit: checked('pc-neuro'),
        neckPain: checked('pc-neck'),
        torticollis: checked('pc-tort'),
        substantialTorsoInjury: checked('pc-torso'),
        predisposingCondition: checked('pc-pred'),
        highRiskMvc: checked('pc-mvc'),
      });
      o.appendChild(el('h2', { text: r.lowRisk ? 'PECARN C-Spine: LOW risk' : `PECARN C-Spine: ${r.presentCount}/8 risk factors` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v15 §3.5.8 wave 15-5: ABC Score for Massive Transfusion (Nunez 2009).
  'abc-mtp'(root) {
    const items = [
      ['Penetrating mechanism', 'abc-pen'],
      ['SBP <=90 mmHg', 'abc-sbp'],
      ['Heart rate >=120 bpm', 'abc-hr'],
      ['Positive FAST exam', 'abc-fast'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.abcMtp({
        penetratingMechanism: checked('abc-pen'),
        sbpLe90: checked('abc-sbp'),
        hrGe120: checked('abc-hr'),
        positiveFast: checked('abc-fast'),
      });
      o.appendChild(el('h2', { text: r.activateMtp ? `ABC ${r.score}/4: activate MTP` : `ABC ${r.score}/4` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v14 §3.3.3 wave 14-3: modified Aldrete (Aldrete 1995).
  aldrete(root) {
    const items = [
      ['Activity (move 4 extremities = 2, 2 = 1, 0 = 0)', 'al-act'],
      ['Respiration (deep breathe + cough = 2, dyspneic/shallow = 1, apneic = 0)', 'al-resp'],
      ['Circulation (BP +/- 20% preop = 2, +/- 20-50% = 1, +/- 50% = 0)', 'al-circ'],
      ['Consciousness (fully awake = 2, arousable on calling = 1, not responding = 0)', 'al-cons'],
      ['O2 saturation (>92% on room air = 2, supplemental O2 needed = 1, <90% with O2 = 0)', 'al-o2'],
    ];
    for (const [l, id] of items) root.appendChild(rangeField(l, id, 0, 2, 2));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.aldrete({
        activity: nv('al-act'),
        respiration: nv('al-resp'),
        circulation: nv('al-circ'),
        consciousness: nv('al-cons'),
        oxygenSaturation: nv('al-o2'),
      });
      o.appendChild(el('h2', { text: `modified Aldrete ${r.score} of 10` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v29 §4.1.2 wave 29-3a: Braden Scale (Bergstrom 1987).
  braden(root) {
    const items = [
      ['Sensory perception (1 completely limited - 4 no impairment)', 'br-sens', 4],
      ['Moisture (1 constantly moist - 4 rarely moist)', 'br-moist', 4],
      ['Activity (1 bedfast - 4 walks frequently)', 'br-act', 4],
      ['Mobility (1 completely immobile - 4 no limitation)', 'br-mob', 4],
      ['Nutrition (1 very poor - 4 excellent)', 'br-nutr', 4],
      ['Friction and shear (1 problem - 3 no apparent problem)', 'br-fric', 3],
    ];
    for (const [l, id, max] of items) root.appendChild(rangeField(l, id, 1, max, max));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.braden({
        sensory: nv('br-sens'), moisture: nv('br-moist'), activity: nv('br-act'),
        mobility: nv('br-mob'), nutrition: nv('br-nutr'), friction: nv('br-fric'),
      });
      o.appendChild(el('h2', { text: `Braden ${r.score} (${r.band})` }));
      o.appendChild(el('p', { text: r.text }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v29 §4.2.1 wave 29-3a: Morse Fall Scale (Morse 1989).
  'morse-falls'(root) {
    root.appendChild(checkbox('History of falling (within 3 months) +25', 'mf-hist'));
    root.appendChild(checkbox('Secondary diagnosis +15', 'mf-sec'));
    const aidWrap = el('p', {}, [
      el('label', { for: 'mf-aid', text: 'Ambulatory aid' }), el('br'),
      el('select', { id: 'mf-aid' }, [
        el('option', { value: 'none', text: 'None / bed rest / nurse assist (0)' }),
        el('option', { value: 'crutches-cane-walker', text: 'Crutches / cane / walker (+15)' }),
        el('option', { value: 'furniture', text: 'Furniture (+30)' }),
      ]),
    ]);
    root.appendChild(aidWrap);
    root.appendChild(checkbox('IV / heparin lock +20', 'mf-iv'));
    const gaitWrap = el('p', {}, [
      el('label', { for: 'mf-gait', text: 'Gait' }), el('br'),
      el('select', { id: 'mf-gait' }, [
        el('option', { value: 'normal', text: 'Normal / bed rest / wheelchair (0)' }),
        el('option', { value: 'weak', text: 'Weak (+10)' }),
        el('option', { value: 'impaired', text: 'Impaired (+20)' }),
      ]),
    ]);
    root.appendChild(gaitWrap);
    const msWrap = el('p', {}, [
      el('label', { for: 'mf-ms', text: 'Mental status' }), el('br'),
      el('select', { id: 'mf-ms' }, [
        el('option', { value: 'oriented', text: 'Oriented to own ability (0)' }),
        el('option', { value: 'forgets-limitations', text: 'Forgets limitations (+15)' }),
      ]),
    ]);
    root.appendChild(msWrap);
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.morseFalls({
        history: checked('mf-hist'),
        secondaryDx: checked('mf-sec'),
        ambulatoryAid: document.getElementById('mf-aid').value,
        ivOrLock: checked('mf-iv'),
        gait: document.getElementById('mf-gait').value,
        mentalStatus: document.getElementById('mf-ms').value,
      });
      o.appendChild(el('h2', { text: `Morse ${r.score} (${r.band})` }));
      o.appendChild(el('p', { text: r.text }));
    });
    const watchIds = ['mf-hist', 'mf-sec', 'mf-aid', 'mf-iv', 'mf-gait', 'mf-ms'];
    watchIds.forEach((id) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v29 §4.2.2 wave 29-3a: Hendrich II Fall Risk (Hendrich 2003).
  'hendrich-ii'(root) {
    const flags = [
      ['Confusion / disorientation / impulsivity +4', 'hii-conf'],
      ['Symptomatic depression +2', 'hii-dep'],
      ['Altered elimination +1', 'hii-elim'],
      ['Dizziness / vertigo +1', 'hii-dizz'],
      ['Male +1', 'hii-male'],
      ['Prescribed antiepileptic +2', 'hii-aed'],
      ['Prescribed benzodiazepine +1', 'hii-bz'],
    ];
    for (const [l, id] of flags) root.appendChild(checkbox(l, id));
    const gugWrap = el('p', {}, [
      el('label', { for: 'hii-gug', text: 'Get-up-and-go test' }), el('br'),
      el('select', { id: 'hii-gug' }, [
        el('option', { value: 'able', text: 'Able to rise in single movement (0)' }),
        el('option', { value: 'pushes-up', text: 'Pushes up successfully in one attempt (+1)' }),
        el('option', { value: 'needs-help', text: 'Multiple attempts but successful (+3)' }),
        el('option', { value: 'unable', text: 'Unable to rise without assistance (+4)' }),
      ]),
    ]);
    root.appendChild(gugWrap);
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.hendrichII({
        confusion: checked('hii-conf'),
        depression: checked('hii-dep'),
        alteredElim: checked('hii-elim'),
        dizziness: checked('hii-dizz'),
        male: checked('hii-male'),
        antiepileptic: checked('hii-aed'),
        benzodiazepine: checked('hii-bz'),
        getUpAndGo: document.getElementById('hii-gug').value,
      });
      o.appendChild(el('h2', { text: `Hendrich II ${r.score} (${r.band})` }));
      o.appendChild(el('p', { text: r.text }));
    });
    flags.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    document.getElementById('hii-gug').addEventListener('change', run);
    run();
  },

  // spec-v29 §4.1.1 wave 29-3b: NPIAP staging (Edsberg 2016 / NPIAP 2019).
  'npiap-staging'(root) {
    root.appendChild(checkbox('Mucosal membrane location', 'np-muc'));
    root.appendChild(checkbox('Skin intact', 'np-intact'));
    const blanchWrap = el('p', {}, [
      el('label', { for: 'np-blanch', text: 'If skin intact, erythema behavior' }), el('br'),
      el('select', { id: 'np-blanch' }, [
        el('option', { value: 'blanchable',                          text: 'Blanchable erythema (no PI)' }),
        el('option', { value: 'non-blanchable-erythema',             text: 'Non-blanchable erythema (Stage 1)' }),
        el('option', { value: 'non-blanchable-deep-discoloration',   text: 'Non-blanchable deep red/maroon/purple (DTPI)' }),
      ]),
    ]);
    root.appendChild(blanchWrap);
    root.appendChild(checkbox('If skin NOT intact: slough or eschar obscures the wound base', 'np-obs'));
    const depthWrap = el('p', {}, [
      el('label', { for: 'np-depth', text: 'If skin NOT intact and not obscured, depth' }), el('br'),
      el('select', { id: 'np-depth' }, [
        el('option', { value: 'partial-thickness',     text: 'Partial-thickness; exposed dermis (Stage 2)' }),
        el('option', { value: 'subq-visible',          text: 'Full-thickness; subcutaneous fat visible (Stage 3)' }),
        el('option', { value: 'bone-tendon-muscle',    text: 'Full-thickness; bone, tendon, or muscle visible (Stage 4)' }),
      ]),
    ]);
    root.appendChild(depthWrap);
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.npiapStaging({
        mucosal: checked('np-muc'),
        skinIntact: checked('np-intact'),
        blanching: document.getElementById('np-blanch').value,
        obscured: checked('np-obs'),
        depth: document.getElementById('np-depth').value,
      });
      o.appendChild(el('h2', { text: r.stage }));
      o.appendChild(el('p', { text: r.text }));
    });
    ['np-muc', 'np-intact', 'np-blanch', 'np-obs', 'np-depth'].forEach((id) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v29 §4.1.3 wave 29-3b: Norton + PUSH (Norton 1962; NPIAP 2005).
  'norton-push'(root) {
    const nortonItems = [
      ['Norton: physical condition (1 very bad - 4 good)', 'nr-pc'],
      ['Norton: mental condition (1 stuporous - 4 alert)', 'nr-mc'],
      ['Norton: activity (1 bedfast - 4 ambulant)',         'nr-act'],
      ['Norton: mobility (1 immobile - 4 full)',            'nr-mob'],
      ['Norton: incontinence (1 doubly - 4 not)',           'nr-inc'],
    ];
    for (const [l, id] of nortonItems) root.appendChild(rangeField(l, id, 1, 4, 4));
    root.appendChild(rangeField('PUSH: length x width band (0 closed - 10 >24 cm^2)', 'pu-lw', 0, 10, 0));
    root.appendChild(rangeField('PUSH: exudate amount (0 none - 3 heavy)', 'pu-ex', 0, 3, 0));
    root.appendChild(rangeField('PUSH: tissue type (0 closed - 4 necrotic)', 'pu-tt', 0, 4, 0));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.nortonPush({
        physicalCondition: nv('nr-pc'),
        mentalCondition:   nv('nr-mc'),
        activity:          nv('nr-act'),
        mobility:          nv('nr-mob'),
        incontinence:      nv('nr-inc'),
        lengthWidthBand:   nv('pu-lw'),
        exudate:           nv('pu-ex'),
        tissueType:        nv('pu-tt'),
      });
      o.appendChild(el('h2', { text: `Norton ${r.nortonTotal} of 20 / PUSH ${r.pushTotal} of 17` }));
      o.appendChild(el('p', { text: r.text }));
    });
    ['nr-pc', 'nr-mc', 'nr-act', 'nr-mob', 'nr-inc', 'pu-lw', 'pu-ex', 'pu-tt'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v29 §4.6.1 wave 29-3b: VIP + INS infiltration (Jackson 1998; INS 2021).
  'vip-extravasation'(root) {
    root.appendChild(rangeField('Visual Infusion Phlebitis (VIP) 0-5', 've-vip', 0, 5, 0));
    root.appendChild(rangeField('INS infiltration / extravasation grade 0-4', 've-ins', 0, 4, 0));
    root.appendChild(checkbox('Infusate is a known vesicant (chemotherapy, vasopressor, contrast, hypertonic)', 've-ves'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.vipExtravasation({
        vip: nv('ve-vip'),
        insGrade: nv('ve-ins'),
        vesicant: checked('ve-ves'),
      });
      o.appendChild(el('h2', { text: r.text }));
      o.appendChild(el('p', { text: `VIP ${r.vip}: ${r.vipLabel}` }));
      o.appendChild(el('p', { text: `INS ${r.insGrade}: ${r.insLabel}` }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'clinical-notice', text: b }));
    });
    ['ve-vip', 've-ins'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    document.getElementById('ve-ves').addEventListener('change', run);
    run();
  },

  // spec-v29 §4.20.1 wave 29-3b: ABO/Rh compatibility (AABB 33rd ed).
  'blood-compat'(root) {
    const rWrap = el('p', {}, [
      el('label', { for: 'bc-recip', text: 'Recipient ABO / Rh' }), el('br'),
      el('select', { id: 'bc-recip' }, [
        el('option', { value: 'O-',  text: 'O negative' }),
        el('option', { value: 'O+',  text: 'O positive' }),
        el('option', { value: 'A-',  text: 'A negative' }),
        el('option', { value: 'A+',  text: 'A positive' }),
        el('option', { value: 'B-',  text: 'B negative' }),
        el('option', { value: 'B+',  text: 'B positive' }),
        el('option', { value: 'AB-', text: 'AB negative' }),
        el('option', { value: 'AB+', text: 'AB positive' }),
      ]),
    ]);
    root.appendChild(rWrap);
    const pWrap = el('p', {}, [
      el('label', { for: 'bc-prod', text: 'Product type' }), el('br'),
      el('select', { id: 'bc-prod' }, [
        el('option', { value: 'prbc',      text: 'PRBC (packed red blood cells)' }),
        el('option', { value: 'ffp',       text: 'FFP / plasma' }),
        el('option', { value: 'platelets', text: 'Platelets (apheresis or pooled)' }),
        el('option', { value: 'cryo',      text: 'Cryoprecipitate' }),
      ]),
    ]);
    root.appendChild(pWrap);
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.bloodCompat({
        recipient: document.getElementById('bc-recip').value,
        product:   document.getElementById('bc-prod').value,
      });
      o.appendChild(el('h2', { text: `${r.product} for ${r.recipient}` }));
      o.appendChild(el('p', { text: `Compatible donor types: ${r.compatibleDonors.join(', ')}` }));
      o.appendChild(el('p', { text: `Emergency release: ${r.emergencyRelease}` }));
      o.appendChild(el('p', { text: r.text }));
    });
    ['bc-recip', 'bc-prod'].forEach((id) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v29 §4.7.1 wave 29-3a: modified NIHSS (Meyer 2002).
  mnihss(root) {
    const items = [
      ['LOC questions (0-2)',         'mn-loc-q',  2],
      ['LOC commands (0-2)',          'mn-loc-c',  2],
      ['Best gaze (0-2)',             'mn-gaze',   2],
      ['Visual fields (0-3)',         'mn-vf',     3],
      ['Motor arm left (0-4)',        'mn-arm-l',  4],
      ['Motor arm right (0-4)',       'mn-arm-r',  4],
      ['Motor leg left (0-4)',        'mn-leg-l',  4],
      ['Motor leg right (0-4)',       'mn-leg-r',  4],
      ['Sensory (0 normal / 1 abnormal)', 'mn-sens',   1],
      ['Best language (0-3)',         'mn-lang',   3],
      ['Extinction / neglect (0-2)',  'mn-ext',    2],
    ];
    for (const [l, id, max] of items) root.appendChild(rangeField(l, id, 0, max, 0));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.mnihss({
        locQuestions: nv('mn-loc-q'),
        locCommands:  nv('mn-loc-c'),
        gaze:         nv('mn-gaze'),
        visualFields: nv('mn-vf'),
        motorArmL:    nv('mn-arm-l'),
        motorArmR:    nv('mn-arm-r'),
        motorLegL:    nv('mn-leg-l'),
        motorLegR:    nv('mn-leg-r'),
        sensory:      nv('mn-sens'),
        language:     nv('mn-lang'),
        extinction:   nv('mn-ext'),
      });
      o.appendChild(el('h2', { text: `mNIHSS ${r.total} of 31` }));
      o.appendChild(el('p', { text: r.band }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v29 §4.10.1 wave 29-3a: modified Aldrete + PADSS (Aldrete 1995; Chung 1995).
  'aldrete-padss'(root) {
    const aldreteItems = [
      ['Aldrete: activity (0-2)',       'ap-al-act'],
      ['Aldrete: respiration (0-2)',    'ap-al-resp'],
      ['Aldrete: circulation (0-2)',    'ap-al-circ'],
      ['Aldrete: consciousness (0-2)',  'ap-al-cons'],
      ['Aldrete: O2 saturation (0-2)',  'ap-al-o2'],
    ];
    const padssItems = [
      ['PADSS: vital signs (0-2)',      'ap-pd-vs'],
      ['PADSS: ambulation (0-2)',       'ap-pd-amb'],
      ['PADSS: nausea / vomiting (0-2)', 'ap-pd-nv'],
      ['PADSS: pain (0-2)',             'ap-pd-pain'],
      ['PADSS: surgical bleeding (0-2)', 'ap-pd-bld'],
    ];
    for (const [l, id] of aldreteItems) root.appendChild(rangeField(l, id, 0, 2, 2));
    for (const [l, id] of padssItems) root.appendChild(rangeField(l, id, 0, 2, 2));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const a = S4.aldrete({
        activity:        nv('ap-al-act'),
        respiration:     nv('ap-al-resp'),
        circulation:     nv('ap-al-circ'),
        consciousness:   nv('ap-al-cons'),
        oxygenSaturation: nv('ap-al-o2'),
      });
      const p = S4.padss({
        vitalSigns:       nv('ap-pd-vs'),
        ambulation:       nv('ap-pd-amb'),
        nauseaVomiting:   nv('ap-pd-nv'),
        pain:             nv('ap-pd-pain'),
        surgicalBleeding: nv('ap-pd-bld'),
      });
      o.appendChild(el('h2', { text: `Aldrete ${a.score} of 10 / PADSS ${p.score} of 10` }));
      o.appendChild(el('p', { text: a.band }));
      o.appendChild(el('p', { text: p.band }));
    });
    [...aldreteItems, ...padssItems].forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v29 §4.7.2 wave 29-3a: ICH Score (Hemphill 2001).
  'ich-score'(root) {
    root.appendChild(rangeField('GCS', 'ich-gcs', 3, 15, 15));
    root.appendChild(rangeField('Age (years)', 'ich-age', 0, 110, 70));
    root.appendChild(rangeField('ICH volume (mL)', 'ich-vol', 0, 200, 10));
    root.appendChild(checkbox('Infratentorial origin', 'ich-infra'));
    root.appendChild(checkbox('Intraventricular hemorrhage', 'ich-ivh'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.ichScore({
        gcs: nv('ich-gcs'),
        age: nv('ich-age'),
        ichVolumeMl: nv('ich-vol'),
        infratentorial: checked('ich-infra'),
        ivh: checked('ich-ivh'),
      });
      o.appendChild(el('h2', { text: `ICH Score ${r.score}: 30-day mortality ${r.mortality30d}` }));
      o.appendChild(el('p', { text: r.band }));
    });
    ['ich-gcs', 'ich-age', 'ich-vol'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    ['ich-infra', 'ich-ivh'].forEach((id) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v29 §4.7.3 wave 29-3a: Hunt-Hess + WFNS (Hunt 1968; Drake 1988).
  'hunt-hess-wfns'(root) {
    const hhWrap = el('p', {}, [
      el('label', { for: 'hh-grade', text: 'Hunt-Hess grade' }), el('br'),
      el('select', { id: 'hh-grade' }, [
        el('option', { value: '1', text: 'I: asymptomatic or minimal headache' }),
        el('option', { value: '2', text: 'II: moderate-to-severe headache, nuchal rigidity' }),
        el('option', { value: '3', text: 'III: drowsy, mild focal deficit' }),
        el('option', { value: '4', text: 'IV: stupor, moderate-to-severe hemiparesis' }),
        el('option', { value: '5', text: 'V: deep coma, decerebrate, moribund' }),
      ]),
    ]);
    root.appendChild(hhWrap);
    root.appendChild(rangeField('GCS (for WFNS)', 'hh-gcs', 3, 15, 15));
    root.appendChild(checkbox('Focal motor deficit (for WFNS)', 'hh-focal'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.huntHessWfns({
        huntHess: nv('hh-grade'),
        gcs: nv('hh-gcs'),
        focalMotorDeficit: checked('hh-focal'),
      });
      o.appendChild(el('h2', { text: `Hunt-Hess ${r.huntHess} / WFNS ${r.wfns}` }));
      o.appendChild(el('p', { text: r.huntHessLabel }));
      o.appendChild(el('p', { text: r.text }));
    });
    ['hh-grade', 'hh-gcs', 'hh-focal'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    document.getElementById('hh-grade').addEventListener('change', run);
    document.getElementById('hh-focal').addEventListener('change', run);
    run();
  },

  // spec-v29 §4.4.1 wave 29-3a: CAM (non-ICU) (Inouye 1990).
  cam(root) {
    const items = [
      ['Feature 1: acute onset and / or fluctuating course', 'cam-f1'],
      ['Feature 2: inattention', 'cam-f2'],
      ['Feature 3: disorganized thinking', 'cam-f3'],
      ['Feature 4: altered level of consciousness', 'cam-f4'],
    ];
    for (const [l, id] of items) root.appendChild(checkbox(l, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.cam({
        acuteFluctuating: checked('cam-f1'),
        inattention: checked('cam-f2'),
        disorganizedThinking: checked('cam-f3'),
        alteredLoc: checked('cam-f4'),
      });
      o.appendChild(el('h2', { text: r.band }));
      o.appendChild(el('p', { text: r.text }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v32 §2.1: FLACC (Merkel 1997).
  flacc(root) {
    const items = [
      ['Face (0 no expression - 2 frown/clenched jaw)',     'fl-face'],
      ['Legs (0 relaxed - 2 kicking/legs drawn up)',        'fl-legs'],
      ['Activity (0 quiet - 2 jerking/rigid)',              'fl-act'],
      ['Cry (0 none - 2 steady crying/screams)',            'fl-cry'],
      ['Consolability (0 content - 2 difficult to console)', 'fl-cons'],
    ];
    for (const [l, id] of items) root.appendChild(rangeField(l, id, 0, 2, 0));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.flacc({
        face: nv('fl-face'), legs: nv('fl-legs'), activity: nv('fl-act'),
        cry: nv('fl-cry'), consolability: nv('fl-cons'),
      });
      o.appendChild(el('h2', { text: `FLACC ${r.score} (${r.band})` }));
      o.appendChild(el('p', { text: r.text }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v32 §2.2: PAINAD (Warden 2003).
  painad(root) {
    const items = [
      ['Breathing independent of vocalization (0-2)', 'pa-br'],
      ['Negative vocalization (0-2)',                  'pa-vo'],
      ['Facial expression (0-2)',                      'pa-fa'],
      ['Body language (0-2)',                          'pa-bl'],
      ['Consolability (0-2)',                          'pa-cons'],
    ];
    for (const [l, id] of items) root.appendChild(rangeField(l, id, 0, 2, 0));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.painad({
        breathing: nv('pa-br'), vocalization: nv('pa-vo'),
        facial: nv('pa-fa'), bodyLanguage: nv('pa-bl'), consolability: nv('pa-cons'),
      });
      o.appendChild(el('h2', { text: `PAINAD ${r.score} (${r.band})` }));
      o.appendChild(el('p', { text: r.text }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v32 §2.3: NIPS (Lawrence 1993).
  nips(root) {
    const items = [
      ['Facial expression (0 relaxed - 1 grimace)',         'ni-face', 1],
      ['Cry (0 no cry - 1 whimper - 2 vigorous)',           'ni-cry',  2],
      ['Breathing patterns (0 relaxed - 1 changed)',        'ni-br',   1],
      ['Arms (0 relaxed - 1 flexed/extended)',              'ni-arms', 1],
      ['Legs (0 relaxed - 1 flexed/extended)',              'ni-legs', 1],
      ['State of arousal (0 sleeping/calm - 1 fussy)',      'ni-sta',  1],
    ];
    for (const [l, id, max] of items) root.appendChild(rangeField(l, id, 0, max, 0));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.nips({
        facialExpression: nv('ni-face'), cry: nv('ni-cry'),
        breathingPatterns: nv('ni-br'), arms: nv('ni-arms'),
        legs: nv('ni-legs'), stateOfArousal: nv('ni-sta'),
      });
      o.appendChild(el('h2', { text: `NIPS ${r.score} of 7 (${r.band})` }));
      o.appendChild(el('p', { text: r.text }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v33 §2.1: N-PASS (Hummel 2008). Signed -2..+2 per item.
  npass(root) {
    function signedRange(label, id) {
      const wrap = el('p');
      wrap.appendChild(el('label', { for: id, text: `${label} (-2..+2)` }));
      wrap.appendChild(el('br'));
      const inp = el('input', { id, type: 'range', min: '-2', max: '2', value: '0' });
      const o = el('output', { id: `${id}-v`, text: '0' });
      inp.addEventListener('input', () => { o.textContent = inp.value; });
      wrap.appendChild(inp);
      wrap.appendChild(document.createTextNode(' '));
      wrap.appendChild(o);
      return wrap;
    }
    const items = [
      ['Crying / Irritability',                     'np-cry'],
      ['Behavior / State',                          'np-beh'],
      ['Facial expression',                         'np-fac'],
      ['Extremities / Tone',                        'np-ext'],
      ['Vital signs (HR / RR / BP / SaO2)',         'np-vit'],
    ];
    for (const [l, id] of items) root.appendChild(signedRange(l, id));
    // Gestational age (weeks): preterm <30 wk adds +1/week to pain side.
    const ga = el('p');
    ga.appendChild(el('label', { for: 'np-ga', text: 'Gestational age (weeks, 20-44)' }));
    ga.appendChild(el('br'));
    ga.appendChild(el('input', { id: 'np-ga', type: 'number', min: '20', max: '44', step: '1', value: '38' }));
    root.appendChild(ga);
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.npass({
        crying: nv('np-cry'), behavior: nv('np-beh'), facial: nv('np-fac'),
        extremities: nv('np-ext'), vitals: nv('np-vit'),
        gestationalAgeWeeks: nv('np-ga'),
      });
      o.appendChild(el('h2', { text: `Pain ${r.painScore} (${r.painBand}); sedation ${r.sedationScore} (${r.sedationBand})` }));
      o.appendChild(el('p', { text: r.text }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    document.getElementById('np-ga').addEventListener('input', run);
    run();
  },

  // spec-v33 §2.2: CRIES (Krechel 1995).
  cries(root) {
    const items = [
      ['Crying (0 none - 1 high-pitched, consolable - 2 inconsolable)', 'cr-cry'],
      ['Requires O2 for SaO2 <95% (0 none - 1 <30% FiO2 - 2 >=30%)',     'cr-o2'],
      ['Increased vital signs (0 baseline - 1 <20% above - 2 >=20%)',    'cr-vit'],
      ['Expression (0 none - 1 grimace - 2 grimace/grunt)',              'cr-exp'],
      ['Sleeplessness (0 none - 1 wakes frequently - 2 constantly awake)', 'cr-slp'],
    ];
    for (const [l, id] of items) root.appendChild(rangeField(l, id, 0, 2, 0));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.cries({
        crying: nv('cr-cry'), requiresO2: nv('cr-o2'), vitals: nv('cr-vit'),
        expression: nv('cr-exp'), sleeplessness: nv('cr-slp'),
      });
      o.appendChild(el('h2', { text: `CRIES ${r.score} of 10 (${r.band})` }));
      o.appendChild(el('p', { text: r.text }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v33 §2.3: POSS (Pasero 2009). Single 5-level ordinal.
  poss(root) {
    const labels = ['S - sleep, easy to arouse', '1 - awake and alert', '2 - slightly drowsy, easily aroused', '3 - frequently drowsy, drifts off mid-conversation', '4 - somnolent, minimal or no response to physical stimulation'];
    const wrap = el('p');
    wrap.appendChild(el('label', { for: 'po-lvl', text: 'Sedation level (0=S, 1, 2, 3, 4)' }));
    wrap.appendChild(el('br'));
    const inp = el('input', { id: 'po-lvl', type: 'range', min: '0', max: '4', value: '1' });
    const tag = el('output', { id: 'po-lvl-v', text: labels[1] });
    inp.addEventListener('input', () => { tag.textContent = labels[Number(inp.value)]; });
    wrap.appendChild(inp);
    wrap.appendChild(document.createTextNode(' '));
    wrap.appendChild(tag);
    root.appendChild(wrap);
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.poss({ level: nv('po-lvl') });
      o.appendChild(el('h2', { text: `POSS ${r.label} - ${r.acceptable ? 'acceptable' : 'unacceptable'}` }));
      o.appendChild(el('p', { text: r.text }));
    });
    inp.addEventListener('input', run);
    run();
  },

  // spec-v34 §2.1: COMFORT-B (van Dijk 2005). Six items each 1-5.
  'comfort-b'(root) {
    const items = [
      ['Alertness (1 deep sleep - 5 hyper-alert)',             'cb-alt'],
      ['Calmness / Agitation (1 calm - 5 panicky)',            'cb-cal'],
      ['Respiratory response or Crying (1 - 5)',               'cb-res'],
      ['Physical movement (1 none - 5 vigorous)',              'cb-mov'],
      ['Muscle tone (1 fully relaxed - 5 rigid/flexed)',       'cb-mus'],
      ['Facial tension (1 fully relaxed - 5 grimacing)',       'cb-fac'],
    ];
    for (const [l, id] of items) root.appendChild(rangeField(l, id, 1, 5, 3));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.comfortB({
        alertness: nv('cb-alt'), calmness: nv('cb-cal'),
        respiratoryOrCry: nv('cb-res'), movement: nv('cb-mov'),
        muscleTone: nv('cb-mus'), facialTension: nv('cb-fac'),
      });
      o.appendChild(el('h2', { text: `COMFORT-B ${r.score} of 30 (${r.band})` }));
      o.appendChild(el('p', { text: r.text }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v34 §2.2: WAT-1 (Franck 2008). Eleven items aggregate to 0-12.
  'wat-1'(root) {
    const items = [
      ['Loose / watery stools in last 12h (0 no - 1 yes)',        'w1-ls'],
      ['Vomiting / retching / gagging in last 12h (0 no - 1 yes)', 'w1-vo'],
      ['Temperature >37.8 C in last 12h (0 no - 1 yes)',           'w1-fe'],
      ['SBS state >0 during 2-min observation (0 no - 1 yes)',     'w1-sb'],
      ['Tremor (0 none - 1 present)',                              'w1-tr'],
      ['Any sweating (0 no - 1 yes)',                              'w1-sw'],
      ['Uncoordinated / repetitive movement (0 no - 1 yes)',       'w1-um'],
      ['Yawning or sneezing (0 none/1 - 1 >=2)',                   'w1-ys'],
      ['Startle to touch (0 none/mild - 1 moderate/severe)',       'w1-st'],
      ['Increased muscle tone (0 normal - 1 increased)',           'w1-mt'],
    ];
    for (const [l, id] of items) root.appendChild(rangeField(l, id, 0, 1, 0));
    const rm = el('p');
    rm.appendChild(el('label', { for: 'w1-rm', text: 'Minutes to regain calm state after stimulus (<2 = 0, 2-5 = 1, >5 = 2)' }));
    rm.appendChild(el('br'));
    rm.appendChild(el('input', { id: 'w1-rm', type: 'number', min: '0', max: '60', step: '1', value: '0' }));
    root.appendChild(rm);
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.wat1({
        looseStools: nv('w1-ls'), vomiting: nv('w1-vo'), fever: nv('w1-fe'),
        sbsStatePositive: nv('w1-sb'), tremor: nv('w1-tr'), sweating: nv('w1-sw'),
        uncoordinatedMovement: nv('w1-um'), yawnSneeze: nv('w1-ys'),
        startleToTouch: nv('w1-st'), increasedMuscleTone: nv('w1-mt'),
        recoveryMinutes: nv('w1-rm'),
      });
      o.appendChild(el('h2', { text: `WAT-1 ${r.score} of 12 (${r.band})` }));
      o.appendChild(el('p', { text: r.text }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    document.getElementById('w1-rm').addEventListener('input', run);
    run();
  },

  // spec-v34 §2.3: SBS (Curley 2006). Single ordinal -3..+2.
  sbs(root) {
    const labels = {
      '-3': '-3 unresponsive',
      '-2': '-2 responsive only to noxious stimuli',
      '-1': '-1 responsive to gentle touch / voice',
      0: '0 awake and able to calm',
      1: '+1 restless and difficult to calm',
      2: '+2 agitated',
    };
    const wrap = el('p');
    wrap.appendChild(el('label', { for: 'sb-lvl', text: 'SBS level (-3 to +2)' }));
    wrap.appendChild(el('br'));
    const inp = el('input', { id: 'sb-lvl', type: 'range', min: '-3', max: '2', value: '0' });
    const tag = el('output', { id: 'sb-lvl-v', text: labels[0] });
    inp.addEventListener('input', () => { tag.textContent = labels[inp.value] || labels[Number(inp.value)]; });
    wrap.appendChild(inp);
    wrap.appendChild(document.createTextNode(' '));
    wrap.appendChild(tag);
    root.appendChild(wrap);
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.sbs({ level: nv('sb-lvl') });
      o.appendChild(el('h2', { text: `SBS ${r.label} - ${r.band}` }));
      o.appendChild(el('p', { text: r.text }));
    });
    inp.addEventListener('input', run);
    run();
  },

  // spec-v35 §2.1: SOS (Ista 2009). Fifteen binary items aggregate to 0-15.
  sos(root) {
    const items = [
      ['Tachycardia (>2 SD above age-norm)',                       'so-tac', 'tachycardia'],
      ['Tachypnea (>2 SD above age-norm)',                         'so-tap', 'tachypnea'],
      ['Fever (>38.4 C)',                                          'so-fev', 'fever'],
      ['Sweating',                                                 'so-swe', 'sweating'],
      ['Agitation',                                                'so-agi', 'agitation'],
      ['Anxiety',                                                  'so-anx', 'anxiety'],
      ['Grimacing',                                                'so-gri', 'grimacing'],
      ['Sleeplessness',                                            'so-sle', 'sleeplessness'],
      ['Hallucinations',                                           'so-hal', 'hallucinations'],
      ['Motor disturbance / movement disorder',                    'so-mot', 'motorDisturbance'],
      ['Hypertonia / increased muscle tone',                       'so-hyp', 'hypertonia'],
      ['Tremor',                                                   'so-tre', 'tremor'],
      ['Vomiting',                                                 'so-vom', 'vomiting'],
      ['Diarrhea',                                                 'so-dia', 'diarrhea'],
      ['Inconsolable crying',                                      'so-cry', 'inconsolableCrying'],
    ];
    for (const [l, id] of items) root.appendChild(rangeField(`${l} (0 absent - 1 present)`, id, 0, 1, 0));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const input = {};
      for (const [, id, key] of items) input[key] = nv(id);
      const r = S4.sos(input);
      o.appendChild(el('h2', { text: `SOS ${r.score} of 15 (${r.band})` }));
      o.appendChild(el('p', { text: r.text }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v36 §2.1: MEOWS (Singh 2012). Track-and-trigger on 8 maternal obs.
  meows(root) {
    const nums = [
      ['Respiratory rate (breaths/min)', 'mw-rr', '16'],
      ['SpO2 (%)',                       'mw-spo2', '98'],
      ['Temperature (°C)',               'mw-temp', '37.0'],
      ['Systolic BP (mmHg)',             'mw-sbp', '118'],
      ['Diastolic BP (mmHg)',            'mw-dbp', '72'],
      ['Heart rate (beats/min)',         'mw-hr', '82'],
    ];
    for (const [l, id, v] of nums) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'number', step: 'any', value: String(v) }),
      ]));
    }
    root.appendChild(el('p', {}, [
      el('label', { for: 'mw-neuro', text: 'Neurological response (AVPU)' }), el('br'),
      el('select', { id: 'mw-neuro' }, [
        el('option', { value: 'A', text: 'A - Alert' }),
        el('option', { value: 'V', text: 'V - responds to Voice' }),
        el('option', { value: 'P', text: 'P - responds to Pain' }),
        el('option', { value: 'U', text: 'U - Unresponsive' }),
      ]),
    ]));
    root.appendChild(rangeField('Pain score', 'mw-pain', 0, 3, 0));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.meows({
        rr: nv('mw-rr'), spo2: nv('mw-spo2'), temp: nv('mw-temp'),
        sbp: nv('mw-sbp'), dbp: nv('mw-dbp'), hr: nv('mw-hr'),
        neuro: document.getElementById('mw-neuro').value,
        pain: nv('mw-pain'),
      });
      o.appendChild(el('h2', { text: `MEOWS: ${r.band} (${r.redCount} red, ${r.yellowCount} yellow)` }));
      o.appendChild(el('p', { text: r.text }));
      const f = r.flags;
      o.appendChild(el('p', { class: 'muted',
        text: `Per-parameter: RR ${f.rr}, SpO2 ${f.spo2}, temp ${f.temp}, SBP ${f.sbp}, DBP ${f.dbp}, HR ${f.hr}, neuro ${f.neuro}, pain ${f.pain}.` }));
    });
    ['mw-rr', 'mw-spo2', 'mw-temp', 'mw-sbp', 'mw-dbp', 'mw-hr', 'mw-pain']
      .forEach((id) => document.getElementById(id).addEventListener('input', run));
    document.getElementById('mw-neuro').addEventListener('change', run);
    run();
  },

  // spec-v41 §2.1: FOUR Score (Wijdicks 2005). ICU coma scale.
  'four-score'(root) {
    const items = [
      ['Eye response (4 tracking - 3 open - 2 to voice - 1 to pain - 0 closed)',     'fs-eye',   'eye'],
      ['Motor response (4 to command - 3 localize - 2 flexion - 1 extension - 0 none)', 'fs-motor', 'motor'],
      ['Brainstem reflexes (4 pupil+corneal - 3 one fixed - 2 one absent - 1 both absent - 0 +cough)', 'fs-brain', 'brainstem'],
      ['Respiration (4 regular - 3 Cheyne-Stokes - 2 irregular - 1 over vent - 0 at/apnea)', 'fs-resp', 'respiration'],
    ];
    for (const [label, id] of items) root.appendChild(rangeField(label, id, 0, 4, 4));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const input = {};
      for (const [, id, key] of items) input[key] = Math.trunc(nv(id));
      const r = S4.fourScore(input);
      o.appendChild(el('h2', { text: `FOUR Score ${r.score} of 16` }));
      o.appendChild(el('p', { text: r.text }));
      o.appendChild(el('p', { class: 'muted',
        text: `Per-component: E${r.parts.eye} M${r.parts.motor} B${r.parts.brainstem} R${r.parts.respiration}.` }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v40 §2.1: GUSS (Trapl 2007). Two-stage post-stroke dysphagia screen.
  guss(root) {
    root.appendChild(el('h3', { text: 'Stage 1: preliminary investigation (must score 5 to proceed)' }));
    const stage1 = [
      ['Vigilance: patient awake / alert (1) vs none (0)',   'gu-vig', 'vigilance'],
      ['Voluntary cough or throat clearing (1) vs no (0)',   'gu-cgh', 'coughClear'],
      ['Saliva swallow successful (1) vs no (0)',            'gu-sw',  'salivaSwallow'],
      ['No drooling (1) vs drooling (0)',                    'gu-dr',  'salivaNoDrool'],
      ['No voice change (1) vs voice change (0)',            'gu-vc',  'salivaNoVoiceChange'],
    ];
    for (const [label, id] of stage1) root.appendChild(rangeField(label, id, 0, 1, 1));
    const consistencies = [
      ['Semisolid', 'ss', 'semisolid'],
      ['Liquid',    'li', 'liquid'],
      ['Solid',     'so', 'solid'],
    ];
    for (const [label, prefix] of consistencies) {
      root.appendChild(el('h3', { text: `Stage 2: ${label} (must score 5 to advance to next consistency)` }));
      root.appendChild(rangeField('Deglutition (0 not possible - 1 delayed - 2 successful)', `gu-${prefix}Sw`, 0, 2, 2));
      root.appendChild(rangeField('No involuntary cough (1) vs cough (0)',                    `gu-${prefix}Cg`, 0, 1, 1));
      root.appendChild(rangeField('No drooling (1) vs drooling (0)',                          `gu-${prefix}Dr`, 0, 1, 1));
      root.appendChild(rangeField('No voice change (1) vs voice change (0)',                  `gu-${prefix}Vc`, 0, 1, 1));
    }
    const allIds = [
      ...stage1.map(([, id]) => id),
      ...consistencies.flatMap(([, p]) => [`gu-${p}Sw`, `gu-${p}Cg`, `gu-${p}Dr`, `gu-${p}Vc`]),
    ];
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = S4.guss({
        vigilance: nv('gu-vig'),
        coughClear: nv('gu-cgh'),
        salivaSwallow: nv('gu-sw'),
        salivaNoDrool: nv('gu-dr'),
        salivaNoVoiceChange: nv('gu-vc'),
        semisolidSwallow: nv('gu-ssSw'),
        semisolidNoCough: nv('gu-ssCg'),
        semisolidNoDrool: nv('gu-ssDr'),
        semisolidNoVoiceChange: nv('gu-ssVc'),
        liquidSwallow: nv('gu-liSw'),
        liquidNoCough: nv('gu-liCg'),
        liquidNoDrool: nv('gu-liDr'),
        liquidNoVoiceChange: nv('gu-liVc'),
        solidSwallow: nv('gu-soSw'),
        solidNoCough: nv('gu-soCg'),
        solidNoDrool: nv('gu-soDr'),
        solidNoVoiceChange: nv('gu-soVc'),
      });
      o.appendChild(el('h2', { text: `GUSS ${r.score} of 20 (${r.band})` }));
      o.appendChild(el('p', { text: r.text }));
      o.appendChild(el('p', { class: 'muted',
        text: `Per-stage: preliminary ${r.stage1}/5, semisolid ${r.semisolid}/5, liquid ${r.liquid}/5, solid ${r.solid}/5.` }));
      if (r.gated.length > 0) {
        o.appendChild(el('p', { class: 'muted', text: `Not performed (gated per Trapl 2007): ${r.gated.join(', ')}.` }));
      }
    });
    allIds.forEach((id) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v39 §2.1: ROSIER (Nor 2005). ED stroke recognition with mimic discrimination.
  rosier(root) {
    const items = [
      ['Loss of consciousness / syncope (-1)',            'ro-loc',    'locSyncope'],
      ['Seizure activity (-1)',                           'ro-sez',    'seizure'],
      ['New asymmetric facial weakness (+1)',             'ro-face',   'facialWeakness'],
      ['New asymmetric arm weakness (+1)',                'ro-arm',    'armWeakness'],
      ['New asymmetric leg weakness (+1)',                'ro-leg',    'legWeakness'],
      ['Speech disturbance (+1)',                         'ro-speech', 'speechDisturbance'],
      ['Visual field defect (+1)',                        'ro-vis',    'visualFieldDefect'],
    ];
    for (const [label, id] of items) root.appendChild(checkbox(label, id));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const input = {};
      for (const [, id, key] of items) input[key] = checked(id);
      const r = S4.rosier(input);
      o.appendChild(el('h2', { text: `ROSIER ${r.score} (${r.band})` }));
      o.appendChild(el('p', { text: r.text }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // spec-v38 §2.1: RACE (Pérez de la Ossa 2014). LVO prediction (5 items).
  race(root) {
    const items = [
      ['Facial palsy (0 absent - 1 mild - 2 moderate/severe)',                'ra-face', 'facialPalsy',     2],
      ['Arm motor function (0 normal/mild - 1 moderate - 2 severe)',          'ra-arm',  'armMotor',        2],
      ['Leg motor function (0 normal/mild - 1 moderate - 2 severe)',          'ra-leg',  'legMotor',        2],
      ['Head / gaze deviation (0 absent - 1 present)',                        'ra-gaze', 'gaze',            1],
      ['Aphasia (R hemiparesis) or agnosia (L hemiparesis): 0 normal - 2 severe', 'ra-lang', 'languageAgnosia', 2],
    ];
    for (const [label, id, , max] of items) {
      root.appendChild(rangeField(label, id, 0, max, 0));
    }
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const input = {};
      for (const [, id, key] of items) input[key] = Math.trunc(nv(id));
      const r = S4.race(input);
      o.appendChild(el('h2', { text: `RACE ${r.score} of 9 (${r.band})` }));
      o.appendChild(el('p', { text: r.text }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v37 §2.1: CPSS (Kothari 1999). Three binary bedside items.
  cpss(root) {
    const items = [
      ['Facial droop (smile / show teeth)',        'cp-face',   'facialDroop'],
      ['Arm drift (close eyes, arms extended 10s)','cp-arm',    'armDrift'],
      ['Abnormal speech (slurred / wrong / mute)', 'cp-speech', 'abnormalSpeech'],
    ];
    for (const [label, id] of items) {
      root.appendChild(rangeField(`${label} (0 normal - 1 abnormal)`, id, 0, 1, 0));
    }
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const input = {};
      for (const [, id, key] of items) input[key] = Math.trunc(nv(id));
      const r = S4.cpss(input);
      o.appendChild(el('h2', { text: `CPSS: ${r.band} (${r.abnormalCount} of 3 abnormal)` }));
      o.appendChild(el('p', { text: r.text }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // spec-v37 §2.2: LAMS (Llanes 2004; Nazliel 2008). LVO prediction.
  lams(root) {
    const items = [
      ['Facial droop',  'lm-face', 'facialDroop',  1],
      ['Arm drift',     'lm-arm',  'armDrift',     2],
      ['Grip strength', 'lm-grip', 'gripStrength', 2],
    ];
    for (const [label, id, , max] of items) {
      root.appendChild(rangeField(label, id, 0, max, 0));
    }
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const input = {};
      for (const [, id, key] of items) input[key] = Math.trunc(nv(id));
      const r = S4.lams(input);
      o.appendChild(el('h2', { text: `LAMS ${r.score} of 5 (${r.band})` }));
      o.appendChild(el('p', { text: r.text }));
    });
    items.forEach(([, id]) => document.getElementById(id).addEventListener('input', run));
    run();
  },
};
