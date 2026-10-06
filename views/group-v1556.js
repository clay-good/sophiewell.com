// spec-v1556: renderers for op-atropine-titration (Group J); scorpion-grade-india (Group J); field-health program, spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as M0 from '../lib/op-atropine-titration-v1556.js';
import * as M1 from '../lib/scorpion-grade-india-v1556.js';
import * as M2 from '../lib/brazil-snakebite-antivenom-v1556.js';
import * as M3 from '../lib/lee-white-clotting-time-v1556.js';
import * as M4 from '../lib/brazil-scorpion-antivenom-v1556.js';
import * as M5 from '../lib/brazil-spider-antivenom-v1556.js';
import * as M6 from '../lib/brazil-lonomia-antivenom-v1556.js';
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
  'op-atropine-titration'(root) {
    const pairs = [['opa-adult', 'adult'], ['opa-last', 'last'], ['opa-total', 'total'], ['opa-hr', 'hr'], ['opa-sbp', 'sbp'], ['opa-chest', 'chest'], ['opa-improving', 'improving'], ['opa-pupils', 'pupils']];
    selectField(root, 'Adult', 'opa-adult', M0.YES_NO, true);
    numField(root, 'Last atropine bolus, mg', 'opa-last', 'e.g. 2', '100');
    numField(root, 'Total atropine given so far, mg', 'opa-total', 'e.g. 2', '2000');
    numField(root, 'Heart rate now, beats/min', 'opa-hr', 'e.g. 60', '250');
    numField(root, 'Systolic blood pressure now, mm Hg', 'opa-sbp', 'e.g. 78', '250');
    selectField(root, 'Chest', 'opa-chest', M0.CHEST_OPTIONS, true);
    selectField(root, 'Begun to improve since the last bolus', 'opa-improving', M0.YES_NO, false);
    selectField(root, 'Pupils', 'opa-pupils', M0.PUPIL_OPTIONS, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M0.opAtropineTitration(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Eddleston', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'scorpion-grade-india'(root) {
    const pairs = [['sg-local', 'local'], ['sg-auto', 'autonomic'], ['sg-pulm', 'pulmonary'], ['sg-warm', 'warmShock']];
    selectField(root, 'Severe local pain, mild local swelling and sweating', 'sg-local', M1.YES_NO, false);
    selectField(root, 'Autonomic storm (vomiting, generalized sweating, drooling, slow or fast pulse, high or low BP, priapism)', 'sg-auto', M1.YES_NO, false);
    selectField(root, 'Pulmonary edema (breathing over 24, crackles) with cold extremities', 'sg-pulm', M1.YES_NO, false);
    selectField(root, 'Fast heart rate and low blood pressure with warm extremities', 'sg-warm', M1.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M1.scorpionGradeIndia(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Grade', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'brazil-snakebite-antivenom'(root) {
    const pairs = [['bsa-type', 'type'], ['bsa-local', 'local'], ['bsa-bleed', 'bleeding'], ['bsa-shock', 'shock'], ['bsa-renal', 'renal'], ['bsa-clot', 'clotting'], ['bsa-vagal', 'vagal'], ['bsa-neuro', 'neuro'], ['bsa-myo', 'myo'], ['bsa-olig', 'oliguria']];
    selectField(root, 'Type of accident', 'bsa-type', M2.TYPE_OPTIONS, true);
    selectField(root, 'Local signs', 'bsa-local', M2.LOCAL_OPTIONS, false);
    selectField(root, 'Bleeding', 'bsa-bleed', M2.BLEED_OPTIONS, false);
    selectField(root, 'Low blood pressure or shock', 'bsa-shock', M2.YES_NO, false);
    selectField(root, 'Kidney failure or no urine', 'bsa-renal', M2.YES_NO, false);
    selectField(root, 'Clotting abnormality (e.g. prolonged Lee-White)', 'bsa-clot', M2.YES_NO, false);
    selectField(root, 'Lachesis: vagal signs (slow pulse, low BP, diarrhea)', 'bsa-vagal', M2.YES_NO, false);
    selectField(root, 'Crotalus: paralysis signs (drooping eyelids, blurred vision)', 'bsa-neuro', M2.NEURO_OPTIONS, false);
    selectField(root, 'Crotalus: muscle pain and dark urine', 'bsa-myo', M2.MYO_OPTIONS, false);
    selectField(root, 'Crotalus: low urine output', 'bsa-olig', M2.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M2.brazilSnakebiteAntivenom(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Brazil', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'lee-white-clotting-time'(root) {
    const pairs = [['lw-min', 'minutes'], ['lw-proto', 'protocol']];
    numField(root, 'Clotting time, whole minutes', 'lw-min', 'e.g. 12', '120');
    selectField(root, 'Done by the method (two glass tubes, 1 mL each, 37 C bath, read each minute from 5)', 'lw-proto', M3.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M3.leeWhiteClottingTime(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Brazil', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'brazil-scorpion-antivenom'(root) {
    const pairs = [['bsc-local', 'local'], ['bsc-mod', 'moderate'], ['bsc-sev', 'severe']];
    selectField(root, 'Local pain or tingling', 'bsc-local', M4.YES_NO, false);
    selectField(root, 'Intense local pain with nausea, vomiting, sweating, drooling, agitation, fast breathing or fast pulse', 'bsc-mod', M4.YES_NO, false);
    selectField(root, 'Incessant vomiting, profuse sweating or drooling, prostration, seizures, coma, slow pulse, heart failure, pulmonary edema or shock', 'bsc-sev', M4.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M4.brazilScorpionAntivenom(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Brazil', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'brazil-spider-antivenom'(root) {
    const pairs = [['bsp-spider', 'spider'], ['bsp-mod', 'moderate'], ['bsp-sev', 'severe'], ['bsp-age', 'ageGroup'], ['bsp-weight', 'weight']];
    selectField(root, 'Spider', 'bsp-spider', M5.SPIDER_OPTIONS, true);
    selectField(root, 'Moderate signs (Phoneutria: intense pain, sweating, vomiting, agitation, high BP; Loxosceles: typical lesion with rash or fever)', 'bsp-mod', M5.YES_NO, false);
    selectField(root, 'Severe signs (Phoneutria: profuse sweating, drooling, priapism, shock, pulmonary edema; Loxosceles: hemolysis)', 'bsp-sev', M5.YES_NO, false);
    selectField(root, 'Adult or child (for prednisone)', 'bsp-age', M5.AGE_OPTIONS, false);
    numField(root, 'Child weight in kg', 'bsp-weight', 'e.g. 20', '150');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M5.brazilSpiderAntivenom(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Brazil', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'brazil-lonomia-antivenom'(root) {
    const pairs = [['blo-clot', 'clotting'], ['blo-bleed', 'bleeding']];
    selectField(root, 'Clotting time', 'blo-clot', M6.CLOT_OPTIONS, true);
    selectField(root, 'Bleeding', 'blo-bleed', M6.BLEED_OPTIONS, true);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M6.brazilLonomiaAntivenom(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Brazil', value: r.bandLabel }]);
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
