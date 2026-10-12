// spec-v1638 MCP adapter: inventory-turns in lib/inventory-turns-v1638.js. The dom keys mirror
// views/group-v1638.js and META['inventory-turns'].example. Administrative domain. No clock.

import { inventoryTurns } from '../../lib/inventory-turns-v1638.js';

export default [
  {
    id: 'inventory-turns',
    summary: 'Inventory turnover, days on hand and a reorder point for a pharmacy. Turns are cost of goods sold over average inventory, annualized by the days in the period; the reorder point is daily use times lead time plus safety stock. Shows the dollars tied up above a target the caller enters. Stated arithmetic, with no benchmark.',
    compute: inventoryTurns,
    fields: [
      { dom: 'inv-cogs', arg: 'cogs', kind: 'number', label: 'Cost of goods sold for the period', unit: 'dollars' },
      { dom: 'inv-days', arg: 'periodDays', kind: 'number', label: 'Days in the period', unit: 'days' },
      { dom: 'inv-begin', arg: 'beginningInventory', kind: 'number', label: 'Beginning inventory at cost', unit: 'dollars' },
      { dom: 'inv-end', arg: 'endingInventory', kind: 'number', label: 'Ending inventory at cost', unit: 'dollars' },
      { dom: 'inv-target', arg: 'targetDaysOnHand', kind: 'number', label: 'Target days on hand', unit: 'days' },
      { dom: 'inv-use', arg: 'dailyUse', kind: 'number', label: 'One item, average daily use', unit: 'units' },
      { dom: 'inv-lead', arg: 'leadTimeDays', kind: 'number', label: 'One item, supplier lead time', unit: 'days' },
      { dom: 'inv-safety', arg: 'safetyStock', kind: 'number', label: 'One item, safety stock (0 if none)', unit: 'units' },
    ],
  },
];
