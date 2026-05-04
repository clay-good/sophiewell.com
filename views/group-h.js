// Group H: Preparation and Workflow (61, 63). Utility 62 (printable bill
// summary) is implemented as a print stylesheet plus a Print button on the
// Bill Decoder; it is not a separate route per spec section 11.

import { el, clear } from '../lib/dom.js';
import { fetchJson } from '../lib/data.js';
import { selectQuestions, selectChecklist } from '../lib/keywords.js';

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
};
