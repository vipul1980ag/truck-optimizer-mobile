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
             color:#64748b; font-size:11px; pointer-events:none; }
    #stats { position:absolute; bottom:8px; left:10px; right:10px;
             color:#94a3b8; font-size:11px; background:rgba(15,23,42,0.7);
             padding:6px 10px; border-radius:8px; pointer-events:none; }
    #legend{ position:absolute; top:28px; right:8px; max-width:140px;
             background:rgba(15,23,42,0.85); border-radius:8px; padding:6px 8px;
             border:1px solid #1e3a5f; }
    .lrow  { display:flex; align-items:center; gap:5px; margin-bottom:3px; }
    .ldot  { width:10px; height:10px; border-radius:3px; flex-shrink:0; }
    .lname { color:#cbd5e1; font-size:9px; white-space:nowrap; overflow:hidden;
             text-overflow:ellipsis; max-width:110px; }
  </style>
</head>
<body>
<div id="hint">Drag to rotate · Pinch to zoom</div>
<div id="stats">Packing…</div>
<div id="legend"></div>

<script src="https://cdn.jsdelivr.net/npm/three@0.134/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.134/examples/js/controls/OrbitControls.js"></script>
<script>
// ─── DATA ─────────────────────────────────────────────────────────────────────
const DATA = ${DATA};
const truck = DATA.truck;  // { name, length, height, width, maxWt }
const TL = truck.length, TH = truck.height, TW = truck.width;

// ─── 3D Guillotine Bin-Packing ────────────────────────────────────────────────
// Spaces are tracked as free rectangular solids: {x, y, z, l, h, w}
//   l = size along X (length axis)
//   h = size along Y (height axis)
//   w = size along Z (width axis)
//
// Stackability rule: top-spaces are only created when the placed box is stackable,
// so elevated positions are guaranteed to be supported.

function pack(items) {
  // Expand qty into individual boxes
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

  // Sort: non-stackable first (go to floor), fragile last (land on top), then largest volume first
  boxes.sort((a, b) => {
    if (!a.stackable && b.stackable) return -1;
    if (a.stackable && !b.stackable) return  1;
    if (!a.isFragile && b.isFragile) return -1;   // fragile goes last
    if (a.isFragile && !b.isFragile) return  1;
    return (b.il * b.ih * b.iw) - (a.il * a.ih * a.iw);
  });

  const placements = [];
  const unplaced   = [];
  let spaces = [{ x:0, y:0, z:0, l:TL, h:TH, w:TW }];

  for (const box of boxes) {
    // 6 orientations: [sizeX, sizeY, sizeZ]
    const orients = [
      [box.il, box.ih, box.iw],
      [box.iw, box.ih, box.il],
      [box.il, box.iw, box.ih],
      [box.iw, box.il, box.ih],
      [box.ih, box.il, box.iw],
      [box.ih, box.iw, box.il],
    ];

    // Fragile items prefer the highest available space (land on top); others prefer lowest
    const sorted = spaces.slice().sort((a, b) => {
      if (box.isFragile) return b.y - a.y || (a.l * a.h * a.w) - (b.l * b.h * b.w);
      return a.y - b.y || (a.l * a.h * a.w) - (b.l * b.h * b.w);
    });

    let placed = false;
    for (const sp of sorted) {
      for (const [ol, oh, ow] of orients) {
        if (ol > sp.l + 0.001 || oh > sp.h + 0.001 || ow > sp.w + 0.001) continue;

        // Place the box
        placements.push({
          x: sp.x, y: sp.y, z: sp.z,
          l: ol,   h: oh,   w: ow,
          name:       box.name,
          customerId: box.customerId,
          stackable:  box.stackable,
          isFragile:  box.isFragile,
          isDG:       box.isDG,
        });

        // Remove the consumed space
        spaces = spaces.filter(s => s !== sp);

        // Guillotine split — longest-side heuristic for X/Z, always split Y last
        const rl = sp.l - ol, rw = sp.w - ow, rh = sp.h - oh;
        if (rl >= rw) {
          if (rl > 0.01) spaces.push({ x: sp.x + ol, y: sp.y, z: sp.z, l: rl, h: sp.h, w: sp.w });
          if (rw > 0.01) spaces.push({ x: sp.x, y: sp.y, z: sp.z + ow, l: ol, h: sp.h, w: rw });
        } else {
          if (rw > 0.01) spaces.push({ x: sp.x, y: sp.y, z: sp.z + ow, l: sp.l, h: sp.h, w: rw });
          if (rl > 0.01) spaces.push({ x: sp.x + ol, y: sp.y, z: sp.z, l: rl, h: oh, w: ow });
        }
        // Top space: only when stackable AND not fragile (nothing placed on top of fragile items)
        if (rh > 0.01 && box.stackable && !box.isFragile) {
          spaces.push({ x: sp.x, y: sp.y + oh, z: sp.z, l: ol, h: rh, w: ow });
        }

        placed = true;
        break;
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
scene.fog = new THREE.FogExp2(0x0f172a, 0.012);

const camera   = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping  = true;
controls.dampingFactor  = 0.12;
controls.minDistance    = 2;
controls.maxDistance    = 200;

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

// Solid semi-transparent walls
const wallMat = new THREE.MeshLambertMaterial({ color: 0x1e3a5f, opacity: 0.12, transparent: true, side: THREE.BackSide });
const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(TL, TH, TW), wallMat);
wallMesh.position.copy(truckCenter);
scene.add(wallMesh);

// Blue edge outline
const truckEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(TL, TH, TW));
const truckLine  = new THREE.LineSegments(truckEdges, new THREE.LineBasicMaterial({ color: 0x3b82f6, opacity: 0.7, transparent: true }));
truckLine.position.copy(truckCenter);
scene.add(truckLine);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(TL, TW),
  new THREE.MeshLambertMaterial({ color: 0x0f2a4a, side: THREE.DoubleSide })
);
floor.rotation.x = -Math.PI / 2;
floor.position.set(TL / 2, 0.001, TW / 2);
scene.add(floor);

// Grid lines on floor
const grid = new THREE.GridHelper(Math.max(TL, TW) * 1.05, 20, 0x1e3a5f, 0x1e3a5f);
grid.position.set(TL / 2, 0.002, TW / 2);
scene.add(grid);

// ─── Label sprite helper ──────────────────────────────────────────────────────
function hexToRgb(hex) {
  const n = parseInt(hex.replace('#',''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function makeLabel(text, hexColor, lineTwo) {
  const CW = 512, CH = lineTwo ? 160 : 100;
  const canvas = document.createElement('canvas');
  canvas.width = CW; canvas.height = CH;
  const ctx = canvas.getContext('2d');

  // Background — darkened version of box color
  const [r, g, b] = hexToRgb(hexColor);
  const dr = Math.max(0, r - 60), dg = Math.max(0, g - 60), db = Math.max(0, b - 60);
  ctx.fillStyle = 'rgba(' + dr + ',' + dg + ',' + db + ',0.92)';
  // Rounded rect (manual for compat)
  const rd = 12;
  ctx.beginPath();
  ctx.moveTo(rd, 0); ctx.lineTo(CW - rd, 0);
  ctx.quadraticCurveTo(CW, 0, CW, rd);
  ctx.lineTo(CW, CH - rd);
  ctx.quadraticCurveTo(CW, CH, CW - rd, CH);
  ctx.lineTo(rd, CH);
  ctx.quadraticCurveTo(0, CH, 0, CH - rd);
  ctx.lineTo(0, rd);
  ctx.quadraticCurveTo(0, 0, rd, 0);
  ctx.closePath();
  ctx.fill();

  // Top colored stripe
  ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',0.6)';
  ctx.fillRect(0, 0, CW, 6);

  // Item name (line 1)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let t = text;
  while (t.length > 1 && ctx.measureText(t).width > CW - 24) t = t.slice(0, -1);
  if (t !== text) t += '\u2026';
  ctx.fillText(t, CW / 2, lineTwo ? 52 : CH / 2);

  // Line 2 (optional sub-label)
  if (lineTwo) {
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '24px Arial';
    let t2 = lineTwo;
    while (t2.length > 1 && ctx.measureText(t2).width > CW - 24) t2 = t2.slice(0, -1);
    if (t2 !== lineTwo) t2 += '\u2026';
    ctx.fillText(t2, CW / 2, 108);
  }

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  // Scale: keep 512:CH aspect, width ~80% of box length but at least 1 ft
  const aspect = CW / CH;
  const sw = Math.max(Math.min(2.5, 0.8), 1.0);  // will be overridden per-placement
  sprite.scale.set(sw * aspect, sw, 1);
  return sprite;
}

// ─── Render placements ────────────────────────────────────────────────────────
placements.forEach(p => {
  const custKey = p.customerId != null ? String(p.customerId) : null;
  const color = DATA.hasCustomers && custKey && DATA.customerInfo[custKey]
    ? DATA.customerInfo[custKey].color
    : (DATA.nameColors[p.name] || '#64748b');

  // Shrink slightly so adjacent boxes have a visible gap
  const gap = 0.04;
  const geo = new THREE.BoxGeometry(Math.max(p.l - gap, 0.05), Math.max(p.h - gap, 0.05), Math.max(p.w - gap, 0.05));

  // Box face
  const mat = new THREE.MeshLambertMaterial({ color, opacity: 0.80, transparent: true });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(p.x + p.l / 2, p.y + p.h / 2, p.z + p.w / 2);
  scene.add(mesh);

  // White wire edges
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.18, transparent: true });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
  edges.position.copy(mesh.position);
  scene.add(edges);

  // Label sprite — customer name takes priority as sub-label
  const custName = DATA.hasCustomers && custKey && DATA.customerInfo[custKey]
    ? DATA.customerInfo[custKey].name : null;
  const subLabel = custName
    ? '\uD83D\uDC64 ' + custName
    : p.isDG ? '\u26a0 Dangerous Goods' : p.isFragile ? '\uD83D\uDD14 Handle with care' : null;
  const sprite = makeLabel(p.name, color, subLabel);
  const sw = Math.max(p.l * 0.9, 1.2);
  const CW = 512, CH = subLabel ? 160 : 100;
  sprite.scale.set(sw, sw * (CH / CW), 1);
  sprite.position.set(p.x + p.l / 2, p.y + p.h / 2, p.z + p.w / 2);
  scene.add(sprite);
});

// ─── Legend ───────────────────────────────────────────────────────────────────
const legendEl = document.getElementById('legend');
if (DATA.hasCustomers) {
  Object.values(DATA.customerInfo).forEach(function(ci) {
    const row = document.createElement('div');
    row.className = 'lrow';
    row.innerHTML =
      '<div class="ldot" style="background:' + ci.color + '"></div>' +
      '<span class="lname">' + ci.name + '</span>';
    legendEl.appendChild(row);
  });
} else {
  const seen = {};
  placements.forEach(p => { seen[p.name] = DATA.nameColors[p.name] || '#64748b'; });
  Object.entries(seen).forEach(function([name, color]) {
    const row = document.createElement('div');
    row.className = 'lrow';
    row.innerHTML =
      '<div class="ldot" style="background:' + color + '"></div>' +
      '<span class="lname">' + name + '</span>';
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
  truck.name + ' &nbsp;|&nbsp; ' +
  placements.length + '/' + totalUnits + ' units &nbsp;|&nbsp; ' +
  utilPct + '% volume' +
  (unplaced.length ? ' &nbsp;|&nbsp; <span style="color:#fbbf24">\u26a0 ' + unplaced.length + ' unplaced</span>' : '');

// ─── Camera ───────────────────────────────────────────────────────────────────
const dist = Math.max(TL, TW, TH) * 1.9;
camera.position.set(TL / 2 + dist * 0.55, TH / 2 + dist * 0.45, TW / 2 + dist * 0.75);
camera.lookAt(truckCenter);
controls.target.copy(truckCenter);
controls.update();

// ─── Animate ──────────────────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
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
