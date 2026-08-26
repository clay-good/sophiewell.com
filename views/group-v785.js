// spec-v785 §2: renderer for olbi — the Oldenburg Burnout Inventory (Clinical Scoring &
// Risk, Group G). Companion to the cbi tile from spec-v780.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Sixteen
// agree-to-disagree selects. Each item is identified by its number, its subscale and its
// scoring direction; the wording belongs to the OLBI form and is not reproduced.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/olbi-v785.js';
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This is a self-report measure of how work is affecting you, not a clinical diagnosis and not an occupational-health determination. No threshold is asserted, because published sources disagree on whether a consensus cutoff exists.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const ANSWER = [
  { value: '', text: '— not answered —' },
  { value: 'strongly-agree', text: 'Strongly agree' },
  { value: 'agree', text: 'Agree' },
  { value: 'disagree', text: 'Disagree' },
  { value: 'strongly-disagree', text: 'Strongly disagree' },
];

export const renderers = {
  olbi(root) {
    note(root, 'Oldenburg Burnout Inventory (Demerouti 2003): answer each of the sixteen statements from the form. Eight measure exhaustion and eight measure disengagement, and half of them are reverse scored, so neither subscale can be scored by adding answers directly. Enter the answer as given and the direction is applied for you. Each subscale runs 8 to 32 and the total 16 to 64; higher is more burnout.');
    // The dom ids are written out as literals, not built in a loop: the tool-page
    // builder resolves a select's option TEXT by finding the literal id beside its
    // options list, so a computed id would leave the page printing the raw value
    // ("agree") where the screen reads "Agree".
    root.appendChild(selectField('Item 1 (disengagement, scored as worded)', 'olbi-q1', ANSWER));
    root.appendChild(selectField('Item 2 (exhaustion, reverse scored)', 'olbi-q2', ANSWER));
    root.appendChild(selectField('Item 3 (disengagement, reverse scored)', 'olbi-q3', ANSWER));
    root.appendChild(selectField('Item 4 (exhaustion, reverse scored)', 'olbi-q4', ANSWER));
    root.appendChild(selectField('Item 5 (exhaustion, scored as worded)', 'olbi-q5', ANSWER));
    root.appendChild(selectField('Item 6 (disengagement, reverse scored)', 'olbi-q6', ANSWER));
    root.appendChild(selectField('Item 7 (disengagement, scored as worded)', 'olbi-q7', ANSWER));
    root.appendChild(selectField('Item 8 (exhaustion, reverse scored)', 'olbi-q8', ANSWER));
    root.appendChild(selectField('Item 9 (disengagement, reverse scored)', 'olbi-q9', ANSWER));
    root.appendChild(selectField('Item 10 (exhaustion, scored as worded)', 'olbi-q10', ANSWER));
    root.appendChild(selectField('Item 11 (disengagement, reverse scored)', 'olbi-q11', ANSWER));
    root.appendChild(selectField('Item 12 (exhaustion, reverse scored)', 'olbi-q12', ANSWER));
    root.appendChild(selectField('Item 13 (disengagement, scored as worded)', 'olbi-q13', ANSWER));
    root.appendChild(selectField('Item 14 (exhaustion, scored as worded)', 'olbi-q14', ANSWER));
    root.appendChild(selectField('Item 15 (disengagement, scored as worded)', 'olbi-q15', ANSWER));
    root.appendChild(selectField('Item 16 (exhaustion, scored as worded)', 'olbi-q16', ANSWER));
    const ids = Array.from({ length: 16 }, (_, i) => `olbi-q${i + 1}`);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const id of ids) args[id.replace('olbi-', '')] = val(id);
      const r = M.olbi(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Exhaustion', value: `${r.exhaustion}/32` },
        { label: 'Disengagement', value: `${r.disengagement}/32` },
        { label: 'Total', value: `${r.total}/64` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
