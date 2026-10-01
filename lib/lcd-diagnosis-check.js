// spec-v1505 tool 3: does this diagnosis support this code under the Medicare billing and coding articles
// for this state?
//
// The data is the Medicare Coverage Database "current articles" export (data/mcd-articles): each article's
// code groups and its covered and non-covered ICD-10-CM groups, already listed code by code. For each
// article that lists the code and whose contractor serves the state:
//   - the covered list that applies is the same-numbered group when the article has several code groups,
//     or every covered group when it has one; when several code groups have no same-numbered covered
//     group, the pairing is stated in prose and is not decided here;
//   - a diagnosis in the covered list supports the code; one in a non-covered group does not; one in
//     neither is "not listed" -- which, in an article with a covered list, means it does not support it.
// Rules the article states only in its paragraphs ("must be billed with a secondary diagnosis") are shown
// for the reader to confirm, never evaluated. No article for the state means the articles do not address
// the code there: an LCD, an NCD or the contractor may still decide.
//
// Pure: no DOM, no fetch, no clock. The caller passes `articles` (see lib/mcd-load.js).

export const STATES = ['AK', 'AL', 'AR', 'AS', 'AZ', 'CA', 'CNMI', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'GU', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VI', 'VT', 'WA', 'WI', 'WV', 'WY']
  .map((s) => ({ value: s, text: s === 'CNMI' ? 'Northern Mariana Islands' : s }));

export const normalizeCode = (raw) => {
  const s = String(raw ?? '').trim().toUpperCase();
  return /^[A-Z0-9]\d{3}[A-Z0-9]$/.test(s) ? s : null;
};

// normalizeIcd('E119') -> 'E11.9'; the MCD lists ICD-10-CM with its dot after the third character.
export function normalizeIcd(raw) {
  const s = String(raw ?? '').trim().toUpperCase().replace(/\./g, '');
  if (!/^[A-TV-Z]\d[0-9A-Z]{1,5}$/.test(s)) return null;
  return s.length > 3 ? `${s.slice(0, 3)}.${s.slice(3)}` : s;
}

export function parseDiagnoses(text) {
  const parts = String(text ?? '').split(/[\s,;]+/).map((x) => x.trim()).filter(Boolean);
  const ok = []; const bad = [];
  for (const p of parts) { const n = normalizeIcd(p); if (n) { if (!ok.includes(n)) ok.push(n); } else bad.push(p); }
  return { ok, bad };
}

const union = (obj) => [...new Set(Object.values(obj || {}).flat())];

// One article's reading for the code and diagnoses.
export function readArticle(a, code, dx) {
  const groups = Object.entries(a.codes).filter(([, codes]) => codes.includes(code)).map(([g]) => g);
  const multi = Object.keys(a.codes).length > 1;
  const coveredGroups = Object.keys(a.covered || {});
  let coveredList = null; let pairing = 'single';
  if (!coveredGroups.length) coveredList = null;
  else if (!multi) coveredList = union(a.covered);
  else {
    const same = groups.filter((g) => a.covered[g]);
    if (same.length) { coveredList = [...new Set(same.flatMap((g) => a.covered[g]))]; pairing = 'by group'; } else pairing = 'prose';
  }
  const non = union(a.noncovered);
  const each = dx.map((d) => ({
    dx: d,
    status: non.includes(d) ? 'not covered' : coveredList && coveredList.includes(d) ? 'covered' : pairing === 'prose' ? 'not decided' : coveredList ? 'not listed' : 'not addressed',
    asterisk: (a.asterisked || []).includes(d),
  }));
  let verdict;
  if (each.some((e) => e.status === 'not covered')) verdict = 'not covered';
  else if (each.some((e) => e.status === 'covered')) verdict = 'covered';
  else if (pairing === 'prose') verdict = 'not decided';
  else if (coveredList) verdict = 'not covered';
  else verdict = 'not addressed';
  const paragraphs = [
    ...groups.map((g) => a.paragraphs?.codes?.[g]).filter(Boolean),
    ...(pairing === 'by group' ? groups.map((g) => a.paragraphs?.covered?.[g]) : Object.values(a.paragraphs?.covered || {})).filter(Boolean),
    // A non-covered group's paragraph says why (a national non-coverage, for example).
    ...Object.entries(a.noncovered || {}).filter(([, codes]) => dx.some((d) => codes.includes(d))).map(([g]) => a.paragraphs?.noncovered?.[g]).filter(Boolean),
  ];
  return { id: a.displayId, title: a.title, url: `https://www.cms.gov/medicare-coverage-database/view/article.aspx?articleid=${a.id}`, groups, pairing, verdict, each, paragraphs: [...new Set(paragraphs)].slice(0, 4), regions: a.regions || [] };
}

const STATE_NAME = { NY: 'New York', MO: 'Missouri', CA: 'California' };
const SAY = { covered: 'supports the code', 'not covered': 'does not support the code', 'not listed': 'is not in the covered list', 'not addressed': 'is not addressed', 'not decided': 'is listed under a group paired in the article\'s text' };

// lcdDiagnosisCheck({ code, diagnoses, state, articles, edition }).
export function lcdDiagnosisCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!String(o.code ?? '').trim()) return { valid: false, message: 'Enter the HCPCS or CPT code.' };
  const code = normalizeCode(o.code);
  if (!code) return { valid: false, message: 'A HCPCS or CPT code is five characters, such as 29877 or J9035. Check the value entered.' };
  const { ok: dx, bad } = parseDiagnoses(o.diagnoses);
  if (bad.length) return { valid: false, message: `${bad.slice(0, 3).join(', ')} ${bad.length === 1 ? 'is not an ICD-10-CM code' : 'are not ICD-10-CM codes'}. Check the value entered.` };
  if (!dx.length) return { valid: false, message: 'Enter the ICD-10-CM diagnosis codes, separated by commas or spaces.' };
  const state = STATES.find((s) => s.value === o.state);
  if (!state) return { valid: false, message: 'Choose the state where the service is furnished: each contractor publishes its own articles.' };
  if (!Array.isArray(o.articles)) return { valid: false, message: 'The Medicare Coverage Database articles could not be loaded.' };
  const here = o.articles.filter((a) => (a.states || []).includes(state.value));
  const edition = o.edition ? ` (MCD export ${o.edition})` : '';
  if (!here.length) {
    return { valid: true, verdict: 'not addressed', articles: [], band: `No billing and coding article for ${state.text} lists ${code}${edition}. The articles do not address it there; an LCD, an NCD or the contractor may still decide coverage.`, bandLabel: 'Not addressed', abnormal: false, notes: [], note: NOTE };
  }
  const read = here.map((a) => readArticle(a, code, dx));
  const verdict = read.some((r) => r.verdict === 'not covered') ? 'not covered' : read.some((r) => r.verdict === 'covered') ? 'covered' : read.some((r) => r.verdict === 'not decided') ? 'not decided' : 'not addressed';
  const lines = read.map((r) => `${r.id} (${r.title}): ${r.each.map((e) => `${e.dx} ${SAY[e.status]}${e.asterisk ? ' (asterisked: the article adds instructions)' : ''}`).join('; ')}.`);
  const someOnly = verdict === 'covered' && read.some((r) => r.each.some((e) => e.status !== 'covered'));
  const head = { covered: someOnly ? `At least one diagnosis supports ${code} under the ${state.text} articles; not every one does` : `The diagnoses support ${code} under the ${state.text} articles`, 'not covered': `At least one article does not accept these diagnoses for ${code} in ${state.text}`, 'not decided': `The articles for ${state.text} pair ${code} with its diagnoses in their text, so this is not decided here`, 'not addressed': `The ${state.text} articles that list ${code} do not address these diagnoses` }[verdict];
  const notes = [...lines];
  for (const r of read) for (const p of r.paragraphs) notes.push(`${r.id} says: ${p}`);
  // A contractor can serve part of a state (New York, Missouri and California are split): say so only then.
  const parts = { NY: 3, MO: 2, CA: 2 };
  for (const r of read) {
    const mine = r.regions.filter((x) => x.startsWith(STATE_NAME[state.value] || '\u0000'));
    if (parts[state.value] && mine.length && mine.length < parts[state.value]) notes.push(`${r.id} applies only in ${mine.join(', ')}.`);
  }
  notes.push('Rules an article states only in its text are listed for you to confirm; they are not evaluated here.');
  return { valid: true, verdict, articles: read, band: `${head}${edition}.`, bandLabel: { covered: 'Supported', 'not covered': 'Not supported', 'not decided': 'Read the article', 'not addressed': 'Not addressed' }[verdict], abnormal: verdict === 'not covered', notes, note: NOTE };
}

const NOTE = 'Billing and coding articles explain how a contractor applies its LCD; the LCD, the medical record and the contractor decide coverage.';
