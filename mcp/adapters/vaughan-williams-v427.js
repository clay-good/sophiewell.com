// spec-v427 MCP wave: adapter for the Vaughan Williams antiarrhythmic classification in
// lib/vaughan-williams-v427.js. The dom key mirrors the browser renderer (views/group-v427.js) and
// META['vaughan-williams'].example. `cls` is an enum (Ia/Ib/Ic/II/III/IV). The compute reports the class and
// its mechanism. The example sets class III; its expected text carries no numeric facts (the mechanism and
// drug names are word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/vaughan-williams-v427.js';

export default [
  {
    id: 'vaughan-williams',
    summary: 'The Vaughan Williams classification of antiarrhythmic drug actions, the classic grouping by primary electrophysiologic mechanism, classes Ia/Ib/Ic/II/III/IV. Ia/Ib/Ic: sodium-channel blockers (moderate/weak/marked block; quinidine, lidocaine, flecainide). II: beta-blockers (metoprolol, propranolol). III: potassium-channel blockers (amiodarone, sotalol, dofetilide). IV: non-dihydropyridine calcium-channel blockers (verapamil, diltiazem). Reports the class and its mechanism, not a prescribing decision, a dose, a diagnosis, or a prognosis.',
    compute: C.vaughanWilliams,
    fields: [
      { dom: 'vw-class', arg: 'cls', kind: 'enum', values: ['Ia', 'Ib', 'Ic', 'II', 'III', 'IV'], label: 'Vaughan Williams class' },
    ],
  },
];
