// spec-v4 §5 utility 103: HHS Federal Poverty Guidelines calculator.
//
// Pure helpers; the renderer in views/group-b.js wires these to the bundled
// data/fpl/fpl.json table.

export const FPL_REGIONS = ['contiguous48', 'alaska', 'hawaii'];

export function fplBase(household, regionRow) {
  if (!Number.isInteger(household) || household < 1) {
    throw new RangeError('household must be a positive integer');
  }
  if (!regionRow || typeof regionRow.base !== 'number' || typeof regionRow.perAdditional !== 'number') {
    throw new TypeError('regionRow must have numeric { base, perAdditional }');
  }
  return regionRow.base + (household - 1) * regionRow.perAdditional;
}

export function fplAt(percent, household, regionRow) {
  if (!Number.isFinite(percent) || percent <= 0) {
    throw new RangeError('percent must be a positive number');
  }
  return Math.round(fplBase(household, regionRow) * (percent / 100));
}

export function fplBands(household, regionRow, percents = [100, 138, 200, 250, 400, 600]) {
  return percents.map((p) => ({ percent: p, threshold: fplAt(p, household, regionRow) }));
}
