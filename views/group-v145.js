// spec-v145 §2: renderers for the five orthopedic risk / osteoarthritis tiles
// (frykman-classification, mirels-score, kellgren-lawrence, pittsburgh-knee-rule,
// compartment-delta-pressure). Frykman, Mirels, Kellgren-Lawrence, and the
// Pittsburgh rule are Clinical Scoring & Risk (Group G); compartment-delta-
// pressure is Clinical Math & Conversions (Group E). v145 continues Wave 8 of
// the spec-v100 program beside the v144 fracture-classification cluster and the
// existing ottawa-knee / ottawa-ankle ED rules.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v100 §2 classification clarification each tile CONSUMES the clinician's
// read of the film / exam and COMPUTES a class, score, or delta; it is not a
// no-input reference table. Per the spec-v50 §3 clinical-posture note, each tile
// renders that it frames a computed value, not a fixation/decompression/imaging
// order in Sophie's voice (spec-v11 §5.3). A blank required input renders a
// complete-the-fields fallback.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ortho-v145.js';
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
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numField(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.max != null) inp.setAttribute('max', String(opts.max));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The class, score, decision, or delta is the cited system’s, computed from the findings you entered — the tile takes your read of the imaging/exam, it does not interpret a radiograph. The management decision — fixation, imaging, decompression, referral — stays with the care team and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function pickField(label, id, options) {
  return selectField(label, id, [{ value: '', text: '— choose —' }, ...options]);
}
function checkList(root, items) {
  for (const [id, label] of items) root.appendChild(checkField(label, id));
  return items.map((i) => i[0]);
}

export const renderers = {
  // ----- 2.1 frykman-classification -------------------------------------
  'frykman-classification'(root) {
    note(root, 'Frykman classification (Frykman 1967): distal-radius fracture by joint involvement plus an associated ulnar-styloid fracture. Odd types have no ulnar fracture; even types add one. I/II extra-articular, III/IV radiocarpal, V/VI radioulnar, VII/VIII both joints.');
    root.appendChild(pickField('Joint involvement', 'fryk-joint', [
      { value: 'extraArticular', text: 'Extra-articular (I / II)' },
      { value: 'radiocarpal', text: 'Radiocarpal joint (III / IV)' },
      { value: 'radioulnar', text: 'Distal radioulnar joint (V / VI)' },
      { value: 'both', text: 'Both radiocarpal and radioulnar joints (VII / VIII)' },
    ]));
    const ids = ['fryk-joint', ...checkList(root, [
      ['fryk-ulnar', 'Associated distal-ulna (ulnar styloid) fracture (→ even type)'],
    ])];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.frykmanClassification({ joint: selVal('fryk-joint'), ulnarStyloid: chk('fryk-ulnar') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.classification },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 mirels-score -----------------------------------------------
  'mirels-score'(root) {
    note(root, 'Mirels score (Mirels 1989): impending pathologic fracture in a long-bone metastasis. Four factors each 1–3, total 4–12. ≤7 low (irradiate/observe), 8 borderline, ≥9 high — prophylactic fixation recommended.');
    root.appendChild(pickField('Site of lesion', 'mir-site', [
      { value: 'upper', text: 'Upper limb (1)' },
      { value: 'lower', text: 'Lower limb (2)' },
      { value: 'peritrochanteric', text: 'Peritrochanteric (3)' },
    ]));
    root.appendChild(pickField('Pain', 'mir-pain', [
      { value: 'mild', text: 'Mild (1)' },
      { value: 'moderate', text: 'Moderate (2)' },
      { value: 'functional', text: 'Functional / mechanical (3)' },
    ]));
    root.appendChild(pickField('Radiographic nature of lesion', 'mir-lesion', [
      { value: 'blastic', text: 'Blastic (1)' },
      { value: 'mixed', text: 'Mixed (2)' },
      { value: 'lytic', text: 'Lytic (3)' },
    ]));
    root.appendChild(pickField('Size relative to cortex', 'mir-size', [
      { value: 'small', text: 'Under ⅓ of cortex (1)' },
      { value: 'mid', text: '⅓–⅔ of cortex (2)' },
      { value: 'large', text: 'Over ⅔ of cortex (3)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['mir-site', 'mir-pain', 'mir-lesion', 'mir-size'], () => safe(o, () => {
      const r = M.mirelsScore({ site: selVal('mir-site'), pain: selVal('mir-pain'), lesion: selVal('mir-lesion'), size: selVal('mir-size') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/12` },
        { label: 'Risk band', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 kellgren-lawrence ------------------------------------------
  'kellgren-lawrence'(root) {
    note(root, 'Kellgren-Lawrence (Kellgren & Lawrence 1957): radiographic osteoarthritis grade 0–4. Grade ≥ 2 (definite osteophyte plus possible narrowing) is the accepted threshold for definite radiographic OA.');
    root.appendChild(pickField('Radiographic grade', 'kl-grade', [
      { value: '0', text: '0 — no OA features (none)' },
      { value: '1', text: '1 — doubtful narrowing, possible osteophytic lipping (doubtful)' },
      { value: '2', text: '2 — definite osteophytes, possible narrowing (minimal)' },
      { value: '3', text: '3 — moderate osteophytes, definite narrowing, some sclerosis (moderate)' },
      { value: '4', text: '4 — large osteophytes, marked narrowing, severe sclerosis, deformity (severe)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['kl-grade'], () => safe(o, () => {
      const r = M.kellgrenLawrence({ grade: selVal('kl-grade') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.classification },
        { label: 'Definite OA', value: r.definiteOA ? 'yes (grade ≥ 2)' : 'no' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 pittsburgh-knee-rule ---------------------------------------
  'pittsburgh-knee-rule'(root) {
    note(root, 'Pittsburgh knee rules (Seaberg 1994): the entry gate is a blunt-trauma or fall mechanism — without it the rule does not apply. Given the gate, a knee radiograph is indicated if age < 12 or > 50, or the patient cannot take 4 weight-bearing steps. Near-neighbor: ottawa-knee (different inputs).');
    const ids = checkList(root, [
      ['pitt-mech', 'Mechanism is blunt trauma OR a fall (entry criterion)'],
      ['pitt-young', 'Age younger than 12 years'],
      ['pitt-old', 'Age older than 50 years'],
      ['pitt-weight', 'Unable to take 4 weight-bearing steps in the ED'],
    ]);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.pittsburghKneeRule({ mechanism: chk('pitt-mech'), ageUnder12: chk('pitt-young'), ageOver50: chk('pitt-old'), cannotBearWeight: chk('pitt-weight') });
      const rows = [{ text: r.band, cls: r.abnormal ? 'warn' : null }];
      if (r.applies) rows.push({ label: 'Radiograph', value: r.indicated ? 'indicated' : 'not indicated' });
      else rows.push({ label: 'Rule', value: 'does not apply' });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 compartment-delta-pressure ---------------------------------
  'compartment-delta-pressure'(root) {
    note(root, 'Compartment delta pressure (McQueen & Court-Brown 1996): ΔP = diastolic BP − measured compartment pressure. ΔP < 30 mmHg is the published fasciotomy threshold. One data point alongside the serial clinical exam.');
    root.appendChild(numField('Diastolic blood pressure (mmHg)', 'comp-dia', { step: '1', min: 0, max: 250, placeholder: 'e.g. 70' }));
    root.appendChild(numField('Measured compartment pressure (mmHg)', 'comp-icp', { step: '1', min: 0, max: 250, placeholder: 'e.g. 45' }));
    const o = out(); root.appendChild(o);
    wire(['comp-dia', 'comp-icp'], () => safe(o, () => {
      const r = M.compartmentDeltaPressure({ diastolic: optNum('comp-dia'), compartment: optNum('comp-icp') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Delta pressure', value: `${r.delta} mmHg` },
        { label: 'Below 30 mmHg', value: r.belowThreshold ? 'yes' : 'no' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
