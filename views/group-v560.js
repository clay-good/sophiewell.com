// spec-v560: renderer for the al Naqeeb aEEG amplitude classification. Group G. Inputs under h2 section
// headings (never h3 - an h3 under the page h1 is a heading-level skip).
//
// Seizure activity sits under its OWN heading, which says outright that it is reported separately and never
// folded into the amplitude category - the distinction the original scheme is built on
// (lib/anaqeeb-aeeg-v560.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile classifies an amplitude
// reading; it never diagnoses encephalopathy and is never a cooling eligibility criterion.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/anaqeeb-aeeg-v560.js';
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
function number(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: '0.5' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'anaqeeb-aeeg'(root) {
    note(root, 'The al Naqeeb classification sorts the amplitude-integrated EEG into three categories from the upper and lower margins of the trace. It is a decision table, not a score — nothing is summed. The classification is not exhaustive: an upper margin of exactly 10 µV falls in no published category, and no category is assigned rather than rounding to the nearest one.');

    heading(root, 'aEEG trace margins');
    root.appendChild(number('Upper margin (µV)', 'anaqeeb-upper'));
    root.appendChild(number('Lower margin (µV)', 'anaqeeb-lower'));
    note(root, M.HEALTHY_CONTROL_REFERENCE);

    heading(root, 'Seizure activity (reported separately)');
    note(root, 'Never folded into the amplitude category. An infant with a normal amplitude and recorded seizures is not thereby moderately abnormal. aEEG is a compressed two-channel summary and cannot exclude seizures.');
    root.appendChild(select('Seizure activity recorded?', 'anaqeeb-seizures',
      [['', 'Not stated'], ['no', 'No'], ['yes', 'Yes']]));

    const o = out(); root.appendChild(o);
    wire(['anaqeeb-upper', 'anaqeeb-lower', 'anaqeeb-seizures'], () => safe(o, () => {
      const r = M.anaqeebAeeg({
        upperMargin: val('anaqeeb-upper'), lowerMargin: val('anaqeeb-lower'),
        seizures: val('anaqeeb-seizures'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Amplitude category', value: r.classified ? r.categoryLabel : 'no published category' },
        { label: 'Margins', value: `upper ${r.upperMargin} µV, lower ${r.lowerMargin} µV` },
        { label: 'Seizures', value: r.seizures === null ? 'not stated' : (r.seizures ? 'recorded (separate finding)' : 'not recorded') },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
