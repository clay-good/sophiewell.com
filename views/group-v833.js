// spec-v833 §2: renderer for figo-pas — the FIGO clinical grading of placenta accreta
// spectrum (Clinical Scoring & Risk, Group G).
//
// Every input is an observable operative finding rather than a grade name, because that is
// what FIGO grades. Offering a "grade" picklist would let a reader assert the conclusion the
// tile is meant to derive.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/figo-pas-v833.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'figo-pas'(root) {
    note(root, 'This grades what is seen at operation, not histology. Enter the findings; the grade follows.');

    root.appendChild(el('h2', { text: 'Separation and bleeding' }));
    root.appendChild(checkField('The placenta does not separate with oxytocin and gentle cord traction', 'pas-noseparation'));
    root.appendChild(checkField('Manual removal brings heavy bleeding from the implantation site', 'pas-bleeding'));

    root.appendChild(el('h2', { text: 'Appearance over the placental bed' }));
    root.appendChild(checkField('Bluish or purple coloring, or distension, the placental bulge', 'pas-bulge'));
    root.appendChild(checkField('Significant neovascularity over the placental bed', 'pas-neovasc'));
    root.appendChild(checkField('Gentle cord traction pulls the uterus inwards without the placenta separating, the dimple sign', 'pas-dimple'));

    root.appendChild(el('h2', { text: 'Invasion' }));
    root.appendChild(checkField('Placental tissue seen invading through the uterine serosa', 'pas-serosa'));
    root.appendChild(checkField('A clear surgical plane is present between bladder and uterus', 'pas-plane'));
    root.appendChild(checkField('Invasion into the bladder wall or urothelium', 'pas-bladder'));
    root.appendChild(checkField('Invasion into the broad ligament, vaginal wall, pelvic sidewall or another pelvic organ', 'pas-other'));

    const ids = ['pas-noseparation', 'pas-bleeding', 'pas-bulge', 'pas-neovasc', 'pas-dimple',
      'pas-serosa', 'pas-plane', 'pas-bladder', 'pas-other'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.figoPas({
        failsToSeparate: checked('pas-noseparation'),
        heavyBleedingOnRemoval: checked('pas-bleeding'),
        placentalBulge: checked('pas-bulge'),
        neovascularity: checked('pas-neovasc'),
        dimpleSign: checked('pas-dimple'),
        invadesThroughSerosa: checked('pas-serosa'),
        clearSurgicalPlane: checked('pas-plane'),
        bladderInvasion: checked('pas-bladder'),
        otherPelvicOrgan: checked('pas-other'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.outrankNote) note(o, r.outrankNote);
      if (r.planeNote) note(o, r.planeNote);
      if (r.clinicalNote) note(o, r.clinicalNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This describes findings already made at operation. It does not plan the surgery or decide about hysterectomy.' }));
  },
};
