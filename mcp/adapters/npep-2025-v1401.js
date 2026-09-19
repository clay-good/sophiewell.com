// spec-v1401: MCP adapter. The dom keys mirror views/group-v1401.js and this tile's META example.

import * as NP from '../../lib/npep-2025-v1401.js';

export default [
  {
    id: 'npep-2025',
    summary: 'Decides whether CDC\'s 2025 guideline recommends nonoccupational HIV PEP, and gives the regimen and follow-up. Start within 72 hours, ideally within 24, for a substantial-risk exposure to a source with HIV who is not durably suppressed; case-by-case when the source\'s status is unknown. It is not routinely recommended after sex with a suppressed source or for someone taking PrEP as directed. Preferred 28-day regimens are BIC/FTC/TAF or dolutegravir plus two NRTIs. Past 72 hours: HIV testing, PrEP counseling, and follow-up instead.',
    compute: NP.npep2025,
    fields: [
      { dom: 'np-hours', arg: 'hours', kind: 'number', required: true, label: 'Hours since the exposure' },
      { dom: 'np-route', arg: 'route', kind: 'enum', required: true, label: 'How the exposure happened', values: NP.ROUTES.map((r) => r.value) },
      { dom: 'np-risk', arg: 'risk', kind: 'enum', required: true, label: 'Exposure presents a substantial risk', values: ['yes', 'no'] },
      { dom: 'np-source', arg: 'source', kind: 'enum', required: true, label: 'Source\'s HIV status', values: NP.SOURCES.map((s) => s.value) },
      { dom: 'np-prep', arg: 'prep', kind: 'enum', required: true, label: 'PrEP', values: NP.PREP.map((p) => p.value) },
    ],
  },
];
