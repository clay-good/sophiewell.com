// spec-v348: renderer for the Strasberg classification of a bile duct injury (types A-E). Group G.
// The clinician picks the injury type; the tile reports the type, its description, and whether it is
// a major (type D-E) injury.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Strasberg type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/strasberg-bdi-v348.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/strasberg-bdi-v348.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the hepatobiliary surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'strasberg-bdi'(root) {
    note(root, 'Strasberg classification (Strasberg 1995) of an iatrogenic bile duct injury (usually laparoscopic cholecystectomy). Pick the type. A leak from a small duct in continuity (cystic stump / Luschka); B occlusion of an aberrant sectoral duct; C leak from an aberrant sectoral duct not in continuity; D lateral injury to the extrahepatic duct; E transection of the main bile duct (E1-E5). Minor (A-C, often ERCP) vs major (D-E, often surgical). Near-neighbors: cholangitis-severity, cholecystitis-severity.');
    root.appendChild(select('Strasberg type', 'strasberg-type', [
      ['A', 'A - leak from a small duct in continuity (cystic stump / Luschka)'],
      ['B', 'B - occlusion of an aberrant sectoral duct'],
      ['C', 'C - leak from an aberrant sectoral duct not in continuity'],
      ['D', 'D - lateral injury to the extrahepatic duct'],
      ['E', 'E - transection of the main bile duct (E1-E5)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['strasberg-type'], () => safe(o, () => {
      const r = M.strasbergBdi({ type: val('strasberg-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.type },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
