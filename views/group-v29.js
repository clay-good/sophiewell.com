// spec-v104 §2: renderers for the six wide-complex-tachycardia, aortic-dissection,
// and syncope-risk tiles (brugada-vt, vereckei-avr, add-rs, rose-syncope, egsys,
// oesil).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The point
// scores render their counted factors as a derivation; the boolean step rules name
// the first positive step. Each tile renders the spec-v50 §3 clinical posture note
// and frames its output as the cited rule's verdict / score / band -- none authors
// an imaging, admission, or antiarrhythmic order in Sophie's voice (spec-v11 §5.3);
// the image/admit/treat decision stays with the clinician and local protocol.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cardio-v104.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
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
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) {
  const n = document.getElementById(id);
  return n && n.value !== '' ? Number(n.value) : null;
}
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The verdict, score, and band are the cited rule’s, computed from the inputs you entered; they do not guarantee an outcome. The imaging, admission, and treatment decisions stay with the clinician and local protocol.' }));
}
function stepList(root, caption, steps) {
  root.appendChild(el('p', { class: 'muted', text: caption }));
  root.appendChild(el('ul', {}, steps.map((s) => el('li', { class: 'muted', text: `${s.label}: ${s.positive ? 'positive' : 'negative'}` }))));
}
function derivation(root, caption, terms) {
  root.appendChild(el('p', { class: 'muted', text: caption }));
  root.appendChild(el('ul', {}, terms.map((t) => {
    const v = typeof t.value === 'number' && Number.isFinite(t.value)
      ? (t.value >= 0 ? `+${t.value}` : String(t.value))
      : '--';
    return el('li', { class: 'muted', text: `${t.label}: ${v}` });
  })));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

export const renderers = {
  // ----- 2.1 brugada-vt --------------------------------------------------
  'brugada-vt'(root) {
    root.appendChild(checkField('Step 1: absence of an RS complex in all precordial leads (V1-V6)', 'br-rs'));
    root.appendChild(checkField('Step 2: R-to-S interval > 100 ms in any precordial lead', 'br-int'));
    root.appendChild(checkField('Step 3: AV dissociation', 'br-av'));
    root.appendChild(checkField('Step 4: morphologic VT criteria in both V1-V2 and V6', 'br-morph'));
    const o = out(); root.appendChild(o);
    wire(['br-rs', 'br-int', 'br-av', 'br-morph'], () => safe(o, () => {
      const r = M.brugadaVt({
        absentRs: chk('br-rs'), rsInterval: chk('br-int'),
        avDissociation: chk('br-av'), morphology: chk('br-morph'),
      });
      resultRow(o, [
        { text: r.band, cls: r.vt ? 'warn' : null },
        { label: 'Verdict', value: r.verdict },
      ]);
      stepList(o, 'Steps (first positive ends the algorithm):', r.steps);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 vereckei-avr ------------------------------------------------
  'vereckei-avr'(root) {
    root.appendChild(checkField('Step 1: initial dominant R wave in lead aVR', 've-r'));
    root.appendChild(checkField('Step 2: initial r or q wave > 40 ms in aVR', 've-w'));
    root.appendChild(checkField('Step 3: notch on the descending limb of a negative-onset QRS in aVR', 've-notch'));
    root.appendChild(checkField('Step 4: ventricular activation-velocity ratio vi/vt <= 1', 've-vivt'));
    const o = out(); root.appendChild(o);
    wire(['ve-r', 've-w', 've-notch', 've-vivt'], () => safe(o, () => {
      const r = M.vereckeiAvr({
        initialR: chk('ve-r'), initialWidth: chk('ve-w'),
        notch: chk('ve-notch'), viVt: chk('ve-vivt'),
      });
      resultRow(o, [
        { text: r.band, cls: r.vt ? 'warn' : null },
        { label: 'Verdict', value: r.verdict },
      ]);
      stepList(o, 'Steps (first positive ends the algorithm):', r.steps);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 add-rs ------------------------------------------------------
  'add-rs'(root) {
    root.appendChild(checkField('High-risk predisposing conditions (Marfan/CTD, family history, aortic valve disease, recent aortic manipulation, thoracic aneurysm)', 'add-pre'));
    root.appendChild(checkField('High-risk pain features (abrupt onset, severe, or ripping/tearing)', 'add-pain'));
    root.appendChild(checkField('High-risk exam features (pulse deficit/BP differential, focal neuro deficit, new AI murmur, hypotension/shock)', 'add-exam'));
    root.appendChild(field('D-dimer (ng/mL, optional pathway note)', 'add-dd', { min: 0, max: 100000, placeholder: '350' }));
    const o = out(); root.appendChild(o);
    wire(['add-pre', 'add-pain', 'add-exam', 'add-dd'], () => safe(o, () => {
      const r = M.addRs({
        predisposing: chk('add-pre'), pain: chk('add-pain'), exam: chk('add-exam'),
        dDimer: optNum('add-dd'),
      });
      resultRow(o, [
        { text: r.band, cls: r.risk === 'high' ? 'warn' : null },
        { label: 'ADD-RS total (0-3)', value: String(r.total) },
        { label: 'Risk band', value: r.risk },
      ]);
      derivation(o, 'Category points (each category = 1 if any feature present):', r.items);
      if (r.dDimerNote) note(o, r.dDimerNote);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 rose-syncope ------------------------------------------------
  'rose-syncope'(root) {
    root.appendChild(checkField('BNP >= 300 pg/mL', 'rose-bnp'));
    root.appendChild(checkField('Bradycardia <= 50 bpm', 'rose-brady'));
    root.appendChild(checkField('Rectal exam positive for fecal occult blood', 'rose-rectal'));
    root.appendChild(checkField('Anemia: hemoglobin <= 90 g/L (9.0 g/dL)', 'rose-anemia'));
    root.appendChild(checkField('Chest pain associated with syncope', 'rose-cp'));
    root.appendChild(checkField('ECG Q wave (not in lead III)', 'rose-q'));
    root.appendChild(checkField('Oxygen saturation <= 94% on room air', 'rose-sat'));
    const o = out(); root.appendChild(o);
    const ids = ['rose-bnp', 'rose-brady', 'rose-rectal', 'rose-anemia', 'rose-cp', 'rose-q', 'rose-sat'];
    wire(ids, () => safe(o, () => {
      const r = M.roseSyncope({
        bnp: chk('rose-bnp'), bradycardia: chk('rose-brady'), rectal: chk('rose-rectal'),
        anemia: chk('rose-anemia'), chestPain: chk('rose-cp'), qWave: chk('rose-q'),
        saturation: chk('rose-sat'),
      });
      resultRow(o, [
        { text: r.band, cls: r.highRisk ? 'warn' : null },
        { label: 'Positive criteria', value: String(r.count) },
      ]);
      stepList(o, 'Criteria (any positive -> high risk):', r.items.map((it) => ({ label: it.label, positive: it.positive })));
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 egsys -------------------------------------------------------
  egsys(root) {
    root.appendChild(checkField('Abnormal ECG and/or heart disease (+3)', 'eg-ecg'));
    root.appendChild(checkField('Palpitations before syncope (+4)', 'eg-palp'));
    root.appendChild(checkField('Syncope during effort (+3)', 'eg-effort'));
    root.appendChild(checkField('Syncope in supine position (+2)', 'eg-supine'));
    root.appendChild(checkField('Precipitating/predisposing factors present (-1)', 'eg-precip'));
    root.appendChild(checkField('Autonomic prodromes present: nausea/vomiting (-1)', 'eg-auto'));
    const o = out(); root.appendChild(o);
    const ids = ['eg-ecg', 'eg-palp', 'eg-effort', 'eg-supine', 'eg-precip', 'eg-auto'];
    wire(ids, () => safe(o, () => {
      const r = M.egsys({
        abnormalEcgOrHeartDisease: chk('eg-ecg'), palpitations: chk('eg-palp'),
        effort: chk('eg-effort'), supine: chk('eg-supine'),
        precipitating: chk('eg-precip'), autonomicProdrome: chk('eg-auto'),
      });
      resultRow(o, [
        { text: r.band, cls: r.cardiac ? 'warn' : null },
        { label: 'EGSYS total (-2 to +12)', value: String(r.total) },
      ]);
      derivation(o, 'Points by item (effort and supine are separate; the -1 items score when present):', r.items);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 oesil -------------------------------------------------------
  oesil(root) {
    root.appendChild(checkField('Age > 65 years (1)', 'oe-age'));
    root.appendChild(checkField('Cardiovascular disease in clinical history (1)', 'oe-cv'));
    root.appendChild(checkField('Syncope without prodrome (1)', 'oe-prod'));
    root.appendChild(checkField('Abnormal electrocardiogram (1)', 'oe-ecg'));
    const o = out(); root.appendChild(o);
    wire(['oe-age', 'oe-cv', 'oe-prod', 'oe-ecg'], () => safe(o, () => {
      const r = M.oesil({
        age65: chk('oe-age'), cvHistory: chk('oe-cv'),
        noProdrome: chk('oe-prod'), abnormalEcg: chk('oe-ecg'),
      });
      resultRow(o, [
        { text: r.band, cls: r.risk === 'high' ? 'warn' : null },
        { label: 'OESIL total (0-4)', value: String(r.total) },
        { label: '12-month mortality', value: `${r.mortality}%` },
      ]);
      derivation(o, 'Points by item:', r.items);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
