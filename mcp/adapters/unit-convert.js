// spec-v629 wave 10: pediatric weight conversion (non-clinical / administrative).
// The tile's compute is inline in views/group-klmno.js, but it only composes two
// existing pure lib fns (lbOzToKg, kgToLbOz) -- so the adapter composes them
// directly, no view/lib change. Provide lb+oz, or kg, or both; each supplied side
// is converted to the other. Rounding matches the tile (kg to 3 dp, oz to 1 dp).

import { lbOzToKg, kgToLbOz } from '../../lib/unit-convert.js';

const round = (v, d) => { const f = 10 ** d; return Math.round(v * f) / f; };

export default [
  {
    id: 'peds-weight-conv',
    summary: 'Pediatric weight conversion between pounds + ounces and kilograms, in both directions.',
    compute: (a) => {
      const out = {};
      // spec-v930: a blank field is not a supplied one. `!= null` lets '' through, so an empty
      // form produced an lb/oz block of zeros while an absent one produced nothing.
      const given = (v) => v !== null && v !== undefined && (typeof v === 'number' || String(v).trim() !== '');
      const hasLbOz = given(a.lb) || given(a.oz);
      if (hasLbOz) {
        const lb = a.lb || 0;
        const oz = a.oz || 0;
        out.lb = lb;
        out.oz = oz;
        out.kg = round(lbOzToKg(lb, oz), 3);
      }
      if (given(a.kg)) {
        out.inputKg = a.kg;
        const r = kgToLbOz(a.kg);
        out.lbFromKg = r.lb;
        out.ozFromKg = round(r.oz, 1);
      }
      // Nothing to convert -> incomplete input. spec-v930: `== null` missed a blank, so an empty
      // form returned an empty object here instead of the same null an absent one returns.
      if (!hasLbOz && !given(a.kg)) return null;
      return out;
    },
    fields: [
      { dom: 'pw-lb', arg: 'lb', kind: 'number', label: 'Weight in pounds' },
      { dom: 'pw-oz', arg: 'oz', kind: 'number', label: 'Plus ounces' },
      { dom: 'pw-kg', arg: 'kg', kind: 'number', label: 'OR weight in kilograms' },
    ],
  },
];
