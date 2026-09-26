// spec-v1507 tool 8: Medicaid MAGI household and income, person by person (42 CFR 435.603).
//
// (f)(1) a tax filer not claimed by anyone: the filer and everyone the filer claims (on a joint return,
// everyone either spouse claims). (f)(2) someone claimed by another taxpayer: that taxpayer's household,
// except three cases that go to the non-filer rules: (i) the claimer is not the person's spouse or parent;
// (ii) a child under the state's age limit living with both parents who do not file jointly, claimed by
// one; (iii) a child under the age limit claimed by a parent who does not live with them (the
// non-custodial parent). (f)(3) non-filers: the person and, living with them, their spouse and children
// under the age limit; for a person under the age limit, also their parents and siblings under it. The age
// limit is 19, or 21 for full-time students at state option ((f)(3)(iv)). (f)(4) a married couple living
// together are always in each other's household.
// (d)(1) household income sums everyone's MAGI-based income, except (d)(2) a child in a parent's household,
// or a tax dependent, who is not required to file a return. (d)(4) 5 percentage points of the poverty line
// are subtracted only when testing the eligibility group with the highest income standard.
// The reader enters who is claimed by whom; the tool does not decide dependency.
//
// Pure: no DOM, no clock (the caller passes `now`).

import { todayUtc } from './pa/date.js';
import { datedValue } from './dated-data.js';
import { DATED_INCOME, REGIONS } from './income-screens-v1506.js';

export { REGIONS };
export const AGE_RULES = [{ value: '19', text: 'Under 19' }, { value: '21', text: 'Under 19, or under 21 for full-time students' }];
const whole = (x) => `$${Math.round(x).toLocaleString('en-US')}`;
const key = (s) => String(s ?? '').trim().toLowerCase();
const none = (s) => !key(s) || ['-', 'none', 'no', 'n/a'].includes(key(s));
const yes = (s) => ['yes', 'y', 'joint'].includes(key(s));

export function parsePeople(text) {
  const people = [];
  for (const [i, line] of String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).entries()) {
    const p = line.split(/\s*,\s*/);
    if (p.length !== 9) return { error: `Line ${i + 1} ("${line.slice(0, 40)}"): enter 9 items: name, age, files taxes (yes, no or joint), claimed by (name or -), spouse in the home (name or -), parents in the home (names separated by ; or -), required to file (yes or no), annual MAGI income, full-time student (yes or no).` };
    const [name, age, files, claimedBy, spouse, parents, mustFile, income, student] = p;
    const a = Number(age);
    const inc = Number(String(income).replace(/[$,]/g, ''));
    if (!name) return { error: `Line ${i + 1}: enter a name first.` };
    if (!Number.isInteger(a) || a < 0 || a > 120) return { error: `Line ${i + 1}: enter the age in whole years.` };
    if (!['yes', 'no', 'joint', 'y', 'n'].includes(key(files))) return { error: `Line ${i + 1}: enter files taxes as yes, no or joint.` };
    if (!Number.isFinite(inc) || inc < 0) return { error: `Line ${i + 1}: enter the annual MAGI income as a number (0 if none).` };
    people.push({
      name, k: key(name), age: a, files: key(files) === 'joint' ? 'joint' : yes(files) ? 'yes' : 'no',
      claimedBy: none(claimedBy) ? null : key(claimedBy), spouse: none(spouse) ? null : key(spouse),
      parents: none(parents) ? [] : parents.split(/\s*;\s*/).map(key).filter(Boolean), mustFile: yes(mustFile), income: inc, student: yes(student),
    });
  }
  const ks = new Set();
  for (const p of people) { if (ks.has(p.k)) return { error: `"${p.name}" appears twice; give each person a different name.` }; ks.add(p.k); }
  for (const p of people) {
    if (p.spouse && !ks.has(p.spouse)) return { error: `${p.name}'s spouse "${p.spouse}" is not listed; list everyone in the home.` };
    for (const par of p.parents) if (!ks.has(par)) return { error: `${p.name}'s parent "${par}" is not listed as living in the home; leave out a parent who lives elsewhere.` };
  }
  return { people };
}

export function magiHousehold(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  if (!String(o.people ?? '').trim()) return { valid: false, message: 'Enter everyone in the home, one per line: name, age, files taxes (yes, no or joint), claimed by, spouse in the home, parents in the home, required to file, annual MAGI income, full-time student.' };
  const pp = parsePeople(o.people);
  if (pp.error) return { valid: false, message: pp.error };
  const { people } = pp;
  const region = REGIONS.some((r) => r.value === o.region) ? o.region : null;
  if (!region) return { valid: false, message: 'Choose where the household lives: the 48 states and DC, Alaska, or Hawaii.' };
  const ageRule = o.ageRule === '21' ? 21 : 19;
  const notes = [];
  if (o.ageRule !== '19' && o.ageRule !== '21') notes.push('The state\'s age rule was not entered, so under 19 is used (42 CFR 435.603(f)(3)(iv)).');
  const yr = String(o.year ?? '').trim();
  const year = yr ? Number(yr) : todayUtc(now).getUTCFullYear();
  if (!DATED_INCOME[`poverty-guidelines-${year}`]) return { valid: false, message: `Enter a year with poverty guidelines on file: none for ${year}.` };
  if (!yr) notes.push(`A year was not entered, so the ${year} poverty guidelines are used.`);
  const by = new Map(people.map((p) => [p.k, p]));
  const under = (p) => p.age < 19 || (ageRule === 21 && p.student && p.age < 21);
  const childrenOf = (p) => people.filter((c) => c.parents.includes(p.k));
  const taxHouse = (t) => {
    const set = new Set([t.k]);
    const filers = [t];
    if (t.files === 'joint' && t.spouse) filers.push(by.get(t.spouse));
    for (const f of filers) { set.add(f.k); for (const d of people) if (d.claimedBy === f.k) set.add(d.k); }
    return set;
  };
  const nonFiler = (p) => {
    const set = new Set([p.k]);
    if (p.spouse) set.add(p.spouse);
    for (const c of childrenOf(p)) if (under(c)) set.add(c.k);
    if (under(p)) {
      for (const par of p.parents) set.add(par);
      for (const s of people) if (s.k !== p.k && under(s) && s.parents.some((x) => p.parents.includes(x))) set.add(s.k);
    }
    return set;
  };
  const rows = [];
  for (const p of people) {
    let set;
    let rule;
    if (p.claimedBy) {
      const t = by.get(p.claimedBy);
      const isParent = p.parents.includes(p.claimedBy);
      const isSpouse = p.spouse === p.claimedBy;
      const bothParents = p.parents.length === 2;
      const jointParents = bothParents && p.parents.every((x) => by.get(x)?.files === 'joint' && p.parents.includes(by.get(x).spouse));
      if (!t) {
        if (under(p)) { set = nonFiler(p); rule = 'claimed by a parent outside the home (non-custodial), so the non-filer rules apply ((f)(2)(iii), (f)(3))'; } else { set = nonFiler(p); rule = 'claimed by someone outside the home, so the non-filer rules apply ((f)(2)(i), (f)(3))'; }
      } else if (!isParent && !isSpouse) { set = nonFiler(p); rule = `claimed by ${t.name}, who is not a spouse or parent, so the non-filer rules apply ((f)(2)(i), (f)(3))`; }
      else if (isParent && under(p) && bothParents && !jointParents) { set = nonFiler(p); rule = 'living with both parents who do not file jointly, so the non-filer rules apply ((f)(2)(ii), (f)(3))'; }
      else { set = taxHouse(t); rule = `in the household of ${t.name}, who claims them ((f)(2))`; if (t.files === 'no') rule += `; ${t.name} was entered as not filing, so check who claims whom`; }
    } else if (p.files !== 'no') { set = taxHouse(p); rule = 'a tax filer not claimed by anyone: the filer and everyone claimed ((f)(1))'; }
    else { set = nonFiler(p); rule = 'neither files nor is claimed: the non-filer rules ((f)(3))'; }
    if (p.spouse) set.add(p.spouse);
    const members = [...set].map((k) => by.get(k));
    const counted = members.filter((m) => {
      const inParentHouse = m.parents.some((x) => set.has(x));
      const dependent = m.claimedBy && set.has(m.claimedBy);
      return m.mustFile || !(inParentHouse || dependent);
    });
    const income = counted.reduce((s, m) => s + m.income, 0);
    const [base, per] = datedValue(`poverty-guidelines-${year}`, region, new Date(Date.UTC(year, 6, 1)), DATED_INCOME).value;
    const line = base + per * (members.length - 1);
    const pct = Math.round((income / line) * 1000) / 10;
    const left = members.filter((m) => !counted.includes(m)).map((m) => m.name);
    rows.push({ name: p.name, size: members.length, income, pct, rule, members: members.map((m) => m.name), left });
  }
  for (const r of rows) {
    notes.push(`${r.name}: household of ${r.size} (${r.members.join(', ')}), ${r.rule}; income ${whole(r.income)}${r.left.length ? `, not counting ${r.left.join(', ')} (a child or dependent not required to file, (d)(2))` : ''}; ${r.pct}% of the poverty line.`);
  }
  notes.push('For the eligibility group with the highest income standard only, the state subtracts 5 percentage points of the poverty line (42 CFR 435.603(d)(4)).');
  const sizes = new Set(rows.map((r) => r.size));
  return {
    valid: true,
    people: rows,
    band: `${rows.length} ${rows.length === 1 ? 'person' : 'people'}: ${rows.map((r) => `${r.name} ${r.size} (${r.pct}%)`).join('; ')}.${sizes.size > 1 ? ' Household sizes differ from person to person.' : ''}`,
    bandLabel: rows.map((r) => `${r.name} ${r.size}`).join(', '),
    notes,
    note: 'Households and income by 42 CFR 435.603 from the facts entered; the state Medicaid agency determines eligibility and its own income standards.',
  };
}
