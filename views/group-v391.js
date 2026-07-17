// spec-v391: renderer for the Hardy (Hardy-Wilson) classification of a pituitary adenoma — two selects: a
// sellar-floor grade (0-IV) and a suprasellar stage (0/A-E). Group G. The clinician picks both; the tile
// reports the grade, the stage, and whether it is an invasive (grade III-IV) sellar-floor grade.
//
// Same input/render contract as the rest of the codebase: each input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Hardy grade/stage; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/hardy-adenoma-v391.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hardy-adenoma-v391.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the neurosurgical / endocrine team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'hardy-adenoma'(root) {
    note(root, 'Hardy (Hardy-Wilson) classification of a pituitary adenoma - a sellar-floor grade and a suprasellar-extension stage. Pick both. Grade: 0 enclosed / I focal < 10 mm / II enlarged, floor intact / III localized floor erosion / IV diffuse destruction. Stage: 0 none / A cistern / B third-ventricle recess / C third ventricle displaced / D intracranial / E cavernous sinus. Near-neighbors: knosp-adenoma.');
    root.appendChild(select('Sellar-floor grade', 'hardy-grade', [
      ['0', 'Grade 0 - enclosed within the sella'],
      ['I', 'Grade I - focal, tumor < 10 mm'],
      ['II', 'Grade II - enlarged, floor intact'],
      ['III', 'Grade III - localized floor erosion'],
      ['IV', 'Grade IV - diffuse destruction'],
    ]));
    root.appendChild(select('Suprasellar stage', 'hardy-stage', [
      ['0', 'Stage 0 - none (intrasellar)'],
      ['A', 'Stage A - suprasellar cistern'],
      ['B', 'Stage B - third-ventricle recess'],
      ['C', 'Stage C - third ventricle displaced'],
      ['D', 'Stage D - intracranial (intradural)'],
      ['E', 'Stage E - into the cavernous sinus'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['hardy-grade', 'hardy-stage'], () => safe(o, () => {
      const r = M.hardyAdenoma({ grade: val('hardy-grade'), stage: val('hardy-stage') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade / stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
