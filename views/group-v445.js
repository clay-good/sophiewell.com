// spec-v445: renderer for the Revised Atlanta acute-pancreatitis severity (mild/moderately-severe/severe).
// Group G. The clinician picks the severity; the tile reports the category and its definition. As a severity
// descriptor it reports the category the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Revised Atlanta severity; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/atlanta-pancreatitis-v445.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/atlanta-pancreatitis-v445.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the treating team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'atlanta-pancreatitis'(root) {
    note(root, 'The Revised Atlanta classification of acute pancreatitis severity, by the presence and duration of organ failure and of local/systemic complications. Pick the severity. Mild: no organ failure, no complications; moderately severe: transient organ failure (resolving within 48 h) and/or complications; severe: persistent organ failure (> 48 h). Reports the severity category the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: ranson-bisap.');
    root.appendChild(select('Revised Atlanta severity', 'atlanta-sev', [
      ['mild', 'Mild - no organ failure, no complications'],
      ['moderately-severe', 'Moderately severe - transient organ failure and/or complications'],
      ['severe', 'Severe - persistent organ failure (> 48 h)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['atlanta-sev'], () => safe(o, () => {
      const r = M.atlantaPancreatitis({ severity: val('atlanta-sev') });
      resultRow(o, [
        { text: r.band },
        { label: 'Severity', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
