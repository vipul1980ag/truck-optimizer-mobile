'use strict';

const RES = 0.5;
const CORRIDOR_THRESHOLD = 200; // miles: zones within this range can be consolidated

class TruckPacker {
  constructor(truck) {
    this.truck = truck;
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
              if (h2 > maxH) { maxH = h2; if (maxH + ih > this.truck.height + 0.001) { ok = false; break outer; } }
            }
          }
          if (ok && maxH + ih <= this.truck.height + 0.001) {
            const score = maxH * 1e7 + gz * 1e4 + gx;
            if (score < bestScore) { bestScore = score; best = { x: gx*RES, y: maxH, z: gz*RES, w: iw, h: ih, d: id, gx, gz, gw, gd }; }
          }
        }
      }
    }

    if (!best) return null;
    const newTop = best.y + best.h;
    for (let dz = 0; dz < best.gd; dz++) { const row = this.hmap[best.gz + dz]; for (let dx = 0; dx < best.gw; dx++) row[best.gx + dx] = newTop; }
    this.usedWeight += itemTotalWeight;

    const cid = item.customerId;
    if (cid != null) {
      if (!this.customerZones[cid]) this.customerZones[cid] = { minZ: Infinity, maxZ: -Infinity };
      this.customerZones[cid].minZ = Math.min(this.customerZones[cid].minZ, best.z);
      this.customerZones[cid].maxZ = Math.max(this.customerZones[cid].maxZ, best.z + best.d);
    }

    const pl = { itemId: item.id, name: item.name, customerId: cid, x: best.x, y: best.y, z: best.z, w: best.w, h: best.h, d: best.d };
    this.placements.push(pl);
    return pl;
  }
}

module.exports = { TruckPacker, RES, CORRIDOR_THRESHOLD };
