// spec-v243 §2: renderers for the ENT / sleep screening tools — the NOSE scale,
// the Reflux Finding Score, the No-Apnea OSA screen, and the sleep-efficiency
// index. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/entsleep-v243.js';
import { resultRow } from '../lib/result-copy.js';

function numInput(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}
const S04 = [['0', '0 (none)'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4 (severe)']];

export const renderers = {
  'nose-scale'(root) {
    note(root, 'NOSE scale (Stewart 2004): 5 items each 0-4, sum x 5 = 0-100. 30-50 moderate, 55-75 severe, 80-100 extreme obstruction. Near-neighbors: rfs-reflux-finding.');
    const items = [['nose-cong', 'congestion', 'Nasal congestion / stuffiness'], ['nose-block', 'blockage', 'Nasal blockage / obstruction'], ['nose-breath', 'breathing', 'Trouble breathing through nose'], ['nose-sleep', 'sleep', 'Trouble sleeping'], ['nose-exert', 'exertion', 'Cannot get enough air on exertion']];
    for (const [id, , label] of items) root.appendChild(select(`${label} (0-4)`, id, S04));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = val(id);
      render(o, M.noseScale(inp), 'NOSE');
    }));
    postureNote(root);
  },
  'rfs-reflux-finding'(root) {
    note(root, 'Reflux Finding Score (Belafsky 2001): 8 laryngoscopic findings, 0-26. > 7 indicates LPR (~95% certainty). Near-neighbors: nose-scale.');
    root.appendChild(select('Subglottic edema', 'rfs-sub', [['0', 'Absent (0)'], ['2', 'Present (2)']]));
    root.appendChild(select('Ventricular obliteration', 'rfs-vent', [['0', 'None (0)'], ['2', 'Partial (2)'], ['4', 'Complete (4)']]));
    root.appendChild(select('Erythema / hyperemia', 'rfs-eryth', [['0', 'None (0)'], ['2', 'Arytenoids (2)'], ['4', 'Diffuse (4)']]));
    root.appendChild(select('Vocal-fold edema', 'rfs-vfe', [['0', 'None (0)'], ['1', 'Mild (1)'], ['2', 'Moderate (2)'], ['3', 'Severe (3)'], ['4', 'Polypoid (4)']]));
    root.appendChild(select('Diffuse laryngeal edema', 'rfs-dle', [['0', 'None (0)'], ['1', 'Mild (1)'], ['2', 'Moderate (2)'], ['3', 'Severe (3)'], ['4', 'Obstructing (4)']]));
    root.appendChild(select('Posterior commissure hypertrophy', 'rfs-pch', [['0', 'None (0)'], ['1', 'Mild (1)'], ['2', 'Moderate (2)'], ['3', 'Severe (3)'], ['4', 'Obstructing (4)']]));
    root.appendChild(select('Granuloma / granulation', 'rfs-gran', [['0', 'Absent (0)'], ['2', 'Present (2)']]));
    root.appendChild(select('Thick endolaryngeal mucus', 'rfs-muc', [['0', 'Absent (0)'], ['2', 'Present (2)']]));
    const o = out(); root.appendChild(o);
    wire(['rfs-sub', 'rfs-vent', 'rfs-eryth', 'rfs-vfe', 'rfs-dle', 'rfs-pch', 'rfs-gran', 'rfs-muc'], () => safe(o, () => {
      render(o, M.rfsRefluxFinding({ subglottic: val('rfs-sub'), ventricular: val('rfs-vent'), erythema: val('rfs-eryth'), vocalFoldEdema: val('rfs-vfe'), diffuseEdema: val('rfs-dle'), posteriorHypertrophy: val('rfs-pch'), granuloma: val('rfs-gran'), mucus: val('rfs-muc') }), 'RFS');
    }));
    postureNote(root);
  },
  'no-apnea-score'(root) {
    note(root, 'No-Apnea OSA screen (Duarte 2018): neck circumference + age, 0-9. > 3 high risk of OSA. Near-neighbors: stop-bang.');
    root.appendChild(numInput('Neck circumference (cm)', 'na-neck', { min: '0' }));
    root.appendChild(numInput('Age (years)', 'na-age', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['na-neck', 'na-age'], () => safe(o, () => {
      render(o, M.noApnea({ neck: val('na-neck'), age: val('na-age') }), 'No-Apnea');
    }));
    postureNote(root);
  },
  'sleep-efficiency'(root) {
    note(root, 'Sleep efficiency = total sleep time / time in bed x 100. >= 85% normal, 75-84% moderate, < 75% poor. Near-neighbors: no-apnea-score.');
    root.appendChild(numInput('Total sleep time (minutes)', 'se-tst', { min: '0' }));
    root.appendChild(numInput('Time in bed (minutes)', 'se-tib', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['se-tst', 'se-tib'], () => safe(o, () => {
      render(o, M.sleepEfficiency({ tst: val('se-tst'), tib: val('se-tib') }), 'Sleep eff.');
    }));
    postureNote(root);
  },
};
