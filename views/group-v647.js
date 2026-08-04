// spec-v647 §2: renderer for schenck-knee — the Schenck anatomic classification of
// knee dislocations (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Checkboxes
// for the torn structures, the fracture, and the C/N modifiers; the lib maps them to
// a KD grade. No cruciate torn and no fracture reports "not a KD pattern" rather than
// a spurious grade.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/schenck-v647.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The grade is inferred from the torn structures you entered; a true knee dislocation requires a documented tibiofemoral dislocation. A knee dislocation is a vascular emergency — the classification does not replace urgent pulse checks, ABIs, and the surgeon’s assessment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'schenck-knee'(root) {
    note(root, 'Schenck classification (Schenck 1994; KD-V and C/N modifiers Wascher 1997): maps the torn ligaments to a KD grade. KD-I one cruciate; KD-II both cruciates (collaterals intact); KD-III both cruciates + one collateral (IIIM medial / IIIL lateral); KD-IV both cruciates + both collaterals; KD-V dislocation with a periarticular fracture. C = arterial injury, N = neurologic injury. Near-neighbors: schatzker-classification, tlics-score.');
    root.appendChild(checkField('ACL torn', 'sk-acl'));
    root.appendChild(checkField('PCL torn', 'sk-pcl'));
    root.appendChild(checkField('Medial side torn (MCL / posteromedial corner)', 'sk-medial'));
    root.appendChild(checkField('Lateral side torn (LCL / posterolateral corner)', 'sk-lateral'));
    root.appendChild(checkField('Periarticular fracture present (makes it KD-V)', 'sk-fracture'));
    root.appendChild(checkField('Arterial (popliteal) injury — appends C', 'sk-arterial'));
    root.appendChild(checkField('Neurologic (e.g. peroneal) injury — appends N', 'sk-nerve'));
    const ids = ['sk-acl', 'sk-pcl', 'sk-medial', 'sk-lateral', 'sk-fracture', 'sk-arterial', 'sk-nerve'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.schenckKnee({
        aclTorn: chk('sk-acl'), pclTorn: chk('sk-pcl'), medialTorn: chk('sk-medial'), lateralTorn: chk('sk-lateral'),
        fracture: chk('sk-fracture'), arterial: chk('sk-arterial'), nerve: chk('sk-nerve'),
      });
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.classified ? r.gradeFull : 'n/a' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
