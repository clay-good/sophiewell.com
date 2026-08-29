// spec-v866 §2: renderer for broset — the Broset Violence Checklist (Clinical Scoring & Risk,
// Group G).
//
// The twenty-four-hour window and the restraint disclaimer print on every result, including the
// zero one, because a checklist like this is most misused when it comes back low.

import { el, clear } from '../lib/dom.js';
import * as B from '../lib/broset-v866.js';
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

const domId = (key) => `bv-${key.toLowerCase()}`;

export const renderers = {
  broset(root) {
    note(root, 'Scored on what is being observed now, and rescored every shift. It covers the next twenty-four hours and nothing beyond them.');

    root.appendChild(el('h2', { text: 'Behavior observed now' }));
    for (const b of B.BEHAVIORS) checkField(root, b.text, domId(b.key));

    const ids = B.BEHAVIORS.map((b) => domId(b.key));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const b of B.BEHAVIORS) args[b.key] = checked(domId(b.key));
      const r = B.brosetViolence(args);
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.presentNote);
      if (r.zeroNote) note(o, r.zeroNote);
      if (r.confusedNote) note(o, r.confusedNote);
      note(o, r.windowNote);
      note(o, r.notRestraintNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This records observed behavior on a published checklist. It does not decide what to do, and it never authorizes restraint or seclusion.' }));
  },
};
