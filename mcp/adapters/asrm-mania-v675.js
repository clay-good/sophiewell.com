// spec-v675 MCP adapter: Altman Self-Rating Mania Scale (ASRM) in lib/asrm-mania-v675.js.
// The dom keys mirror the browser renderer (views/group-v675.js) and
// META['asrm-mania'].example. Five 0-4 item enums; the sum 0-20 screens positive at
// >= 6. Clinical domain.

import { asrmMania } from '../../lib/asrm-mania-v675.js';

export default [
  {
    id: 'asrm-mania',
    summary: 'Altman Self-Rating Mania Scale (Altman 1997): a five-item patient self-report over the past week — elevated mood, increased self-confidence, decreased need for sleep, increased speech, increased activity — each rated 0-4, summed to 0-20. A total of 6 or more (the study\'s cut of > 5) screens positive for a manic/hypomanic condition (sensitivity ~85%, specificity ~87%). A screen, not a diagnosis. Companion to the clinician-rated YMRS.',
    compute: asrmMania,
    fields: [
      { dom: 'asrm-mood', arg: 'mood', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Elevated/positive mood (0 unchanged - 4 most severe)' },
      { dom: 'asrm-confidence', arg: 'confidence', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Increased self-confidence (0-4)' },
      { dom: 'asrm-sleep', arg: 'sleep', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Decreased need for sleep (0-4)' },
      { dom: 'asrm-speech', arg: 'speech', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Increased speech/talkativeness (0-4)' },
      { dom: 'asrm-activity', arg: 'activity', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Increased activity level (0-4)' },
    ],
  },
];
