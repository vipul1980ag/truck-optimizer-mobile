'use strict';

const { CORRIDOR_THRESHOLD } = require('./packer');

function analyzeRoutes({ customers, items, trucks, carriers }) {
  // Cargo per customer (from items)
  const custCargo = {};
  for (const item of items) {
    if (item.customerId == null) continue;
    if (!custCargo[item.customerId]) custCargo[item.customerId] = { vol: 0, wt: 0 };
    custCargo[item.customerId].vol += item.length * item.width * item.height * item.qty;
    custCargo[item.customerId].wt  += item.weight * item.qty;
  }

  // Group customers by zone (case-insensitive)
  const zoneMap = {};
  for (const cust of customers) {
    const key = (cust.zone || '').trim().toLowerCase() || '(no zone)';
    const display = cust.zone?.trim() || '(No Zone)';
    if (!zoneMap[key]) zoneMap[key] = { zone: display, customers: [], distance: 0, totalVol: 0, totalWt: 0 };
    zoneMap[key].customers.push(cust);
    zoneMap[key].distance = Math.max(zoneMap[key].distance, cust.distance || 0);
    const cargo = custCargo[cust.id] || { vol: 0, wt: 0 };
    zoneMap[key].totalVol += cargo.vol;
    zoneMap[key].totalWt  += cargo.wt;
  }

  // Master truck list: own fleet + all external carrier trucks
  const allOptions = [];
  for (const t of trucks) {
    allOptions.push({ carrierName: 'Own Fleet', carrierType: 'own', truckName: t.name,
      vol: t.length * t.width * t.height, maxWt: t.maxWt, baseRate: t.baseRate || 0, ratePerMi: t.ratePerMi || 0 });
  }
  for (const carrier of carriers) {
    for (const ct of carrier.trucks) {
      allOptions.push({ carrierName: carrier.name, carrierType: 'external', truckName: ct.name,
        vol: ct.length * ct.width * ct.height, maxWt: ct.maxWt, baseRate: ct.baseRate || 0, ratePerMi: ct.ratePerMi || 0 });
    }
  }

  // Per-zone options
  const zoneGroups = Object.values(zoneMap).map(zg => {
    const dist = zg.distance;
    const options = allOptions.map(t => {
      const hasCost = (t.baseRate > 0 || t.ratePerMi > 0);
      const cost = hasCost ? (t.baseRate + dist * t.ratePerMi) : null;
      const volPct = t.vol > 0 ? Math.round(zg.totalVol / t.vol * 100) : 999;
      const wtPct  = t.maxWt > 0 ? Math.round(zg.totalWt  / t.maxWt * 100) : 999;
      const fits = volPct <= 100 && wtPct <= 100;
      return { carrierName: t.carrierName, carrierType: t.carrierType, truckName: t.truckName, cost, volPct, wtPct, fits };
    });
    // Sort: fits first, then cheapest (nulls last)
    options.sort((a, b) => {
      if (a.fits !== b.fits) return a.fits ? -1 : 1;
      if (a.cost == null && b.cost == null) return 0;
      if (a.cost == null) return 1;
      if (b.cost == null) return -1;
      return a.cost - b.cost;
    });
    const bestFit = options.find(o => o.fits && o.cost != null);
    if (bestFit) bestFit.recommended = true;
    return { ...zg, options, bestFit };
  });

  // Cross-zone consolidation
  const consolidations = [];
  for (let i = 0; i < zoneGroups.length; i++) {
    for (let j = i + 1; j < zoneGroups.length; j++) {
      const g1 = zoneGroups[i], g2 = zoneGroups[j];
      const distDiff = Math.abs(g1.distance - g2.distance);
      if (distDiff > CORRIDOR_THRESHOLD) continue;
      const combVol = g1.totalVol + g2.totalVol;
      const combWt  = g1.totalWt  + g2.totalWt;
      const maxDist = Math.max(g1.distance, g2.distance);
      if (!g1.bestFit || !g2.bestFit) continue;
      const separateCost = g1.bestFit.cost + g2.bestFit.cost;
      let bestCombined = null;
      for (const t of allOptions) {
        if (combVol <= t.vol && combWt <= t.maxWt && (t.baseRate > 0 || t.ratePerMi > 0)) {
          const cost = t.baseRate + maxDist * t.ratePerMi;
          if (!bestCombined || cost < bestCombined.cost) {
            bestCombined = { carrierName: t.carrierName, truckName: t.truckName, cost };
          }
        }
      }
      if (bestCombined && bestCombined.cost < separateCost) {
        consolidations.push({
          zones: [g1.zone, g2.zone], distDiff,
          separateCost, combinedCost: bestCombined.cost,
          savings: separateCost - bestCombined.cost,
          recommendation: bestCombined,
          g1Best: g1.bestFit, g2Best: g2.bestFit
        });
      }
    }
  }
  consolidations.sort((a, b) => b.savings - a.savings);
  return { zoneGroups, consolidations };
}

module.exports = { analyzeRoutes };
