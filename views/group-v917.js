// spec-v917 §2: renderer for who-surgical-checklist — the three phases of the WHO Surgical
// Safety Checklist (Communication & Handoff, Group H).
//
// The result names the incomplete PHASE rather than giving one percentage, and the Sign Out line
// prints on every result, because that is the phase that goes missing.

import { el, clear } from '../lib/dom.js';
import * as W from '../lib/who-surgical-checklist-v917.js';
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

const domId = (key) => `wsc-${key.toLowerCase()}`;

export const renderers = {
  'who-surgical-checklist'(root) {
    note(root, 'Each item is recorded when it has been done or does not apply.');

    const ids = [];
    for (const phase of W.PHASES) {
      root.appendChild(el('h2', { text: `${phase.name} - ${phase.moment}` }));
      for (const item of phase.items) {
        checkField(root, item.text, domId(item.key));
        ids.push(domId(item.key));
      }
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const phase of W.PHASES) for (const item of phase.items) args[item.key] = checked(domId(item.key));
      const r = W.whoSurgicalChecklist(args);
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      for (const p of r.phases) {
        note(o, p.complete
          ? `${p.name}: complete, ${p.doneCount} of ${p.total}.`
          : `${p.name}: ${p.doneCount} of ${p.total}. Outstanding: ${p.outstanding.join('; ')}.`);
      }
      note(o, r.signOutNote);
      note(o, r.namingNote);
      note(o, r.momentNote);
      note(o, r.spokenNote);
      note(o, r.wordingNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reports which phase is incomplete. It does not verify that anything was actually done.' }));
  },
};
