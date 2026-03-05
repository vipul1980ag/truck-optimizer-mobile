import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useWizard } from '../../WizardContext';
import { api } from '../../api';

// ── Truck suggestion (mirrors ReviewCargoScreen) ──────────────────────────────
function suggestTruck(trucks, totalWeight, totalVol, hasDG, hasFragile, category) {
  const semi = trucks.find(t => t.maxWt >= 30000) || trucks[0];
  const box  = trucks.find(t => t.maxWt <  30000) || trucks[0];
  if (!semi || !box) return null;
  const boxVol = box.length * box.width * box.height;
  if (hasDG)                     return semi;
  if (totalWeight > box.maxWt)   return semi;
  if (totalVol > boxVol * 0.9)   return semi;
  if (category === 'industrial') return semi;
  if (hasFragile)                return box;
  return box;
}

// ── Build self-contained Three.js HTML ────────────────────────────────────────
// Coordinate system used throughout:
//   X = along truck length  (0 … truck.length)
//   Y = vertical / height   (0 … truck.height)
//   Z = along truck width   (0 … truck.width)
//
// Three.js BoxGeometry(xSize, ySize, zSize) matches this directly.
//
function buildVizHTML(items, truck, customers = []) {
  const COLORS = [
    '#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6',
    '#06b6d4','#ec4899','#84cc16','#f97316','#14b8a6',
    '#a78bfa','#34d399','#fbbf24','#f87171','#60a5fa',
  ];
  const nameColors = {};
  let ci = 0;
  items.forEach(i => { if (!nameColors[i.name]) nameColors[i.name] = COLORS[ci++ % COLORS.length]; });

  const hasCustomers = customers.length > 0;
  const customerInfo = {};
  if (hasCustomers) {
    customers.forEach((c, idx) => {
      customerInfo[String(c._id)] = { name: c.name, color: COLORS[idx % COLORS.length] };
    });
  }

  // Pass items and truck into the HTML as a JSON literal.
  // The packing algorithm runs entirely inside the WebView.
  const DATA = JSON.stringify({ items, truck, nameColors, hasCustomers, customerInfo });

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; overflow: hidden; background: #0f172a; font-family: Arial, sans-serif; }
    canvas { display: block; }
    #hint  { position:absolute; top:8px; left:0; right:0; text-align:center;
             color:#94a3b8; font-size:11px; pointer-events:none; }
    #info  { position:absolute; top:8px; left:8px; right:8px; display:none;
             align-items:center; gap:8px; background:rgba(15,23,42,0.92);
             padding:7px 12px; border-radius:10px; border:1px solid #3b82f6; }
    #iname { color:#f1f5f9; font-size:11px; font-weight:700; flex:1; }
    #ireset{ background:#1e3a5f; border:1px solid #3b82f6; color:#60a5fa;
             font-size:10px; font-weight:700; padding:5px 10px; border-radius:6px;
             cursor:pointer; white-space:nowrap; }
    #stats { position:absolute; bottom:6px; left:8px; right:8px;
             color:#94a3b8; font-size:10px; background:rgba(15,23,42,0.75);
             padding:5px 10px; border-radius:8px; pointer-events:none; }
    #legend{ position:absolute; top:28px; right:6px; max-width:140px;
             background:rgba(15,23,42,0.88); border-radius:8px; padding:6px 8px;
             border:1px solid #1e3a5f; }
    .lrow  { display:flex; align-items:center; gap:5px; margin-bottom:3px; }
    .ldot  { width:10px; height:10px; border-radius:3px; flex-shrink:0; }
    .lname { color:#cbd5e1; font-size:9px; white-space:nowrap; overflow:hidden;
             text-overflow:ellipsis; max-width:110px; }
  </style>
</head>
<body>
<div id="hint">Drag to rotate &nbsp;·&nbsp; Pinch to zoom &nbsp;·&nbsp; Tap a box to move it</div>
<div id="info"><span id="iname"></span><button id="ireset" onclick="resetPositions()">&#8635; Reset All</button><button id="ireset" onclick="deselect()" style="background:#1e3a5f;border:1px solid #475569;color:#94a3b8;font-size:10px;font-weight:700;padding:5px 8px;border-radius:6px;cursor:pointer;">&#10005; Done</button></div>
<div id="stats">Packing&#8230;</div>
<div id="legend"></div>

<script src="https://cdn.jsdelivr.net/npm/three@0.134/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.134/examples/js/controls/OrbitControls.js"></script>
<script>
// ─── DATA ─────────────────────────────────────────────────────────────────────
const DATA = ${DATA};
const truck = DATA.truck;  // { name, length, height, width, maxWt }
const TL = truck.length, TH = truck.height, TW = truck.width;

// ─── 3D Guillotine Bin-Packing ────────────────────────────────────────────────
function pack(items) {
  const boxes = [];
  items.forEach(item => {
    const qty = Math.max(1, parseInt(item.qty) || 1);
    for (let q = 0; q < qty; q++) {
      boxes.push({
        name:       item.name,
        customerId: item.customerId || null,
        il:        parseFloat(item.length) || 1,
        ih:        parseFloat(item.height) || 1,
        iw:        parseFloat(item.width)  || 1,
        stackable: item.stackable !== false,
        isFragile: item.isFragile || false,
        isDG:      item.isDG || false,
      });
    }
  });

  // Sort: non-stackable first, fragile last, then largest volume first
  boxes.sort((a, b) => {
    if (!a.stackable && b.stackable) return -1;
    if (a.stackable && !b.stackable) return  1;
    if (!a.isFragile && b.isFragile) return -1;
    if (a.isFragile && !b.isFragile) return  1;
    return (b.il * b.ih * b.iw) - (a.il * a.ih * a.iw);
  });

  const placements = [];
  const unplaced   = [];
  let spaces = [{ x:0, y:0, z:0, l:TL, h:TH, w:TW }];

  for (const box of boxes) {
    const orients = [
      [box.il, box.ih, box.iw], [box.iw, box.ih, box.il],
      [box.il, box.iw, box.ih], [box.iw, box.il, box.ih],
      [box.ih, box.il, box.iw], [box.ih, box.iw, box.il],
    ];
    const sorted = spaces.slice().sort((a, b) => {
      if (box.isFragile) return b.y - a.y || (a.l*a.h*a.w) - (b.l*b.h*b.w);
      return a.y - b.y || (a.l*a.h*a.w) - (b.l*b.h*b.w);
    });
    let placed = false;
    for (const sp of sorted) {
      for (const [ol, oh, ow] of orients) {
        if (ol > sp.l + 0.001 || oh > sp.h + 0.001 || ow > sp.w + 0.001) continue;
        placements.push({ x:sp.x, y:sp.y, z:sp.z, l:ol, h:oh, w:ow,
          name: box.name, customerId: box.customerId,
          stackable: box.stackable, isFragile: box.isFragile, isDG: box.isDG });
        spaces = spaces.filter(s => s !== sp);
        const rl = sp.l - ol, rw = sp.w - ow, rh = sp.h - oh;
        if (rl >= rw) {
          if (rl > 0.01) spaces.push({ x:sp.x+ol, y:sp.y, z:sp.z, l:rl, h:sp.h, w:sp.w });
          if (rw > 0.01) spaces.push({ x:sp.x, y:sp.y, z:sp.z+ow, l:ol, h:sp.h, w:rw });
        } else {
          if (rw > 0.01) spaces.push({ x:sp.x, y:sp.y, z:sp.z+ow, l:sp.l, h:sp.h, w:rw });
          if (rl > 0.01) spaces.push({ x:sp.x+ol, y:sp.y, z:sp.z, l:rl, h:oh, w:ow });
        }
        // Top space: only when stackable AND not fragile
        if (rh > 0.01 && box.stackable && !box.isFragile) {
          spaces.push({ x:sp.x, y:sp.y+oh, z:sp.z, l:ol, h:rh, w:ow });
        }
        placed = true; break;
      }
      if (placed) break;
    }
    if (!placed) unplaced.push(box);
  }
  return { placements, unplaced };
}

const { placements, unplaced } = pack(DATA.items);

// ─── Three.js Setup ───────────────────────────────────────────────────────────
const scene    = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a);
// No fog — it was hiding 60%+ of long trucks

const camera   = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping  = true;
controls.dampingFactor  = 0.12;
controls.minDistance    = 1;
controls.maxDistance    = 500;
controls.zoomSpeed      = 1.5;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.65));
const sun = new THREE.DirectionalLight(0xffffff, 0.85);
sun.position.set(TL * 0.8, TH * 3, TW * 1.5);
scene.add(sun);
const fill = new THREE.DirectionalLight(0x6688cc, 0.3);
fill.position.set(-TL, TH, -TW);
scene.add(fill);

// ─── Truck shell ──────────────────────────────────────────────────────────────
const truckCenter = new THREE.Vector3(TL / 2, TH / 2, TW / 2);

const wallMat = new THREE.MeshLambertMaterial({ color: 0x1e3a5f, opacity: 0.12, transparent: true, side: THREE.BackSide });
const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(TL, TH, TW), wallMat);
wallMesh.position.copy(truckCenter);
scene.add(wallMesh);

const truckEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(TL, TH, TW));
const truckLine  = new THREE.LineSegments(truckEdges, new THREE.LineBasicMaterial({ color: 0x3b82f6, opacity: 0.7, transparent: true }));
truckLine.position.copy(truckCenter);
scene.add(truckLine);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(TL, TW),
  new THREE.MeshLambertMaterial({ color: 0x0f2a4a, side: THREE.DoubleSide })
);
floor.rotation.x = -Math.PI / 2;
floor.position.set(TL / 2, 0.001, TW / 2);
scene.add(floor);

const grid = new THREE.GridHelper(Math.max(TL, TW) * 1.05, 20, 0x1e3a5f, 0x1e3a5f);
grid.position.set(TL / 2, 0.002, TW / 2);
scene.add(grid);

// ─── Truck dimension annotations (permanent, amber) ────────────────────────
// Function declarations are hoisted so dimLine() can be called here.
const truckDimGrp = new THREE.Group();
// LENGTH — bottom edge of the visible long side (z=TW face), pushed downward
dimLine(truckDimGrp,
  new THREE.Vector3(0, 0, TW), new THREE.Vector3(TL, 0, TW),
  new THREE.Vector3(0, -1, 0));
// BREADTH — bottom edge of the right end face (x=TL), pushed outward in +X
dimLine(truckDimGrp,
  new THREE.Vector3(TL, 0, 0), new THREE.Vector3(TL, 0, TW),
  new THREE.Vector3(1, 0, 0));
// HEIGHT — near-right vertical edge (x=TL, z=TW), pushed out diagonally
dimLine(truckDimGrp,
  new THREE.Vector3(TL, 0, TW), new THREE.Vector3(TL, TH, TW),
  new THREE.Vector3(1, 0, 1));
scene.add(truckDimGrp);

// ─── Label sprite helper ──────────────────────────────────────────────────────
function hexToRgb(hex) {
  const n = parseInt(hex.replace('#',''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function makeLabel(text, hexColor, lineTwo, dimText) {
  const CW = 1024;
  const CH = lineTwo ? (dimText ? 430 : 320) : (dimText ? 290 : 200);
  const canvas = document.createElement('canvas');
  canvas.width = CW; canvas.height = CH;
  const ctx = canvas.getContext('2d');

  const [r, g, b] = hexToRgb(hexColor);
  const dr = Math.max(0, r - 60), dg = Math.max(0, g - 60), db = Math.max(0, b - 60);
  ctx.fillStyle = 'rgba(' + dr + ',' + dg + ',' + db + ',0.93)';
  const rd = 20;
  ctx.beginPath();
  ctx.moveTo(rd, 0); ctx.lineTo(CW - rd, 0);
  ctx.quadraticCurveTo(CW, 0, CW, rd);
  ctx.lineTo(CW, CH - rd);
  ctx.quadraticCurveTo(CW, CH, CW - rd, CH);
  ctx.lineTo(rd, CH);
  ctx.quadraticCurveTo(0, CH, 0, CH - rd);
  ctx.lineTo(0, rd);
  ctx.quadraticCurveTo(0, 0, rd, 0);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',0.7)';
  ctx.fillRect(0, 0, CW, 10);

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

  // Line 1 — item name
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 72px Arial';
  let t = text;
  while (t.length > 1 && ctx.measureText(t).width > CW - 40) t = t.slice(0, -1);
  if (t !== text) t += '\u2026';
  const nameY = lineTwo ? 85 : (dimText ? 85 : CH / 2);
  ctx.fillText(t, CW / 2, nameY);

  // Line 2 — customer / DG / fragile sub-label
  if (lineTwo) {
    ctx.fillStyle = 'rgba(255,255,255,0.80)'; ctx.font = 'bold 54px Arial';
    let t2 = lineTwo;
    while (t2.length > 1 && ctx.measureText(t2).width > CW - 40) t2 = t2.slice(0, -1);
    if (t2 !== lineTwo) t2 += '\u2026';
    ctx.fillText(t2, CW / 2, dimText ? 205 : 220);
  }

  // Line 3 — dimensions
  if (dimText) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '40px Arial';
    ctx.fillText(dimText, CW / 2, lineTwo ? 340 : 205);
  }

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
  return new THREE.Sprite(mat);
}

// ─── Dimension annotation helpers ─────────────────────────────────────────────
function makeDimSprite(text, lineLen) {
  const CW = 320, CH = 72;
  const canvas = document.createElement('canvas');
  canvas.width = CW; canvas.height = CH;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(10,18,36,0.82)';
  const rd = 10;
  ctx.beginPath();
  ctx.moveTo(rd,0); ctx.lineTo(CW-rd,0); ctx.quadraticCurveTo(CW,0,CW,rd);
  ctx.lineTo(CW,CH-rd); ctx.quadraticCurveTo(CW,CH,CW-rd,CH);
  ctx.lineTo(rd,CH); ctx.quadraticCurveTo(0,CH,0,CH-rd);
  ctx.lineTo(0,rd); ctx.quadraticCurveTo(0,0,rd,0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(251,191,36,0.6)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 44px Arial';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, CW / 2, CH / 2);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
  const sp = new THREE.Sprite(mat);
  const w = Math.max(lineLen * 0.55, 1.1);
  sp.scale.set(w, w * (CH / CW), 1);
  return sp;
}

function dimLine(grp, from, to, perpDir, color) {
  const clr = color || 0xfbbf24;
  const pd  = perpDir.clone().normalize();
  const OFF = 0.55, TICK = 0.32;
  const f   = from.clone().add(pd.clone().multiplyScalar(OFF));
  const t2  = to.clone().add(pd.clone().multiplyScalar(OFF));
  const lm  = new THREE.LineBasicMaterial({ color: clr });
  const em  = new THREE.LineBasicMaterial({ color: clr, opacity: 0.35, transparent: true });
  // Main line
  grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([f, t2]), lm));
  // Extension lines from surface to dim line
  grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([from.clone(), f.clone()]), em));
  grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([to.clone(), t2.clone()]), em));
  // Tick marks
  const lineDir = t2.clone().sub(f).normalize();
  const tickDir = new THREE.Vector3().crossVectors(lineDir, pd).normalize().multiplyScalar(TICK);
  [f, t2].forEach(pt => {
    grp.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([pt.clone().sub(tickDir), pt.clone().add(tickDir)]), lm
    ));
  });
  // Label at midpoint
  const mid = f.clone().add(t2).multiplyScalar(0.5).add(pd.clone().multiplyScalar(0.35));
  const dist = parseFloat(from.distanceTo(to).toFixed(1));
  const sp = makeDimSprite(dist + ' ft', dist);
  sp.position.copy(mid);
  grp.add(sp);
}

// ─── Render placements ────────────────────────────────────────────────────────
const boxObjects = [];
placements.forEach(p => {
  const custKey = p.customerId != null ? String(p.customerId) : null;
  const color = DATA.hasCustomers && custKey && DATA.customerInfo[custKey]
    ? DATA.customerInfo[custKey].color
    : (DATA.nameColors[p.name] || '#64748b');

  const gap = 0.04;
  const geo = new THREE.BoxGeometry(Math.max(p.l - gap, 0.05), Math.max(p.h - gap, 0.05), Math.max(p.w - gap, 0.05));
  const mat = new THREE.MeshLambertMaterial({ color, opacity: 0.80, transparent: true });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(p.x + p.l / 2, p.y + p.h / 2, p.z + p.w / 2);
  scene.add(mesh);

  const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.18, transparent: true });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
  edges.position.copy(mesh.position);
  scene.add(edges);

  const custName = DATA.hasCustomers && custKey && DATA.customerInfo[custKey]
    ? DATA.customerInfo[custKey].name : null;
  const subLabel = custName
    ? '\uD83D\uDC64 ' + custName
    : p.isDG ? '\u26a0 Dangerous Goods' : p.isFragile ? '\uD83D\uDD14 Handle with care' : null;
  const dimText = p.l + '\xD7' + p.w + '\xD7' + p.h + ' ft';
  const sprite = makeLabel(p.name, color, subLabel, dimText);
  const sw = Math.max(Math.min(p.l, p.w) * 1.1, 1.8);
  const CH = subLabel ? 430 : 290;
  sprite.scale.set(sw, sw * (CH / 1024), 1);
  sprite.position.set(p.x + p.l / 2, p.y + p.h / 2, p.z + p.w / 2);
  scene.add(sprite);

  const origPos = new THREE.Vector3(p.x + p.l / 2, p.y + p.h / 2, p.z + p.w / 2);
  boxObjects.push({ mesh, edges, sprite, mat, placement: p, origPos });
});

// ─── Legend ───────────────────────────────────────────────────────────────────
const legendEl = document.getElementById('legend');
if (DATA.hasCustomers) {
  Object.values(DATA.customerInfo).forEach(function(ci) {
    const row = document.createElement('div');
    row.className = 'lrow';
    row.innerHTML = '<div class="ldot" style="background:' + ci.color + '"></div><span class="lname">' + ci.name + '</span>';
    legendEl.appendChild(row);
  });
} else {
  const seen = {};
  placements.forEach(p => { seen[p.name] = DATA.nameColors[p.name] || '#64748b'; });
  Object.entries(seen).forEach(function([name, color]) {
    const row = document.createElement('div');
    row.className = 'lrow';
    row.innerHTML = '<div class="ldot" style="background:' + color + '"></div><span class="lname">' + name + '</span>';
    legendEl.appendChild(row);
  });
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
const totalUnits = DATA.items.reduce((s, i) => s + (parseInt(i.qty) || 1), 0);
const placedVol  = placements.reduce((s, p) => s + p.l * p.h * p.w, 0);
const truckVol   = TL * TH * TW;
const utilPct    = Math.min(Math.round(placedVol / truckVol * 100), 100);
const statsEl    = document.getElementById('stats');
statsEl.innerHTML =
  '<span style="color:#60a5fa;font-weight:700;">\uD83D\uDE9B ' + truck.name + '</span>'
  + ' \u00B7 <span style="color:#94a3b8;">' + TL + '\xD7' + TW + '\xD7' + TH + ' ft</span>'
  + ' \u00B7 <span style="color:#cbd5e1;">' + truck.maxWt.toLocaleString() + ' lbs max</span>'
  + ' | ' + placements.length + '/' + totalUnits + ' units'
  + ' \u00B7 ' + utilPct + '% vol'
  + (unplaced.length ? ' \u00B7 <span style="color:#fbbf24">\u26a0 ' + unplaced.length + ' unplaced</span>' : '');

// ─── Camera ───────────────────────────────────────────────────────────────────
// Use cross-section diagonal (H×W) instead of full 3D diagonal so the truck
// length doesn't push the camera too far away (which made the truck look tiny).
const crossDiag = Math.sqrt(TH * TH + TW * TW);
const fovRad    = 28 * Math.PI / 180;
const camDist   = crossDiag / (2 * Math.tan(fovRad / 2) * 0.70);
const dn        = Math.sqrt(0.55 * 0.55 + 0.55 * 0.55 + 0.85 * 0.85);
camera.position.set(
  truckCenter.x + camDist * 0.55 / dn,
  truckCenter.y + camDist * 0.55 / dn,
  truckCenter.z + camDist * 0.85 / dn
);
camera.lookAt(truckCenter);
controls.target.copy(truckCenter);
controls.update();

// ─── Drag-to-move interaction ─────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse2d   = new THREE.Vector2();
const dragPlane = new THREE.Plane();
const dragStart = new THREE.Vector3();
const objStart  = new THREE.Vector3();
let selected    = null;
let isDragging  = false;

// Box dimension annotations (cyan, shown on select / hidden on deselect)
let boxDimGrp = null;
function showBoxDims(obj) {
  if (boxDimGrp) { scene.remove(boxDimGrp); boxDimGrp = null; }
  const p  = obj.placement;
  const mx = obj.mesh.position.x - p.l / 2;
  const my = obj.mesh.position.y - p.h / 2;
  const mz = obj.mesh.position.z - p.w / 2;
  boxDimGrp = new THREE.Group();
  dimLine(boxDimGrp,
    new THREE.Vector3(mx,       my, mz),
    new THREE.Vector3(mx + p.l, my, mz),
    new THREE.Vector3(0, 0, -1), 0x22d3ee);
  dimLine(boxDimGrp,
    new THREE.Vector3(mx + p.l, my,    mz),
    new THREE.Vector3(mx + p.l, my,    mz + p.w),
    new THREE.Vector3(1, 0, 0), 0x22d3ee);
  dimLine(boxDimGrp,
    new THREE.Vector3(mx + p.l, my,        mz),
    new THREE.Vector3(mx + p.l, my + p.h,  mz),
    new THREE.Vector3(1, 0, -1), 0x22d3ee);
  scene.add(boxDimGrp);
}
function hideBoxDims() {
  if (boxDimGrp) { scene.remove(boxDimGrp); boxDimGrp = null; }
}

function deselect() {
  if (selected) {
    selected.mat.emissive.set(0x000000);
    selected.mat.opacity = 0.80;
    selected.edges.material.opacity = 0.18;
    selected = null;
  }
  hideBoxDims();
  document.getElementById('hint').style.display = '';
  document.getElementById('info').style.display = 'none';
  controls.enabled = true;
}

function selectObj(obj) {
  if (selected && selected !== obj) deselect();
  selected = obj;
  obj.mat.emissive = new THREE.Color(0x334466);
  obj.mat.opacity  = 1.0;
  obj.edges.material.opacity = 0.6;
  showBoxDims(obj);
  document.getElementById('hint').style.display = 'none';
  document.getElementById('info').style.display = 'flex';
  const p2 = obj.placement;
  document.getElementById('iname').textContent =
    '\u270F ' + p2.name + '  \u2014  ' + p2.l + '\xD7' + p2.w + '\xD7' + p2.h + ' ft  \u00B7  drag to move';
}

function resetPositions() {
  boxObjects.forEach(o => {
    o.mesh.position.copy(o.origPos);
    o.edges.position.copy(o.origPos);
    o.sprite.position.copy(o.origPos);
  });
  deselect();
}

function getPointerNDC(e) {
  const r = renderer.domElement.getBoundingClientRect();
  const cx = e.clientX !== undefined ? e.clientX : (e.touches ? e.touches[0].clientX : 0);
  const cy = e.clientY !== undefined ? e.clientY : (e.touches ? e.touches[0].clientY : 0);
  mouse2d.x =  ((cx - r.left) / r.width)  * 2 - 1;
  mouse2d.y = -((cy - r.top)  / r.height) * 2 + 1;
}

renderer.domElement.addEventListener('pointerdown', function(e) {
  if (e.button !== undefined && e.button !== 0) return;
  getPointerNDC(e);
  raycaster.setFromCamera(mouse2d, camera);
  const hits = raycaster.intersectObjects(boxObjects.map(o => o.mesh));
  if (hits.length) {
    const obj = boxObjects.find(o => o.mesh === hits[0].object);
    selectObj(obj);
    controls.enabled = false;
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    dragPlane.setFromNormalAndCoplanarPoint(camDir.negate(), hits[0].point);
    raycaster.ray.intersectPlane(dragPlane, dragStart);
    objStart.copy(obj.mesh.position);
    isDragging = true;
    e.stopPropagation();
  } else {
    deselect();
  }
});

renderer.domElement.addEventListener('pointermove', function(e) {
  if (!isDragging || !selected) return;
  getPointerNDC(e);
  raycaster.setFromCamera(mouse2d, camera);
  const pt = new THREE.Vector3();
  if (!raycaster.ray.intersectPlane(dragPlane, pt)) return;
  const delta = pt.clone().sub(dragStart);
  const np = objStart.clone().add(delta);
  const p = selected.placement;
  np.x = Math.max(p.l / 2, Math.min(TL - p.l / 2, np.x));
  np.y = Math.max(p.h / 2, Math.min(TH - p.h / 2, np.y));
  np.z = Math.max(p.w / 2, Math.min(TW - p.w / 2, np.z));
  selected.mesh.position.copy(np);
  selected.edges.position.copy(np);
  selected.sprite.position.copy(np);
});

renderer.domElement.addEventListener('pointerup', function() { isDragging = false; });
window.addEventListener('keydown', function(e) { if (e.key === 'Escape') deselect(); });

// ─── Animate ──────────────────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
</script>
</body>
</html>`;
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function Viz3DScreen() {
  const { items, cargoCategory, customers } = useWizard();
  const [html,    setHtml]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data   = await api.getData();
        const trucks = data.trucks || [];
        if (!trucks.length) throw new Error('No trucks found');

        const totalWeight = items.reduce((s, i) => s + (i.weight + (i.packagingWeight || 0)) * i.qty, 0);
        const totalVol    = items.reduce((s, i) => s + i.length * i.width * i.height * i.qty, 0);
        const hasDG       = items.some(i => i.isDG);
        const hasFragile  = items.some(i => i.isFragile);

        const truck = suggestTruck(trucks, totalWeight, totalVol, hasDG, hasFragile, cargoCategory);
        if (!truck) throw new Error('Could not determine a suitable truck');

        setHtml(buildVizHTML(items, truck, customers));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#60a5fa" size="large" />
        <Text style={s.loadingTxt}>Packing cargo…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.center}>
        <Text style={s.errorIcon}>⚠️</Text>
        <Text style={s.errorTxt}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <WebView
        source={{ html }}
        style={{ flex: 1 }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        allowsInlineMediaPlayback
      />
    </View>
  );
}

const s = StyleSheet.create({
  center:     { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingTxt: { marginTop: 14, fontSize: 14, color: '#94a3b8', fontWeight: '600' },
  errorIcon:  { fontSize: 36, marginBottom: 10 },
  errorTxt:   { fontSize: 13, color: '#f87171', textAlign: 'center', lineHeight: 20 },
});
