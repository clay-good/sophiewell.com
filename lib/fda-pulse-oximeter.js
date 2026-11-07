// FDA's two pulse oximeter guidances, as the numbers spo2-arms-accuracy (spec-v1704) checks against. Read from the
// PDFs on November 7, 2026; both are under the weekly page watch (scripts/data/watch-pages.mjs), and the tool stops
// answering after validThrough so a change cannot go unread for long. Pure data.
//
// 2013 final: "10 or more healthy subjects"; "200 or more data points"; "at least 2 darkly pigmented subjects or 15%
// of your subject pool, whichever is larger"; Table 3 typical Arms: transmittance, wrap and clip <= 3.0%; ear clip and
// reflectance <= 3.5%. The Arms formula is deferred to ISO 80601-2-61 (licensed, not read).
// January 7, 2025 draft ("Draft - Not for Implementation"): Arms is "the root mean square deviation between SpO2 and
// SaO2 across all paired repeated measures and study participants"; 150 or more participants; MST groups 1-4, 5-7,
// 8-10 each at least 25%; at least 50% of group 8-10 with ITA <= -50 degrees; at least 40% of each sex per group;
// 3,000 or more pairs; Arms less than 3%; the largest MST-group difference in bias less than 3.5% for
// 70% <= SaO2 <= 85% and less than 1.5% for 85% < SaO2 <= 100%.

export const PULSE_OX_2013 = {
  edition: 'March 4, 2013 (final)', route: 'B', readOn: '2026-11-07', validThrough: '2027-05-07',
  source: { label: 'FDA, Pulse Oximeters - Premarket Notification Submissions [510(k)s] (2013)', url: 'https://www.fda.gov/media/72470/download' },
  subjects: 10, pairs: 200, darkMin: 2, darkShare: 0.15,
  arms: { transmittance: 3.0, ear: 3.5, reflectance: 3.5 },
};

export const PULSE_OX_2025_DRAFT = {
  edition: 'January 7, 2025 (draft, not for implementation)', route: 'B', readOn: '2026-11-07', validThrough: '2027-05-07',
  source: { label: 'FDA draft guidance, Pulse Oximeters for Medical Purposes (2025)', url: 'https://www.fda.gov/media/184896/download' },
  participants: 150, groupShare: 0.25, itaShare: 0.5, itaCut: -50, sexShare: 0.4, pairs: 3000, arms: 3,
  biasGapLow: 3.5, biasGapHigh: 1.5,
};
