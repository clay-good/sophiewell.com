// spec-v280 §2: renderers for the rheumatology function & case-definition tiles —
// the HAQ-DI disability index and the ASAS axial-spondyloarthritis classification
// criteria. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers diagnosis and management to the
// clinician (spec-v11 §5.3): HAQ-DI reports a disability index and ASAS presents
// the criteria's own classification, never a diagnosis or a treatment order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rheum-fn-v280.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and management stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.bandLabel, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}

const DIFFICULTY = [['', '—'], ['0', '0 — without any difficulty'], ['1', '1 — with some difficulty'], ['2', '2 — with much difficulty'], ['3', '3 — unable to do']];
const HAQ_CATS = [
  ['dressing', 'Dressing & grooming'], ['arising', 'Arising'], ['eating', 'Eating'], ['walking', 'Walking'],
  ['hygiene', 'Hygiene'], ['reach', 'Reach'], ['grip', 'Grip'], ['activities', 'Common activities'],
];

export const renderers = {
  'haq-di'(root) {
    note(root, 'HAQ-DI (Fries 1980) — the anchor measure of physical function in rheumatology: the mean of 8 functional categories, each 0–3. Check "aids/help" for a category to raise a 0 or 1 to 2. Needs ≥ 6 of 8 answered. Bands: ≤ 1 mild-moderate, > 1–2 moderate-severe, > 2 severe. Near-neighbors: das28, rapid3, basfi.');
    const ids = [];
    for (const [key, label] of HAQ_CATS) {
      root.appendChild(select(`${label} (difficulty)`, `haq-${key}`, DIFFICULTY));
      root.appendChild(check(`${label}: uses aids/devices or help from another person`, `haq-${key}-aid`));
      ids.push(`haq-${key}`, `haq-${key}-aid`);
    }
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const [key] of HAQ_CATS) { input[key] = val(`haq-${key}`); input[`${key}Aid`] = chk(`haq-${key}-aid`); }
      render(o, M.haqDi(input), 'HAQ-DI');
    }));
    postureNote(root);
  },
  'asas-axspa'(root) {
    note(root, 'ASAS classification criteria for axial spondyloarthritis (Rudwaleit 2009). Entry: back pain ≥ 3 months with onset < 45. Then the imaging arm (sacroiliitis + ≥ 1 SpA feature) OR the clinical arm (HLA-B27 + ≥ 2 other SpA features). A classification (study-enrollment) tool, not a diagnostic test. Near-neighbors: basdai, asdas, caspar.');
    note(root, 'Entry criteria:');
    root.appendChild(check('Back pain ≥ 3 months', 'asas-bp'));
    root.appendChild(check('Age at onset < 45 years', 'asas-age'));
    note(root, 'Imaging:');
    root.appendChild(check('Sacroiliitis on imaging (active MRI or definite radiographic, modified New York)', 'asas-sacro'));
    note(root, 'SpA features:');
    const feats = [
      ['ibp', 'Inflammatory back pain'], ['arthritis', 'Arthritis'], ['enthesitis', 'Enthesitis (heel)'],
      ['uveitis', 'Uveitis'], ['dactylitis', 'Dactylitis'], ['psoriasis', 'Psoriasis'], ['ibd', "Crohn's / colitis"],
      ['nsaidResponse', 'Good response to NSAIDs'], ['familyHistory', 'Family history of SpA'],
      ['hlaB27', 'HLA-B27 positive'], ['elevatedCrp', 'Elevated CRP'],
    ];
    const ids = ['asas-bp', 'asas-age', 'asas-sacro'];
    for (const [key, label] of feats) { root.appendChild(check(label, `asas-${key}`)); ids.push(`asas-${key}`); }
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {
        backPain3mo: chk('asas-bp'), ageOnsetUnder45: chk('asas-age'), sacroiliitisImaging: chk('asas-sacro'),
      };
      for (const [key] of feats) input[key] = chk(`asas-${key}`);
      render(o, M.asasAxspa(input), 'ASAS');
    }));
    postureNote(root);
  },
};
