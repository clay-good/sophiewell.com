// spec-v1502 tool 2: step therapy history builder.
//
// The reader enters the steps the plan requires (a name, how many different agents, the minimum trial in
// days) and each drug tried (the step it belongs to, start and stop dates, and why it stopped). A trial
// counts toward its step when it lasted the minimum, or when it stopped for intolerance or a
// contraindication and the reader marks that the plan accepts that. A step is met when enough different
// agents count. For a Medicare Advantage plan applying step therapy to a Part B drug, 42 CFR 422.136(a)(1)
// allows it only for new administrations, with a lookback of at least 365 days: a claim for the drug in the
// 365 days before the request means step therapy cannot apply. The tool never judges whether a trial was
// clinically adequate; it counts and dates what is entered.
//
// Pure: no DOM, no clock (the caller passes `now`).

import { parseIsoStrict, addCalendarDaysUtc } from './deadline.js';
import { todayUtc } from './pa/date.js';
import { longDate } from './partd-appeals-v1503.js';

const DAY = 86400000;
const date = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };
export const REASONS = ['inadequate response', 'intolerance', 'contraindication', 'still taking'];
export const PLAN_TYPES = [{ value: 'commercial', text: 'Commercial, Part D or Medicaid' }, { value: 'ma-part-b', text: 'Medicare Advantage, Part B drug' }];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, ' ');

function parseSteps(text) {
  const steps = [];
  for (const [i, line] of String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).entries()) {
    const p = line.split(/\s*[,;\t]\s*/);
    if (p.length !== 3 || !p[0]) return { error: `Step line ${i + 1} ("${line.slice(0, 40)}"): enter step name, number of agents, minimum days.` };
    const n = Number(p[1]);
    const days = Number(p[2]);
    if (!Number.isInteger(n) || n < 1 || n > 10) return { error: `Step line ${i + 1}: enter the number of agents as a whole number from 1 to 10.` };
    if (!Number.isInteger(days) || days < 1 || days > 730) return { error: `Step line ${i + 1}: enter the minimum trial as whole days from 1 to 730.` };
    steps.push({ name: p[0], key: norm(p[0]), agents: n, days });
  }
  return { steps };
}

function parseTrials(text, asOf) {
  const trials = [];
  for (const [i, line] of String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).entries()) {
    const p = line.split(/\s*[,;\t]\s*/);
    if (p.length !== 5) return { error: `Trial line ${i + 1} ("${line.slice(0, 40)}"): enter drug, step, start date, stop date (or "ongoing"), reason stopped.` };
    const [drug, step, s, e, why] = p;
    const start = date(s);
    if (!drug || !step) return { error: `Trial line ${i + 1}: enter the drug and the step it belongs to.` };
    if (!start) return { error: `Trial line ${i + 1}: enter the start date as YYYY-MM-DD.` };
    const ongoing = !e || norm(e) === 'ongoing';
    const stop = ongoing ? asOf : date(e);
    if (!stop) return { error: `Trial line ${i + 1}: enter the stop date as YYYY-MM-DD, or "ongoing".` };
    if (stop < start) return { error: `Trial line ${i + 1}: the stop date comes before the start.` };
    const reason = norm(why);
    if (!REASONS.includes(reason)) return { error: `Trial line ${i + 1}: enter the reason as one of: ${REASONS.join(', ')}.` };
    trials.push({ drug, key: norm(drug), step: norm(step), start, stop, ongoing, reason, days: Math.round((stop - start) / DAY) + 1 });
  }
  return { trials: trials.sort((a, b) => a.start - b.start) };
}

export function stepTherapyHistory(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  if (!String(o.steps ?? '').trim()) return { valid: false, message: 'Enter the plan\'s required steps, one per line: step name, number of agents, minimum days (for example, conventional DMARD, 2, 90).' };
  if (!String(o.trials ?? '').trim()) return { valid: false, message: 'Enter the drugs tried, one per line: drug, step, start date, stop date (or "ongoing"), reason stopped.' };
  const asOf = todayUtc(now);
  const ps = parseSteps(o.steps);
  if (ps.error) return { valid: false, message: ps.error };
  const pt = parseTrials(o.trials, asOf);
  if (pt.error) return { valid: false, message: pt.error };
  const { steps } = ps;
  const { trials } = pt;
  const accepts = o.acceptsIntolerance === 'yes';
  const notes = [];
  if (o.acceptsIntolerance !== 'yes' && o.acceptsIntolerance !== 'no') notes.push('Whether the plan accepts intolerance or a contraindication in place of a full trial was not entered, so it is not assumed.');
  const unknown = trials.filter((t) => !steps.some((s) => s.key === t.step));
  if (unknown.length) return { valid: false, message: `Trial "${unknown[0].drug}" names step "${unknown[0].step}", which is not in the steps entered.` };
  const unmet = [];
  for (const s of steps) {
    const counted = new Map();
    for (const t of trials.filter((x) => x.step === s.key)) {
      const early = t.reason === 'intolerance' || t.reason === 'contraindication';
      const ok = t.days >= s.days || (early && accepts);
      if (ok && !counted.has(t.key)) counted.set(t.key, t.days >= s.days ? `${t.days} days` : t.reason);
    }
    const met = counted.size >= s.agents;
    if (!met) unmet.push(s.name);
    notes.push(`${s.name}: ${counted.size} of ${s.agents} agent${s.agents > 1 ? 's' : ''} counted (minimum ${s.days} days)${counted.size ? `: ${[...counted].map(([k, v]) => `${trials.find((t) => t.key === k).drug} (${v})`).join(', ')}` : ''}; ${met ? 'met' : 'not met'}.`);
  }
  for (const t of trials) notes.push(`${t.drug}: ${longDate(t.start)} to ${t.ongoing ? `${longDate(t.stop)} (ongoing)` : longDate(t.stop)}, ${t.days} days, ${t.reason}.`);
  for (let i = 0; i < trials.length; i += 1) {
    for (let j = i + 1; j < trials.length; j += 1) {
      const a = trials[i];
      const b = trials[j];
      const from = a.start > b.start ? a.start : b.start;
      const to = a.stop < b.stop ? a.stop : b.stop;
      if (to >= from) notes.push(`${a.drug} and ${b.drug} overlap for ${Math.round((to - from) / DAY) + 1} days (${longDate(from)} to ${longDate(to)}).`);
    }
  }
  let band = unmet.length ? `Not met: ${unmet.join(', ')}.` : `Every required step is met (${steps.length} step${steps.length > 1 ? 's' : ''}).`;
  let label = unmet.length ? `${unmet.length} step${unmet.length > 1 ? 's' : ''} not met` : 'All steps met';
  if (o.planType === 'ma-part-b') {
    const req = date(o.requestDate) ?? asOf;
    if (!date(o.requestDate)) notes.push(`A request date was not entered, so today, ${longDate(asOf)}, is used for the lookback.`);
    const last = String(o.lastClaim ?? '').trim() ? date(o.lastClaim) : null;
    if (String(o.lastClaim ?? '').trim() && !last) return { valid: false, message: 'Enter the last claim date for the requested drug as YYYY-MM-DD, or leave it blank.' };
    const from = addCalendarDaysUtc(req, -365);
    if (last && last >= from && last <= req) {
      band = `Step therapy cannot apply: the patient had a claim for the drug on ${longDate(last)}, within the 365 days before ${longDate(req)}, so this is not a new administration (42 CFR 422.136(a)(1)).`;
      label = 'Lookback: not a new start';
    } else notes.push(`Medicare Advantage may apply step therapy to a Part B drug only for a new administration, with no claim for it in the lookback of at least 365 days (from ${longDate(from)}; 42 CFR 422.136(a)(1)).${last ? '' : ' No earlier claim was entered.'}`);
  }
  return { valid: true, unmet, band, bandLabel: label, abnormal: unmet.length > 0, notes, note: 'This counts and dates the history entered against the steps entered; the plan decides whether each trial meets its policy.' };
}
