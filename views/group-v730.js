// spec-v730 §2: renderer for sds-dependence — the Severity of Dependence Scale (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. A substance select
// and five 0-3 selects; the sum 0-15 is compared against a substance-specific cutoff.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/sds-dependence-v730.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The SDS screens the severity of psychological dependence to prompt fuller assessment; it is not a diagnosis. It supports rather than replaces clinical evaluation.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const SUBSTANCE = [['heroin', 'Heroin (cutoff >= 5)'], ['cocaine', 'Cocaine (cutoff >= 3)'], ['amphetamines', 'Amphetamines (cutoff >= 5)'], ['cannabis', 'Cannabis (cutoff >= 4)'], ['alcohol', 'Alcohol (cutoff >= 4)'], ['other', 'Other / unspecified (no fixed cutoff)']];
const FREQ = [['0', '0 — never / almost never'], ['1', '1 — sometimes'], ['2', '2 — often'], ['3', '3 — always / nearly always']];
const DIFF = [['0', '0 — not difficult'], ['1', '1 — quite difficult'], ['2', '2 — very difficult'], ['3', '3 — impossible']];

export const renderers = {
  'sds-dependence'(root) {
    note(root, 'Severity of Dependence Scale (Gossop 1995): five items each 0–3, summed to 0–15. Substance-specific cutoffs: heroin ≥ 5, cocaine ≥ 3, amphetamines ≥ 5, cannabis ≥ 4, alcohol ≥ 4. Higher = greater psychological dependence.');
    root.appendChild(selectField('Substance', 'sds-substance', CHOICE(SUBSTANCE)));
    root.appendChild(selectField('Felt your use was out of control', 'sds-control', CHOICE(FREQ)));
    root.appendChild(selectField('Anxious/worried about missing a dose', 'sds-anxious', CHOICE(FREQ)));
    root.appendChild(selectField('Worried about your use', 'sds-worried', CHOICE(FREQ)));
    root.appendChild(selectField('Wished you could stop', 'sds-wish', CHOICE(FREQ)));
    root.appendChild(selectField('How difficult to stop or go without', 'sds-difficulty', CHOICE(DIFF)));
    const ids = ['sds-substance', 'sds-control', 'sds-anxious', 'sds-worried', 'sds-wish', 'sds-difficulty'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.sdsDependence({
        substance: val('sds-substance'), outOfControl: val('sds-control'), anxiousMissing: val('sds-anxious'),
        worried: val('sds-worried'), wishStop: val('sds-wish'), difficultyStopping: val('sds-difficulty'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/15` },
        { label: 'Cutoff', value: r.cutoff !== null ? `>= ${r.cutoff}` : '—' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
