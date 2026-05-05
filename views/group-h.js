// Group H: Preparation and Workflow (61, 63). Utility 62 (printable bill
// summary) is implemented as a print stylesheet plus a Print button on the
// Bill Decoder; it is not a separate route per spec section 11.

import { el, clear } from '../lib/dom.js';
import { fetchJson } from '../lib/data.js';
import { selectQuestions, selectChecklist } from '../lib/keywords.js';
import { renderPrintable } from '../lib/print.js';
import {
  buildHipaaAuthorization, buildROIRequest, buildDischargeInstructions,
  buildSpecialtyVisit, buildWalletCard,
} from '../lib/workflow-v4.js';

function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }

export const renderers = {
  prep(root) {
    const o = out();
    fetchJson('data/workflow/questions.json').then((bank) => {
      const visitWrap = el('p');
      visitWrap.appendChild(el('label', { for: 'visit', text: 'Visit type' }));
      visitWrap.appendChild(el('br'));
      const visitSel = el('select', { id: 'visit' });
      visitSel.appendChild(el('option', { value: '', text: '(select)' }));
      for (const v of bank.visitTypes) visitSel.appendChild(el('option', { value: v, text: v }));
      visitWrap.appendChild(visitSel);
      root.appendChild(visitWrap);

      const ftWrap = el('p');
      ftWrap.appendChild(el('label', { for: 'topic', text: 'What is on your mind (free text)' }));
      ftWrap.appendChild(el('br'));
      const ta = el('textarea', { id: 'topic', rows: '4', cols: '60' });
      ftWrap.appendChild(ta);
      root.appendChild(ftWrap);

      const btnWrap = el('p', {}, [
        el('button', { id: 'gen-btn', type: 'button', text: 'Generate questions' }),
        document.createTextNode(' '),
        el('button', { id: 'print-btn', type: 'button', text: 'Print list' }),
      ]);
      root.appendChild(btnWrap);
      root.appendChild(o);

      const run = () => {
        const result = selectQuestions(bank, {
          visitType: visitSel.value,
          freeText: ta.value,
        });
        clear(o);
        if (result.sections.length === 0) {
          o.appendChild(el('p', { text: 'No matching questions. Pick a visit type or describe your concerns.' }));
          return;
        }
        for (const sec of result.sections) {
          o.appendChild(el('h2', { text: sec.section }));
          const ul = el('ul');
          for (const item of sec.items) ul.appendChild(el('li', { text: item }));
          o.appendChild(ul);
        }
        o.appendChild(el('p', { class: 'muted', text:
          'Questions are matched deterministically against a hand-curated bank. ' +
          'They are reference prompts, not medical advice.' }));
      };
      document.getElementById('gen-btn').addEventListener('click', run);
      document.getElementById('print-btn').addEventListener('click', () => window.print());
    }).catch((err) => {
      o.appendChild(el('p', { class: 'muted', text: `Failed to load question bank: ${err.message}` }));
      root.appendChild(o);
    });
  },

  'prior-auth'(root) {
    const o = out();
    fetchJson('data/workflow/prior-auth.json').then((bank) => {
      const wrap = el('p');
      wrap.appendChild(el('label', { for: 'proc', text: 'Procedure type' }));
      wrap.appendChild(el('br'));
      const sel = el('select', { id: 'proc' });
      sel.appendChild(el('option', { value: '', text: '(select)' }));
      for (const p of bank.procedures) sel.appendChild(el('option', { value: p.id, text: p.name }));
      wrap.appendChild(sel);
      root.appendChild(wrap);
      root.appendChild(el('p', {}, [
        el('button', { id: 'pa-btn', type: 'button', text: 'Generate checklist' }),
        document.createTextNode(' '),
        el('button', { id: 'pa-print', type: 'button', text: 'Print checklist' }),
      ]));
      root.appendChild(o);
      const run = () => {
        clear(o);
        const c = selectChecklist(bank, sel.value);
        if (!c) { o.appendChild(el('p', { text: 'Select a procedure type.' })); return; }
        o.appendChild(el('h2', { text: c.name }));
        const ul = el('ul');
        for (const item of c.items) ul.appendChild(el('li', { text: item }));
        o.appendChild(ul);
        o.appendChild(el('p', { class: 'notice', text: bank.notes }));
      };
      document.getElementById('pa-btn').addEventListener('click', run);
      document.getElementById('pa-print').addEventListener('click', () => window.print());
    }).catch((err) => {
      o.appendChild(el('p', { class: 'muted', text: `Failed to load procedure bank: ${err.message}` }));
      root.appendChild(o);
    });
  },

  // --- spec-v4 §5: Group H extensions (utilities 161-165) -------------

  'hipaa-auth'(root) {
    const fields = [
      ['Patient name', 'ha-pt'], ['Plan / covered entity', 'ha-plan'],
      ['Information to be released', 'ha-info'], ['Recipient', 'ha-rcpt'],
      ['Purpose of disclosure', 'ha-purpose'], ['Expiration', 'ha-exp'],
    ];
    for (const [l, id] of fields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'text', autocomplete: 'off' }),
      ]));
    }
    const region = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    const btn = el('button', { type: 'button', class: 'render-btn', text: 'Build printable authorization' });
    root.appendChild(el('p', {}, [btn]));
    root.appendChild(region);
    btn.addEventListener('click', () => {
      const v = (id) => document.getElementById(id).value || '';
      renderPrintable(region, buildHipaaAuthorization({
        patient: v('ha-pt'), plan: v('ha-plan'), info: v('ha-info'),
        recipient: v('ha-rcpt'), purpose: v('ha-purpose'), expiration: v('ha-exp'),
      }));
    });
  },

  roi(root) {
    const fields = [
      ['Patient name', 'roi-pt'], ['DOB', 'roi-dob'],
      ['From provider', 'roi-from'], ['To recipient', 'roi-to'],
      ['Date range', 'roi-dr'], ['Records requested', 'roi-rec'],
      ['Delivery method', 'roi-del'],
    ];
    for (const [l, id] of fields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'text', autocomplete: 'off' }),
      ]));
    }
    const region = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    const btn = el('button', { type: 'button', class: 'render-btn', text: 'Build printable ROI request' });
    root.appendChild(el('p', {}, [btn]));
    root.appendChild(region);
    btn.addEventListener('click', () => {
      const v = (id) => document.getElementById(id).value || '';
      renderPrintable(region, buildROIRequest({
        patient: v('roi-pt'), dob: v('roi-dob'),
        fromProvider: v('roi-from'), toRecipient: v('roi-to'),
        dateRange: v('roi-dr'), recordsRequested: v('roi-rec'),
        deliveryMethod: v('roi-del'),
      }));
    });
  },

  'discharge-instr'(root) {
    root.appendChild(el('p', {}, [el('label', { for: 'di-dx', text: 'Diagnosis' }), el('br'),
      el('input', { id: 'di-dx', type: 'text', autocomplete: 'off' })]));
    root.appendChild(el('p', {}, [el('label', { for: 'di-fu', text: 'Follow-up date / clinic' }), el('br'),
      el('input', { id: 'di-fu', type: 'text', autocomplete: 'off' })]));
    root.appendChild(el('p', {}, [el('label', { for: 'di-rp', text: 'Return precautions (one per line)' }), el('br'),
      el('textarea', { id: 'di-rp', rows: '4', cols: '40' })]));
    root.appendChild(el('p', {}, [el('label', { for: 'di-meds', text: 'Medications (one per line)' }), el('br'),
      el('textarea', { id: 'di-meds', rows: '4', cols: '40' })]));
    root.appendChild(el('p', {}, [el('label', { for: 'di-notes', text: 'Other notes' }), el('br'),
      el('textarea', { id: 'di-notes', rows: '3', cols: '40' })]));
    const region = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    const btn = el('button', { type: 'button', class: 'render-btn', text: 'Build printable discharge instructions' });
    root.appendChild(el('p', {}, [btn]));
    root.appendChild(region);
    btn.addEventListener('click', () => {
      const lines = (id) => String(document.getElementById(id).value || '').split('\n').map((s) => s.trim()).filter(Boolean);
      renderPrintable(region, buildDischargeInstructions({
        diagnosis: document.getElementById('di-dx').value,
        followUpDate: document.getElementById('di-fu').value,
        returnPrecautions: lines('di-rp'),
        medications: lines('di-meds'),
        notes: document.getElementById('di-notes').value,
      }));
    });
  },

  'specialty-visit'(root) {
    root.appendChild(el('p', {}, [el('label', { for: 'sv-spec', text: 'Specialty' }), el('br'),
      el('select', { id: 'sv-spec' }, [
        ['cardiology', 'Cardiology'], ['oncology', 'Oncology'], ['ortho', 'Orthopedics'],
        ['gi', 'Gastroenterology'], ['derm', 'Dermatology'], ['neuro', 'Neurology'],
        ['obgyn', 'OB/GYN'], ['peds', 'Pediatrics'],
      ].map(([v, l]) => el('option', { value: v, text: l })))]));
    root.appendChild(el('p', {}, [el('label', { for: 'sv-ctx', text: 'Visit context (optional)' }), el('br'),
      el('input', { id: 'sv-ctx', type: 'text', autocomplete: 'off' })]));
    const region = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    const btn = el('button', { type: 'button', class: 'render-btn', text: 'Build printable question list' });
    root.appendChild(el('p', {}, [btn]));
    root.appendChild(region);
    btn.addEventListener('click', () => {
      const cfg = buildSpecialtyVisit({
        specialty: document.getElementById('sv-spec').value,
        visitContext: document.getElementById('sv-ctx').value,
      });
      if (!cfg) { clear(region); region.appendChild(el('p', { text: 'Unknown specialty.' })); return; }
      renderPrintable(region, cfg);
    });
  },

  'wallet-card'(root) {
    const fields = [
      ['Patient name', 'wc-name'], ['Emergency contact', 'wc-ec'],
      ['Primary provider', 'wc-pp'], ['Pharmacy', 'wc-rx'],
    ];
    for (const [l, id] of fields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'text', autocomplete: 'off' }),
      ]));
    }
    root.appendChild(el('p', {}, [el('label', { for: 'wc-allergies', text: 'Allergies (one per line; blank = NKDA)' }), el('br'),
      el('textarea', { id: 'wc-allergies', rows: '3', cols: '40' })]));
    root.appendChild(el('p', {}, [el('label', { for: 'wc-conditions', text: 'Conditions (one per line)' }), el('br'),
      el('textarea', { id: 'wc-conditions', rows: '3', cols: '40' })]));
    root.appendChild(el('p', {}, [el('label', { for: 'wc-meds', text: 'Medications (one per line)' }), el('br'),
      el('textarea', { id: 'wc-meds', rows: '5', cols: '40' })]));
    const region = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    const btn = el('button', { type: 'button', class: 'render-btn', text: 'Build printable wallet card' });
    root.appendChild(el('p', {}, [btn]));
    root.appendChild(region);
    btn.addEventListener('click', () => {
      const lines = (id) => String(document.getElementById(id).value || '').split('\n').map((s) => s.trim()).filter(Boolean);
      const v = (id) => document.getElementById(id).value || '';
      renderPrintable(region, buildWalletCard({
        patientName: v('wc-name'),
        allergies: lines('wc-allergies'),
        conditions: lines('wc-conditions'),
        medications: lines('wc-meds'),
        emergencyContact: v('wc-ec'),
        primaryProvider: v('wc-pp'),
        pharmacy: v('wc-rx'),
      }));
    });
  },
};
