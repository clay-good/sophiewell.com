// spec-v884 §2: renderer for eat-sleep-console — the Eat, Sleep, Console approach to neonatal
// opioid withdrawal (Clinical Scoring & Risk, Group G).
//
// The not-a-score sentence prints on every result, because a reader arriving from the Finnegan
// tile will expect a total and there is not one.

import { el, clear } from '../lib/dom.js';
import * as E from '../lib/eat-sleep-console-v884.js';
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

const domId = (key) => `esc-${key.toLowerCase()}`;

export const renderers = {
  'eat-sleep-console'(root) {
    note(root, 'Three functional questions about the infant as it is now. Nothing is added up, and there is no total.');

    root.appendChild(el('h2', { text: 'Not met, because of withdrawal' }));
    for (const i of E.ITEMS) checkField(root, i.text, domId(i.key));
    checkField(root, 'Another cause for the difficulty is suspected', 'esc-othercausesuspected');

    root.appendChild(el('h2', { text: 'Non-pharmacologic care in place' }));
    for (const m of E.CARE_MEASURES) checkField(root, m.text, domId(m.key));

    const all = [...E.ITEMS, ...E.CARE_MEASURES];
    const ids = all.map((i) => domId(i.key)).concat(['esc-othercausesuspected']);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = { otherCauseSuspected: checked('esc-othercausesuspected') };
      for (const i of all) args[i.key] = checked(domId(i.key));
      const r = E.eatSleepConsole(args);
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.recordedNote);
      if (r.missingCareNote) note(o, r.missingCareNote);
      if (r.parentNote) note(o, r.parentNote);
      note(o, r.notAScoreNote);
      note(o, r.careFirstNote);
      note(o, r.attributionNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This records three functional observations against a published approach. It does not decide whether to give medication.' }));
  },
};
