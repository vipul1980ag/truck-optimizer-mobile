'use strict';

const RES = 0.5;
const CORRIDOR_THRESHOLD = 200; // miles: zones within this range can be consolidated

class TruckPacker {
  constructor(truck, config = {}) {
    this.truck = truck;
    this.config = {
      stackAxis:  config.stackAxis  || 'height_first', // height_first | length_first | width_first
      centerMass: config.centerMass || false,           // shift center of mass to truck midpoint
      loadFrom:   config.loadFrom   || 'back',          // back (rear door) | front (cab end)
    };
    this.placements = [];
    this.usedWeight = 0;
    this.gW = Math.ceil(truck.width  / RES) + 1;
    this.gL = Math.ceil(truck.length / RES) + 1;
    this.hmap = Array.from({ length: this.gL }, () => new Float32Array(this.gW));
    this.customerZones = {};
  }

  orientations(item) {
    const { length: l, width: w, height: h } = item;
    const all = [[w,h,l],[l,h,w],[w,l,h],[l,w,h],[h,w,l],[h,l,w]];
    const seen = new Set();
    return all.filter(([iw,ih,id]) => {
      const k = `${iw},${ih},${id}`;
      if (seen.has(k)) return false; seen.add(k);
      return iw <= this.truck.width  + 0.001 &&
             ih <= this.truck.height + 0.001 &&
             id <= this.truck.length + 0.001;
    });
  }

  tryPlace(item) {
    const itemTotalWeight = (item.weight || 0) + (item.packagingWeight || 0);
    if (this.usedWeight + itemTotalWeight > this.truck.maxWt + 0.001) return null;
    const orients = item.rotate ? this.orientations(item) : [[item.width, item.height, item.length]];
    let best = null, bestScore = Infinity;

    const { stackAxis, centerMass, loadFrom } = this.config;
    const truckMidZ = this.truck.length / 2;

    for (const [iw, ih, id] of orients) {
      const gw = Math.max(1, Math.ceil(iw / RES));
      const gd = Math.max(1, Math.ceil(id / RES));
      const maxGX = this.gW - gw, maxGZ = this.gL - gd;
      if (maxGX < 0 || maxGZ < 0) continue;

      for (let gz = 0; gz <= maxGZ; gz++) {
        for (let gx = 0; gx <= maxGX; gx++) {
          let maxH = 0, ok = true;
          outer: for (let dz = 0; dz < gd; dz++) {
            const row = this.hmap[gz + dz];
            for (let dx = 0; dx < gw; dx++) {
              const h2 = row[gx + dx];
              if (h2 > maxH) {
                maxH = h2;
                if (maxH + ih > this.truck.height + 0.001) { ok = false; break outer; }
              }
            }
          }
          if (ok && maxH + ih <= this.truck.height + 0.001) {
            // Depth score: loadFrom 'back' = fill near rear door first (low gz),
            //              loadFrom 'front' = fill near cab first (high gz)
            const depthScore = loadFrom === 'front' ? (maxGZ - gz) : gz;

            let score;
            if (stackAxis === 'length_first') {
              // Fill along truck length first, then height, then width
              score = depthScore * 1e7 + maxH * 1e4 + gx;
            } else if (stackAxis === 'width_first') {
              // Fill along truck width first, then height, then length
              score = gx * 1e7 + maxH * 1e4 + depthScore;
            } else {
              // height_first (default): minimize stack height, then fill by depth, then width
              score = maxH * 1e7 + depthScore * 1e4 + gx;
            }

            // Shift mass to center: penalise positions far from truck's longitudinal midpoint
            if (centerMass) {
              const itemCenterZ = (gz + gd / 2) * RES;
              const distFromCenter = Math.abs(itemCenterZ - truckMidZ);
              score += distFromCenter * 500;
            }

            if (score < bestScore) {
              bestScore = score;
              best = { x: gx*RES, y: maxH, z: gz*RES, w: iw, h: ih, d: id, gx, gz, gw, gd };
            }
          }
        }
      }
    }

    if (!best) return null;

    const newTop = best.y + best.h;
    // If item is not stackable, block its footprint up to ceiling height so
    // nothing can be placed on top of it.
    const mapTop = (item.stackable === false) ? this.truck.height : newTop;
    for (let dz = 0; dz < best.gd; dz++) {
      const row = this.hmap[best.gz + dz];
      for (let dx = 0; dx < best.gw; dx++) row[best.gx + dx] = mapTop;
    }
    this.usedWeight += itemTotalWeight;

    const cid = item.customerId;
    if (cid != null) {
      if (!this.customerZones[cid]) this.customerZones[cid] = { minZ: Infinity, maxZ: -Infinity };
      this.customerZones[cid].minZ = Math.min(this.customerZones[cid].minZ, best.z);
      this.customerZones[cid].maxZ = Math.max(this.customerZones[cid].maxZ, best.z + best.d);
    }

    const pl = { itemId: item.id, name: item.name, customerId: cid, x: best.x, y: best.y, z: best.z, w: best.w, h: best.h, d: best.d, stackable: item.stackable };
    this.placements.push(pl);
    return pl;
  }
}

module.exports = { TruckPacker, RES, CORRIDOR_THRESHOLD };
