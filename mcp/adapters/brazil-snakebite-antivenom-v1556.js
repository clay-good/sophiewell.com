// spec-v1556 MCP adapter: brazil-snakebite-antivenom in lib/brazil-snakebite-antivenom-v1556.js.
// The dom keys mirror views/group-v1556.js and META['brazil-snakebite-antivenom'].example. Clinical domain.

import * as M from '../../lib/brazil-snakebite-antivenom-v1556.js';

export default [
  {
    id: 'brazil-snakebite-antivenom',
    summary: 'Classes a snakebite in Brazil and gives the antivenom vials. Bothrops, Lachesis, Crotalus or Micrurus, mild to severe by the Ministry of Health table, with the antivenom type.',
    compute: M.brazilSnakebiteAntivenom,
    fields: [
      { dom: 'bsa-type', arg: 'type', kind: 'enum', required: true, label: 'Type of accident', values: M.TYPE_OPTIONS.map((d) => d.value) },
      { dom: 'bsa-local', arg: 'local', kind: 'enum', label: 'Local signs', values: M.LOCAL_OPTIONS.map((d) => d.value) },
      { dom: 'bsa-bleed', arg: 'bleeding', kind: 'enum', label: 'Bleeding', values: M.BLEED_OPTIONS.map((d) => d.value) },
      { dom: 'bsa-shock', arg: 'shock', kind: 'enum', label: 'Low blood pressure or shock', values: M.YES_NO.map((d) => d.value) },
      { dom: 'bsa-renal', arg: 'renal', kind: 'enum', label: 'Kidney failure or no urine', values: M.YES_NO.map((d) => d.value) },
      { dom: 'bsa-clot', arg: 'clotting', kind: 'enum', label: 'Clotting abnormality (e.g. prolonged Lee-White)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'bsa-vagal', arg: 'vagal', kind: 'enum', label: 'Lachesis: vagal signs (slow pulse, low BP, diarrhea)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'bsa-neuro', arg: 'neuro', kind: 'enum', label: 'Crotalus: paralysis signs (drooping eyelids, blurred vision)', values: M.NEURO_OPTIONS.map((d) => d.value) },
      { dom: 'bsa-myo', arg: 'myo', kind: 'enum', label: 'Crotalus: muscle pain and dark urine', values: M.MYO_OPTIONS.map((d) => d.value) },
      { dom: 'bsa-olig', arg: 'oliguria', kind: 'enum', label: 'Crotalus: low urine output', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
