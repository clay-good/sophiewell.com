// spec-v729 §2: renderer for abc-scale — the Activities-specific Balance Confidence Scale
// (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Sixteen 0-100%
// number inputs; the mean maps to a balance-confidence / fall-risk band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/abc-scale-v729.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max: '100', step: '1', inputmode: 'numeric' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The ABC measures balance confidence to gauge fall risk and track change; it is not a performance test or a diagnosis. It supports rather than replaces the physical and fall-risk assessment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const ACTIVITIES = [
  'Walk around the house', 'Walk up or down stairs', 'Bend over and pick up a slipper', 'Reach at eye level',
  'Reach on tiptoes', 'Stand on a chair to reach', 'Sweep the floor', 'Walk outside to a nearby car',
  'Get into or out of a car', 'Walk across a parking lot', 'Walk up or down a ramp', 'Walk in a crowded mall',
  'Walk in a crowd or get bumped', 'Ride an escalator holding the rail', 'Ride an escalator not holding the rail', 'Walk on icy sidewalks',
];

export const renderers = {
  'abc-scale'(root) {
    note(root, 'Activities-specific Balance Confidence Scale (Powell & Myers 1995): rate confidence 0–100% for 16 activities. Score = mean. < 67% indicates increased fall risk; functioning bands: < 50 low, 50–80 moderate, > 80 high.');
    const ids = [];
    ACTIVITIES.forEach((activity, i) => {
      const id = `abc-a${i + 1}`;
      ids.push(id);
      root.appendChild(numberField(`${activity} (% confidence)`, id));
    });
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      ids.forEach((id, i) => { args[`a${i + 1}`] = val(id); });
      const r = M.abcScale(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'ABC', value: `${r.score}%` },
        { label: 'Fall risk', value: r.fallRisk ? 'increased' : 'lower' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
