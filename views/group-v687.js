// spec-v687 §2: renderer for elemental-iron-ingested — the elemental-iron toxic-dose
// estimator (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three number
// inputs (tablets, mg per tablet, weight) plus a salt-type select; a conversion returns
// elemental mg and mg/kg with a toxicity band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/elemental-iron-ingested-v687.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: step || '1', inputmode: 'decimal' }));
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
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This is an advisory triage estimate from a reported (often uncertain) amount; always involve Poison Control and use a measured serum iron level. A reassuring estimate never rules out a serious ingestion.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const SALT = [['ferrous-sulfate', 'Ferrous sulfate (20% elemental)'], ['ferrous-gluconate', 'Ferrous gluconate (12% elemental)'], ['ferrous-fumarate', 'Ferrous fumarate (33% elemental)'], ['elemental', 'Elemental iron (already elemental mg)']];

export const renderers = {
  'elemental-iron-ingested'(root) {
    note(root, 'Elemental iron ingested = tablets × mg iron salt per tablet × percent elemental (ferrous sulfate 20%, gluconate 12%, fumarate 33%); dose = elemental mg / weight. Thresholds (mg/kg): < 20 minimal, 20–60 mild–moderate, > 60 severe, > 150 potentially lethal.');
    root.appendChild(numberField('Number of tablets ingested', 'iron-tabs', '1'));
    root.appendChild(numberField('Iron salt per tablet (mg)', 'iron-mg', '1'));
    root.appendChild(selectField('Iron salt', 'iron-salt', CHOICE(SALT)));
    root.appendChild(numberField('Body weight (kg)', 'iron-wt', '0.1'));
    const ids = ['iron-tabs', 'iron-mg', 'iron-salt', 'iron-wt'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.elementalIronIngested({ tablets: val('iron-tabs'), mgPerTablet: val('iron-mg'), saltType: val('iron-salt'), weightKg: val('iron-wt') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Elemental', value: `${r.elementalMg} mg` },
        { label: 'Dose', value: `${r.dosePerKg} mg/kg` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
