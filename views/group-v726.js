// spec-v726 §2: renderer for isi — the Insomnia Severity Index (Clinical Scoring & Risk,
// Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Seven 0-4 selects;
// the sum 0-28 maps to an insomnia-severity band. Neutral item labels (item wording is
// copyrighted).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/isi-v726.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The ISI grades insomnia severity and tracks response to treatment; it is not a stand-alone diagnosis. It supports rather than replaces clinical assessment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SCORE = [{ value: '', text: '— 0-4 —' }, { value: '0', text: '0 (none)' }, { value: '1', text: '1 (mild)' }, { value: '2', text: '2 (moderate)' }, { value: '3', text: '3 (severe)' }, { value: '4', text: '4 (very severe)' }];

export const renderers = {
  'isi'(root) {
    note(root, 'Insomnia Severity Index (Bastien 2001): seven items each rated 0–4, summed to 0–28. Bands: 0–7 none, 8–14 subthreshold, 15–21 moderate, 22–28 severe. A score ≥ 15 correlates with a clinical insomnia diagnosis.');
    root.appendChild(selectField('Severity of difficulty falling asleep', 'isi-fall', SCORE));
    root.appendChild(selectField('Severity of difficulty staying asleep', 'isi-stay', SCORE));
    root.appendChild(selectField('Severity of waking up too early', 'isi-early', SCORE));
    root.appendChild(selectField('Dissatisfaction with the current sleep pattern', 'isi-dissat', SCORE));
    root.appendChild(selectField('How noticeable to others (impairs quality of life)', 'isi-notice', SCORE));
    root.appendChild(selectField('How worried / distressed about the sleep problem', 'isi-worry', SCORE));
    root.appendChild(selectField('Interference with daily functioning', 'isi-interfere', SCORE));
    const ids = ['isi-fall', 'isi-stay', 'isi-early', 'isi-dissat', 'isi-notice', 'isi-worry', 'isi-interfere'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.isi({
        fallingAsleep: val('isi-fall'), stayingAsleep: val('isi-stay'), wakingEarly: val('isi-early'),
        dissatisfaction: val('isi-dissat'), noticeable: val('isi-notice'), worried: val('isi-worry'), interference: val('isi-interfere'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/28` },
        { label: 'Severity', value: r.tier },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
