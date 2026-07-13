// spec-v297: renderer for the Seddon-Sunderland nerve-injury classification.
// Group G (clinical scoring & reference). The clinician selects the Sunderland
// grade (I-V); the tile reports the disrupted structures, the Seddon equivalent,
// the expected recovery, and whether surgical repair is typically required.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the classification descriptor; it never asserts a
// diagnosis or a surgical decision (lib/nerve-injury-v297.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nerve-injury-v297.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const [value, text] of options) sel.appendChild(el('option', { value, text }));
  wrap.appendChild(sel);
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
  'seddon-sunderland'(root) {
    note(root, 'Seddon-Sunderland peripheral nerve-injury classification. Select the Sunderland grade to see which structures are disrupted, the Seddon equivalent (neurapraxia / axonotmesis / neurotmesis), the expected recovery, and whether surgical repair is typically required. Grades I–II usually recover spontaneously; IV–V typically need surgery. Near-neighbors: house-brackmann, asia-impairment.');
    root.appendChild(select('Sunderland grade', 'ni-grade', [
      ['I', 'Grade I — neurapraxia (conduction block)'],
      ['II', 'Grade II — axonotmesis (axon disrupted, endoneurium intact)'],
      ['III', 'Grade III — axonotmesis (endoneurium disrupted)'],
      ['IV', 'Grade IV — perineurium disrupted (neuroma-in-continuity)'],
      ['V', 'Grade V — neurotmesis (complete transection)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['ni-grade'], () => safe(o, () => {
      const r = M.nerveInjuryGrade({ grade: val('ni-grade') });
      if (!r.valid) { note(o, r.message || 'Select a grade.'); return; }
      const rows = [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Seddon equivalent', value: r.seddon },
      ];
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
