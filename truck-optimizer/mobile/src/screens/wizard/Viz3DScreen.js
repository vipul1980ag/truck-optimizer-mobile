import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useWizard } from '../../WizardContext';
import { api } from '../../api';
import { C } from '../../theme';

// ── Truck suggestion (mirrors ReviewCargoScreen logic) ────────────────────────
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

// ── Build Three.js HTML ───────────────────────────────────────────────────────
function buildVizHTML(placements, truck) {
  const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16','#f97316','#14b8a6'];
  const nameColors = {};
  let ci = 0;
  placements.forEach(p => { if (!nameColors[p.name]) nameColors[p.name] = COLORS[ci++ % COLORS.length]; });

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; overflow: hidden; background: #0f172a; }
    canvas { display: block; }
    #info { position: absolute; top: 10px; left: 0; right: 0; text-align: center; color: #94a3b8; font-family: sans-serif; font-size: 12px; pointer-events: none; }
  </style>
</head>
<body>
  <div id="info">Drag to rotate · Pinch to zoom</div>
  <script src="https://cdn.jsdelivr.net/npm/three@0.134/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.134/examples/js/controls/OrbitControls.js"></script>
  <script>
    const DATA = ${JSON.stringify({ placements, truck, nameColors })};

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(DATA.truck.length, DATA.truck.height * 2, DATA.truck.width);
    scene.add(dir);

    // Truck wireframe outline
    const truckGeo  = new THREE.BoxGeometry(DATA.truck.length, DATA.truck.height, DATA.truck.width);
    const truckEdges = new THREE.EdgesGeometry(truckGeo);
    const truckLines = new THREE.LineSegments(truckEdges, new THREE.LineBasicMaterial({ color: 0x334155, opacity: 0.6, transparent: true }));
    truckLines.position.set(DATA.truck.length / 2, DATA.truck.height / 2, DATA.truck.width / 2);
    scene.add(truckLines);

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(DATA.truck.length, DATA.truck.width),
      new THREE.MeshLambertMaterial({ color: 0x1e293b })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(DATA.truck.length / 2, 0, DATA.truck.width / 2);
    scene.add(floor);

    // Placements
    DATA.placements.forEach(p => {
      const geo  = new THREE.BoxGeometry(p.w - 0.05, p.h - 0.05, p.d - 0.05);
      const mat  = new THREE.MeshLambertMaterial({ color: DATA.nameColors[p.name], opacity: 0.85, transparent: true });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p.x + p.w / 2, p.y + p.h / 2, p.z + p.d / 2);
      scene.add(mesh);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.25, transparent: true })
      );
      edges.position.copy(mesh.position);
      scene.add(edges);
    });

    // Camera position
    const cx = DATA.truck.length / 2;
    const cy = DATA.truck.height;
    const cz = DATA.truck.width * 3;
    camera.position.set(cx, cy, cz);
    camera.lookAt(cx, DATA.truck.height / 2, DATA.truck.width / 2);
    controls.target.set(cx, DATA.truck.height / 2, DATA.truck.width / 2);

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
  const { items, cargoCategory } = useWizard();
  const [html,           setHtml]           = useState(null);
  const [unplaced,       setUnplaced]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [suggestedTruck, setSuggestedTruck] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data   = await api.getData();
        const trucks = data.trucks || [];
        if (!trucks.length) throw new Error('No trucks found in server data');

        const totalWeight = items.reduce((s, i) => s + (i.weight + (i.packagingWeight || 0)) * i.qty, 0);
        const totalVol    = items.reduce((s, i) => s + i.length * i.width * i.height * i.qty, 0);
        const hasDG       = items.some(i => i.isDG);
        const hasFragile  = items.some(i => i.isFragile);

        const truck = suggestTruck(trucks, totalWeight, totalVol, hasDG, hasFragile, cargoCategory);
        if (!truck) throw new Error('Could not determine a suitable truck');
        setSuggestedTruck(truck);

        const mappedItems = items.map(i => ({
          name:       i.name,
          length:     i.length,
          width:      i.width,
          height:     i.height,
          weight:     i.weight + (i.packagingWeight || 0),
          qty:        i.qty,
          rotate:     true,
          customerId: null,
          stackable:  i.stackable !== false,
          isDG:       i.isDG || false,
        }));

        const result     = await api.optimize({ trucks: [truck], items: mappedItems, customers: [], config: {} });
        const placements = result.packers?.[0]?.placements || [];
        setUnplaced(result.unplaced || []);
        setHtml(buildVizHTML(placements, truck));
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
    <View style={s.container}>
      <WebView
        source={{ html }}
        style={{ flex: 1 }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
      />
      {unplaced.length > 0 && (
        <View style={s.unplacedBanner}>
          <Text style={s.unplacedTxt}>
            ⚠ {unplaced.length} item(s) did not fit in {suggestedTruck?.name}
          </Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center:    { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingTxt:{ marginTop: 14, fontSize: 14, color: '#94a3b8', fontWeight: '600' },
  errorIcon: { fontSize: 36, marginBottom: 10 },
  errorTxt:  { fontSize: 13, color: '#f87171', textAlign: 'center', lineHeight: 20 },
  unplacedBanner: {
    backgroundColor: '#78350f', paddingVertical: 10, paddingHorizontal: 16,
    alignItems: 'center',
  },
  unplacedTxt: { fontSize: 13, color: '#fef08a', fontWeight: '700' },
});
