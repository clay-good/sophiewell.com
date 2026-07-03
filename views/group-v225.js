// spec-v225 §2: renderers for the obstetrics & gynecology instruments — Nugent,
// Amsel, modified Ferriman-Gallwey, PBAC, Thompson HIE, Menopause Rating Scale,
// and the Blatt-Kupperman index. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnostic / treatment decision to
// the clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/obgyn-v225.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
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
function gradeN(label, id, hi) {
  const opts = [];
  for (let i = 0; i <= hi; i += 1) opts.push([String(i), String(i)]);
  return select(label, id, opts);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnostic and treatment decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel, value) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'nugent-score'(root) {
    note(root, 'Nugent score (Nugent 1991): Gram-stain morphotype scoring (0-10). 0-3 normal, 4-6 intermediate, 7-10 bacterial vaginosis. Near-neighbors: amsel-criteria, centor.');
    root.appendChild(select('Lactobacillus morphotypes (per oil-immersion field)', 'nug-lacto', [['0', '> 30 (0)'], ['1', '5-30 (1)'], ['2', '1-4 (2)'], ['3', '< 1 (3)'], ['4', '0 (4)']]));
    root.appendChild(select('Gardnerella / Bacteroides morphotypes', 'nug-gard', [['0', '0 (0)'], ['1', '< 1 (1)'], ['2', '1-4 (2)'], ['3', '5-30 (3)'], ['4', '> 30 (4)']]));
    root.appendChild(select('Curved gram-variable rods / Mobiluncus', 'nug-mob', [['0', '0 (0)'], ['1', '1-4 (1)'], ['2', '>= 5 (2)']]));
    const o = out(); root.appendChild(o);
    wire(['nug-lacto', 'nug-gard', 'nug-mob'], () => safe(o, () => {
      render(o, M.nugent({ lactobacillus: val('nug-lacto'), gardnerella: val('nug-gard'), mobiluncus: val('nug-mob') }), 'Nugent', `${M.nugent({ lactobacillus: val('nug-lacto'), gardnerella: val('nug-gard'), mobiluncus: val('nug-mob') }).score}`);
    }));
    postureNote(root);
  },
  'amsel-criteria'(root) {
    note(root, 'Amsel criteria (Amsel 1983): thin gray-white discharge, pH > 4.5, positive whiff test, clue cells > 20%. >= 3 of 4 = bacterial vaginosis. Near-neighbors: nugent-score, centor.');
    root.appendChild(check('Thin homogeneous gray-white discharge', 'ams-disch'));
    root.appendChild(check('Vaginal pH > 4.5', 'ams-ph'));
    root.appendChild(check('Positive whiff (amine) test', 'ams-whiff'));
    root.appendChild(check('Clue cells > 20% on wet mount', 'ams-clue'));
    const o = out(); root.appendChild(o);
    wire(['ams-disch', 'ams-ph', 'ams-whiff', 'ams-clue'], () => safe(o, () => {
      render(o, M.amsel({ discharge: chk('ams-disch'), ph: chk('ams-ph'), whiff: chk('ams-whiff'), clueCells: chk('ams-clue') }), 'Amsel', `${M.amsel({ discharge: chk('ams-disch'), ph: chk('ams-ph'), whiff: chk('ams-whiff'), clueCells: chk('ams-clue') }).score}`);
    }));
    postureNote(root);
  },
  'ferriman-gallwey'(root) {
    note(root, 'Modified Ferriman-Gallwey (1961/1981): terminal-hair grades 0-4 over 9 areas (0-36). >= 8 indicates hirsutism. Near-neighbors: arr, free-thyroxine-index.');
    const areas = [['fg-lip', 'upperLip', 'Upper lip'], ['fg-chin', 'chin', 'Chin'], ['fg-chest', 'chest', 'Chest'], ['fg-uabd', 'upperAbdomen', 'Upper abdomen'], ['fg-labd', 'lowerAbdomen', 'Lower abdomen'], ['fg-arm', 'upperArm', 'Upper arm'], ['fg-thigh', 'thigh', 'Thigh'], ['fg-uback', 'upperBack', 'Upper back'], ['fg-lback', 'lowerBack', 'Lower back']];
    for (const [id, , label] of areas) root.appendChild(gradeN(label + ' (0-4)', id, 4));
    const o = out(); root.appendChild(o);
    wire(areas.map((a) => a[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of areas) inp[key] = val(id);
      render(o, M.ferrimanGallwey(inp), 'mFG', `${M.ferrimanGallwey(inp).score}`);
    }));
    postureNote(root);
  },
  'pbac-hmb'(root) {
    note(root, 'PBAC (Higham 1990): weighted tally of pads, tampons, and clots over the cycle. > 100 corresponds to > 80 mL (heavy menstrual bleeding). Near-neighbors: bishop, due-date.');
    root.appendChild(num('Lightly stained pads (×1)', 'pb-lp', { min: '0' }));
    root.appendChild(num('Moderately soiled pads (×5)', 'pb-mp', { min: '0' }));
    root.appendChild(num('Fully soaked pads (×20)', 'pb-sp', { min: '0' }));
    root.appendChild(num('Lightly stained tampons (×1)', 'pb-lt', { min: '0' }));
    root.appendChild(num('Moderately soiled tampons (×5)', 'pb-mt', { min: '0' }));
    root.appendChild(num('Fully soaked tampons (×10)', 'pb-st', { min: '0' }));
    root.appendChild(num('Small clots < 1 cm (×1)', 'pb-sc', { min: '0' }));
    root.appendChild(num('Large clots > 1 cm (×5)', 'pb-lc', { min: '0' }));
    const o = out(); root.appendChild(o);
    const ids = ['pb-lp', 'pb-mp', 'pb-sp', 'pb-lt', 'pb-mt', 'pb-st', 'pb-sc', 'pb-lc'];
    wire(ids, () => safe(o, () => {
      const r = M.pbac({ lightPads: val('pb-lp'), moderatePads: val('pb-mp'), soakedPads: val('pb-sp'), lightTampons: val('pb-lt'), moderateTampons: val('pb-mt'), soakedTampons: val('pb-st'), smallClots: val('pb-sc'), largeClots: val('pb-lc') });
      render(o, r, 'PBAC', `${r.score}`);
    }));
    postureNote(root);
  },
  'thompson-hie'(root) {
    note(root, 'Thompson score (Thompson 1997): 9 signs of neonatal HIE summed. 0-10 mild, 11-14 moderate, >= 15 severe. Near-neighbors: apgar, ballard.');
    const items = [['th-tone', 'tone', 'Tone', 3], ['th-cons', 'consciousness', 'Consciousness', 2], ['th-seiz', 'seizures', 'Seizures', 2], ['th-post', 'posture', 'Posture', 3], ['th-moro', 'moro', 'Moro reflex', 2], ['th-grasp', 'grasp', 'Grasp', 2], ['th-suck', 'suck', 'Suck', 2], ['th-resp', 'respiration', 'Respiration', 3], ['th-font', 'fontanelle', 'Fontanelle', 2]];
    for (const [id, , label, hi] of items) root.appendChild(gradeN(`${label} (0-${hi})`, id, hi));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = val(id);
      render(o, M.thompsonHie(inp), 'Thompson', `${M.thompsonHie(inp).score}`);
    }));
    postureNote(root);
  },
  'menopause-rating-scale'(root) {
    note(root, 'Menopause Rating Scale (Heinemann 2004): 11 items each 0-4 (0-44). 0-4 none/little, 5-8 mild, 9-16 moderate, >= 17 severe. Near-neighbors: kupperman-index, epds.');
    const items = [['mrs-flush', 'hotFlushes', 'Hot flushes / sweating'], ['mrs-heart', 'heartDiscomfort', 'Heart discomfort'], ['mrs-sleep', 'sleepProblems', 'Sleep problems'], ['mrs-depr', 'depressive', 'Depressive mood'], ['mrs-irr', 'irritability', 'Irritability'], ['mrs-anx', 'anxiety', 'Anxiety'], ['mrs-exh', 'exhaustion', 'Physical/mental exhaustion'], ['mrs-sex', 'sexualProblems', 'Sexual problems'], ['mrs-blad', 'bladderProblems', 'Bladder problems'], ['mrs-dry', 'vaginalDryness', 'Dryness of vagina'], ['mrs-joint', 'jointMuscle', 'Joint and muscular discomfort']];
    for (const [id, , label] of items) root.appendChild(gradeN(label + ' (0-4)', id, 4));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = val(id);
      render(o, M.menopauseRating(inp), 'MRS', `${M.menopauseRating(inp).score}`);
    }));
    postureNote(root);
  },
  'kupperman-index'(root) {
    note(root, 'Blatt-Kupperman index (Kupperman 1953): 11 weighted symptoms rated 0-3 (to 51). Band cutoffs vary by variant. Near-neighbors: menopause-rating-scale, epds.');
    const items = [['ku-flush', 'hotFlushes', 'Hot flushes (×4)'], ['ku-par', 'paresthesia', 'Paresthesia (×2)'], ['ku-ins', 'insomnia', 'Insomnia (×2)'], ['ku-nerv', 'nervousness', 'Nervousness (×2)'], ['ku-mel', 'melancholia', 'Melancholia (×1)'], ['ku-ver', 'vertigo', 'Vertigo (×1)'], ['ku-weak', 'weakness', 'Weakness / fatigue (×1)'], ['ku-arth', 'arthralgia', 'Arthralgia / myalgia (×1)'], ['ku-head', 'headache', 'Headache (×1)'], ['ku-palp', 'palpitations', 'Palpitations (×1)'], ['ku-form', 'formication', 'Formication (×1)']];
    for (const [id, , label] of items) root.appendChild(gradeN(label + ' severity (0-3)', id, 3));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = val(id);
      render(o, M.kupperman(inp), 'Kupperman', `${M.kupperman(inp).score}`);
    }));
    postureNote(root);
  },
};
