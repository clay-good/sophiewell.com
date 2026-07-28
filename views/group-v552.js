// spec-v552: renderer for the SNOT-22. Group G. Items under an h2 section heading (never h3 - an h3 under
// the page h1 is a heading-level skip).
//
// The "most important items" checkboxes sit under their own h2 with the label saying outright that they are
// not scored, because the whole risk with this instrument is a reader assuming that marking an item weights
// it (lib/snot22-v552.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 this reports a patient-reported
// symptom burden; it never diagnoses rhinosinusitis and never indicates surgery.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/snot22-v552.js';
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
function checkbox(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ` ${label}` }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const OPTIONS = M.SNOT22_OPTIONS.map((o) => [String(o.value), `${o.value} — ${o.text}`]);

export const renderers = {
  snot22(root) {
    note(root, 'The 22-item Sino-Nasal Outcome Test asks the patient to rate 22 symptoms and consequences of rhinosinusitis over the past two weeks, each from 0 to 5, for a total of 0 to 110 where higher is worse. It is a companion to the Lund-Mackay CT stage rather than a duplicate of it — that grades what the scan shows, this asks the patient, and the two correlate poorly by design.');

    heading(root, 'Rate each problem over the past two weeks');
    for (const item of M.SNOT22_ITEMS) {
      root.appendChild(select(item.text, `snot22-${item.key}`, OPTIONS));
    }

    heading(root, 'Most important items (not scored)');
    note(root, 'The form asks the patient to mark up to five items most affecting their health. This is a descriptor recorded alongside the total — it is not summed, not weighted, and does not change any item’s contribution to the score.');
    for (const item of M.SNOT22_ITEMS) {
      root.appendChild(checkbox(item.text, `snot22-imp-${item.key}`));
    }

    const scoreIds = M.SNOT22_ITEMS.map((i) => `snot22-${i.key}`);
    const impIds = M.SNOT22_ITEMS.map((i) => `snot22-imp-${i.key}`);

    const o = out(); root.appendChild(o);
    wire([...scoreIds, ...impIds], () => safe(o, () => {
      const input = { mostImportant: M.SNOT22_ITEMS.filter((i) => checked(`snot22-imp-${i.key}`)).map((i) => i.key) };
      for (const item of M.SNOT22_ITEMS) input[item.key] = val(`snot22-${item.key}`);
      const r = M.snot22(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Total', value: `${r.total} of ${r.max}` },
        { label: 'Band', value: r.namedBand ? r.band : `${r.band} (no named band below 8)` },
        { label: 'Marked most important', value: r.mostImportant.length ? `${r.mostImportant.length} item(s), not scored` : 'none' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
