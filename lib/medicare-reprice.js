// spec-v1626 shared module: what Medicare would pay for the same service, from the bundled fee
// schedules. Pure: the caller passes the rows it loaded. Each function returns
// { amount, method, edition } or { unpriced: reason } -- a line that cannot be priced is never
// priced at zero.
//
// Only the physician fee schedule is priced today: the site bundles every PPRRVU row, the GPCIs
// and the conversion factor (data/mpfs). It holds no full OPPS addendum and no IPPS base rates, so
// outpatient and inpatient facility lines are unpriced with that reason.

// Pub. 100-04 ch. 12 sec. 20.4.2 (rev. 12823, effective October 8, 2024): the places of service
// paid at the facility rate, and those paid at the nonfacility rate. A code on neither list is not
// priced. A professional component (modifier 26) has one rate either way.
export const FACILITY_POS = ['02', '19', '21', '22', '23', '24', '26', '31', '34', '41', '42', '51', '52', '53', '56', '61'];
export const NONFACILITY_POS = ['01', '03', '04', '09', '10', '11', '12', '13', '14', '15', '16', '17', '20', '25', '27', '32', '33', '49', '50', '54', '55', '57', '58', '60', '62', '65', '71', '72', '81', '99'];

// Status codes the fee schedule pays from its own RVUs (PPRRVU status indicators A, R and T).
const PAID_STATUS = new Set(['A', 'R', 'T']);
// Modifiers with their own PPRRVU rows.
const ROW_MODIFIERS = new Set(['26', 'TC', '53']);
// Modifiers that do not change the fee schedule amount for the line. Any other modifier (50, 51,
// 52, 62, 80, AS and the rest) changes it in a way this does not model, so the line is unpriced.
const NEUTRAL_MODIFIERS = new Set(['25', '59', 'XE', 'XP', 'XS', 'XU', '76', '77', '79', 'LT', 'RT', 'GA', 'GY', 'GZ', 'KX', '95', 'GT', '93', 'FQ', '24', '57']);

const round2 = (n) => Math.round(n * 100) / 100;

// setting(serviceCodes) -> 'facility' | 'nonfacility' | { unpriced }.
export function settingFor(serviceCodes) {
  const codes = (serviceCodes || []).map(String);
  if (!codes.length) return { unpriced: 'no place of service is stated' };
  if (codes.includes('CSTM-00')) return { unpriced: 'the rate applies to every place of service, and Medicare pays some at the facility rate and some at the nonfacility rate' };
  const fac = codes.filter((c) => FACILITY_POS.includes(c)); const non = codes.filter((c) => NONFACILITY_POS.includes(c));
  if (fac.length + non.length < codes.length) return { unpriced: `place of service ${codes.find((c) => !FACILITY_POS.includes(c) && !NONFACILITY_POS.includes(c))} is on neither Medicare list` };
  if (fac.length && non.length) return { unpriced: 'its places of service include both facility and nonfacility settings, which Medicare pays at different rates' };
  return fac.length ? 'facility' : 'nonfacility';
}

// repriceProfessional({ code, modifiers, serviceCodes, rows, gpci, conversionFactor, edition })
// rows: every PPRRVU row for the code (global and modifier rows); gpci: { workGpci, peGpci, mpGpci,
// name }.
export function repriceProfessional({ code, modifiers = [], serviceCodes, rows, gpci, conversionFactor, edition }) {
  if (!rows || !rows.length) return { unpriced: `${code} is not in the physician fee schedule` };
  const mods = modifiers.map((m) => String(m).toUpperCase());
  const rowMods = mods.filter((m) => ROW_MODIFIERS.has(m));
  const other = mods.find((m) => !ROW_MODIFIERS.has(m) && !NEUTRAL_MODIFIERS.has(m));
  if (other) return { unpriced: `modifier ${other} changes the Medicare amount in a way not modeled here` };
  if (rowMods.length > 1) return { unpriced: `modifiers ${rowMods.join(' and ')} together are not one fee schedule row` };
  const row = rows.find((r) => (r.modifier || '') === (rowMods[0] || ''));
  if (!row) return { unpriced: `${code} has no fee schedule row with modifier ${rowMods[0]}` };
  if (!PAID_STATUS.has(row.statusCode)) return { unpriced: `${code} has status ${row.statusCode} on the fee schedule, so it has no fee schedule amount of its own` };
  let setting = settingFor(serviceCodes);
  if (rowMods[0] === '26') setting = 'facility';
  if (setting.unpriced) return setting;
  const pe = setting === 'facility' ? row.peRvuFacility : row.peRvuNonFacility;
  const amount = round2((row.workRvu * gpci.workGpci + pe * gpci.peGpci + row.mpRvu * gpci.mpGpci) * conversionFactor);
  if (!(amount > 0)) return { unpriced: `${code} has no relative value units on the fee schedule` };
  return { amount, method: `physician fee schedule, ${setting} rate${rowMods[0] ? `, modifier ${rowMods[0]}` : ''}, ${gpci.name}`, edition };
}

export function repriceOutpatient() {
  return { unpriced: 'facility outpatient rates are paid under the OPPS, whose full table this site does not hold' };
}

export function repriceInpatient() {
  return { unpriced: 'inpatient rates are paid under the IPPS, whose hospital base rates this site does not hold' };
}
