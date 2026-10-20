// spec-v1635 tool 4: lifetime cumulative dose against the figure each label states.
//
// Sources, DailyMed labels re-read October 11, 2026:
//   Doxorubicin HCl Injection, Pfizer, set 1fd148fb-..., version 28. 2.2: "Cumulative doses above
//     550 mg/m2 are associated with an increased risk of cardiomyopathy". 5.1: "estimated to be 1 to
//     2% at a total cumulative dose of 300 mg/m2 ..., 3 to 5% at a dose of 400 mg/m2, 5 to 8% at a
//     dose of 450 mg/m2, and 6 to 20% at a dose of 500 mg/m2, when doxorubicin hydrochloride is
//     administered every 3 weeks"; "additive or potentially synergistic increase in the risk ... in
//     patients who have received radiotherapy to the mediastinum" (no lower figure is given).
//   ELLENCE (epirubicin), Pfizer, set 0a03c798-..., version 26. Boxed warning: "0.9% at a cumulative
//     dose of 550 mg/m2, 1.6% at 700 mg/m2, and 3.3% at 900 mg/m2". 5.1: "cumulative doses of
//     900 mg/m2 ELLENCE should generally be avoided."
//   Daunorubicin HCl, Hikma, set 227784a8-..., version 6. Boxed warning: "increases after a total
//     cumulative dose exceeding 400 to 550 mg/m2 in adults, 300 mg/m2 in children more than 2 years
//     of age, or 10 mg/kg in children less than 2 years of age." Warnings: "In adults, at cumulative
//     doses exceeding 550 mg/m2, there is an increased incidence of drug-induced congestive heart
//     failure ... this limit appears lower, namely 400 mg/m2, in patients who received radiation
//     therapy that encompassed the heart."
//   IDAMYCIN PFS (idarubicin), Pfizer, set 0a5a6d93-..., version 27. 5: "Include prior doses of
//     other anthracyclines or anthracenediones in calculations of total cumulative dosage"; "at
//     cumulative doses exceeding 90 mg/m2 ..., there is an increased incidence of drug-induced
//     congestive heart failure. The tolerable limit may be lower in patients who received radiation
//     therapy to the mediastinum."
//   Mitoxantrone, Hospira, set accf9569-..., version 25. Boxed warning: "MS patients should not
//     receive a cumulative mitoxantrone dose greater than 140 mg/m2"; Dosage and Administration:
//     not to MS patients "who have received a cumulative lifetime dose of >=140 mg/m2"; Warnings:
//     cancer patients at 140 mg/m2 "had a cumulative 2.6% probability of clinical congestive heart
//     failure."
//   Bleomycin for Injection, Meitheal, set 640602f9-..., version 3. Dosage and Administration:
//     "a striking increase when the total dose is over 400 units. Total doses over 400 units should
//     be given with great caution."
//
// Totals are per agent. No label gives a conversion ratio between anthracyclines, so none ships: the
// reader may enter prior other agents already converted, and that part is labeled as the reader's.
//
// Pure: the clock is a parameter (used only for the label rows).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';
import { dpSafe } from './cut-display.js';

export const AGENTS = [
  { value: 'doxorubicin', text: 'Doxorubicin' },
  { value: 'epirubicin', text: 'Epirubicin' },
  { value: 'daunorubicin', text: 'Daunorubicin' },
  { value: 'idarubicin', text: 'Idarubicin' },
  { value: 'mitoxantrone', text: 'Mitoxantrone' },
  { value: 'bleomycin', text: 'Bleomycin' },
];
export const LABELS = {
  doxorubicin: { name: 'Doxorubicin Hydrochloride Injection', setId: '1fd148fb-0fbc-4b6f-b790-23546fb46a71' },
  epirubicin: { name: 'ELLENCE', setId: '0a03c798-a652-4895-b29c-3b521a89ba42' },
  daunorubicin: { name: 'Daunorubicin Hydrochloride', setId: '227784a8-ce68-4dd4-8ac5-a65265969677' },
  idarubicin: { name: 'IDAMYCIN PFS', setId: '0a5a6d93-cc1e-4d7f-8da1-446c134503b3' },
  mitoxantrone: { name: 'Mitoxantrone', setId: 'accf9569-4b57-4e83-a7db-4e890a75d1ba' },
  bleomycin: { name: 'Bleomycin for Injection', setId: '640602f9-a7df-46f0-a9b1-19c471008bee' },
};
export const DAUNORUBICIN_GROUPS = [
  { value: 'adult', text: 'Adult' },
  { value: 'child-over-2', text: 'Child more than 2 years of age' },
  { value: 'child-under-2', text: 'Child less than 2 years of age (doses in mg/kg)' },
];
export const HEART_RADIATION = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
export const MITOXANTRONE_USES = [
  { value: 'multiple-sclerosis', text: 'Multiple sclerosis' },
  { value: 'cancer', text: 'Cancer' },
];
const NOTE = 'A running total set beside the figure the label states. The figures are not safe limits: each label describes toxicity below them, and cardiac or pulmonary monitoring is a separate matter. It does not say whether a further dose should be given.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US');
// One decimal, or more where one would put the shown number on the other side of a cut-off.
const nCut = (x, cuts) => dpSafe(x, cuts, 1).toLocaleString('en-US', { maximumFractionDigits: 12 });
const DOX_POINTS = [[300, '1 to 2%'], [400, '3 to 5%'], [450, '5 to 8%'], [500, '6 to 20%']];
const EPI_POINTS = [[550, '0.9%'], [700, '1.6%'], [900, '3.3%']];

// Where a total sits among the doses a label gives a probability for. Never interpolated.
function among(points, total, unit) {
  const exact = points.find(([d]) => Math.abs(d - total) < 1e-9);
  if (exact) return `The label's estimate at ${exact[0]} ${unit} is ${exact[1]}.`;
  const below = [...points].reverse().find(([d]) => d < total); const above = points.find(([d]) => d > total);
  if (!below) return `Below the lowest dose the label gives an estimate for (${above[1]} at ${above[0]} ${unit}).`;
  if (!above) return `Above the highest dose the label gives an estimate for (${below[1]} at ${below[0]} ${unit}).`;
  return `Between two doses the label gives estimates for: ${below[1]} at ${below[0]} ${unit} and ${above[1]} at ${above[0]} ${unit}. Nothing is interpolated.`;
}

// The figure and sentences for an agent and its qualifiers: { figure, unit, sentences[], inclusive? } or { message }.
function rule(agent, o) {
  if (agent === 'doxorubicin') return { figure: 550, unit: 'mg/m²', points: DOX_POINTS, sentences: ['Label: "Cumulative doses above 550 mg/m² are associated with an increased risk of cardiomyopathy."', 'The label says radiotherapy to the mediastinum, or other cardiotoxic agents such as cyclophosphamide and trastuzumab, add to the risk. It gives no lower figure for them, and none is applied here.', 'The label\'s estimates (1 to 2% at 300, 3 to 5% at 400, 5 to 8% at 450, 6 to 20% at 500 mg/m²) are for doxorubicin given every 3 weeks.'] };
  if (agent === 'epirubicin') return { figure: 900, unit: 'mg/m²', inclusive: true, points: EPI_POINTS, sentences: ['Label: "cumulative doses of 900 mg/m² ELLENCE should generally be avoided."', 'The label says prior cardiovascular disease, radiotherapy to the mediastinal or pericardial area, and other anthracyclines or anthracenediones add to the risk; it gives no lower figure for them.'] };
  if (agent === 'idarubicin') return { figure: 90, unit: 'mg/m²', sentences: ['Label: "at cumulative doses exceeding 90 mg/m² of idarubicin hydrochloride, there is an increased incidence of drug-induced congestive heart failure."', 'Label: "Include prior doses of other anthracyclines or anthracenediones in calculations of total cumulative dosage." It gives no conversion ratio.', 'Label: "The tolerable limit may be lower in patients who received radiation therapy to the mediastinum." It gives no figure.'] };
  if (agent === 'bleomycin') return { figure: 400, unit: 'units', sentences: ['Label: "Total doses over 400 units should be given with great caution."', 'The label says pulmonary toxicity is more common over 70 years of age and above 400 units, is unpredictable, has occurred in young patients at low doses, and may occur at lower doses in combination regimens.'] };
  if (agent === 'mitoxantrone') {
    const use = MITOXANTRONE_USES.find((u) => u.value === String(o.mitoxantroneUse ?? '').trim());
    if (!use) return { message: 'Choose what mitoxantrone is for: the label\'s 140 mg/m² sentence differs for multiple sclerosis and for cancer.' };
    if (use.value === 'multiple-sclerosis') return { figure: 140, unit: 'mg/m²', inclusive: true, sentences: ['Label, boxed warning: "MS patients should not receive a cumulative mitoxantrone dose greater than 140 mg/m²."', 'Label, dosage section: not to be given to multiple sclerosis patients "who have received a cumulative lifetime dose of ≥140 mg/m²." The two sentences differ at exactly 140; the second is the one applied here.'] };
    return { figure: 140, unit: 'mg/m²', sentences: ['Label: cancer patients who received cumulative doses of 140 mg/m² "had a cumulative 2.6% probability of clinical congestive heart failure." The label states no cumulative figure not to exceed in cancer; 140 mg/m² is the dose its estimate is for.', 'The label says prior anthracyclines, mediastinal radiotherapy and cardiovascular disease add to the risk.'] };
  }
  const group = DAUNORUBICIN_GROUPS.find((g) => g.value === String(o.daunorubicinGroup ?? '').trim());
  if (!group) return { message: 'Choose the daunorubicin age group: the label gives one figure for adults, one for children over 2 years and one, in mg/kg, for children under 2.' };
  if (group.value === 'child-over-2') return { figure: 300, unit: 'mg/m²', sentences: ['Label, boxed warning: myocardial toxicity increases after a total cumulative dose exceeding "300 mg/m² in children more than 2 years of age."'] };
  if (group.value === 'child-under-2') return { figure: 10, unit: 'mg/kg', sentences: ['Label, boxed warning: myocardial toxicity increases after a total cumulative dose exceeding "10 mg/kg in children less than 2 years of age."'] };
  const rad = HEART_RADIATION.find((r) => r.value === String(o.heartRadiation ?? '').trim());
  if (!rad) return { message: 'Choose whether the patient had radiation therapy that encompassed the heart: the daunorubicin label gives 400 mg/m² with it and 550 mg/m² without.' };
  const both = 'The boxed warning words it differently: "exceeding 400 to 550 mg/m² in adults." Both sentences are the label\'s.';
  if (rad.value === 'yes') return { figure: 400, unit: 'mg/m²', sentences: ['Label: "this limit appears lower, namely 400 mg/m², in patients who received radiation therapy that encompassed the heart."', both] };
  return { figure: 550, unit: 'mg/m²', lower: 400, sentences: ['Label: "In adults, at cumulative doses exceeding 550 mg/m², there is an increased incidence of drug-induced congestive heart failure."', both] };
}

export function cumulativeDoseLimit(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const agent = AGENTS.find((a) => a.value === String(o.agent ?? '').trim());
  if (!agent) return { valid: false, message: 'Choose the agent: each label states its own figure.' };
  const r = rule(agent.value, o);
  if (r.message) return { valid: false, message: r.message };
  const per = r.unit === 'units' ? null : r.unit === 'mg/kg' ? 'kg' : 'm²';
  const lines = String(o.doses ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { valid: false, message: per ? `Enter the prior doses, one per line: ${r.unit}, or the dose in mg, a comma, and the ${per === 'kg' ? 'weight in kg' : 'body surface area in m²'} at that dose.` : 'Enter the prior doses in units, one per line.' };
  if (lines.length > 200) return { valid: false, message: 'Enter no more than 200 dose lines.' };
  let total = 0; let converted = 0;
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*,\s*/);
    if (p.length > 2 || (p.length === 2 && !per)) return { valid: false, message: `Dose line ${i + 1}: enter one number${per ? `, or the dose in mg, a comma, and the ${per === 'kg' ? 'weight' : 'body surface area'}` : ' of units'}.` };
    if (p.length === 1) {
      const f = inputFault([[`the dose on line ${i + 1}`, p[0], null, per ? (per === 'kg' ? 20 : 1000) : 1000, r.unit]]);
      if (f) return { valid: false, message: f };
      total += Number(p[0]);
    } else {
      const f = inputFault([[`the dose in mg on line ${i + 1}`, p[0], null, 3000, 'mg'], per === 'kg' ? [`the weight on line ${i + 1}`, p[1], 0.4, 300, 'kg'] : [`the body surface area on line ${i + 1}`, p[1], 0.1, 3.5, 'm²']]);
      if (f) return { valid: false, message: f };
      total += Number(p[0]) / Number(p[1]); converted += 1;
    }
  }
  let other = null;
  if (!blank(o.otherEquivalent)) {
    if (!per) return { valid: false, message: 'The entry for other agents does not apply to bleomycin: clear it.' };
    const f = inputFault([['the prior other agents, as converted by you', o.otherEquivalent, 0, 2000, r.unit]]);
    if (f) return { valid: false, message: f };
    other = Number(o.otherEquivalent);
  }
  const L = LABELS[agent.value];
  const lr = labelRow(L.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The ${L.name} label figures are withheld: ${lr.why}. Read the cumulative-dose statement from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };

  const past = (t) => (r.inclusive ? t >= r.figure - 1e-9 : t > r.figure + 1e-9);
  const at = (t) => Math.abs(t - r.figure) < 1e-9;
  const own = past(total);
  const combined = other === null ? null : total + other;
  const withOther = combined !== null && !own && past(combined);
  const flag = own ? 'past-figure' : withOther ? 'past-figure-with-reader-conversion' : at(total) ? 'at-figure' : r.lower && total > r.lower ? 'in-boxed-warning-range' : 'below-figure';
  const word = r.inclusive ? 'at or above' : 'above';
  const cuts = [r.figure, ...(r.lower ? [r.lower] : [])];
  const T = `${nCut(total, cuts)} ${r.unit}`;
  const pct = (t) => nCut(t / r.figure * 100, [100, ...(r.lower ? [r.lower / r.figure * 100] : [])]);
  const band = own ? `${agent.text} total ${T}: ${word} the label's ${r.figure} ${r.unit} (${pct(total)}%).`
    : withOther ? `${agent.text} total ${T} is ${pct(total)}% of the label's ${r.figure} ${r.unit}; with the other agents as you converted them (${n1(other)} ${r.unit}) the total is ${nCut(combined, cuts)} ${r.unit}, ${word} it.`
      : at(total) ? `${agent.text} total ${T}: exactly the label's ${r.figure} ${r.unit}, which its sentence puts "above" or "exceeding" that figure; any further dose passes it.`
        : flag === 'in-boxed-warning-range' ? `${agent.text} total ${T}: ${pct(total)}% of 550 mg/m², and inside the boxed warning's "400 to 550 mg/m²."`
          : `${agent.text} total ${T}: ${pct(total)}% of the label's ${r.figure} ${r.unit}.`;
  const notes = [...r.sentences];
  notes.push(`${lines.length} dose${lines.length === 1 ? '' : 's'} summed${converted ? ` (${converted} converted from mg by the ${per === 'kg' ? 'weight' : 'body surface area'} entered for that dose)` : ''}: ${T}.`);
  if (r.points) notes.push(among(r.points, total, r.unit));
  const remaining = r.figure - total;
  if (remaining > 1e-9) notes.push(r.inclusive ? `A further ${n1(remaining)} ${r.unit} would bring the total to ${r.figure} ${r.unit}.` : `A further dose of more than ${n1(remaining)} ${r.unit} would take the total above ${r.figure} ${r.unit}.`);
  if (other !== null) notes.push(`Other anthracyclines or anthracenediones, as converted by you: ${n1(other)} ${r.unit}; combined ${n1(combined)} ${r.unit} (${n1(combined / r.figure * 100)}% of ${r.figure}). The conversion is yours: no label read here gives a ratio between agents.`);
  else if (per) notes.push('Totals are per agent. Prior doses of other anthracyclines or anthracenediones are not included; no label read here gives a ratio for converting them.');
  notes.push(`Label: ${lr.edition}.`);
  return {
    valid: true, flag, abnormal: flag !== 'below-figure', labelUrl: lr.url,
    total: Number(total.toFixed(2)), unit: r.unit, figure: r.figure, percentOfFigure: Number((total / r.figure * 100).toFixed(1)),
    remaining: Number(Math.max(0, remaining).toFixed(2)), combinedTotal: combined === null ? null : Number(combined.toFixed(2)),
    band, bandLabel: `${T} of ${r.figure}`, notes, note: NOTE,
  };
}
