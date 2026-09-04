// spec-v256 §2: renderers for the rheumatology + critical-care tools — the MASES
// enthesitis score, MMT-8, the Intubation Difficulty Scale, and the CROP weaning
// index. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rheumcrit-v256.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
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
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
// spec-v1044: an item nobody rated is not an item rated zero. These scales total
// their items, so a blank one silently lowers the total (and on the scales where
// higher is better, silently makes the patient look worse). A clinician who means
// zero types zero, which still means zero -- see docs/product-decisions.md.
function needItems(o, entries) {
  const missing = entries.filter(([, id]) => {
    const n = document.getElementById(id);
    return !n || String(n.value).trim() === '';
  }).map(([label]) => label);
  if (!missing.length) return false;
  const list_ = missing.length === 1 ? missing[0]
    : `${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}`;
  o.appendChild(el('p', { class: 'muted', text:
    `Rate ${list_}: the total is the sum of the items, so one left blank is not an item scoring zero.` }));
  return true;
}
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

export const renderers = {
  'mases-enthesitis'(root) {
    note(root, 'MASES (Heuft-Dorenbosch 2003): 13 entheseal sites, each tender = 1, 0-13. >= 1 enthesitis.');
    const items = [['ma-cc1r', 'cc1R', '1st costochondral (R)'], ['ma-cc1l', 'cc1L', '1st costochondral (L)'], ['ma-cc7r', 'cc7R', '7th costochondral (R)'], ['ma-cc7l', 'cc7L', '7th costochondral (L)'], ['ma-psisr', 'psisR', 'Posterior superior iliac spine (R)'], ['ma-psisl', 'psisL', 'Posterior superior iliac spine (L)'], ['ma-asisr', 'asisR', 'Anterior superior iliac spine (R)'], ['ma-asisl', 'asisL', 'Anterior superior iliac spine (L)'], ['ma-ilr', 'iliacR', 'Iliac crest (R)'], ['ma-ill', 'iliacL', 'Iliac crest (L)'], ['ma-achr', 'achillesR', 'Proximal Achilles (R)'], ['ma-achl', 'achillesL', 'Proximal Achilles (L)'], ['ma-l5', 'l5', 'L5 spinous process']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = chk(id);
      render(o, M.masesEnthesitis(inp), 'MASES');
    }));
    postureNote(root);
  },
  'mmt8-myositis'(root) {
    note(root, 'MMT-8 (IMACS): 8 muscle groups each 0-10, 0-80. Higher = stronger.');
    const items = [['mm-neck', 'neck', 'Neck flexors'], ['mm-delt', 'deltoid', 'Deltoid (middle)'], ['mm-bic', 'biceps', 'Biceps'], ['mm-wrist', 'wrist', 'Wrist extensors'], ['mm-gmax', 'glutMax', 'Gluteus maximus'], ['mm-gmed', 'glutMed', 'Gluteus medius'], ['mm-quad', 'quad', 'Quadriceps'], ['mm-ankle', 'ankle', 'Ankle dorsiflexors']];
    for (const [id, , label] of items) root.appendChild(numInput(`${label} (0-10)`, id, { min: '0', max: '10' }));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      if (needItems(o, items.map(([id, , label]) => [label.toLowerCase(), id]))) return;
      const inp = {}; for (const [id, key] of items) inp[key] = val(id);
      render(o, M.mmt8(inp), 'MMT-8');
    }));
    postureNote(root);
  },
  'intubation-difficulty-scale'(root) {
    note(root, 'Intubation Difficulty Scale (Adnet 1997): N1-N7 summed. 0 easy, 1-5 slight-moderate, > 5 difficult.');
    root.appendChild(numInput('Attempts beyond the first (N1)', 'ids-attempts', { min: '0' }));
    root.appendChild(numInput('Operators beyond the first (N2)', 'ids-operators', { min: '0' }));
    root.appendChild(numInput('Alternative techniques used (N3)', 'ids-tech', { min: '0' }));
    root.appendChild(select('Cormack-Lehane grade (N4 = grade - 1)', 'ids-cormack', [['1', 'Grade 1 (0)'], ['2', 'Grade 2 (1)'], ['3', 'Grade 3 (2)'], ['4', 'Grade 4 (3)']]));
    root.appendChild(check('Increased lifting force required (N5)', 'ids-force'));
    root.appendChild(check('External laryngeal pressure applied (N6)', 'ids-pressure'));
    root.appendChild(check('Vocal cords adducted / closed (N7)', 'ids-cords'));
    const o = out(); root.appendChild(o);
    wire(['ids-attempts', 'ids-operators', 'ids-tech', 'ids-cormack', 'ids-force', 'ids-pressure', 'ids-cords'], () => safe(o, () => {
      if (needItems(o, [['the attempts beyond the first', 'ids-attempts'],
        ['the operators beyond the first', 'ids-operators'],
        ['the alternative techniques used', 'ids-tech']])) return;
      render(o, M.intubationDifficultyScale({ extraAttempts: val('ids-attempts'), extraOperators: val('ids-operators'), altTechniques: val('ids-tech'), cormack: val('ids-cormack'), liftingForce: chk('ids-force'), laryngealPressure: chk('ids-pressure'), cordsAdducted: chk('ids-cords') }), 'IDS');
    }));
    postureNote(root);
  },
  'crop-index'(root) {
    note(root, 'CROP index (Yang-Tobin 1991) = [Cdyn x PImax x (PaO2/PAO2)] / RR. >= 13 favors extubation.');
    root.appendChild(numInput('Dynamic compliance (mL/cmH2O)', 'crop-cdyn', { min: '0' }));
    root.appendChild(numInput('Maximal inspiratory pressure PImax (cmH2O, magnitude)', 'crop-pimax', { min: '0' }));
    root.appendChild(numInput('PaO2 (mmHg)', 'crop-pao2', { min: '0' }));
    root.appendChild(numInput('FiO2 (fraction, 0.21-1.0)', 'crop-fio2', { min: '0', max: '1' }));
    root.appendChild(numInput('PaCO2 (mmHg)', 'crop-paco2', { min: '0' }));
    root.appendChild(numInput('Respiratory rate (breaths/min)', 'crop-rr', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['crop-cdyn', 'crop-pimax', 'crop-pao2', 'crop-fio2', 'crop-paco2', 'crop-rr'], () => safe(o, () => {
      render(o, M.cropIndex({ compliance: val('crop-cdyn'), pimax: val('crop-pimax'), pao2: val('crop-pao2'), fio2: val('crop-fio2'), paco2: val('crop-paco2'), rr: val('crop-rr') }), 'CROP');
    }));
    postureNote(root);
  },
};
