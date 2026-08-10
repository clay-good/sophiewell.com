// spec-v688 §2: renderer for downton-fall-risk — the Downton Fall Risk Index (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Nine checkboxes
// (previous falls, five medication classes, three sensory deficits) plus two selects
// (mental state, gait); a count 0-11 maps to a low/high fall-risk band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/downton-fall-risk-v688.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
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
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Downton index is a fall-risk screen that should trigger fall-prevention measures, not a prediction of any individual fall. It supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const MENTAL = [['oriented', 'Oriented'], ['confused', 'Confused / cognitively impaired']];
const GAIT = [['normal', 'Normal (safe without aids)'], ['safe-with-aids', 'Safe with walking aids'], ['unsafe', 'Unsafe (with or without aids)'], ['unable', 'Unable to walk']];

export const renderers = {
  'downton-fall-risk'(root) {
    note(root, 'Downton Fall Risk Index: one point each for previous falls, five medication classes (tranquillizers/sedatives, diuretics, antihypertensives, antiparkinson, antidepressants), three sensory deficits (visual, hearing, limb), confused mental state, and an unsafe gait. Total 0–11; a score ≥ 3 is high fall risk.');
    root.appendChild(checkField('Known previous falls', 'dfr-falls'));
    root.appendChild(checkField('Tranquillizers or sedatives', 'dfr-med-tranq'));
    root.appendChild(checkField('Diuretics', 'dfr-med-diuretic'));
    root.appendChild(checkField('Antihypertensives (other than diuretics)', 'dfr-med-antihtn'));
    root.appendChild(checkField('Antiparkinson drugs', 'dfr-med-parkinson'));
    root.appendChild(checkField('Antidepressants', 'dfr-med-antidep'));
    root.appendChild(checkField('Visual impairment', 'dfr-sens-visual'));
    root.appendChild(checkField('Hearing impairment', 'dfr-sens-hearing'));
    root.appendChild(checkField('Limb deficit (e.g. amputation, neuropathy)', 'dfr-sens-limb'));
    root.appendChild(selectField('Mental state', 'dfr-mental', CHOICE(MENTAL)));
    root.appendChild(selectField('Gait', 'dfr-gait', CHOICE(GAIT)));
    const ids = ['dfr-falls', 'dfr-med-tranq', 'dfr-med-diuretic', 'dfr-med-antihtn', 'dfr-med-parkinson', 'dfr-med-antidep', 'dfr-sens-visual', 'dfr-sens-hearing', 'dfr-sens-limb', 'dfr-mental', 'dfr-gait'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.downtonFallRisk({
        previousFalls: checked('dfr-falls'),
        medTranquilizer: checked('dfr-med-tranq'), medDiuretic: checked('dfr-med-diuretic'), medAntihypertensive: checked('dfr-med-antihtn'),
        medAntiparkinson: checked('dfr-med-parkinson'), medAntidepressant: checked('dfr-med-antidep'),
        sensoryVisual: checked('dfr-sens-visual'), sensoryHearing: checked('dfr-sens-hearing'), sensoryLimb: checked('dfr-sens-limb'),
        mentalState: val('dfr-mental'), gait: val('dfr-gait'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/11` },
        { label: 'Risk', value: r.tier === 'high' ? 'high' : 'low' },
      ]);
      note(o, r.factors.length ? `Points: ${r.factors.join(', ')}.` : 'No risk points (score 0).');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
