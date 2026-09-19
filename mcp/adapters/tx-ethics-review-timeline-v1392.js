// spec-v1392: MCP adapter. The dom keys mirror views/group-v1392.js and this tile's META example.
// Dates are 'YYYY-MM-DD' and times 'YYYY-MM-DDTHH:MM'; the tile never reads the clock.

import * as TXE from '../../lib/tx-ethics-review-timeline-v1392.js';

export default [
  {
    id: 'tx-ethics-review-timeline',
    summary: 'Computes the Texas ethics committee review dates under Health and Safety Code 166.046 as amended in 2023. That means seven calendar days\' written notice before the meeting, a good faith 48-hour notice of legal counsel, and 24 hours to consent to a transfer-enabling procedure. Life-sustaining treatment continues through the 25th calendar day after the start notice, or the delay-notice procedure, and the 25 days cannot be paused once started.',
    compute: TXE.txEthicsReviewTimeline,
    fields: [
      { dom: 'txe-notice', arg: 'noticeGiven', kind: 'string', required: true, label: 'Written notice of the meeting given (YYYY-MM-DD)' },
      { dom: 'txe-waived', arg: 'waived', kind: 'enum', label: 'Seven-day notice waived in writing', values: ['yes', 'no'] },
      { dom: 'txe-meeting', arg: 'meeting', kind: 'string', label: 'Meeting (YYYY-MM-DDTHH:MM)' },
      { dom: 'txe-consent', arg: 'consentRequested', kind: 'string', label: 'Procedure consent requested (YYYY-MM-DDTHH:MM)' },
      { dom: 'txe-start', arg: 'startNotice', kind: 'string', label: 'Start notice given (YYYY-MM-DD)' },
      { dom: 'txe-procedure', arg: 'procedureDone', kind: 'string', label: 'Delay-notice procedure performed (YYYY-MM-DD)' },
    ],
  },
];
