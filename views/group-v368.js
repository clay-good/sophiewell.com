// spec-v368: renderer for the Ross classification of pediatric heart failure (classes I-IV). Group G.
// The clinician picks the functional class; the tile reports the class, its symptom description, and
// whether it is an advanced (class III-IV) heart failure.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Ross class; it never asserts a diagnosis, a treatment decision, or
// a prognosis (lib/ross-hf-peds-v368.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ross-hf-peds-v368.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The class is symptom-based and can vary; the management decision stays with the pediatric cardiology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ross-hf-peds'(root) {
    note(root, 'Ross classification (Ross 1992; modified 2012) of heart failure in infants and children - the pediatric counterpart to the adult NYHA class. Pick the class from the child\'s symptoms. I: no symptoms; II: mild tachypnea / diaphoresis with feeds or dyspnea on exertion, no growth failure; III: marked symptoms with growth failure; IV: symptoms at rest. Near-neighbors: nyha-class.');
    root.appendChild(select('Ross class', 'ross-class', [
      ['I', 'Class I - no limitation or symptoms'],
      ['II', 'Class II - mild symptoms with feeds / exertion, no growth failure'],
      ['III', 'Class III - marked symptoms with growth failure'],
      ['IV', 'Class IV - symptomatic at rest'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['ross-class'], () => safe(o, () => {
      const r = M.rossHfPeds({ cls: val('ross-class') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Class', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
