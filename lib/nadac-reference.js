// spec-v1614 §6: the reader's own CMS NADAC file, used by pharmacy-spread-check for that run instead of the
// bundled week. Its use is the past: the bundle holds the current week, so claims filled before that week's
// effective dates have no benchmark, while CMS posts every week of a year as one file on data.medicaid.gov.
//
// Layout (the NADAC CSV, as the recognizer reads it): NDC Description, NDC, NADAC Per Unit, Effective Date,
// Pricing Unit, ..., As of Date, one row per drug per weekly file; a yearly file repeats each drug in every week.
// Header words may be joined by underscores. Dates are MM/DD/YYYY.
//
// readNadacFile streams the file and keeps only rows of the labelers asked for, so memory follows the claims, not
// the file. nadacHistory turns those rows into, per NDC, its distinct (effective date, price) steps; a claim is
// priced at the step in effect on its fill date (the latest effective date on or before it), and only while the
// file's weeks reach that date (its latest As of Date).

const norm = (s) => String(s || '').toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
const iso = (s) => { const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s || '').trim()); return m ? `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}` : null; };

function splitLine(line) {
  const out = []; let v = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { v += '"'; i++; } else if (c === '"') q = false; else v += c; }
    else if (c === '"') q = true;
    else if (c === ',') { out.push(v); v = ''; }
    else v += c;
  }
  out.push(v);
  return out;
}

// readNadacFile(file, labelers) -> { rows, asOfDate, firstAsOf, lines }. Rows are in the bundled shape.
export async function readNadacFile(file, labelers) {
  const want = new Set(labelers.map(String));
  const reader = file.stream().pipeThrough(new TextDecoderStream()).getReader();
  let rest = ''; let cols = null; const rows = []; let asOf = null; let firstAsOf = null; let lines = 0;
  for (;;) {
    const { value, done } = await reader.read();
    const parts = (rest + (value || '')).split(/\r?\n/);
    rest = done ? '' : parts.pop();
    for (const line of parts) {
      if (!line.trim()) continue;
      lines += 1;
      const c = splitLine(line);
      if (!cols) {
        const h = c.map(norm);
        const at = (name) => h.indexOf(name);
        cols = { desc: at('ndc description'), ndc: at('ndc'), price: at('nadac per unit'), eff: at('effective date'), unit: at('pricing unit'), asOf: at('as of date') };
        if (cols.ndc < 0 || cols.price < 0 || cols.eff < 0) throw new RangeError('This is not a CMS NADAC file: no NDC, NADAC Per Unit and Effective Date columns were found.');
        continue;
      }
      const ndc = String(c[cols.ndc] || '').replace(/\D/g, '').padStart(11, '0');
      if (!want.has(ndc.slice(0, 5))) continue;
      const effectiveDate = iso(c[cols.eff]); const perUnit = Number(c[cols.price]);
      if (!effectiveDate || !Number.isFinite(perUnit)) continue;
      const a = cols.asOf >= 0 ? iso(c[cols.asOf]) : null;
      if (a) { if (!asOf || a > asOf) asOf = a; if (!firstAsOf || a < firstAsOf) firstAsOf = a; }
      rows.push({ ndc, description: cols.desc >= 0 ? String(c[cols.desc] || '').trim() : '', perUnit, effectiveDate, pricingUnit: cols.unit >= 0 ? String(c[cols.unit] || '').trim() : '' });
    }
    if (done) break;
  }
  if (!cols) throw new RangeError('The NADAC file is empty.');
  return { rows, asOfDate: asOf, firstAsOf, lines };
}

// nadacHistory(rows) -> { NDC: [rows with distinct effective dates, oldest first] }.
export function nadacHistory(rows) {
  const out = {};
  for (const r of rows) {
    const list = (out[r.ndc] ||= []);
    if (!list.some((x) => x.effectiveDate === r.effectiveDate)) list.push(r);
  }
  for (const k of Object.keys(out)) out[k].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
  return out;
}

// stepOn(list, isoDate) -> the row in effect on the date, or the earliest row when the date is before all of them.
export function stepOn(list, isoDate) {
  let pick = null;
  for (const r of list) if (r.effectiveDate <= isoDate) pick = r;
  return pick || list[0];
}
