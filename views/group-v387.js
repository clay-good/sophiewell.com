// spec-v387: renderer for the Dimeglio clubfoot classification (four 0-4 parameters + four bonus flags,
// total 0-20, grades I-IV). Group G. The clinician scores the parameters and checks the bonus features;
// the tile reports the total, the angle/bonus subscores, and the grade.
//
// Same input/render contract as the rest of the codebase: each input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Dimeglio score; it never asserts a diagnosis, a treatment decision,
// or a prognosis (lib/dimeglio-clubfoot-v387.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/dimeglio-clubfoot-v387.js';
import { resultRow } from '../lib/result-copy.js';

const PARAM_OPTS = [['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']];

function select(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of PARAM_OPTS) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function check(label, id) {
  const wrap = el('p');
  const box = el('input', { id, type: 'checkbox' });
  wrap.appendChild(box);
  wrap.appendChild(el('label', { for: id, text: ` ${label}` }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const IDS = ['dim-equinus', 'dim-varus', 'dim-derotation', 'dim-adduction', 'dim-pc', 'dim-mc', 'dim-cavus', 'dim-muscle'];

export const renderers = {
  'dimeglio-clubfoot'(root) {
    note(root, 'Dimeglio classification of clubfoot severity - four reducibility parameters (each 0-4) plus four 1-point features, total 0-20 (grade I benign to IV very severe). Higher = more severe. Companion to the Pirani score. Near-neighbors: pirani-clubfoot.');
    note(root, 'Reducibility (each 0-4: 90-45 deg = 4, down to < -20 deg = 0):');
    root.appendChild(select('Equinus', 'dim-equinus'));
    root.appendChild(select('Varus', 'dim-varus'));
    root.appendChild(select('Derotation of the calcaneopedal block', 'dim-derotation'));
    root.appendChild(select('Forefoot adduction', 'dim-adduction'));
    note(root, 'Bonus points (1 each):');
    root.appendChild(check('Posterior crease', 'dim-pc'));
    root.appendChild(check('Medial crease', 'dim-mc'));
    root.appendChild(check('Cavus', 'dim-cavus'));
    root.appendChild(check('Muscle abnormality', 'dim-muscle'));

    const o = out(); root.appendChild(o);
    wire(IDS, () => safe(o, () => {
      const r = M.dimeglioClubfoot({
        equinus: val('dim-equinus'), varus: val('dim-varus'), derotation: val('dim-derotation'), adduction: val('dim-adduction'),
        posteriorCrease: checked('dim-pc'), medialCrease: checked('dim-mc'), cavus: checked('dim-cavus'), muscleAbnormality: checked('dim-muscle'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: r.bandLabel },
        { label: 'Reducibility subtotal', value: `${r.angleScore} of 16` },
        { label: 'Bonus', value: `${r.bonusScore} of 4` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
