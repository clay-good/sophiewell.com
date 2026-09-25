// spec-v1436: MCP adapter. The dom keys mirror views/group-v1436.js and this tile's META example.

import * as RC from '../../lib/rcvs2-v1436.js';

const YN = RC.RCVS2_YES_NO.map((x) => x.value);

export default [
  {
    id: 'rcvs2',
    summary: 'Scores RCVS2 (-2 to 10) to tell reversible cerebral vasoconstriction syndrome from other intracranial arteriopathies. Five or more favors RCVS, 2 or less argues against it, and 3 to 4 is indeterminate; every item must be answered because one subtracts.',
    compute: RC.rcvs2,
    fields: [
      { dom: 'rc2-tch', arg: 'tch', kind: 'enum', required: true, label: 'Recurrent or single thunderclap headache', values: YN },
      { dom: 'rc2-carotid', arg: 'carotid', kind: 'enum', required: true, label: 'Intracranial carotid artery involved', values: YN },
      { dom: 'rc2-trigger', arg: 'trigger', kind: 'enum', required: true, label: 'Vasoconstrictive trigger', values: YN },
      { dom: 'rc2-sex', arg: 'sex', kind: 'enum', required: true, label: 'Sex', values: RC.RCVS2_SEX.map((x) => x.value) },
      { dom: 'rc2-sah', arg: 'sah', kind: 'enum', required: true, label: 'Subarachnoid hemorrhage', values: YN },
    ],
  },
];
