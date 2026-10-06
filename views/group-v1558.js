// spec-v1558: renderers for pph-who-2025 (WHO 2025 postpartum hemorrhage criteria and tranexamic acid) and
// labor-care-guide-alert (WHO Labour Care Guide alert thresholds); Group G, Clinical Scoring & Risk; spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as P from '../lib/pph-who-2025-v1558.js';
import * as L from '../lib/labor-care-guide-alert-v1558.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options, required) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [{ value: '', text: required ? '— choose —' : '— not entered —' }, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder, max) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', inputmode: 'decimal', min: '0', max, step: 'any', placeholder }));
  root.appendChild(wrap);
}
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}

export const renderers = {
  'pph-who-2025'(root) {
    const pairs = [['pph-loss', 'loss'], ['pph-hours', 'hours'], ['pph-pulse', 'pulse'], ['pph-sbp', 'sbp'], ['pph-dbp', 'dbp'], ['pph-txa', 'txa'], ['pph-txamin', 'txaMinutes'], ['pph-bleeding', 'bleeding']];
    numField(root, 'Measured blood loss in mL (for example a calibrated drape)', 'pph-loss', 'e.g. 350', '5000');
    numField(root, 'Hours since birth', 'pph-hours', 'e.g. 1', '72');
    numField(root, 'Pulse per minute', 'pph-pulse', 'e.g. 104', '250');
    numField(root, 'Systolic pressure, mmHg', 'pph-sbp', 'e.g. 110', '260');
    numField(root, 'Diastolic pressure, mmHg', 'pph-dbp', 'e.g. 70', '200');
    selectField(root, 'Tranexamic acid already given', 'pph-txa', P.YES_NO, false);
    numField(root, 'Minutes since the first tranexamic acid dose', 'pph-txamin', 'e.g. 30', '4320');
    selectField(root, 'Bleeding now', 'pph-bleeding', P.BLEEDING_OPTIONS, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = P.pphWho2025(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2025', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'labor-care-guide-alert'(root) {
    const pairs = [['lcg-stage', 'stage'], ['lcg-companion', 'companion'], ['lcg-pain', 'painRelief'], ['lcg-oral', 'oralFluid'], ['lcg-posture', 'posture'], ['lcg-fhr', 'fhr'], ['lcg-decel', 'decel'], ['lcg-fluid', 'fluid'], ['lcg-position', 'position'], ['lcg-caput', 'caput'], ['lcg-moulding', 'moulding'], ['lcg-pulse', 'pulse'], ['lcg-sbp', 'sbp'], ['lcg-dbp', 'dbp'], ['lcg-temp', 'temp'], ['lcg-protein', 'protein'], ['lcg-acetone', 'acetone'], ['lcg-contractions', 'contractions'], ['lcg-duration', 'duration'], ['lcg-dilatation', 'dilatation'], ['lcg-lag', 'lagHours'], ['lcg-parity', 'parity'], ['lcg-second', 'secondHours']];
    selectField(root, 'Stage of labor', 'lcg-stage', L.STAGE_OPTIONS, true);
    root.appendChild(el('p', { class: 'muted', text: 'Every row below is optional. A blank row is not assessed, never normal.' }));
    selectField(root, 'Companion present', 'lcg-companion', L.YN, false);
    selectField(root, 'Pain relief', 'lcg-pain', L.YN, false);
    selectField(root, 'Oral fluid', 'lcg-oral', L.YN, false);
    selectField(root, 'Posture', 'lcg-posture', L.POSTURE_OPTIONS, false);
    numField(root, 'Baseline fetal heart rate (1-minute count)', 'lcg-fhr', 'e.g. 140', '250');
    selectField(root, 'Fetal heart decelerations', 'lcg-decel', L.DECEL_OPTIONS, false);
    selectField(root, 'Amniotic fluid', 'lcg-fluid', L.FLUID_OPTIONS, false);
    selectField(root, 'Fetal position', 'lcg-position', L.POSITION_OPTIONS, false);
    selectField(root, 'Caput', 'lcg-caput', L.GRADE_OPTIONS, false);
    selectField(root, 'Moulding', 'lcg-moulding', L.GRADE_OPTIONS, false);
    numField(root, 'Maternal pulse per minute', 'lcg-pulse', 'e.g. 88', '250');
    numField(root, 'Systolic pressure, mmHg', 'lcg-sbp', 'e.g. 118', '260');
    numField(root, 'Diastolic pressure, mmHg', 'lcg-dbp', 'e.g. 74', '200');
    numField(root, 'Axillary temperature, °C', 'lcg-temp', 'e.g. 36.8', '44');
    selectField(root, 'Urine protein', 'lcg-protein', L.DIP_OPTIONS, false);
    selectField(root, 'Urine acetone', 'lcg-acetone', L.DIP_OPTIONS, false);
    numField(root, 'Contractions per 10 minutes', 'lcg-contractions', 'e.g. 4', '15');
    numField(root, 'Contraction duration in seconds', 'lcg-duration', 'e.g. 45', '300');
    numField(root, 'Cervical dilatation in cm (first stage)', 'lcg-dilatation', 'e.g. 6', '10');
    numField(root, 'Hours at this dilatation without progress', 'lcg-lag', 'e.g. 3', '48');
    selectField(root, 'Parity (second stage)', 'lcg-parity', L.PARITY_OPTIONS, false);
    numField(root, 'Hours in the second stage', 'lcg-second', 'e.g. 1', '12');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = L.laborCareGuideAlert(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'LCG', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
};
