// spec-v906 §2: renderer for taco-trali — telling transfusion-associated circulatory overload
// from transfusion-related acute lung injury (Clinical Scoring & Risk, Group G).
//
// The stop-the-transfusion line prints on every result, above the distinction, because that step
// does not wait on it.

import { el, clear } from '../lib/dom.js';
import * as T from '../lib/taco-trali-v906.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const domId = (key) => `tt-${key.toLowerCase()}`;

export const renderers = {
  'taco-trali'(root) {
    note(root, 'Stop the transfusion and report the event for both. That does not wait on the distinction below.');

    root.appendChild(el('h2', { text: 'Entry criteria, common to both' }));
    checkField(root, 'Onset within 6 hours of the transfusion', 'tt-withinsixhours');
    checkField(root, 'New hypoxemia with bilateral pulmonary infiltrates', 'tt-newhypoxemiawithinfiltrates');

    root.appendChild(el('h2', { text: 'Pointing to circulatory overload' }));
    for (const f of T.OVERLOAD_FEATURES) checkField(root, f.text, domId(f.key));

    root.appendChild(el('h2', { text: 'Pointing to acute lung injury' }));
    for (const f of T.INJURY_FEATURES) checkField(root, f.text, domId(f.key));

    const all = [...T.OVERLOAD_FEATURES, ...T.INJURY_FEATURES];
    const ids = ['tt-withinsixhours', 'tt-newhypoxemiawithinfiltrates'].concat(all.map((f) => domId(f.key)));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {
        withinSixHours: checked('tt-withinsixhours'),
        newHypoxemiaWithInfiltrates: checked('tt-newhypoxemiawithinfiltrates'),
      };
      for (const f of all) args[f.key] = checked(domId(f.key));
      const r = T.tacoTrali(args);
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.recordedNote);
      note(o, r.stopNote);
      note(o, r.treatmentNote);
      note(o, r.coexistNote);
      note(o, r.surveillanceNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This weighs features already observed against published definitions. It does not diagnose, and it does not decide whether to give a diuretic.' }));
  },
};
