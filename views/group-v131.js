// spec-v131 §2: renderers for the five urology tiles that close Wave 5's
// urology cluster -- capra-score, renal-nephrometry, padua-renal,
// stone-nephrolithometry, twist-score -- all in Clinical Scoring & Risk
// (Group G). (roks-stone-recurrence is deferred; see lib/uro-v131.js header.)
//
// Same input/render contract as the rest of the codebase: every input has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// Per the spec-v50 §3 clinical-posture note, each tile renders that it frames a
// urologic score/class, not management (spec-v11 §5.3). Each compute surfaces a
// complete-the-fields fallback rather than a bad number; the scored selects
// carry a blank leading option so a partial entry is reported as not-assessed,
// not silently scored 0 (lib/uro-v131.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/uro-v131.js';
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
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score and risk class are the cited instrument’s, computed from the findings you entered. The diagnosis and the management decision — including any emergent torsion decision — stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

const YES_NO = [{ value: '0', text: 'No' }, { value: '1', text: 'Yes' }];
const BLANK = { value: '', text: 'Select…' };
const GLEASON_OPTS = [BLANK, { value: '1', text: 'Pattern 1' }, { value: '2', text: 'Pattern 2' }, { value: '3', text: 'Pattern 3' }, { value: '4', text: 'Pattern 4' }, { value: '5', text: 'Pattern 5' }];

export const renderers = {
  // ----- 2.1 capra-score ------------------------------------------------
  'capra-score'(root) {
    note(root, 'UCSF CAPRA score (Cooperberg 2005): a 0–10 predictor of biochemical recurrence after radical prostatectomy. Age ≥50 = +1; PSA ≤6 = 0, >6–10 = +1, >10–20 = +2, >20–30 = +3, >30 = +4; Gleason primary 4/5 = +3, else secondary 4/5 = +1; clinical T3a = +1; ≥34% positive cores = +1. 0–2 low, 3–5 intermediate, 6–10 high.');
    root.appendChild(field('Age at diagnosis (years)', 'capra-age', { min: 0, placeholder: 'e.g. 60' }));
    root.appendChild(field('PSA at diagnosis (ng/mL)', 'capra-psa', { step: '0.1', min: 0, placeholder: 'e.g. 7' }));
    root.appendChild(selectField('Primary (most common) Gleason pattern', 'capra-gp', GLEASON_OPTS));
    root.appendChild(selectField('Secondary Gleason pattern', 'capra-gs', GLEASON_OPTS));
    root.appendChild(selectField('Clinical T stage', 'capra-stage', [BLANK, { value: 'T1-T2', text: 'T1 or T2' }, { value: 'T3a', text: 'T3a' }]));
    root.appendChild(field('Positive biopsy cores (%)', 'capra-cores', { min: 0, max: 100, placeholder: 'e.g. 20' }));
    const o = out(); root.appendChild(o);
    wire(['capra-age', 'capra-psa', 'capra-gp', 'capra-gs', 'capra-stage', 'capra-cores'], () => safe(o, () => {
      const r = M.capraScore({ age: optNum('capra-age'), psa: optNum('capra-psa'), gleasonPrimary: Number(selVal('capra-gp')), gleasonSecondary: Number(selVal('capra-gs')), stage: selVal('capra-stage'), cores: optNum('capra-cores') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'CAPRA', value: `${r.total} of 10 (${r.tier})` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 renal-nephrometry ------------------------------------------
  'renal-nephrometry'(root) {
    note(root, 'R.E.N.A.L. nephrometry score (Kutikov & Uzzo 2009): a 4–12 anatomic-complexity score for a renal mass facing nephron-sparing surgery. Radius, Exophytic/endophytic, Nearness to the collecting system and Location score 1–3 each; Anterior/posterior is a non-scoring a/p/x suffix, and h marks a hilar tumour. 4–6 low, 7–9 moderate, 10–12 high.');
    root.appendChild(selectField('(R) Radius / maximal diameter', 'ren-radius', [BLANK, { value: '1', text: '≤4 cm (1)' }, { value: '2', text: '>4 to <7 cm (2)' }, { value: '3', text: '≥7 cm (3)' }]));
    root.appendChild(selectField('(E) Exophytic / endophytic', 'ren-exo', [BLANK, { value: '1', text: '≥50% exophytic (1)' }, { value: '2', text: '<50% exophytic (2)' }, { value: '3', text: 'Entirely endophytic (3)' }]));
    root.appendChild(selectField('(N) Nearness to collecting system / sinus', 'ren-near', [BLANK, { value: '1', text: '≥7 mm (1)' }, { value: '2', text: '>4 to <7 mm (2)' }, { value: '3', text: '≤4 mm (3)' }]));
    root.appendChild(selectField('(L) Location relative to polar lines', 'ren-loc', [BLANK, { value: '1', text: 'Above upper or below lower polar line (1)' }, { value: '2', text: 'Crosses a polar line (2)' }, { value: '3', text: '>50% across / between lines / crosses midline (3)' }]));
    root.appendChild(selectField('(A) Anterior / posterior', 'ren-ap', [BLANK, { value: 'a', text: 'Anterior (a)' }, { value: 'p', text: 'Posterior (p)' }, { value: 'x', text: 'Indeterminate (x)' }]));
    root.appendChild(selectField('Hilar tumour?', 'ren-hilar', [{ value: '', text: 'No' }, { value: 'h', text: 'Yes (h suffix)' }]));
    const o = out(); root.appendChild(o);
    wire(['ren-radius', 'ren-exo', 'ren-near', 'ren-loc', 'ren-ap', 'ren-hilar'], () => safe(o, () => {
      const r = M.renalNephrometry({ radius: Number(selVal('ren-radius')), exophytic: Number(selVal('ren-exo')), nearness: Number(selVal('ren-near')), location: Number(selVal('ren-loc')), ap: selVal('ren-ap'), hilar: selVal('ren-hilar') === 'h' });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'R.E.N.A.L.', value: `${r.total}${r.suffix}` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 padua-renal ------------------------------------------------
  'padua-renal'(root) {
    note(root, 'PADUA score (Ficarra 2009) for a renal tumour: a 6–14 complexity score. Longitudinal location (polar 1 / middle 2), exophytic rate (1–3), renal rim (lateral 1 / medial 2), sinus involvement (1–2), urinary-collecting-system involvement (1–2) and tumour size (1–3) score; the anterior/posterior face is a non-scoring descriptor. 6–7 low, 8–9 intermediate, ≥10 high. (Distinct from the VTE Padua score.)');
    root.appendChild(selectField('Longitudinal (polar) location', 'pad-long', [BLANK, { value: '1', text: 'Superior / inferior polar (1)' }, { value: '2', text: 'Middle (2)' }]));
    root.appendChild(selectField('Exophytic rate', 'pad-exo', [BLANK, { value: '1', text: '≥50% exophytic (1)' }, { value: '2', text: '<50% exophytic (2)' }, { value: '3', text: 'Entirely endophytic (3)' }]));
    root.appendChild(selectField('Renal rim', 'pad-rim', [BLANK, { value: '1', text: 'Lateral (1)' }, { value: '2', text: 'Medial (2)' }]));
    root.appendChild(selectField('Renal sinus involvement', 'pad-sinus', [BLANK, { value: '1', text: 'Not involved (1)' }, { value: '2', text: 'Involved (2)' }]));
    root.appendChild(selectField('Urinary collecting system involvement', 'pad-ucs', [BLANK, { value: '1', text: 'Not involved (1)' }, { value: '2', text: 'Involved (2)' }]));
    root.appendChild(selectField('Tumour size', 'pad-size', [BLANK, { value: '1', text: '≤4 cm (1)' }, { value: '2', text: '>4 to 7 cm (2)' }, { value: '3', text: '>7 cm (3)' }]));
    root.appendChild(selectField('Anterior / posterior face', 'pad-face', [BLANK, { value: 'a', text: 'Anterior (a)' }, { value: 'p', text: 'Posterior (p)' }]));
    const o = out(); root.appendChild(o);
    wire(['pad-long', 'pad-exo', 'pad-rim', 'pad-sinus', 'pad-ucs', 'pad-size', 'pad-face'], () => safe(o, () => {
      const r = M.paduaRenal({ longitudinal: Number(selVal('pad-long')), exophytic: Number(selVal('pad-exo')), rim: Number(selVal('pad-rim')), sinus: Number(selVal('pad-sinus')), ucs: Number(selVal('pad-ucs')), size: Number(selVal('pad-size')), face: selVal('pad-face') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'PADUA', value: `${r.total} (${r.face})` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 stone-nephrolithometry -------------------------------------
  'stone-nephrolithometry'(root) {
    note(root, 'S.T.O.N.E. nephrolithometry (Okhunov 2013): a 5–13 PCNL complexity score (original area version). Stone size is the area (length × width, mm²): 0–399=1, 400–799=2, 800–1599=3, ≥1600=4. Tract ≤100 mm=1, >100=2; obstruction none/mild=1, moderate/severe=2; calices 1–2=1, 3=2, staghorn=3; density ≤950 HU=1, >950=2. Higher score = lower stone-free likelihood.');
    root.appendChild(field('Stone length (mm)', 'stn-len', { step: '0.1', min: 0, placeholder: 'e.g. 20' }));
    root.appendChild(field('Stone width (mm)', 'stn-wid', { step: '0.1', min: 0, placeholder: 'e.g. 20' }));
    root.appendChild(field('Tract length, skin to stone (mm)', 'stn-tract', { step: '0.1', min: 0, placeholder: 'e.g. 80' }));
    root.appendChild(selectField('Obstruction (hydronephrosis)', 'stn-obstr', [BLANK, { value: '1', text: 'None / mild (1)' }, { value: '2', text: 'Moderate / severe (2)' }]));
    root.appendChild(selectField('Number of involved calices', 'stn-cal', [BLANK, { value: '1', text: '1–2 calices (1)' }, { value: '2', text: '3 calices (2)' }, { value: '3', text: 'Full staghorn (3)' }]));
    root.appendChild(field('Stone density (HU)', 'stn-hu', { min: 0, placeholder: 'e.g. 800' }));
    const o = out(); root.appendChild(o);
    wire(['stn-len', 'stn-wid', 'stn-tract', 'stn-obstr', 'stn-cal', 'stn-hu'], () => safe(o, () => {
      const r = M.stoneNephrolithometry({ length: optNum('stn-len'), width: optNum('stn-wid'), tract: optNum('stn-tract'), obstruction: Number(selVal('stn-obstr')), calices: Number(selVal('stn-cal')), hu: optNum('stn-hu') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'S.T.O.N.E.', value: `${r.total} of 13` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 twist-score ------------------------------------------------
  'twist-score'(root) {
    note(root, 'TWIST score (Barbosa 2013): a 0–7 point-of-care score for suspected testicular torsion. Testicular swelling = 2, hard testis = 2, absent cremasteric reflex = 1, nausea/vomiting = 1, high-riding testis = 1. 0–2 low (≈2% torsion), 3–4 intermediate (ultrasound), 5–7 high (≈87% torsion, consider exploration). Torsion is a time-critical emergency.');
    root.appendChild(selectField('Testicular swelling (2)', 'tw-swell', YES_NO));
    root.appendChild(selectField('Hard testis (2)', 'tw-hard', YES_NO));
    root.appendChild(selectField('Absent cremasteric reflex (1)', 'tw-crem', YES_NO));
    root.appendChild(selectField('Nausea / vomiting (1)', 'tw-nv', YES_NO));
    root.appendChild(selectField('High-riding testis (1)', 'tw-high', YES_NO));
    const o = out(); root.appendChild(o);
    wire(['tw-swell', 'tw-hard', 'tw-crem', 'tw-nv', 'tw-high'], () => safe(o, () => {
      const r = M.twistScore({ swelling: selVal('tw-swell'), hardTestis: selVal('tw-hard'), absentCremasteric: selVal('tw-crem'), nauseaVomiting: selVal('tw-nv'), highRiding: selVal('tw-high') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'TWIST', value: `${r.total} of 7 (${r.tier})` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
