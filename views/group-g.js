// Group G: Clinical Scoring and Reference (48-60).

import { el, clear } from '../lib/dom.js';
import { loadFile } from '../lib/data.js';
import * as C from '../lib/clinical.js';

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
};
