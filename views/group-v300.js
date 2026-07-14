// spec-v300: renderer for the AVF maturation "Rule of 6s". Group G (clinical
// scoring & reference). The clinician enters the fistula blood flow, vein inner
// diameter, and vein depth; the tile reports which of the three thresholds are
// met and whether all three are satisfied.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the cited rule's criteria; it never asserts a
// cannulation decision (lib/av-fistula-v300.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/av-fistula-v300.js';
import { resultRow } from '../lib/result-copy.js';

function numInput(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'avf-rule-of-6s'(root) {
    note(root, 'Arteriovenous fistula (AVF) maturation — the “Rule of 6s”. Enter the fistula blood flow, vein inner diameter, and vein depth; the tile checks each against the 2006 KDOQI thresholds (flow ≥ 600 mL/min, diameter ≥ 6 mm, depth ≤ 6 mm) and reports whether all three are met. Meeting all three is highly predictive of maturation; the 2019 KDOQI update relies on clinical judgment. Near-neighbors: ktv-urr, ufr-dialysis.');
    root.appendChild(numInput('Fistula blood flow (mL/min)', 'avf-flow', { min: '0' }));
    root.appendChild(numInput('Vein inner diameter (mm)', 'avf-diameter', { min: '0' }));
    root.appendChild(numInput('Vein depth from skin (mm)', 'avf-depth', { min: '0' }));

    const o = out(); root.appendChild(o);
    wire(['avf-flow', 'avf-diameter', 'avf-depth'], () => safe(o, () => {
      const r = M.avfRuleOf6s({ flow: val('avf-flow'), diameter: val('avf-diameter'), depth: val('avf-depth') });
      if (!r.valid) { note(o, r.message || 'Enter the measurements.'); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Criteria met', value: `${r.metCount} of 3` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
