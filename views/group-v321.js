// spec-v321: renderer for the Hinchey classification of acute diverticulitis.
// Group G. The clinician picks the stage (I-IV); the tile reports the stage and its
// standard definition.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the stage; it never asserts a diagnosis or a
// management decision (lib/hinchey-v321.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hinchey-v321.js';
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and management stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'hinchey'(root) {
    note(root, 'Original Hinchey classification of perforated diverticulitis (Hinchey 1978). Pick the stage from the operative/CT findings. Stages I–II are abscesses (often antibiotics ± drainage); III–IV are generalized peritonitis (generally emergent surgery). Near-neighbors: mannheim-peritonitis-index.');
    root.appendChild(select('Hinchey stage (operative / CT findings)', 'hinchey-stage', [
      ['I', 'I — localized pericolic/mesocolic abscess or phlegmon'],
      ['II', 'II — pelvic, distant intra-abdominal, or retroperitoneal abscess'],
      ['III', 'III — generalized purulent peritonitis'],
      ['IV', 'IV — generalized fecal (feculent) peritonitis'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['hinchey-stage'], () => safe(o, () => {
      const r = M.hinchey({ stage: val('hinchey-stage') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Stage', value: r.stage },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
