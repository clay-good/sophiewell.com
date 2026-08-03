// spec-v644 §2: renderer for slums — the St. Louis University Mental Status
// examination (Clinical Scoring & Risk, Group G). A free MMSE alternative filling
// a scored-cognitive-screen gap alongside mini-cog and the dementia-staging tiles.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The tile
// takes the EARNED points per item (the clinician administers and scores the actual
// test); it does not reproduce the test items. Education is required because it
// selects the (education-adjusted) interpretation cut points.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/slums-v644.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function numField(label, id, max) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', '1');
  inp.setAttribute('inputmode', 'numeric');
  inp.setAttribute('min', '0');
  inp.setAttribute('max', String(max));
  inp.setAttribute('placeholder', `0-${max}`);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. SLUMS is a screen computed from the points you entered, not a diagnosis; a positive screen calls for fuller assessment, and the result is read alongside the history, function, and reversible contributors. The clinical decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const ITEM_DOM = {
  day: 'slums-day', year: 'slums-year', state: 'slums-state', money: 'slums-money',
  animals: 'slums-animals', recall: 'slums-recall', digits: 'slums-digits',
  clock: 'slums-clock', figures: 'slums-figures', story: 'slums-story',
};

export const renderers = {
  slums(root) {
    note(root, 'SLUMS (Tariq 2006): a free MMSE alternative. Enter the earned points per item (total 0-30). Bands are education-adjusted — high-school or above: 27-30 normal, 21-26 mild neurocognitive disorder, ≤ 20 dementia; less than high-school: 25-30 normal, 20-24 MNCD, ≤ 19 dementia. Near-neighbors: mini-cog, cdr-sob.');
    root.appendChild(selectField('Education level', 'slums-edu', [
      { value: '', text: '— choose —' },
      { value: 'hs', text: 'High-school education or above' },
      { value: 'less-hs', text: 'Less than high-school education' },
    ]));
    for (const it of M.SLUMS_ITEMS) {
      root.appendChild(numField(`Points — ${it.label}`, ITEM_DOM[it.key], it.max));
    }
    const ids = ['slums-edu', ...M.SLUMS_ITEMS.map((it) => ITEM_DOM[it.key])];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = { education: selVal('slums-edu') };
      for (const it of M.SLUMS_ITEMS) input[it.key] = selVal(ITEM_DOM[it.key]);
      const r = M.slums(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/30` },
        { label: 'Screen', value: r.band },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
