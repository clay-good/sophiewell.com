// spec-v1563 MCP adapter: yellow-fever-case-def in lib/yellow-fever-case-def-v1563.js.
// The dom keys mirror views/group-v1563.js and META['yellow-fever-case-def'].example. Clinical domain.

import * as M from '../../lib/yellow-fever-case-def-v1563.js';

export default [
  {
    id: 'yellow-fever-case-def',
    summary: 'Classifies a yellow fever case by WHO 2010 definitions: suspected, probable or confirmed, applying the separate 30-day and 14-day vaccine windows to antibody and virological results.',
    compute: M.yellowFeverCaseDef,
    fields: [
      { dom: 'yfd-fever', arg: 'fever', kind: 'enum', required: true, label: 'Acute onset of fever', values: M.YES_NO.map((d) => d.value) },
      { dom: 'yfd-jaund', arg: 'jaundice', kind: 'enum', required: true, label: 'Jaundice within 14 days of the first symptoms', values: M.YES_NO.map((d) => d.value) },
      { dom: 'yfd-vac', arg: 'vaccine', kind: 'enum', label: 'Yellow fever vaccination before onset', values: M.VACCINE_OPTIONS.map((d) => d.value) },
      { dom: 'yfd-igm', arg: 'igm', kind: 'enum', label: 'Yellow fever IgM positive', values: M.YES_NO.map((d) => d.value) },
      { dom: 'yfd-histo', arg: 'histo', kind: 'enum', label: 'Positive postmortem liver histopathology', values: M.YES_NO.map((d) => d.value) },
      { dom: 'yfd-epi', arg: 'epi', kind: 'enum', label: 'Epidemiological link to a confirmed case or outbreak', values: M.YES_NO.map((d) => d.value) },
      { dom: 'yfd-sero', arg: 'serology', kind: 'enum', label: 'Specific IgM, fourfold antibody rise, or specific neutralizing antibodies', values: M.YES_NO.map((d) => d.value) },
      { dom: 'yfd-viro', arg: 'virology', kind: 'enum', label: 'Virus genome by PCR, antigen, or isolation', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
