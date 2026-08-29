// spec-v880 MCP adapter: the EWGSOP2 sarcopenia algorithm in lib/ewgsop2-v880.js. The dom keys
// mirror the browser renderer (views/group-v880.js) and META.ewgsop2.example.
//
// Muscle strength is the entry criterion; mass and performance are read only after it.
// Every cutoff is sex-specific. Clinical domain.

import { ewgsop2 } from '../../lib/ewgsop2-v880.js';

export default [
  {
    id: 'ewgsop2',
    summary: 'Applies the EWGSOP2 algorithm for sarcopenia and returns probable, confirmed or severe. Low muscle strength is a grip strength below 27 kg in men or 16 kg in women, or five chair rises above 15 seconds, and low strength alone is probable sarcopenia. Adding low muscle quantity, an appendicular skeletal muscle mass below 20 kg in men or 15 kg in women or an index below 7.0 or 5.5 kg per square meter, confirms it. Adding low physical performance, a gait speed at or below 0.8 meters per second, a battery score at or below 8, a Timed Up and Go at or above 20 seconds, or a failed 400 meter walk, grades it severe. STRENGTH COMES FIRST, NOT MASS: the 2019 revision moved strength ahead of muscle mass deliberately, and probable sarcopenia is enough for intervention to begin. PERFORMANCE GRADES SEVERITY, IT DOES NOT DIAGNOSE. EVERY CUTOFF IS SEX-SPECIFIC.',
    compute: ewgsop2,
    fields: [
      { dom: 'ew-sex', arg: 'sex', kind: 'enum', required: false, label: 'Sex, for the cutoffs', values: ['male', 'female'] },
      { dom: 'ew-gripstrength', arg: 'gripStrength', kind: 'number', required: false, label: 'Grip strength, kg (low below 27 in men, 16 in women)', unit: 'kg' },
      { dom: 'ew-chairriseseconds', arg: 'chairRiseSeconds', kind: 'number', required: false, label: 'Five chair rises, seconds (low strength above 15)', unit: 's' },
      { dom: 'ew-asm', arg: 'asm', kind: 'number', required: false, label: 'Appendicular skeletal muscle mass, kg (low below 20 in men, 15 in women)', unit: 'kg' },
      { dom: 'ew-asmi', arg: 'asmi', kind: 'number', required: false, label: 'Muscle mass index, kg per square meter (low below 7.0 in men, 5.5 in women)', unit: 'kg/m2' },
      { dom: 'ew-gaitspeed', arg: 'gaitSpeed', kind: 'number', required: false, label: 'Gait speed, meters per second (low at or below 0.8)', unit: 'm/s' },
      { dom: 'ew-sppb', arg: 'sppb', kind: 'number', required: false, label: 'Short Physical Performance Battery, 0 to 12 (low at or below 8)' },
      { dom: 'ew-tugseconds', arg: 'tugSeconds', kind: 'number', required: false, label: 'Timed Up and Go, seconds (low at or above 20)', unit: 's' },
      { dom: 'ew-fourhundredmeterwalkfailed', arg: 'fourHundredMeterWalkFailed', kind: 'boolean', required: false, label: 'A 400 meter walk was not completed, or took 6 minutes or more' },
    ],
  },
];
