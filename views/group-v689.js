// spec-v689 §2: renderer for elderly-mobility-scale — the Elderly Mobility Scale (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Seven selects
// (one per item, each option carrying its point value); the sum 0-20 maps to an
// independence band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/elderly-mobility-scale-v689.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The EMS is a functional-mobility measure that guides rehabilitation and discharge planning; it supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const LIE = [['2', 'Independent'], ['1', 'Needs help of 1 person'], ['0', 'Needs help of 2 or more']];
const SIT_STAND = [['3', 'Independent, under 3 seconds'], ['2', 'Independent, over 3 seconds'], ['1', 'Needs help of 1 (verbal or physical)'], ['0', 'Needs help of 2 or more']];
const STANDING = [['3', 'Stands without support and reaches within arm reach'], ['2', 'Stands without support but needs help to reach'], ['1', 'Stands but requires support'], ['0', 'Stands only with physical support']];
const GAIT = [['3', 'Independent (including with sticks)'], ['2', 'Independent with a frame'], ['1', 'Mobile with an aid but erratic or unsafe turning'], ['0', 'Needs physical assistance or constant supervision']];
const WALK = [['3', 'Under 15 seconds'], ['2', '16 to 30 seconds'], ['1', 'Over 30 seconds']];
const REACH = [['4', 'Over 20 cm'], ['2', '10 to 20 cm'], ['0', 'Under 10 cm']];

export const renderers = {
  'elderly-mobility-scale'(root) {
    note(root, 'Elderly Mobility Scale (Smith 1994): seven mobility items summed to a maximum of 20. Bands: 14–20 independent (generally safe for home), 10–13 borderline, under 10 dependent. Higher is better.');
    root.appendChild(selectField('Lying to sitting', 'ems-lie-sit', CHOICE(LIE)));
    root.appendChild(selectField('Sitting to lying', 'ems-sit-lie', CHOICE(LIE)));
    root.appendChild(selectField('Sit to stand', 'ems-sit-stand', CHOICE(SIT_STAND)));
    root.appendChild(selectField('Standing (and reach)', 'ems-standing', CHOICE(STANDING)));
    root.appendChild(selectField('Gait', 'ems-gait', CHOICE(GAIT)));
    root.appendChild(selectField('Timed 6 meter walk', 'ems-walk', CHOICE(WALK)));
    root.appendChild(selectField('Functional reach', 'ems-reach', CHOICE(REACH)));
    const ids = ['ems-lie-sit', 'ems-sit-lie', 'ems-sit-stand', 'ems-standing', 'ems-gait', 'ems-walk', 'ems-reach'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.elderlyMobilityScale({
        lyingToSitting: val('ems-lie-sit'), sittingToLying: val('ems-sit-lie'), sitToStand: val('ems-sit-stand'),
        standing: val('ems-standing'), gait: val('ems-gait'), timedWalk: val('ems-walk'), functionalReach: val('ems-reach'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/20` },
        { label: 'Mobility', value: r.tier },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
