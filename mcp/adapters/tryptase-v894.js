// spec-v894 MCP adapter: the acute tryptase rise in lib/tryptase-v894.js. The dom keys mirror the
// browser renderer (views/group-v894.js) and META.tryptase.example.
//
// BOTH levels are required; the rule is a comparison, not a threshold. Clinical domain.

import { tryptase } from '../../lib/tryptase-v894.js';

export default [
  {
    id: 'tryptase',
    summary: 'Applies the consensus rule for mast cell activation: an acute serum tryptase above 1.2 times the person\'s own baseline plus 2 ng/mL supports mast cell activation. IT IS A RISE FROM THAT PERSON\'S OWN BASELINE, NOT A THRESHOLD, so an acute value inside the laboratory reference range can meet it and one above that range can fail it, and a single acute value on its own answers nothing. THE TIMING IS PART OF THE TEST: the acute sample is drawn about thirty minutes to four hours after the reaction and the baseline at least twenty-four hours after everything has settled. A NORMAL TRYPTASE DOES NOT EXCLUDE ANAPHYLAXIS, which frequently fails to raise it in food-triggered reactions and is a clinical diagnosis. A persistently raised baseline above 20 ng/mL is a minor criterion for systemic mastocytosis and a separate question.',
    compute: tryptase,
    fields: [
      { dom: 'try-acutetryptase', arg: 'acuteTryptase', kind: 'number', required: true, label: 'Acute tryptase, ng/mL, drawn about 30 minutes to 4 hours after the reaction', unit: 'ng/mL' },
      { dom: 'try-baselinetryptase', arg: 'baselineTryptase', kind: 'number', required: true, label: 'Baseline tryptase, ng/mL, drawn at least 24 hours after everything settled', unit: 'ng/mL' },
    ],
  },
];
