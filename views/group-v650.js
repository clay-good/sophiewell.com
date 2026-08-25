// spec-v650 §2: renderer for masaoka-koga — Masaoka-Koga staging of thymic
// epithelial tumors (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Checkboxes
// for the invasion/spread findings; the lib takes the most advanced one as the stage.
// None checked reports Stage I (completely encapsulated).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/masaoka-v650.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The stage is the most advanced finding you entered; it is a pathologic staging applied to a resected specimen, read with the full pathology report and the WHO histologic type. The staging and treatment decisions stay with the pathologist and the multidisciplinary team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'masaoka-koga'(root) {
    note(root, 'Masaoka-Koga staging (Koga 1994; ITMIG-clarified, Detterbeck 2011): the most advanced finding sets the thymoma stage. Nothing checked = Stage I (completely encapsulated, including invasion into but not through the capsule). Stage III is not subdivided.');
    root.appendChild(checkField('Microscopic transcapsular invasion (through the capsule) — IIa', 'mk-micro'));
    root.appendChild(checkField('Macroscopic invasion into surrounding fat, or gross adherence to (not through) pleura/pericardium — IIb', 'mk-macro'));
    root.appendChild(checkField('Macroscopic invasion into a neighboring organ (pericardium, great vessel, lung) — III', 'mk-organ'));
    root.appendChild(checkField('Pleural or pericardial dissemination (separate implant nodules) — IVa', 'mk-dissem'));
    root.appendChild(checkField('Lymphogenous or hematogenous (nodal/distant) metastasis — IVb', 'mk-mets'));
    const ids = ['mk-micro', 'mk-macro', 'mk-organ', 'mk-dissem', 'mk-mets'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.masaokaKoga({
        microInvasion: chk('mk-micro'), macroInvasion: chk('mk-macro'), organInvasion: chk('mk-organ'),
        dissemination: chk('mk-dissem'), distantMets: chk('mk-mets'),
      });
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Stage', value: r.stage },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
