// Copyright (c) 2024-2026 Vipul Agrawal. All Rights Reserved.
// Proprietary and confidential. Unauthorized copying or distribution
// of this file, via any medium, is strictly prohibited.
'use strict';

const { TruckPacker } = require('./packer');

function optimize({ trucks, items, customers, config = {} }) {
  const allItems = [];
  for (const item of items) for (let i = 0; i < item.qty; i++) allItems.push({ ...item });

  // Sort order: volume desc (default), weight desc, or keep insertion order
  const sortOrder = config.sortOrder || 'volume_desc';
  if (sortOrder === 'weight_desc') {
    allItems.sort((a, b) => (b.weight || 0) - (a.weight || 0));
  } else {
    allItems.sort((a, b) => (b.length * b.width * b.height) - (a.length * a.width * a.height));
  }

  const packers = trucks.map(t => new TruckPacker(t, config));
  const unplaced  = [];
  const splitWarn = [];

  // Bucket items by customer; separate unassigned items
  const custMap = {};
  const unassignedItems = [];
  for (const item of allItems) {
    if (item.customerId == null) { unassignedItems.push(item); continue; }
    if (!custMap[item.customerId]) custMap[item.customerId] = [];
    custMap[item.customerId].push(item);
  }
  Object.values(custMap).forEach(arr =>
    arr.sort((a, b) => (b.length * b.width * b.height) - (a.length * a.width * a.height)));

  // ── Zone-based consolidation ─────────────────────────────────────────────
  // Group customers by delivery zone (case-insensitive).
  // Zones farther from the depot are packed first so those items sit near the
  // cab and are unloaded last — preserving stop-order inside the trailer.
  const zoneMap = {};
  for (const cust of customers) {
    const zk = (cust.zone || '').trim().toLowerCase() || `__nz_${cust.id}`;
    if (!zoneMap[zk]) zoneMap[zk] = { key: zk, customers: [], distance: 0 };
    zoneMap[zk].customers.push(cust);
    zoneMap[zk].distance = Math.max(zoneMap[zk].distance, cust.distance || 0);
  }

  // Sort zones: farther distance first (those items go deeper into the trailer)
  const sortedZones = Object.values(zoneMap)
    .sort((a, b) => b.distance - a.distance);

  // For each zone, track which packers have already received items from it.
  // When packing a new customer in the same zone, we prefer those packers first
  // — this keeps same-zone loads on the same truck(s).
  const zonePackerSets = {};
  for (const z of sortedZones) zonePackerSets[z.key] = new Set();

  for (const zone of sortedZones) {
    // Within a zone, process customers in reverse stop order (last stop near cab)
    const sortedCusts = [...zone.customers].sort((a, b) => b.stop - a.stop);

    for (const cust of sortedCusts) {
      const custItems = custMap[cust.id] || [];
      if (custItems.length === 0) continue;

      const custTruckMap = {};

      for (const item of custItems) {
        let placed = false;
        // Priority: 1) trucks already used for this zone, 2) trucks already
        // used for this specific customer, 3) any remaining truck.
        const zonePreferred = [...zonePackerSets[zone.key]];
        const custPreferred = Object.keys(custTruckMap).map(Number)
          .filter(i => !zonePreferred.includes(i));
        const others = packers.map((_, i) => i)
          .filter(i => !zonePreferred.includes(i) && !custPreferred.includes(i));
        const order = [...zonePreferred, ...custPreferred, ...others];

        for (const ti of order) {
          if (packers[ti].tryPlace(item)) {
            custTruckMap[ti] = (custTruckMap[ti] || 0) + 1;
            zonePackerSets[zone.key].add(ti);
            placed = true;
            break;
          }
        }
        if (!placed) unplaced.push(item);
      }

      if (Object.keys(custTruckMap).length > 1) {
        splitWarn.push({ name: cust.name, trucks: Object.keys(custTruckMap).map(i => trucks[i]?.name) });
      }
    }
  }

  // Pack unassigned items into whatever truck has room
  unassignedItems.sort((a, b) => (b.length * b.width * b.height) - (a.length * a.width * a.height));
  for (const item of unassignedItems) {
    let placed = false;
    for (const packer of packers) { if (packer.tryPlace(item)) { placed = true; break; } }
    if (!placed) unplaced.push(item);
  }

  return { packers, unplaced, splitWarn };
}

module.exports = { optimize };
