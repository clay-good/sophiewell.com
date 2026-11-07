// ICH M12, Drug Interaction Studies, Step 4 guideline adopted May 21, 2024: the constants the drug-interaction
// tools use, read from the PDF on November 7, 2026 (74 pages, SHA-256 recorded in scripts/data/page-hashes.json).
// A route-B dated constant: the PDF is under the weekly page watch (scripts/data/watch-pages.mjs).
// Shared by spec-v1700's ddi-basic-screen, ddi-static-aucr and enzyme-recovery-time. Pure data.

export const ICH_M12_EDITION = {
  edition: 'Step 4, May 21, 2024', route: 'B', readOn: '2026-11-07',
  source: { label: 'ICH M12 Guideline: Drug Interaction Studies (Step 4, 2024)', url: 'https://database.ich.org/sites/default/files/ICH_M12_Step4_Guideline_2024_0521.pdf' },
};

// Table 6: representative turnover of major CYP enzymes, hepatic unless stated. The two columns are rounded
// independently in the table (0.00032/min is a half-life of 36.1 h); the tools use kdeg and print both.
export const TABLE_6 = [
  { value: 'CYP1A2', text: 'CYP1A2', halfLifeH: 38, kdegPerMin: 0.00030 },
  { value: 'CYP2B6', text: 'CYP2B6', halfLifeH: 32, kdegPerMin: 0.00036 },
  { value: 'CYP2C8', text: 'CYP2C8', halfLifeH: 22, kdegPerMin: 0.00053 },
  { value: 'CYP2C9', text: 'CYP2C9', halfLifeH: 104, kdegPerMin: 0.00011 },
  { value: 'CYP2C19', text: 'CYP2C19', halfLifeH: 26, kdegPerMin: 0.00044 },
  { value: 'CYP2D6', text: 'CYP2D6', halfLifeH: 51, kdegPerMin: 0.00023 },
  { value: 'CYP3A4', text: 'CYP3A4 (hepatic)', halfLifeH: 36, kdegPerMin: 0.00032 },
  { value: 'CYP3A4-gut', text: 'CYP3A4 (intestinal)', halfLifeH: 24, kdegPerMin: 0.00048 },
];
export const ENZYME_OPTIONS = TABLE_6.map(({ value, text }) => ({ value, text }));
export const enzymeRow = (v) => TABLE_6.find((r) => r.value === v) || null;

// kdegFault(v) -> a message when an entered kdeg (per minute) is not plausible, else null. Table 6 spans
// 0.00011 to 0.00053/min; above 0.005/min (a half-life under about 2.3 h) the figure is most likely per hour,
// which would make time-dependent inhibition look negligible and recovery look fast (spec-v1714).
export const KDEG_MAX_PER_MIN = 0.005;
export function kdegFault(v) {
  if (!(v > 0)) return 'kdeg must be above 0.';
  if (v < 0.00001) return `kdeg ${v}/min is below 0.00001/min (a half-life over 48 days); ICH M12 Table 6 gives 0.00011 to 0.00053/min. Check the value entered.`;
  if (v > KDEG_MAX_PER_MIN) return `kdeg ${v}/min is above ${KDEG_MAX_PER_MIN}/min (a half-life under about 2.3 hours); ICH M12 Table 6 gives 0.00011 to 0.00053/min. Enter kdeg per minute: a per-hour figure divided by 60.`;
  return null;
}

// Section 2.1.2.1 and 2.1.2.2 (basic methods) and 7.5.1 (mechanistic static model).
export const CUTOFFS = { reversible: 0.02, gut: 10, tdi: 1.25, aucrLow: 0.80, aucrHigh: 1.25, fupFloor: 0.01 };
// Section 7.5.1 defaults for the concentration estimates ("e.g." values for Qen and Qh).
export const DEFAULTS = { fa: 1, fg: 1, kaPerMin: 0.1, qenLPerH: 18, qhLPerH: 97, d: 1 };
