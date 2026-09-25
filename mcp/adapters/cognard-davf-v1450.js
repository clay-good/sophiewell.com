// spec-v1450: MCP adapter. The dom keys mirror views/group-v1450.js and this tile's META example.

import * as CG from '../../lib/cognard-davf-v1450.js';

const YN = CG.COGNARD_YES_NO.map((x) => x.value);

export default [
  {
    id: 'cognard-davf',
    summary: 'Derives the Cognard type (I to V) of an intracranial dural arteriovenous fistula from its venous drainage on angiography. It separates the benign group without cortical venous drainage from the aggressive group with it.',
    compute: CG.cognardDavf,
    fields: [
      { dom: 'cog-drainage', arg: 'drainage', kind: 'enum', required: true, label: 'Venous drainage', values: CG.COGNARD_DRAINAGE.map((x) => x.value) },
      { dom: 'cog-sinus', arg: 'sinusReflux', kind: 'enum', label: 'If into a sinus: retrograde flow within the sinus', values: YN },
      { dom: 'cog-cortical', arg: 'corticalReflux', kind: 'enum', label: 'If into a sinus: reflux into cortical veins', values: YN },
      { dom: 'cog-ectasia', arg: 'ectasia', kind: 'enum', label: 'If direct cortical: venous ectasia', values: YN },
    ],
  },
];
