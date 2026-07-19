// spec-v431: renderer for the modified Bell staging of NEC (stages IA/IB/IIA/IIB/IIIA/IIIB). Group G. The
// clinician picks the stage; the tile reports the stage and its hallmark findings. As a stage descriptor it
// reports the stage the clinician has assigned.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the modified Bell stage; it never asserts a diagnosis, a treatment decision,
// or a prognosis (lib/bell-nec-v431.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/bell-nec-v431.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the neonatology / pediatric-surgery team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'bell-nec'(root) {
    note(root, 'The modified Bell staging of necrotizing enterocolitis (NEC), staging a newborn by systemic, intestinal, and radiographic findings. Pick the stage. I (IA/IB): suspected; II (IIA/IIB): proven (pneumatosis intestinalis; IIB adds portal venous gas); III (IIIA/IIIB): advanced and severely ill (IIIA intact, IIIB perforated with pneumoperitoneum). Reports the stage the clinician has assigned, not a diagnosis or a treatment decision (medical vs surgery). Near-neighbors: sarnat-hie, papile-ivh.');
    root.appendChild(select('Modified Bell stage', 'bell-stage', [
      ['IA', 'IA - suspected'],
      ['IB', 'IB - suspected, grossly bloody stool'],
      ['IIA', 'IIA - proven, mildly ill (pneumatosis)'],
      ['IIB', 'IIB - proven, moderately ill (portal venous gas)'],
      ['IIIA', 'IIIA - advanced, severely ill, bowel intact'],
      ['IIIB', 'IIIB - advanced, perforated (pneumoperitoneum)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['bell-stage'], () => safe(o, () => {
      const r = M.bellNec({ stage: val('bell-stage') });
      resultRow(o, [
        { text: r.band },
        { label: 'Stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
